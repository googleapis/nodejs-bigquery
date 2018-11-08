/**
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {DecorateRequestOptions, ServiceObject, ServiceObjectConfig, util} from '@google-cloud/common';
import {GoogleErrorBody} from '@google-cloud/common/build/src/util';
import * as pfy from '@google-cloud/promisify';
import {File} from '@google-cloud/storage';
import * as arrify from 'arrify';
import * as assert from 'assert';
import Big from 'big.js';
import {EventEmitter} from 'events';
import * as extend from 'extend';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as stream from 'stream';
import * as uuid from 'uuid';

import {BigQuery} from '../src';
import {Job, JobOptions} from '../src/job';
import {CopyTableMetadata, JobLoadMetadata, Table, TableOptions} from '../src/table';

let promisified = false;
let makeWritableStreamOverride: Function|null;
let isCustomTypeOverride: Function|null;
const fakeUtil = extend({}, util, {
  isCustomType: (...args: Array<{}>) => {
    return (isCustomTypeOverride || util.isCustomType).apply(null, args);
  },
  makeWritableStream: (...args: Array<{}>) => {
    (makeWritableStreamOverride || util.makeWritableStream).apply(null, args);
  },
  noop: () => {}
});
const fakePfy = extend({}, pfy, {
  promisifyAll: (c: Function) => {
    if (c.name === 'Table') {
      promisified = true;
    }
  },
});

let extended = false;
const fakePaginator = {
  paginator: {
    extend: (c: Function, methods: string[]) => {
      if (c.name !== 'Table') {
        return;
      }

      methods = arrify(methods);
      assert.strictEqual(c.name, 'Table');
      assert.deepStrictEqual(methods, ['getRows']);
      extended = true;
    },
    streamify: (methodName: string) => {
      return methodName;
    },
  }
};

// tslint:disable-next-line no-any
let fakeUuid: any = extend(true, {}, uuid);

class FakeServiceObject extends ServiceObject {
  calledWith_: IArguments;
  constructor(config: ServiceObjectConfig) {
    super(config);
    this.calledWith_ = arguments;
  }
}

let sandbox: sinon.SinonSandbox;
beforeEach(() => sandbox = sinon.createSandbox());
afterEach(() => sandbox.restore());

describe('BigQuery/Table', () => {
  const DATASET = {
    id: 'dataset-id',
    createTable: util.noop,
    bigQuery: {
      projectId: 'project-id',
      job: (id: string) => {
        return {id};
      },
      request: util.noop,
    },
  };

  const SCHEMA_OBJECT = {
    fields: [
      {name: 'id', type: 'INTEGER'},
      {name: 'name', type: 'STRING'},
      {name: 'dob', type: 'TIMESTAMP'},
      {name: 'has_claws', type: 'BOOLEAN'},
      {name: 'hair_count', type: 'FLOAT'},
      {name: 'numeric_col', type: 'NUMERIC'},
    ],
  };

  const SCHEMA_STRING = [
    'id:integer',
    'name',
    'dob:timestamp',
    'has_claws:boolean',
    'hair_count:float',
    'numeric_col:numeric',
  ].join(',');

  const LOCATION = 'asia-northeast1';

  // tslint:disable-next-line no-any variable-name
  let Table: any;
  const TABLE_ID = 'kittens';
  // tslint:disable-next-line no-any
  let table: any;
  // tslint:disable-next-line no-any
  let tableOverrides: any = {};

  before(() => {
    Table = proxyquire('../src/table.js', {
              uuid: fakeUuid,
              '@google-cloud/common': {
                ServiceObject: FakeServiceObject,
                util: fakeUtil,
              },
              '@google-cloud/paginator': fakePaginator,
              '@google-cloud/promisify': fakePfy,
            }).Table;

    const tableCached = extend(true, {}, Table);

    // Override all util methods, allowing them to be mocked. Overrides are
    // removed before each test.
    Object.keys(Table).forEach(tableMethod => {
      if (typeof Table[tableMethod] !== 'function') {
        return;
      }

      Table[tableMethod] = () => {
        return (tableOverrides[tableMethod] || tableCached[tableMethod])
            .apply(null, arguments);
      };
    });
  });

  beforeEach(() => {
    fakeUuid = extend(fakeUuid, uuid);
    isCustomTypeOverride = null;
    makeWritableStreamOverride = null;
    tableOverrides = {};
    table = new Table(DATASET, TABLE_ID);
    table.bigQuery.request = util.noop;
    table.bigQuery.createJob = util.noop;
    sandbox.stub(BigQuery, 'mergeSchemaWithRows_').callsFake((schema, rows) => {
      return rows;
    });
  });

  describe('instantiation', () => {
    it('should extend the correct methods', () => {
      assert(extended);  // See `fakePaginator.extend`
    });

    it('should streamify the correct methods', () => {
      assert.strictEqual(table.createReadStream, 'getRows');
    });

    it('should promisify all the things', () => {
      assert(promisified);
    });

    it('should inherit from ServiceObject', done => {
      const datasetInstance = extend({}, DATASET, {
        createTable: {
          bind: (context: {}) => {
            assert.strictEqual(context, datasetInstance);
            done();
          },
        },
      });

      const table = new Table(datasetInstance, TABLE_ID);
      assert(table instanceof ServiceObject);

      const calledWith = table.calledWith_[0];

      assert.strictEqual(calledWith.parent, datasetInstance);
      assert.strictEqual(calledWith.baseUrl, '/tables');
      assert.strictEqual(calledWith.id, TABLE_ID);
      assert.deepStrictEqual(calledWith.methods, {
        create: true,
        delete: true,
        exists: true,
        get: true,
        getMetadata: true,
      });
    });

    it('should capture the location', () => {
      const options = {location: LOCATION};
      const table = new Table(DATASET, TABLE_ID, options);

      assert.strictEqual(table.location, LOCATION);
    });

    describe('etag interceptor', () => {
      const FAKE_ETAG = 'abc';

      it('should apply the If-Match header', () => {
        const interceptor = table.interceptors.pop();

        const fakeReqOpts = {
          method: 'PATCH',
          json: {
            etag: FAKE_ETAG,
          },
        };

        const reqOpts = interceptor.request(fakeReqOpts);
        assert.deepStrictEqual(reqOpts.headers, {'If-Match': FAKE_ETAG});
      });

      it('should respect already existing headers', () => {
        const interceptor = table.interceptors.pop();

        const fakeReqOpts = {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          json: {
            etag: FAKE_ETAG,
          },
        };

        const expectedHeaders = extend({}, fakeReqOpts.headers, {
          'If-Match': FAKE_ETAG,
        });

        const reqOpts = interceptor.request(fakeReqOpts);
        assert.deepStrictEqual(reqOpts.headers, expectedHeaders);
      });

      it('should not apply the header if method is not patch', () => {
        const interceptor = table.interceptors.pop();

        const fakeReqOpts = {
          method: 'POST',
          json: {
            etag: FAKE_ETAG,
          },
        };

        const reqOpts = interceptor.request(fakeReqOpts);
        assert.deepStrictEqual(reqOpts.headers, undefined);
      });
    });
  });

  describe('createSchemaFromString_', () => {
    it('should create a schema object from a string', () => {
      assert.deepStrictEqual(
          Table.createSchemaFromString_(SCHEMA_STRING), SCHEMA_OBJECT);
    });

    it('should trim names', () => {
      const schema = Table.createSchemaFromString_(' name :type');
      assert.strictEqual(schema.fields[0].name, 'name');
    });

    it('should trim types', () => {
      const schema = Table.createSchemaFromString_('name: type ');
      assert.strictEqual(schema.fields[0].type, 'TYPE');
    });
  });

  describe('encodeValue_', () => {
    it('should return null if null or undefined', () => {
      assert.strictEqual(Table.encodeValue_(null), null);
      assert.strictEqual(Table.encodeValue_(undefined), null);
    });

    it('should properly encode values', () => {
      const buffer = Buffer.from('test');
      assert.strictEqual(Table.encodeValue_(buffer), buffer.toString('base64'));

      const date = new Date();
      assert.strictEqual(Table.encodeValue_(date), date.toJSON());
    });

    it('should properly encode custom types', () => {
      class BigQueryDate {
        value: {};
        constructor(value: {}) {
          this.value = value;
        }
      }
      class BigQueryDatetime {
        value: {};
        constructor(value: {}) {
          this.value = value;
        }
      }
      class BigQueryTime {
        value: {};
        constructor(value: {}) {
          this.value = value;
        }
      }
      class BigQueryTimestamp {
        value: {};
        constructor(value: {}) {
          this.value = value;
        }
      }

      const date = new BigQueryDate('date');
      const datetime = new BigQueryDatetime('datetime');
      const time = new BigQueryTime('time');
      const timestamp = new BigQueryTimestamp('timestamp');

      assert.strictEqual(Table.encodeValue_(date), 'date');
      assert.strictEqual(Table.encodeValue_(datetime), 'datetime');
      assert.strictEqual(Table.encodeValue_(time), 'time');
      assert.strictEqual(Table.encodeValue_(timestamp), 'timestamp');
    });

    it('should properly encode arrays', () => {
      const buffer = Buffer.from('test');
      const date = new Date();

      const array = [buffer, date];

      assert.deepStrictEqual(Table.encodeValue_(array), [
        buffer.toString('base64'),
        date.toJSON(),
      ]);
    });

    it('should properly encode objects', () => {
      const buffer = Buffer.from('test');
      const date = new Date();

      const object = {
        nested: {
          array: [buffer, date],
        },
      };

      assert.deepStrictEqual(Table.encodeValue_(object), {
        nested: {
          array: [buffer.toString('base64'), date.toJSON()],
        },
      });
    });

    it('should properly encode numerics', () => {
      assert.strictEqual(Table.encodeValue_(new Big('123.456')), '123.456');
      assert.strictEqual(Table.encodeValue_(new Big('-123.456')), '-123.456');
      assert.strictEqual(
          Table.encodeValue_(
              new Big('99999999999999999999999999999.999999999')),
          '99999999999999999999999999999.999999999');
      assert.strictEqual(
          Table.encodeValue_(
              new Big('-99999999999999999999999999999.999999999')),
          '-99999999999999999999999999999.999999999');
    });
  });

  describe('formatMetadata_', () => {
    it('should return a deep copy', () => {
      const metadata = {
        a: {
          b: 'c',
        },
      };

      const formatted = Table.formatMetadata_(metadata);

      assert.deepStrictEqual(metadata, formatted);
      assert.notStrictEqual(metadata, formatted);
    });

    it('should format the name option', () => {
      const NAME = 'name';

      const formatted = Table.formatMetadata_({name: NAME});

      assert.strictEqual(formatted.name, undefined);
      assert.strictEqual(formatted.friendlyName, NAME);
    });

    it('should format the schema string option', () => {
      const fakeSchema = {};

      Table.createSchemaFromString_ = (schema: string) => {
        assert.strictEqual(schema, SCHEMA_STRING);
        return fakeSchema;
      };

      const formatted = Table.formatMetadata_({schema: SCHEMA_STRING});

      assert.strictEqual(formatted.schema, fakeSchema);
    });

    it('should accept an array of schema fields', () => {
      const fields = ['a', 'b', 'c'];

      const formatted = Table.formatMetadata_({schema: fields});

      assert.deepStrictEqual(formatted.schema.fields, fields);
    });

    it('should format the schema fields option', () => {
      const metadata = {
        schema: {
          fields: ['a', {fields: []}, 'b'],
        },
      };

      const expectedFields = ['a', {fields: [], type: 'RECORD'}, 'b'];
      const formatted = Table.formatMetadata_(metadata);

      assert.deepStrictEqual(formatted.schema.fields, expectedFields);
    });

    it('should format the time partitioning option', () => {
      const formatted = Table.formatMetadata_({partitioning: 'abc'});

      assert.strictEqual(formatted.timePartitioning.type, 'ABC');
    });

    it('should format the table view option', () => {
      const VIEW = 'abc';

      const formatted = Table.formatMetadata_({view: VIEW});

      assert.strictEqual(formatted.view.query, VIEW);
      assert.strictEqual(formatted.view.useLegacySql, false);
    });
  });

  describe('copy', () => {
    // tslint:disable-next-line no-any
    let fakeJob: any;

    beforeEach(() => {
      fakeJob = new EventEmitter();
      table.createCopyJob =
          (destination: {}, metadata: {}, callback: Function) => {
            callback(null, fakeJob);
          };
    });

    it('should pass the arguments to createCopyJob', done => {
      const fakeDestination = {};
      const fakeMetadata: CopyTableMetadata = {
        createDisposition: 'CREATE_NEVER',
        writeDisposition: 'WRITE_TRUNCATE'
      };

      table.createCopyJob = (destination: {}, metadata: {}) => {
        assert.strictEqual(destination, fakeDestination);
        assert.strictEqual(metadata, fakeMetadata);
        done();
      };

      table.copy(fakeDestination, fakeMetadata, assert.ifError);
    });

    it('should optionally accept metadata', done => {
      table.createCopyJob = (destination: {}, metadata: {}) => {
        assert.deepStrictEqual(metadata, {});
        done();
      };

      table.copy({}, assert.ifError);
    });

    it('should return any createCopyJob errors', done => {
      const error = new Error('err');
      const response = {};

      table.createCopyJob =
          (destination: {}, metadata: {}, callback: Function) => {
            callback(error, null, response);
          };

      table.copy({}, (err: Error, resp: {}) => {
        assert.strictEqual(err, error);
        assert.strictEqual(resp, response);
        done();
      });
    });

    it('should return any job errors', done => {
      const error = new Error('err');

      table.copy({}, (err: Error) => {
        assert.strictEqual(err, error);
        done();
      });

      fakeJob.emit('error', error);
    });

    it('should return the metadata on complete', done => {
      const metadata = {};

      table.copy({}, (err: Error, resp: {}) => {
        assert.ifError(err);
        assert.strictEqual(resp, metadata);
        done();
      });

      fakeJob.emit('complete', metadata);
    });
  });

  describe('copyFrom', () => {
    // tslint:disable-next-line no-any
    let fakeJob: any;

    beforeEach(() => {
      fakeJob = new EventEmitter();
      table.createCopyFromJob =
          (sourceTables: {}, metadata: {}, callback: Function) => {
            callback(null, fakeJob);
          };
    });

    it('should pass the arguments to createCopyFromJob', done => {
      const fakeSourceTables = {};
      const fakeMetadata = {};

      table.createCopyFromJob = (sourceTables: {}, metadata: {}) => {
        assert.strictEqual(sourceTables, fakeSourceTables);
        assert.strictEqual(metadata, fakeMetadata);
        done();
      };

      table.copyFrom(fakeSourceTables, fakeMetadata, assert.ifError);
    });

    it('should optionally accept metadata', done => {
      table.createCopyFromJob = (sourceTables: {}, metadata: {}) => {
        assert.deepStrictEqual(metadata, {});
        done();
      };

      table.copyFrom({}, assert.ifError);
    });

    it('should return any createCopyFromJob errors', done => {
      const error = new Error('err');
      const response = {};

      table.createCopyFromJob =
          (sourceTables: {}, metadata: {}, callback: Function) => {
            callback(error, null, response);
          };

      table.copyFrom({}, (err: Error, resp: {}) => {
        assert.strictEqual(err, error);
        assert.strictEqual(resp, response);
        done();
      });
    });

    it('should return any job errors', done => {
      const error = new Error('err');

      table.copyFrom({}, (err: Error) => {
        assert.strictEqual(err, error);
        done();
      });

      fakeJob.emit('error', error);
    });

    it('should return the metadata on complete', done => {
      const metadata = {};

      table.copyFrom({}, (err: Error, resp: {}) => {
        assert.ifError(err);
        assert.strictEqual(resp, metadata);
        done();
      });

      fakeJob.emit('complete', metadata);
    });
  });

  describe('createCopyJob', () => {
    let DEST_TABLE: Table;

    before(() => {
      DEST_TABLE = new Table(DATASET, 'destination-table');
    });

    it('should throw if a destination is not a Table', () => {
      assert.throws(() => {
        table.createCopyJob();
      }, /Destination must be a Table/);

      assert.throws(() => {
        table.createCopyJob({});
      }, /Destination must be a Table/);

      assert.throws(() => {
        table.createCopyJob(() => {});
      }, /Destination must be a Table/);
    });

    it('should send correct request to the API', done => {
      table.bigQuery.createJob = (reqOpts: DecorateRequestOptions) => {
        assert.deepStrictEqual(reqOpts, {
          configuration: {
            copy: {
              a: 'b',
              c: 'd',
              destinationTable: {
                datasetId: DEST_TABLE.dataset.id,
                projectId: DEST_TABLE.bigQuery.projectId,
                tableId: DEST_TABLE.id,
              },
              sourceTable: {
                datasetId: table.dataset.id,
                projectId: table.bigQuery.projectId,
                tableId: table.id,
              },
            },
          },
        });

        done();
      };

      table.createCopyJob(DEST_TABLE, {a: 'b', c: 'd'}, assert.ifError);
    });

    it('should accept a job prefix', done => {
      const fakeJobPrefix = 'abc-';
      const options = {
        jobPrefix: fakeJobPrefix,
      };

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.jobPrefix, fakeJobPrefix);
        assert.strictEqual(reqOpts.configuration.copy.jobPrefix, undefined);
        callback();  // the done fn
      };

      table.createCopyJob(DEST_TABLE, options, done);
    });

    it('should use the default location', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.location, LOCATION);
        callback();  // the done fn
      };

      table.location = LOCATION;
      table.createCopyJob(DEST_TABLE, done);
    });

    it('should accept a job id', done => {
      const jobId = 'job-id';
      const options = {jobId};

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.jobId, jobId);
        assert.strictEqual(reqOpts.configuration.copy.jobId, undefined);
        callback();  // the done fn
      };

      table.createCopyJob(DEST_TABLE, options, done);
    });

    it('should pass the callback to createJob', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback();  // the done fn
      };

      table.createCopyJob(DEST_TABLE, {}, done);
    });

    it('should optionally accept metadata', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback();  // the done fn
      };

      table.createCopyJob(DEST_TABLE, done);
    });
  });

  describe('createCopyFromJob', () => {
    let SOURCE_TABLE: Table;

    before(() => {
      SOURCE_TABLE = new Table(DATASET, 'source-table');
    });

    it('should throw if a source is not a Table', () => {
      assert.throws(() => {
        table.createCopyFromJob(['table']);
      }, /Source must be a Table/);

      assert.throws(() => {
        table.createCopyFromJob([SOURCE_TABLE, 'table']);
      }, /Source must be a Table/);

      assert.throws(() => {
        table.createCopyFromJob({});
      }, /Source must be a Table/);

      assert.throws(() => {
        table.createCopyFromJob(() => {});
      }, /Source must be a Table/);
    });

    it('should send correct request to the API', done => {
      table.bigQuery.createJob = (reqOpts: DecorateRequestOptions) => {
        assert.deepStrictEqual(reqOpts, {
          configuration: {
            copy: {
              a: 'b',
              c: 'd',
              destinationTable: {
                datasetId: table.dataset.id,
                projectId: table.bigQuery.projectId,
                tableId: table.id,
              },
              sourceTables: [
                {
                  datasetId: SOURCE_TABLE.dataset.id,
                  projectId: SOURCE_TABLE.bigQuery.projectId,
                  tableId: SOURCE_TABLE.id,
                },
              ],
            },
          },
        });

        done();
      };

      table.createCopyFromJob(SOURCE_TABLE, {a: 'b', c: 'd'}, assert.ifError);
    });

    it('should accept multiple source tables', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        assert.deepStrictEqual(reqOpts.configuration.copy.sourceTables, [
          {
            datasetId: SOURCE_TABLE.dataset.id,
            projectId: SOURCE_TABLE.bigQuery.projectId,
            tableId: SOURCE_TABLE.id,
          },
          {
            datasetId: SOURCE_TABLE.dataset.id,
            projectId: SOURCE_TABLE.bigQuery.projectId,
            tableId: SOURCE_TABLE.id,
          },
        ]);

        done();
      };

      table.createCopyFromJob([SOURCE_TABLE, SOURCE_TABLE], assert.ifError);
    });

    it('should accept a job prefix', done => {
      const fakeJobPrefix = 'abc-';
      const options = {
        jobPrefix: fakeJobPrefix,
      };

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.jobPrefix, fakeJobPrefix);
        assert.strictEqual(reqOpts.configuration.copy.jobPrefix, undefined);
        callback();  // the done fn
      };

      table.createCopyFromJob(SOURCE_TABLE, options, done);
    });

    it('should use the default location', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.location, LOCATION);
        callback();  // the done fn
      };

      table.location = LOCATION;
      table.createCopyFromJob(SOURCE_TABLE, done);
    });

    it('should accept a job id', done => {
      const jobId = 'job-id';
      const options = {jobId};

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.jobId, jobId);
        assert.strictEqual(reqOpts.configuration.copy.jobId, undefined);
        callback();  // the done fn
      };

      table.createCopyFromJob(SOURCE_TABLE, options, done);
    });

    it('should pass the callback to createJob', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback();  // the done fn
      };

      table.createCopyFromJob(SOURCE_TABLE, {}, done);
    });

    it('should optionally accept options', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback();  // the done fn
      };

      table.createCopyFromJob(SOURCE_TABLE, done);
    });
  });

  describe('createExtractJob', () => {
    const FILE = {
      name: 'file-name.json',
      bucket: {
        name: 'bucket-name',
      },
    };

    beforeEach(() => {
      isCustomTypeOverride = () => {
        return true;
      };

      table.bigQuery.job = (id: string) => {
        return {id};
      };

      table.bigQuery.createJob = () => {};
    });

    it('should call createJob correctly', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        assert.deepStrictEqual(reqOpts.configuration.extract.sourceTable, {
          datasetId: table.dataset.id,
          projectId: table.bigQuery.projectId,
          tableId: table.id,
        });

        done();
      };

      table.createExtractJob(FILE, assert.ifError);
    });

    it('should accept just a destination and a callback', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        callback(null, {jobReference: {jobId: 'job-id'}});
      };

      table.createExtractJob(FILE, done);
    });

    describe('formats', () => {
      it('should accept csv', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const extract = reqOpts.configuration.extract;
          assert.strictEqual(extract.destinationFormat, 'CSV');
          done();
        };

        table.createExtractJob(FILE, {format: 'csv'}, assert.ifError);
      });

      it('should accept json', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const extract = reqOpts.configuration.extract;
          assert.strictEqual(
              extract.destinationFormat, 'NEWLINE_DELIMITED_JSON');
          done();
        };

        table.createExtractJob(FILE, {format: 'json'}, assert.ifError);
      });

      it('should accept avro', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const extract = reqOpts.configuration.extract;
          assert.strictEqual(extract.destinationFormat, 'AVRO');
          done();
        };

        table.createExtractJob(FILE, {format: 'avro'}, assert.ifError);
      });

      it('should accept orc', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const extract = reqOpts.configuration.extract;
          assert.strictEqual(extract.destinationFormat, 'ORC');
          done();
        };

        table.createExtractJob(FILE, {format: 'orc'}, assert.ifError);
      });

      it('should accept parquet', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const extract = reqOpts.configuration.extract;
          assert.strictEqual(extract.destinationFormat, 'PARQUET');
          done();
        };

        table.createExtractJob(FILE, {format: 'parquet'}, assert.ifError);
      });
    });

    it('should parse out full gs:// urls from files', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        assert.deepStrictEqual(reqOpts.configuration.extract.destinationUris, [
          'gs://' + FILE.bucket.name + '/' + FILE.name,
        ]);
        done();
      };

      table.createExtractJob(FILE, assert.ifError);
    });

    it('should check if a destination is a File', done => {
      isCustomTypeOverride = (dest: {}, type: string) => {
        assert.strictEqual(dest, FILE);
        assert.strictEqual(type, 'storage/file');
        setImmediate(done);
        return true;
      };

      table.createExtractJob(FILE, assert.ifError);
    });

    it('should throw if a destination is not a File', () => {
      isCustomTypeOverride = () => {
        return false;
      };

      assert.throws(() => {
        table.createExtractJob({}, util.noop);
      }, /Destination must be a File object/);

      assert.throws(() => {
        table.createExtractJob([FILE, {}], util.noop);
      }, /Destination must be a File object/);
    });

    it('should detect file format if a format is not provided', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        const destFormat = reqOpts.configuration.extract.destinationFormat;
        assert.strictEqual(destFormat, 'NEWLINE_DELIMITED_JSON');
        done();
      };

      table.createExtractJob(FILE, assert.ifError);
    });

    it('should assign the provided format if matched', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        const extract = reqOpts.configuration.extract;
        assert.strictEqual(extract.destinationFormat, 'CSV');
        assert.strictEqual(extract.format, undefined);
        done();
      };

      table.createExtractJob(FILE, {format: 'csv'}, assert.ifError);
    });

    it('should throw if a provided format is not recognized', () => {
      assert.throws(() => {
        table.createExtractJob(FILE, {format: 'zip'}, util.noop);
      }, /Destination format not recognized/);
    });

    it('should assign GZIP compression with gzip: true', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        assert.strictEqual(reqOpts.configuration.extract.compression, 'GZIP');
        assert.strictEqual(reqOpts.configuration.extract.gzip, undefined);
        done();
      };

      table.createExtractJob(FILE, {gzip: true}, util.noop);
    });

    it('should accept a job prefix', done => {
      const fakeJobPrefix = 'abc-';
      const options = {
        jobPrefix: fakeJobPrefix,
      };

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.jobPrefix, fakeJobPrefix);
        assert.strictEqual(reqOpts.configuration.extract.jobPrefix, undefined);
        callback();  // the done fn
      };

      table.createExtractJob(FILE, options, done);
    });

    it('should use the default location', done => {
      const table = new Table(DATASET, TABLE_ID, {location: LOCATION});

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.location, LOCATION);
        callback();  // the done fn
      };

      table.createExtractJob(FILE, done);
    });

    it('should accept a job id', done => {
      const jobId = 'job-id';
      const options = {jobId};

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.jobId, jobId);
        assert.strictEqual(reqOpts.configuration.extract.jobId, undefined);
        callback();  // the done fn
      };

      table.createExtractJob(FILE, options, done);
    });

    it('should pass the callback to createJob', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback();  // the done fn
      };

      table.createExtractJob(FILE, {}, done);
    });

    it('should optionally accept options', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback();  // the done fn
      };

      table.createExtractJob(FILE, done);
    });
  });

  describe('createLoadJob', () => {
    const FILEPATH = require.resolve('../../test/testdata/testfile.json');
    const FILE = {
      name: 'file-name.json',
      bucket: {
        name: 'bucket-name',
      },
    };

    const JOB = {
      id: 'foo',
      metadata: {},
    };

    beforeEach(() => {
      isCustomTypeOverride = () => {
        return true;
      };
    });

    it('should accept just a File and a callback', done => {
      table.createWriteStream_ = () => {
        const ws = new stream.Writable();
        setImmediate(() => {
          ws.emit('job', JOB);
          ws.end();
        });
        return ws;
      };

      table.createLoadJob(FILEPATH, (err: Error, job: Job, resp: {}) => {
        assert.strictEqual(err, null);
        assert.strictEqual(job, JOB);
        assert.strictEqual(resp, JOB.metadata);
        done();
      });
    });

    it('should return a stream when a string is given', () => {
      sandbox.stub(table, 'createWriteStream_').returns(new stream.Writable());
      assert(table.createLoadJob(FILEPATH) instanceof stream.Stream);
    });

    it('should infer the file format from the given filepath', done => {
      table.createWriteStream_ = (metadata: JobLoadMetadata) => {
        assert.strictEqual(metadata.sourceFormat, 'NEWLINE_DELIMITED_JSON');
        const ws = new stream.Writable();
        setImmediate(() => {
          ws.emit('job', JOB);
          ws.end();
        });
        return ws;
      };

      table.createLoadJob(FILEPATH, done);
    });

    it('should execute callback with error from writestream', done => {
      const error = new Error('Error.');

      table.createWriteStream_ = (metadata: JobLoadMetadata) => {
        assert.strictEqual(metadata.sourceFormat, 'NEWLINE_DELIMITED_JSON');
        const ws = new stream.Writable();
        setImmediate(() => {
          ws.emit('error', error);
          ws.end();
        });
        return ws;
      };

      table.createLoadJob(FILEPATH, (err: Error) => {
        assert.strictEqual(err, error);
        done();
      });
    });

    it('should not infer the file format if one is given', done => {
      table.createWriteStream_ = (metadata: JobLoadMetadata) => {
        assert.strictEqual(metadata.sourceFormat, 'CSV');
        const ws = new stream.Writable();
        setImmediate(() => {
          ws.emit('job', JOB);
          ws.end();
        });
        return ws;
      };

      table.createLoadJob(FILEPATH, {sourceFormat: 'CSV'}, done);
    });

    it('should check if a destination is a File', done => {
      isCustomTypeOverride = (dest: File, type: string) => {
        assert.strictEqual(dest, FILE);
        assert.strictEqual(type, 'storage/file');
        setImmediate(done);
        return true;
      };

      table.createLoadJob(FILE, assert.ifError);
    });

    it('should throw if a File object is not provided', () => {
      isCustomTypeOverride = () => {
        return false;
      };

      assert.throws(() => {
        table.createLoadJob({});
      }, /Source must be a File object/);
    });

    it('should convert File objects to gs:// urls', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        const sourceUri = reqOpts.configuration.load.sourceUris[0];
        assert.strictEqual(
            sourceUri, 'gs://' + FILE.bucket.name + '/' + FILE.name);
        done();
      };

      table.createLoadJob(FILE, assert.ifError);
    });

    it('should infer the file format from a File object', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        const sourceFormat = reqOpts.configuration.load.sourceFormat;
        assert.strictEqual(sourceFormat, 'NEWLINE_DELIMITED_JSON');
        done();
      };

      table.createLoadJob(FILE, assert.ifError);
    });

    it('should not override a provided format with a File', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        const sourceFormat = reqOpts.configuration.load.sourceFormat;
        assert.strictEqual(sourceFormat, 'NEWLINE_DELIMITED_JSON');
        done();
      };

      table.createLoadJob(
          FILE, {
            sourceFormat: 'NEWLINE_DELIMITED_JSON',
          },
          assert.ifError);
    });

    it('should pass the callback to createJob', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback();  // the done fn
      };

      table.createLoadJob(FILE, {}, done);
    });

    it('should optionally accept options', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback();  // the done fn
      };

      table.createLoadJob(FILE, done);
    });

    it('should set the job prefix', done => {
      const fakeJobPrefix = 'abc';

      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        assert.strictEqual(reqOpts.jobPrefix, fakeJobPrefix);
        assert.strictEqual(reqOpts.configuration.load.jobPrefix, undefined);
        done();
      };

      table.createLoadJob(
          FILE, {
            jobPrefix: fakeJobPrefix,
          },
          assert.ifError);
    });

    it('should use the default location', done => {
      const table = new Table(DATASET, TABLE_ID, {location: LOCATION});

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.location, LOCATION);
        callback();  // the done fn
      };

      table.createLoadJob(FILE, done);
    });

    it('should accept a job id', done => {
      const jobId = 'job-id';
      const options = {jobId};

      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        assert.strictEqual(reqOpts.jobId, jobId);
        assert.strictEqual(reqOpts.configuration.load.jobId, undefined);
        done();
      };

      table.createLoadJob(FILE, options, assert.ifError);
    });

    describe('formats', () => {
      it('should accept csv', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const load = reqOpts.configuration.load;
          assert.strictEqual(load.sourceFormat, 'CSV');
          done();
        };

        table.createLoadJob(FILE, {format: 'csv'}, assert.ifError);
      });

      it('should accept json', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const load = reqOpts.configuration.load;
          assert.strictEqual(load.sourceFormat, 'NEWLINE_DELIMITED_JSON');
          done();
        };

        table.createLoadJob(FILE, {format: 'json'}, assert.ifError);
      });

      it('should accept avro', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const load = reqOpts.configuration.load;
          assert.strictEqual(load.sourceFormat, 'AVRO');
          done();
        };

        table.createLoadJob(FILE, {format: 'avro'}, assert.ifError);
      });
    });
  });

  describe('createQueryJob', () => {
    it('should call through to dataset#createQueryJob', done => {
      const fakeOptions = {};
      const fakeReturnValue = {};

      table.dataset.createQueryJob =
          (options: JobOptions, callback: Function) => {
            assert.strictEqual(options, fakeOptions);
            // tslint:disable-next-line
            setImmediate(callback as any);
            return fakeReturnValue;
          };

      const returnVal = table.createQueryJob(fakeOptions, done);
      assert.strictEqual(returnVal, fakeReturnValue);
    });
  });

  describe('createQueryStream', () => {
    it('should call datasetInstance.createQueryStream()', done => {
      table.dataset.createQueryStream = (a: {}) => {
        assert.strictEqual(a, 'a');
        done();
      };

      table.createQueryStream('a');
    });

    it('should return whatever dataset.createQueryStream returns', () => {
      const fakeValue = 123;
      table.dataset.createQueryStream = () => {
        return fakeValue;
      };
      const val = table.createQueryStream();
      assert.strictEqual(val, fakeValue);
    });
  });

  describe('createWriteStream_', () => {
    describe('formats', () => {
      it('should accept csv', done => {
        makeWritableStreamOverride =
            (stream: stream.Stream, options: JobOptions) => {
              const load = options.metadata.configuration.load;
              assert.strictEqual(load.sourceFormat, 'CSV');
              done();
            };

        table.createWriteStream_('csv').emit('writing');
      });

      it('should accept json', done => {
        makeWritableStreamOverride =
            (stream: stream.Stream, options: JobOptions) => {
              const load = options.metadata.configuration.load;
              assert.strictEqual(load.sourceFormat, 'NEWLINE_DELIMITED_JSON');
              done();
            };

        table.createWriteStream_('json').emit('writing');
      });

      it('should accept avro', done => {
        makeWritableStreamOverride =
            (stream: stream.Stream, options: JobOptions) => {
              const load = options.metadata.configuration.load;
              assert.strictEqual(load.sourceFormat, 'AVRO');
              done();
            };

        table.createWriteStream_('avro').emit('writing');
      });
    });

    it('should format a schema', done => {
      const expectedSchema = {};
      tableOverrides.createSchemaFromString_ = (s: string) => {
        assert.strictEqual(s, SCHEMA_STRING);
        return expectedSchema;
      };

      makeWritableStreamOverride =
          (stream: stream.Stream, options: JobOptions) => {
            const load = options.metadata.configuration.load;
            assert.deepStrictEqual(load.schema, expectedSchema);
            done();
          };

      table.createWriteStream_({schema: SCHEMA_STRING}).emit('writing');
    });

    it('should throw if a given source format is not recognized', () => {
      assert.throws(() => {
        table.createWriteStream_('zip');
      }, /Source format not recognized/);

      assert.throws(() => {
        table.createWriteStream_({
          sourceFormat: 'zip',
        });
      }, /Source format not recognized/);

      assert.doesNotThrow(() => {
        table.createWriteStream_();
        table.createWriteStream_({});
      });
    });

    it('should return a stream', () => {
      assert(table.createWriteStream_() instanceof stream.Stream);
    });

    describe('writable stream', () => {
      // tslint:disable-next-line no-any
      let fakeJob: any;
      let fakeJobId: string;

      beforeEach(() => {
        fakeJob = new EventEmitter();
        fakeJobId = uuid.v4();

        fakeUuid.v4 = () => {
          return fakeJobId;
        };
      });

      it('should make a writable stream when written to', done => {
        let stream: stream.Writable;

        makeWritableStreamOverride = (s: {}) => {
          assert.strictEqual(s, stream);
          done();
        };

        stream = table.createWriteStream_();
        stream.emit('writing');
      });

      it('should pass extended metadata', done => {
        makeWritableStreamOverride =
            (stream: stream.Stream, options: JobOptions) => {
              assert.deepStrictEqual(options.metadata, {
                configuration: {
                  load: {
                    a: 'b',
                    c: 'd',
                    destinationTable: {
                      projectId: table.bigQuery.projectId,
                      datasetId: table.dataset.id,
                      tableId: table.id,
                    },
                  },
                },
                jobReference: {
                  projectId: table.bigQuery.projectId,
                  jobId: fakeJobId,
                  location: undefined,
                },
              });
              done();
            };

        table.createWriteStream_({a: 'b', c: 'd'}).emit('writing');
      });

      it('should pass the correct request uri', done => {
        makeWritableStreamOverride =
            (stream: stream.Stream, options: JobOptions) => {
              const uri =
                  'https://www.googleapis.com/upload/bigquery/v2/projects/' +
                  table.bigQuery.projectId + '/jobs';
              assert.strictEqual(options.request.uri, uri);
              done();
            };

        table.createWriteStream_().emit('writing');
      });

      it('should respect the jobPrefix option', done => {
        const jobPrefix = 'abc-';
        const expectedJobId = jobPrefix + fakeJobId;

        makeWritableStreamOverride =
            (stream: stream.Stream, options: JobOptions) => {
              const jobId = options.metadata.jobReference.jobId;
              assert.strictEqual(jobId, expectedJobId);

              const config = options.metadata.configuration.load;
              assert.strictEqual(config.jobPrefix, undefined);

              done();
            };

        table.createWriteStream_({jobPrefix}).emit('writing');
      });

      it('should use the default location', done => {
        const table = new Table(DATASET, TABLE_ID, {location: LOCATION});

        makeWritableStreamOverride =
            (stream: stream.Stream, options: JobOptions) => {
              const location = options.metadata.jobReference.location;
              assert.strictEqual(location, LOCATION);

              done();
            };

        table.createWriteStream_().emit('writing');
      });

      it('should accept a job id', done => {
        const jobId = 'job-id';
        const options = {jobId};

        makeWritableStreamOverride =
            (stream: stream.Stream, options: JobOptions) => {
              const jobReference = options.metadata.jobReference;
              assert.strictEqual(jobReference.jobId, jobId);

              const config = options.metadata.configuration.load;
              assert.strictEqual(config.jobId, undefined);

              done();
            };

        table.createWriteStream_(options).emit('writing');
      });

      it('should create a job and emit it with job', done => {
        const metadata = {
          jobReference: {
            jobId: 'job-id',
            location: 'location',
          },
          a: 'b',
          c: 'd',
        };

        table.bigQuery.job = (id: string, options: {}) => {
          assert.strictEqual(id, metadata.jobReference.jobId);
          assert.deepStrictEqual(options, {
            location: metadata.jobReference.location,
          });
          return fakeJob;
        };

        makeWritableStreamOverride =
            (stream: {}, options: {}, callback: Function) => {
              callback(metadata);
            };

        table.createWriteStream_()
            .on('job',
                (job: Job) => {
                  assert.strictEqual(job, fakeJob);
                  assert.deepStrictEqual(job.metadata, metadata);
                  done();
                })
            .emit('writing');
      });
    });
  });

  describe('createWriteStream', () => {
    let fakeJob: EventEmitter;
    // tslint:disable-next-line no-any
    let fakeStream: any;

    beforeEach(() => {
      fakeJob = new EventEmitter();
      fakeStream = new EventEmitter();
      table.createWriteStream_ = () => fakeStream;
    });

    it('should pass the metadata to the private method', done => {
      const fakeMetadata = {};

      table.createWriteStream_ = (metadata: {}) => {
        assert.strictEqual(metadata, fakeMetadata);
        setImmediate(done);
        return new EventEmitter();
      };

      table.createWriteStream(fakeMetadata);
    });

    it('should cork the stream on prefinish', () => {
      let corked = false;

      fakeStream.cork = () => {
        corked = true;
      };

      table.createWriteStream().emit('prefinish');

      assert.strictEqual(corked, true);
    });

    it('should destroy the stream on job error', done => {
      const error = new Error('error');

      fakeStream.destroy = (err: Error) => {
        assert.strictEqual(err, error);
        done();
      };

      table.createWriteStream().emit('job', fakeJob);
      fakeJob.emit('error', error);
    });

    it('should signal complete upon job complete', done => {
      const stream = table.createWriteStream();

      let uncorked = false;

      stream.uncork = () => {
        uncorked = true;
      };

      stream.on('complete', (job: {}) => {
        assert.strictEqual(job, fakeJob);

        setImmediate(() => {
          assert.strictEqual(uncorked, true);
          done();
        });
      });

      stream.emit('job', fakeJob);
      fakeJob.emit('complete');
    });
  });

  describe('extract', () => {
    // tslint:disable-next-line no-any
    let fakeJob: any;

    beforeEach(() => {
      fakeJob = new EventEmitter();
      table.createExtractJob =
          (destination: {}, metadata: {}, callback: Function) => {
            callback(null, fakeJob);
          };
    });

    it('should pass the arguments to createExtractJob', done => {
      const fakeDestination = {};
      const fakeMetadata = {};

      table.createExtractJob = (destination: {}, metadata: {}) => {
        assert.strictEqual(destination, fakeDestination);
        assert.strictEqual(metadata, fakeMetadata);
        done();
      };

      table.extract(fakeDestination, fakeMetadata, assert.ifError);
    });

    it('should optionally accept metadata', done => {
      table.createExtractJob = (destination: {}, metadata: {}) => {
        assert.deepStrictEqual(metadata, {});
        done();
      };

      table.extract({}, assert.ifError);
    });

    it('should return any createExtractJob errors', done => {
      const error = new Error('err');
      const response = {};

      table.createExtractJob =
          (destination: {}, metadata: {}, callback: Function) => {
            callback(error, null, response);
          };

      table.extract({}, (err: Error, resp: {}) => {
        assert.strictEqual(err, error);
        assert.strictEqual(resp, response);
        done();
      });
    });

    it('should return any job errors', done => {
      const error = new Error('err');

      table.extract({}, (err: Error) => {
        assert.strictEqual(err, error);
        done();
      });

      fakeJob.emit('error', error);
    });

    it('should return the metadata on complete', done => {
      const metadata = {};

      table.extract({}, (err: Error, resp: {}) => {
        assert.ifError(err);
        assert.strictEqual(resp, metadata);
        done();
      });

      fakeJob.emit('complete', metadata);
    });
  });

  describe('getRows', () => {
    it('should accept just a callback', done => {
      table.request = (reqOpts: JobOptions, callback: Function) => {
        callback(null, {});
      };
      table.getRows(done);
    });

    it('should make correct API request', done => {
      const options = {a: 'b', c: 'd'};

      table.request = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.uri, '/data');
        assert.strictEqual(reqOpts.qs, options);
        callback(null, {});
      };

      table.getRows(options, done);
    });

    it('should execute callback with error & API response', done => {
      const apiResponse = {};
      const error = new Error('Error.');

      table.request = (reqOpts: JobOptions, callback: Function) => {
        callback(error, apiResponse);
      };

      table.getRows((err: Error, rows: {}, nextQuery: {}, apiResponse_: {}) => {
        assert.strictEqual(err, error);
        assert.strictEqual(rows, null);
        assert.strictEqual(nextQuery, null);
        assert.strictEqual(apiResponse_, apiResponse);

        done();
      });
    });

    describe('refreshing metadata', () => {
      // Using "Stephen" so you know who to blame for these tests.
      const rows = [{f: [{v: 'stephen'}]}];
      const schema = {fields: [{name: 'name', type: 'string'}]};
      const mergedRows = [{name: 'stephen'}];

      beforeEach(() => {
        // tslint:disable-next-line no-any
        table.request = (reqOpts: JobOptions, callback: any) => {
          // Respond with a row, so it grabs the schema.
          // Use setImmediate to let our getMetadata overwrite process.
          setImmediate(callback, null, {rows});
        };

        sandbox.restore();
        sandbox.stub(BigQuery, 'mergeSchemaWithRows_')
            .callsFake((schema_, rows_) => {
              assert.strictEqual(schema_, schema);
              assert.strictEqual(rows_, rows);
              return mergedRows;
            });
      });

      it('should refresh', done => {
        // Step 1: makes the request.
        table.getRows(responseHandler);

        // Step 2: refreshes the metadata to pull down the schema.
        table.getMetadata = (callback: Function) => {
          table.metadata = {schema};
          callback();
        };

        // Step 3: execute original complete handler with schema-merged rows.
        function responseHandler(err: Error, rows: {}) {
          assert.ifError(err);
          assert.strictEqual(rows, mergedRows);
          done();
        }
      });

      it('should execute callback from refreshing metadata', done => {
        const apiResponse = {};
        const error = new Error('Error.');

        // Step 1: makes the request.
        table.getRows(responseHandler);

        // Step 2: refreshes the metadata to pull down the schema.
        table.getMetadata = (callback: Function) => {
          callback(error, {}, apiResponse);
        };

        // Step 3: execute original complete handler with schema-merged rows.
        function responseHandler(
            err: Error, rows: {}, nextQuery: {}, apiResponse_: {}) {
          assert.strictEqual(err, error);
          assert.strictEqual(rows, null);
          assert.strictEqual(nextQuery, null);
          assert.strictEqual(apiResponse_, apiResponse);
          done();
        }
      });
    });

    it('should return schema-merged rows', done => {
      const rows = [{f: [{v: 'stephen'}]}];
      const schema = {fields: [{name: 'name', type: 'string'}]};
      const merged = [{name: 'stephen'}];

      table.metadata = {schema};

      table.request = (reqOpts: JobOptions, callback: Function) => {
        callback(null, {rows});
      };

      sandbox.restore();
      sandbox.stub(BigQuery, 'mergeSchemaWithRows_')
          .callsFake((schema_, rows_) => {
            assert.strictEqual(schema_, schema);
            assert.strictEqual(rows_, rows);
            return merged;
          });

      table.getRows((err: Error, rows: {}) => {
        assert.ifError(err);
        assert.strictEqual(rows, merged);
        done();
      });
    });

    it('should return apiResponse in callback', done => {
      const rows = [{f: [{v: 'stephen'}]}];
      const schema = {fields: [{name: 'name', type: 'string'}]};
      table.metadata = {schema};

      table.request = (reqOpts: JobOptions, callback: Function) => {
        callback(null, {rows});
      };

      table.getRows((err: Error, rows: {}, nextQuery: {}, apiResponse: {}) => {
        assert.ifError(err);
        assert.deepStrictEqual(apiResponse, {rows: [{f: [{v: 'stephen'}]}]});
        done();
      });
    });

    it('should pass nextQuery if pageToken is returned', done => {
      const options = {a: 'b', c: 'd'};
      const pageToken = 'token';

      // Set a schema so it doesn't try to refresh the metadata.
      table.metadata = {schema: {}};

      table.request = (reqOpts: JobOptions, callback: Function) => {
        callback(null, {pageToken});
      };

      table.getRows(options, (err: Error, rows: {}, nextQuery: {}) => {
        assert.ifError(err);
        assert.deepStrictEqual(nextQuery, {
          a: 'b',
          c: 'd',
          pageToken,
        });
        // Original object isn't affected.
        assert.deepStrictEqual(options, {a: 'b', c: 'd'});
        done();
      });
    });
  });

  describe('insert', () => {
    const fakeInsertId = 'fake-insert-id';

    const data = [
      {state: 'MI', gender: 'M', year: '2015', name: 'Berkley', count: '0'},
      {state: 'MI', gender: 'M', year: '2015', name: 'Berkley', count: '0'},
      {state: 'MI', gender: 'M', year: '2015', name: 'Berkley', count: '0'},
      {state: 'MI', gender: 'M', year: '2015', name: 'Berkley', count: '0'},
      {state: 'MI', gender: 'M', year: '2015', name: 'Berkley', count: '0'},
    ];

    const rawData = [
      {insertId: 1, json: data[0]},
      {insertId: 2, json: data[1]},
      {insertId: 3, json: data[2]},
      {insertId: 4, json: data[3]},
      {insertId: 5, json: data[4]},
    ];

    const dataApiFormat = {
      rows: data.map(row => {
        return {
          insertId: fakeInsertId,
          json: row,
        };
      }),
    };

    beforeEach(() => {
      fakeUuid.v4 = () => {
        return fakeInsertId;
      };
    });

    it('should throw an error if rows is empty', () => {
      assert.throws(() => {
        table.insert([]);
      }, /You must provide at least 1 row to be inserted\./);
    });

    it('should save data', done => {
      table.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.method, 'POST');
        assert.strictEqual(reqOpts.uri, '/insertAll');
        assert.deepStrictEqual(reqOpts.json, dataApiFormat);
        done();
      };

      table.insert(data, done);
    });

    it('should generate insertId', done => {
      table.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.json.rows[0].insertId, fakeInsertId);
        done();
      };

      table.insert([data[0]], done);
    });

    it('should execute callback with API response', done => {
      const apiResponse = {insertErrors: []};

      table.request = (reqOpts: JobOptions, callback: Function) => {
        callback(null, apiResponse);
      };

      table.insert(data, (err: Error, apiResponse_: {}) => {
        assert.ifError(err);
        assert.strictEqual(apiResponse_, apiResponse);
        done();
      });
    });

    it('should execute callback with error & API response', done => {
      const error = new Error('Error.');
      const apiResponse = {};

      table.request = (reqOpts: JobOptions, callback: Function) => {
        callback(error, apiResponse);
      };

      table.insert(data, (err: Error, apiResponse_: {}) => {
        assert.strictEqual(err, error);
        assert.strictEqual(apiResponse_, apiResponse);
        done();
      });
    });

    it('should return partial failures', done => {
      const row0Error = {message: 'Error.', reason: 'notFound'};
      const row1Error = {message: 'Error.', reason: 'notFound'};

      table.request = (reqOpts: JobOptions, callback: Function) => {
        callback(null, {
          insertErrors: [
            {index: 0, errors: [row0Error]},
            {index: 1, errors: [row1Error]},
          ],
        });
      };

      table.insert(data, (err: Error) => {
        assert.strictEqual(err.name, 'PartialFailureError');

        assert.deepStrictEqual((err as {} as GoogleErrorBody).errors, [
          {
            row: dataApiFormat.rows[0].json,
            errors: [row0Error],
          },
          {
            row: dataApiFormat.rows[1].json,
            errors: [row1Error],
          },
        ]);

        done();
      });
    });

    it('should insert raw data', done => {
      table.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.method, 'POST');
        assert.strictEqual(reqOpts.uri, '/insertAll');
        assert.deepStrictEqual(reqOpts.json, {rows: rawData});
        assert.strictEqual(reqOpts.json.raw, undefined);
        done();
      };

      const opts = {raw: true};
      table.insert(rawData, opts, done);
    });

    it('should accept options', done => {
      const opts = {
        ignoreUnknownValues: true,
        skipInvalidRows: true,
        templateSuffix: 'test',
      };

      table.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.method, 'POST');
        assert.strictEqual(reqOpts.uri, '/insertAll');

        assert.strictEqual(
            reqOpts.json.ignoreUnknownValues, opts.ignoreUnknownValues);
        assert.strictEqual(reqOpts.json.skipInvalidRows, opts.skipInvalidRows);
        assert.strictEqual(reqOpts.json.templateSuffix, opts.templateSuffix);

        assert.deepStrictEqual(reqOpts.json.rows, dataApiFormat.rows);
        done();
      };

      table.insert(data, opts, done);
    });

    describe('create table and retry', () => {
      const OPTIONS = {
        autoCreate: true,
        schema: SCHEMA_STRING,
      };

      // tslint:disable-next-line no-any
      let _setTimeout: any;
      // tslint:disable-next-line no-any
      let _random: any;

      before(() => {
        _setTimeout = global.setTimeout;
        _random = Math.random;
      });

      beforeEach(() => {
        sandbox.stub(global, 'setTimeout').callsFake(cb => cb());
        Math.random = _random;
        table.request = (reqOpts: JobOptions, callback: Function) => {
          callback({code: 404});
        };
        table.create = (reqOpts: JobOptions, callback: Function) => {
          callback(null);
        };
      });

      after(() => {
        global.setTimeout = _setTimeout;
        Math.random = _random;
      });

      it('should throw if autoCreate is set with no schema', () => {
        const options = {
          autoCreate: true,
        };

        assert.throws(() => {
          table.insert(data, options);
        }, /Schema must be provided in order to auto-create Table\./);
      });

      it('should not include the schema in the insert request', done => {
        table.request = (reqOpts: DecorateRequestOptions) => {
          assert.strictEqual(reqOpts.json.schema, undefined);
          assert.strictEqual(reqOpts.json.autoCreate, undefined);
          done();
        };

        table.insert(data, OPTIONS, assert.ifError);
      });

      it('should set a timeout to create the table', done => {
        const fakeRandomValue = Math.random();

        Math.random = () => {
          return fakeRandomValue;
        };

        sandbox.restore();
        sandbox.stub(global, 'setTimeout').callsFake((callback, delay) => {
          assert.strictEqual(delay, fakeRandomValue * 60000);
          callback();
        });

        table.create = (reqOpts: JobOptions) => {
          assert.strictEqual(reqOpts.schema, SCHEMA_STRING);
          done();
        };

        table.insert(data, OPTIONS, assert.ifError);
      });

      it('should return table creation errors', done => {
        const error = new Error('err.');
        const response = {};

        table.create = (reqOpts: JobOptions, callback: Function) => {
          callback(error, null, response);
        };

        table.insert(data, OPTIONS, (err: Error, resp: {}) => {
          assert.strictEqual(err, error);
          assert.strictEqual(resp, response);
          done();
        });
      });

      it('should ignore 409 errors', done => {
        table.create = (reqOpts: JobOptions, callback: Function) => {
          callback({code: 409});
        };

        let timeouts = 0;
        sandbox.restore();
        sandbox.stub(global, 'setTimeout').callsFake((callback, delay) => {
          if (++timeouts === 2) {
            assert.strictEqual(delay, 60000);
            done();
            return;
          }

          callback(null);
        });

        table.insert(data, OPTIONS, assert.ifError);
      });

      it('should retry the insert', done => {
        const response = {};
        let attempts = 0;

        table.request = (reqOpts: JobOptions, callback: Function) => {
          assert.strictEqual(reqOpts.method, 'POST');
          assert.strictEqual(reqOpts.uri, '/insertAll');
          assert.deepStrictEqual(reqOpts.json, dataApiFormat);

          if (++attempts === 2) {
            callback(null, response);
            return;
          }

          callback({code: 404});
        };

        table.insert(data, OPTIONS, (err: Error, resp: {}) => {
          assert.ifError(err);
          assert.strictEqual(resp, response);
          done();
        });
      });
    });
  });

  describe('load', () => {
    // tslint:disable-next-line no-any
    let fakeJob: any;

    beforeEach(() => {
      fakeJob = new EventEmitter();
      table.createLoadJob = (source: {}, metadata: {}, callback: Function) => {
        callback(null, fakeJob);
      };
    });

    it('should pass the arguments to createLoadJob', done => {
      const fakeSource = {};
      const fakeMetadata = {};

      table.createLoadJob = (source: {}, metadata: {}) => {
        assert.strictEqual(source, fakeSource);
        assert.strictEqual(metadata, fakeMetadata);
        done();
      };

      table.load(fakeSource, fakeMetadata, assert.ifError);
    });

    it('should optionally accept metadata', done => {
      table.createLoadJob = (source: {}, metadata: {}) => {
        assert.deepStrictEqual(metadata, {});
        done();
      };

      table.load({}, assert.ifError);
    });

    it('should return any createLoadJob errors', done => {
      const error = new Error('err');
      const response = {};

      table.createLoadJob = (source: {}, metadata: {}, callback: Function) => {
        callback(error, null, response);
      };

      table.load({}, (err: Error, resp: {}) => {
        assert.strictEqual(err, error);
        assert.strictEqual(resp, response);
        done();
      });
    });

    it('should return any job errors', done => {
      const error = new Error('err');

      table.load({}, (err: Error) => {
        assert.strictEqual(err, error);
        done();
      });

      fakeJob.emit('error', error);
    });

    it('should return the metadata on complete', done => {
      const metadata = {};

      table.load({}, (err: Error, resp: {}) => {
        assert.ifError(err);
        assert.strictEqual(resp, metadata);
        done();
      });

      fakeJob.emit('complete', metadata);
    });
  });

  describe('query', () => {
    it('should pass args through to datasetInstance.query()', done => {
      table.dataset.query = (a: {}, b: {}) => {
        assert.strictEqual(a, 'a');
        assert.strictEqual(b, 'b');
        done();
      };

      table.query('a', 'b');
    });
  });

  describe('setMetadata', () => {
    it('should call ServiceObject#setMetadata', done => {
      const fakeMetadata = {};
      const formattedMetadata = {};

      Table.formatMetadata_ = (data: {}) => {
        assert.strictEqual(data, fakeMetadata);
        return formattedMetadata;
      };

      // tslint:disable-next-line:no-any
      (FakeServiceObject.prototype as any).setMetadata = function(
          metadata: {}, callback: Function) {
        assert.strictEqual(this, table);
        assert.strictEqual(metadata, formattedMetadata);
        assert.strictEqual(callback, done);
        callback!(null);  // the done fn
      };

      table.setMetadata(fakeMetadata, done);
    });
  });
});

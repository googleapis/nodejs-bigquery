// Copyright 2014 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  DecorateRequestOptions,
  ServiceObject,
  ServiceObjectConfig,
  util,
} from '@google-cloud/common';
import {GoogleErrorBody} from '@google-cloud/common/build/src/util';
import * as pfy from '@google-cloud/promisify';
import {File} from '@google-cloud/storage';
import arrify = require('arrify');
import * as assert from 'assert';
import {describe, it, afterEach, beforeEach, before, after} from 'mocha';
import Big from 'big.js';
import {EventEmitter} from 'events';
import * as extend from 'extend';
import * as pReflect from 'p-reflect';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as stream from 'stream';
import * as uuid from 'uuid';

import {BigQuery, Query} from '../src/bigquery';
import {Job, JobOptions} from '../src/job';
import {
  CopyTableMetadata,
  InsertRowsResponse,
  JobLoadMetadata,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Table,
  ViewDefinition,
} from '../src/table';
import bigquery from '../src/types';

interface CalledWithTable extends ServiceObject {
  calledWith_: Array<{
    parent: {};
    baseUrl: string;
    id: string;
    methods: string[];
  }>;
}

let promisified = false;
let makeWritableStreamOverride: Function | null;
let isCustomTypeOverride: Function | null;
const fakeUtil = Object.assign({}, util, {
  isCustomType: (...args: Array<{}>) => {
    return (isCustomTypeOverride || util.isCustomType)(...args);
  },
  makeWritableStream: (...args: Array<{}>) => {
    (makeWritableStreamOverride || util.makeWritableStream)(...args);
  },
  noop: () => {},
});
const fakePfy = Object.assign({}, pfy, {
  promisifyAll: (c: Function) => {
    if (c.name === 'Table') {
      promisified = true;
    }
    pfy.promisifyAll(c);
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
  },
};

let fakeUuid = extend(true, {}, uuid);

class FakeServiceObject extends ServiceObject {
  calledWith_: IArguments;
  constructor(config: ServiceObjectConfig) {
    super(config);
    // eslint-disable-next-line prefer-rest-params
    this.calledWith_ = arguments;
  }
}

interface MakeWritableStreamOptions {
  metadata: bigquery.IJob;
  request: {uri: string};
}

const sandbox = sinon.createSandbox();

describe('BigQuery/Table', () => {
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Table[tableMethod] = (...args: any[]) => {
        const method = tableOverrides[tableMethod] || tableCached[tableMethod];
        return method(...args);
      };
    });
  });

  beforeEach(() => {
    fakeUuid = Object.assign(fakeUuid, uuid);
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

  afterEach(() => sandbox.restore());

  const DATASET = {
    id: 'dataset-id',
    createTable: util.noop,
    bigQuery: {
      projectId: 'project-id',
      job: (id: string) => {
        return {id};
      },
      apiEndpoint: 'bigquery.googleapis.com',
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let Table: any;
  const TABLE_ID = 'kittens';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let table: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tableOverrides: any = {};

  describe('instantiation', () => {
    it('should extend the correct methods', () => {
      assert(extended); // See `fakePaginator.extend`
    });

    it('should streamify the correct methods', () => {
      assert.strictEqual(table.createReadStream, 'getRows');
    });

    it('should promisify all the things', () => {
      assert(promisified);
    });

    it('should inherit from ServiceObject', done => {
      const datasetInstance = Object.assign({}, DATASET, {
        createTable: {
          bind: (context: {}) => {
            assert.strictEqual(context, datasetInstance);
            done();
          },
        },
      });

      const table = new Table(datasetInstance, TABLE_ID);
      assert(table instanceof ServiceObject);

      const calledWith = (table as CalledWithTable).calledWith_[0];

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

        const expectedHeaders = Object.assign({}, fakeReqOpts.headers, {
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
        Table.createSchemaFromString_(SCHEMA_STRING),
        SCHEMA_OBJECT
      );
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
        Table.encodeValue_(new Big('99999999999999999999999999999.999999999')),
        '99999999999999999999999999999.999999999'
      );
      assert.strictEqual(
        Table.encodeValue_(new Big('-99999999999999999999999999999.999999999')),
        '-99999999999999999999999999999.999999999'
      );
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

    it('should allow the view option to be passed as a pre-formatted object', () => {
      const view: ViewDefinition = {query: 'abc', useLegacySql: false};

      const {view: formattedView} = Table.formatMetadata_({view});

      assert.deepStrictEqual(formattedView, view);
    });
  });

  describe('copy', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fakeJob: any;

    beforeEach(() => {
      fakeJob = new EventEmitter();
      table.createCopyJob = (
        destination: {},
        metadata: {},
        callback: Function
      ) => {
        callback(null, fakeJob);
      };
    });

    it('should pass the arguments to createCopyJob', done => {
      const fakeDestination = {};
      const fakeMetadata: CopyTableMetadata = {
        createDisposition: 'CREATE_NEVER',
        writeDisposition: 'WRITE_TRUNCATE',
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

      table.createCopyJob = (
        destination: {},
        metadata: {},
        callback: Function
      ) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fakeJob: any;

    beforeEach(() => {
      fakeJob = new EventEmitter();
      table.createCopyFromJob = (
        sourceTables: {},
        metadata: {},
        callback: Function
      ) => {
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

      table.createCopyFromJob = (
        sourceTables: {},
        metadata: {},
        callback: Function
      ) => {
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

    it('should throw if a destination is not a Table', async () => {
      await assert.rejects(
        async () => table.createCopyJob(),
        /Destination must be a Table/
      );

      await assert.rejects(
        async () => table.createCopyJob({}),
        /Destination must be a Table/
      );

      await assert.rejects(
        async () => table.createCopyJob(() => {}),
        /Destination must be a Table/
      );
    });

    it('should send correct request to the API', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
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
        assert.strictEqual(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (reqOpts.configuration!.copy as any).jobPrefix,
          undefined
        );
        callback(); // the done fn
      };

      table.createCopyJob(DEST_TABLE, options, done);
    });

    it('should use the default location', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.location, LOCATION);
        callback(); // the done fn
      };

      table.location = LOCATION;
      table.createCopyJob(DEST_TABLE, done);
    });

    it('should accept a job id', done => {
      const jobId = 'job-id';
      const options = {jobId};

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.jobId, jobId);
        assert.strictEqual(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (reqOpts.configuration!.copy as any).jobId,
          undefined
        );
        callback(); // the done fn
      };

      table.createCopyJob(DEST_TABLE, options, done);
    });

    it('should pass the callback to createJob', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback(); // the done fn
      };

      table.createCopyJob(DEST_TABLE, {}, done);
    });

    it('should optionally accept metadata', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback(); // the done fn
      };

      table.createCopyJob(DEST_TABLE, done);
    });
  });

  describe('createCopyFromJob', () => {
    let SOURCE_TABLE: Table;

    before(() => {
      SOURCE_TABLE = new Table(DATASET, 'source-table');
    });

    it('should throw if a source is not a Table', async () => {
      await assert.rejects(
        async () => table.createCopyFromJob(['table']),
        /Source must be a Table/
      );

      await assert.rejects(
        async () => table.createCopyFromJob([SOURCE_TABLE, 'table']),
        /Source must be a Table/
      );

      await assert.rejects(
        async () => table.createCopyFromJob({}),
        /Source must be a Table/
      );

      await assert.rejects(
        async () => table.createCopyFromJob(() => {}),
        /Source must be a Table/
      );
    });

    it('should send correct request to the API', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
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
        assert.deepStrictEqual(reqOpts.configuration!.copy!.sourceTables, [
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
        assert.strictEqual(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (reqOpts.configuration!.copy as any).jobPrefix,
          undefined
        );
        callback(); // the done fn
      };

      table.createCopyFromJob(SOURCE_TABLE, options, done);
    });

    it('should use the default location', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.location, LOCATION);
        callback(); // the done fn
      };

      table.location = LOCATION;
      table.createCopyFromJob(SOURCE_TABLE, done);
    });

    it('should accept a job id', done => {
      const jobId = 'job-id';
      const options = {jobId};

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.jobId, jobId);
        assert.strictEqual(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (reqOpts.configuration!.copy as any).jobId,
          undefined
        );
        callback(); // the done fn
      };

      table.createCopyFromJob(SOURCE_TABLE, options, done);
    });

    it('should pass the callback to createJob', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback(); // the done fn
      };

      table.createCopyFromJob(SOURCE_TABLE, {}, done);
    });

    it('should optionally accept options', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback(); // the done fn
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
        assert.deepStrictEqual(reqOpts.configuration!.extract!.sourceTable, {
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
          const extract = reqOpts.configuration!.extract!;
          assert.strictEqual(extract.destinationFormat, 'CSV');
          done();
        };

        table.createExtractJob(FILE, {format: 'csv'}, assert.ifError);
      });

      it('should accept json', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const extract = reqOpts.configuration!.extract!;
          assert.strictEqual(
            extract.destinationFormat,
            'NEWLINE_DELIMITED_JSON'
          );
          done();
        };

        table.createExtractJob(FILE, {format: 'json'}, assert.ifError);
      });

      it('should accept avro', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const extract = reqOpts.configuration!.extract!;
          assert.strictEqual(extract.destinationFormat, 'AVRO');
          done();
        };

        table.createExtractJob(FILE, {format: 'avro'}, assert.ifError);
      });

      it('should accept orc', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const extract = reqOpts.configuration!.extract!;
          assert.strictEqual(extract.destinationFormat, 'ORC');
          done();
        };

        table.createExtractJob(FILE, {format: 'orc'}, assert.ifError);
      });

      it('should accept parquet', done => {
        table.bigQuery.createJob = (reqOpts: JobOptions) => {
          const extract = reqOpts.configuration!.extract!;
          assert.strictEqual(extract.destinationFormat, 'PARQUET');
          done();
        };

        table.createExtractJob(FILE, {format: 'parquet'}, assert.ifError);
      });
    });

    it('should parse out full gs:// urls from files', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        assert.deepStrictEqual(
          reqOpts.configuration!.extract!.destinationUris,
          ['gs://' + FILE.bucket.name + '/' + FILE.name]
        );
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
        const destFormat = reqOpts.configuration!.extract!.destinationFormat;
        assert.strictEqual(destFormat, 'NEWLINE_DELIMITED_JSON');
        done();
      };

      table.createExtractJob(FILE, assert.ifError);
    });

    it('should assign the provided format if matched', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions) => {
        const extract = reqOpts.configuration!.extract!;
        assert.strictEqual(extract.destinationFormat, 'CSV');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assert.strictEqual((extract as any).format, undefined);
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
        assert.strictEqual(reqOpts.configuration!.extract!.compression, 'GZIP');
        assert.strictEqual(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (reqOpts.configuration!.extract as any).gzip,
          undefined
        );
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
        assert.strictEqual(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (reqOpts.configuration!.extract as any).jobPrefix,
          undefined
        );
        callback(); // the done fn
      };

      table.createExtractJob(FILE, options, done);
    });

    it('should use the default location', done => {
      const table = new Table(DATASET, TABLE_ID, {location: LOCATION});

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.location, LOCATION);
        callback(); // the done fn
      };

      table.createExtractJob(FILE, done);
    });

    it('should accept a job id', done => {
      const jobId = 'job-id';
      const options = {jobId};

      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(reqOpts.jobId, jobId);
        assert.strictEqual(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (reqOpts.configuration!.extract as any).jobId,
          undefined
        );
        callback(); // the done fn
      };

      table.createExtractJob(FILE, options, done);
    });

    it('should pass the callback to createJob', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback(); // the done fn
      };

      table.createExtractJob(FILE, {}, done);
    });

    it('should optionally accept options', done => {
      table.bigQuery.createJob = (reqOpts: JobOptions, callback: Function) => {
        assert.strictEqual(done, callback);
        callback(); // the done fn
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

    let bqCreateJobStub: sinon.SinonStub;

    beforeEach(() => {
      bqCreateJobStub = sinon
        .stub(table.bigQuery, 'createJob')
        .resolves([JOB, JOB.metadata]);
      isCustomTypeOverride = () => {
        return true;
      };
    });

    afterEach(() => {
      bqCreateJobStub.restore();
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

    it('should throw if a File object is not provided', async () => {
      isCustomTypeOverride = () => {
        return false;
      };
      await assert.rejects(
        async () => table.createLoadJob({}),
        /Source must be a File object/
      );
    });

    it('should convert File objects to gs:// urls', async () => {
      await table.createLoadJob(FILE);
      assert(bqCreateJobStub.calledOnce);
      assert(
        bqCreateJobStub.calledWithMatch({
          configuration: {
            load: {
              sourceUris: ['gs://' + FILE.bucket.name + '/' + FILE.name],
            },
          },
        })
      );
    });

    it('should infer the file format from a File object', async () => {
      await table.createLoadJob(FILE);
      assert(bqCreateJobStub.calledOnce);
      assert(
        bqCreateJobStub.calledWithMatch({
          configuration: {
            load: {
              sourceFormat: 'NEWLINE_DELIMITED_JSON',
            },
          },
        })
      );
    });

    it('should not override a provided format with a File', async () => {
      await table.createLoadJob(FILE, {sourceFormat: 'AVRO'});
      assert(bqCreateJobStub.calledOnce);
      assert(
        bqCreateJobStub.calledWithMatch({
          configuration: {
            load: {
              sourceFormat: 'AVRO',
            },
          },
        })
      );
    });

    it('should use bigQuery.createJob', async () => {
      await table.createLoadJob(FILE, {});
      assert(bqCreateJobStub.calledOnce);
    });

    it('should optionally accept options', async () => {
      await table.createLoadJob(FILE);
      assert(bqCreateJobStub.calledOnce);
    });

    it('should set the job prefix', async () => {
      const jobPrefix = 'abc';
      await table.createLoadJob(FILE, {jobPrefix});
      assert(bqCreateJobStub.calledOnce);
      assert(
        bqCreateJobStub.calledWithMatch({
          jobPrefix,
          configuration: {
            load: {
              jobPrefix: undefined,
            },
          },
        })
      );
    });

    it('should use the default location', async () => {
      const table = new Table(DATASET, TABLE_ID, {location: LOCATION});
      await table.createLoadJob(FILE);
      assert(bqCreateJobStub.calledWithMatch({location: LOCATION}));
    });

    it('should accept a job id', async () => {
      const jobId = 'job-id';
      await table.createLoadJob(FILE, {jobId});
      assert(bqCreateJobStub.calledOnce);
      assert(
        bqCreateJobStub.calledWithMatch({
          jobId,
          configuration: {
            load: {
              jobId: undefined,
            },
          },
        })
      );
    });

    describe('formats', () => {
      it('should accept csv', async () => {
        await table.createLoadJob(FILE, {format: 'csv'});
        assert(bqCreateJobStub.calledOnce);
        assert(
          bqCreateJobStub.calledWithMatch({
            configuration: {
              load: {
                sourceFormat: 'CSV',
              },
            },
          })
        );
      });

      it('should accept json', async () => {
        await table.createLoadJob(FILE, {format: 'json'});
        assert(bqCreateJobStub.calledOnce);
        assert(
          bqCreateJobStub.calledWithMatch({
            configuration: {
              load: {
                sourceFormat: 'NEWLINE_DELIMITED_JSON',
              },
            },
          })
        );
      });

      it('should accept avro', async () => {
        await table.createLoadJob(FILE, {format: 'avro'});
        assert(bqCreateJobStub.calledOnce);
        assert(
          bqCreateJobStub.calledWithMatch({
            configuration: {
              load: {
                sourceFormat: 'AVRO',
              },
            },
          })
        );
      });
    });
  });

  describe('createQueryJob', () => {
    it('should call through to dataset#createQueryJob', done => {
      const fakeOptions = {};
      const fakeReturnValue = {};

      table.dataset.createQueryJob = (options: Query, callback: Function) => {
        assert.strictEqual(options, fakeOptions);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        makeWritableStreamOverride = (
          stream: stream.Stream,
          options: MakeWritableStreamOptions
        ) => {
          const load = options.metadata.configuration!.load!;
          assert.strictEqual(load.sourceFormat, 'CSV');
          done();
        };

        table.createWriteStream_('csv').emit('writing');
      });

      it('should accept json', done => {
        makeWritableStreamOverride = (
          stream: stream.Stream,
          options: MakeWritableStreamOptions
        ) => {
          const load = options.metadata.configuration!.load!;
          assert.strictEqual(load.sourceFormat, 'NEWLINE_DELIMITED_JSON');
          done();
        };

        table.createWriteStream_('json').emit('writing');
      });

      it('should accept avro', done => {
        makeWritableStreamOverride = (
          stream: stream.Stream,
          options: MakeWritableStreamOptions
        ) => {
          const load = options.metadata.configuration!.load!;
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

      makeWritableStreamOverride = (
        stream: stream.Stream,
        options: MakeWritableStreamOptions
      ) => {
        const load = options.metadata.configuration!.load!;
        assert.deepStrictEqual(load.schema, expectedSchema);
        done();
      };

      table.createWriteStream_({schema: SCHEMA_STRING}).emit('writing');
    });

    it('should return a stream', () => {
      assert(table.createWriteStream_() instanceof stream.Stream);
    });

    describe('writable stream', () => {
      let fakeJob: EventEmitter;
      let fakeJobId: string;

      beforeEach(() => {
        fakeJob = new EventEmitter();
        fakeJobId = uuid.v4();
        sandbox.stub(fakeUuid, 'v4').returns(fakeJobId);
      });

      it('should make a writable stream when written to', done => {
        makeWritableStreamOverride = (s: {}) => {
          assert.strictEqual(s, stream);
          done();
        };
        const stream = table.createWriteStream_();
        stream.emit('writing');
      });

      it('should pass extended metadata', done => {
        makeWritableStreamOverride = (
          stream: stream.Stream,
          options: MakeWritableStreamOptions
        ) => {
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
        makeWritableStreamOverride = (
          stream: stream.Stream,
          options: MakeWritableStreamOptions
        ) => {
          const uri =
            'https://bigquery.googleapis.com/upload/bigquery/v2/projects/' +
            table.bigQuery.projectId +
            '/jobs';
          assert.strictEqual(options.request.uri, uri);
          done();
        };

        table.createWriteStream_().emit('writing');
      });

      it('should respect the jobPrefix option', done => {
        const jobPrefix = 'abc-';
        const expectedJobId = jobPrefix + fakeJobId;

        makeWritableStreamOverride = (
          stream: stream.Stream,
          options: MakeWritableStreamOptions
        ) => {
          const jobId = options.metadata.jobReference!.jobId;
          assert.strictEqual(jobId, expectedJobId);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const config = options.metadata.configuration!.load as any;
          assert.strictEqual(config.jobPrefix, undefined);

          done();
        };

        table.createWriteStream_({jobPrefix}).emit('writing');
      });

      it('should use the default location', done => {
        const table = new Table(DATASET, TABLE_ID, {location: LOCATION});

        makeWritableStreamOverride = (
          stream: stream.Stream,
          options: MakeWritableStreamOptions
        ) => {
          const location = options.metadata.jobReference!.location;
          assert.strictEqual(location, LOCATION);

          done();
        };

        table.createWriteStream_().emit('writing');
      });

      it('should accept a job id', done => {
        const jobId = 'job-id';
        const options = {jobId};

        makeWritableStreamOverride = (
          stream: stream.Stream,
          options: MakeWritableStreamOptions
        ) => {
          const jobReference = options.metadata.jobReference!;
          assert.strictEqual(jobReference.jobId, jobId);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const config = options.metadata.configuration!.load as any;
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
          assert.strictEqual(id, metadata.jobReference!.jobId);
          assert.deepStrictEqual(options, {
            location: metadata.jobReference!.location,
          });
          return fakeJob;
        };

        makeWritableStreamOverride = (
          stream: {},
          options: {},
          callback: Function
        ) => {
          callback(metadata);
        };

        table
          .createWriteStream_()
          .on('job', (job: Job) => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fakeJob: any;

    beforeEach(() => {
      fakeJob = new EventEmitter();
      table.createExtractJob = (
        destination: {},
        metadata: {},
        callback: Function
      ) => {
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

      table.createExtractJob = (
        destination: {},
        metadata: {},
        callback: Function
      ) => {
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
      table.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, {});
      };
      table.getRows(done);
    });

    it('should make correct API request', done => {
      const options = {a: 'b', c: 'd'};

      table.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        assert.strictEqual(reqOpts.uri, '/data');
        assert.strictEqual(reqOpts.qs, options);
        callback(null, {});
      };

      table.getRows(options, done);
    });

    it('should execute callback with error & API response', done => {
      const apiResponse = {};
      const error = new Error('Error.');

      table.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        table.request = (reqOpts: DecorateRequestOptions, callback: any) => {
          // Respond with a row, so it grabs the schema.
          // Use setImmediate to let our getMetadata overwrite process.
          setImmediate(callback, null, {rows});
        };

        sandbox.restore();
        sandbox
          .stub(BigQuery, 'mergeSchemaWithRows_')
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
          err: Error,
          rows: {},
          nextQuery: {},
          apiResponse_: {}
        ) {
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

      table.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, {rows});
      };

      sandbox.restore();
      sandbox
        .stub(BigQuery, 'mergeSchemaWithRows_')
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

      table.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
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

      table.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
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

    const OPTIONS = {
      schema: SCHEMA_STRING,
    };

    let clock: sinon.SinonFakeTimers;
    let insertSpy: sinon.SinonSpy;
    let requestStub: sinon.SinonStub;

    before(() => {
      clock = sinon.useFakeTimers() as sinon.SinonFakeTimers;
    });

    beforeEach(() => {
      insertSpy = sinon.spy(table, '_insert');
      requestStub = sinon.stub(table, 'request').resolves([{}]);
      sandbox.stub(fakeUuid, 'v4').returns(fakeInsertId);
    });

    afterEach(() => {
      clock.reset();
      insertSpy.restore();
    });

    after(() => {
      clock.restore();
    });

    /**
     * Only use this method when NOT directly awaiting on `table.insert`, i.e.
     * when relying on any of the fake timer async helpers.
     * Tests should assert isRejected or isFulfilled.
     * @ignore
     * @param fn
     * @returns {Promise<pReflect.PromiseResult<any>>}
     */
    async function reflectAfterTimer<FnReturn>(
      fn: () => Promise<FnReturn>
    ): Promise<pReflect.PromiseResult<FnReturn>> {
      // When `fn` rejects/throws, we need to capture this and test
      // for it as needed. Using reflection avoids try/catch's potential for
      // false-positives.
      // Also, defer capturing the settled promise until _after_ the
      // internal timer (delay) has been completed.

      const fnPromise: Promise<FnReturn> = fn();
      const reflectedPromise: Promise<pReflect.PromiseResult<
        FnReturn
      >> = pReflect(fnPromise);

      await clock.runAllAsync();
      return reflectedPromise;
    }

    it('should throw an error if rows is empty', async () => {
      await assert.rejects(
        async () => table.insert([]),
        /You must provide at least 1 row to be inserted/
      );
    });

    it('should save data', async () => {
      await table.insert(data);
      assert(
        requestStub.calledOnceWithExactly({
          method: 'POST',
          uri: '/insertAll',
          json: dataApiFormat,
        })
      );
    });

    it('should generate insertId', async () => {
      await table.insert([data[0]]);
      assert(
        requestStub.calledOnceWith(
          sinon.match.hasNested('json.rows[0].insertId', fakeInsertId)
        )
      );
    });

    it('should omit the insertId if createInsertId is false', async () => {
      await table.insert([data[0]], {createInsertId: false});
      assert(requestStub.calledOnce);
      assert(
        requestStub.calledWithMatch(
          ({json}: DecorateRequestOptions) =>
            json.rows[0].insertId === undefined &&
            json.createInsertId === undefined
        )
      );
    });

    it('should execute callback with API response', done => {
      const apiResponse = {insertErrors: []};
      requestStub.resolves([apiResponse]);

      table.insert(data, (err: Error, apiResponse_: {}) => {
        assert.ifError(err);
        assert.strictEqual(apiResponse_, apiResponse);
        done();
      });
    });

    it('should execute callback with error & API response', done => {
      const error = new Error('Error.');
      requestStub.rejects(error);

      table.insert(data, (err: Error, apiResponse_: {}) => {
        assert.strictEqual(err, error);
        assert.strictEqual(apiResponse_, null);
        done();
      });
    });

    it('should reject with API error', async () => {
      const error = new Error('Error.');
      requestStub.rejects(error);
      await assert.rejects(async () => table.insert(data), error);
    });

    it('should return partial failures', async () => {
      const row0Error = {message: 'Error.', reason: 'notFound'};
      const row1Error = {message: 'Error.', reason: 'notFound'};
      requestStub.resolves([
        {
          insertErrors: [
            {index: 0, errors: [row0Error]},
            {index: 1, errors: [row1Error]},
          ],
        },
      ]);

      const reflection = await reflectAfterTimer(() => table.insert(data));
      assert(reflection.isRejected);
      const {reason} = reflection as pReflect.PromiseRejectedResult;
      assert.deepStrictEqual((reason as GoogleErrorBody).errors, [
        {
          row: dataApiFormat.rows[0].json,
          errors: [row0Error],
        },
        {
          row: dataApiFormat.rows[1].json,
          errors: [row1Error],
        },
      ]);
    });

    it('should retry partials default max 3', async () => {
      const rowError = {message: 'Error.', reason: 'try again plz'};
      requestStub.resetBehavior();
      requestStub.resolves([
        {
          insertErrors: [
            {index: 0, errors: [rowError]},
            {index: 1, errors: [rowError]},
            {index: 2, errors: [rowError]},
            {index: 3, errors: [rowError]},
          ],
        },
      ]);

      const reflection = await reflectAfterTimer(() =>
        table.insert(data, OPTIONS)
      );
      assert(reflection.isRejected);
      assert.strictEqual(insertSpy.callCount, 4);
    });

    it('should retry partials with optional max', async () => {
      const partialRetries = 6;
      const rowError = {message: 'Error.', reason: 'try again plz'};
      requestStub.resetBehavior();
      requestStub.resolves([
        {
          insertErrors: [
            {index: 0, errors: [rowError]},
            {index: 1, errors: [rowError]},
            {index: 2, errors: [rowError]},
            {index: 3, errors: [rowError]},
          ],
        },
      ]);

      const reflection = await reflectAfterTimer(() =>
        table.insert(data, {...OPTIONS, partialRetries})
      );
      assert(reflection.isRejected);
      assert.strictEqual(insertSpy.callCount, partialRetries + 1);
    });

    it('should allow 0 partial retries, but still do it once', async () => {
      const rowError = {message: 'Error.', reason: 'try again plz'};
      requestStub.resetBehavior();
      requestStub.resolves([
        {
          insertErrors: [
            {index: 0, errors: [rowError]},
            {index: 1, errors: [rowError]},
            {index: 2, errors: [rowError]},
            {index: 3, errors: [rowError]},
          ],
        },
      ]);

      const reflection = await reflectAfterTimer(() =>
        table.insert(data, {...OPTIONS, partialRetries: 0})
      );
      assert(reflection.isRejected);
      assert.strictEqual(insertSpy.callCount, 1);
    });

    it('should keep partial retries option non-negative', async () => {
      const rowError = {message: 'Error.', reason: 'try again plz'};
      requestStub.resetBehavior();
      requestStub.resolves([
        {
          insertErrors: [
            {index: 0, errors: [rowError]},
            {index: 1, errors: [rowError]},
            {index: 2, errors: [rowError]},
            {index: 3, errors: [rowError]},
          ],
        },
      ]);

      const reflection = await reflectAfterTimer(() =>
        table.insert(data, {...OPTIONS, partialRetries: -1})
      );
      assert(reflection.isRejected);
      assert.strictEqual(insertSpy.callCount, 1);
    });

    it('should retry partial inserts deltas', async () => {
      const rowError = {message: 'Error.', reason: 'try again plz'};
      requestStub.resetBehavior();
      requestStub.onCall(0).resolves([
        {
          insertErrors: [
            {index: 0, errors: [rowError]},
            {index: 1, errors: [rowError]},
            {index: 2, errors: [rowError]},
            {index: 3, errors: [rowError]},
          ],
        },
      ]);

      requestStub.onCall(1).resolves([
        {
          insertErrors: [
            {index: 0, errors: [rowError]},
            {index: 1, errors: [rowError]},
            {index: 2, errors: [rowError]},
          ],
        },
      ]);

      requestStub.onCall(2).resolves([
        {
          insertErrors: [
            {index: 1, errors: [rowError]},
            {index: 2, errors: [rowError]},
          ],
        },
      ]);

      const goodResponse = [{foo: 'bar'}];
      requestStub.onCall(3).resolves(goodResponse);

      const reflection = await reflectAfterTimer(() =>
        table.insert(data, OPTIONS)
      );
      assert(reflection.isFulfilled);

      assert.deepStrictEqual(
        requestStub.getCall(0).args[0].json,
        dataApiFormat,
        'first call: try all 5'
      );
      assert.deepStrictEqual(
        requestStub.getCall(1).args[0].json,
        {rows: dataApiFormat.rows.slice(0, 4)},
        'second call: previous failures were 4/5'
      );
      assert.deepStrictEqual(
        requestStub.getCall(2).args[0].json,
        {rows: dataApiFormat.rows.slice(0, 3)},
        'third call: previous failures were 3/5'
      );
      assert.deepStrictEqual(
        requestStub.getCall(3).args[0].json,
        {rows: dataApiFormat.rows.slice(1, 3)},
        'fourth call: previous failures were 2/5'
      );
      assert(!requestStub.getCall(4), 'fifth call: should not have happened');

      const {value} = reflection as pReflect.PromiseFulfilledResult<
        InsertRowsResponse
      >;
      assert(value);
    });

    it('should insert raw data', async () => {
      const opts = {raw: true};
      await table.insert(rawData, opts);
      assert(requestStub.calledOnce);

      const [reqOpts]: DecorateRequestOptions[] = requestStub.firstCall.args;
      assert.strictEqual(reqOpts.method, 'POST');
      assert.strictEqual(reqOpts.uri, '/insertAll');
      assert.deepStrictEqual(reqOpts.json, {rows: rawData});
    });

    it('should accept options', async () => {
      const opts = {
        ignoreUnknownValues: true,
        skipInvalidRows: true,
        templateSuffix: 'test',
      };

      await table.insert(data, opts);
      assert(requestStub.calledOnce);

      const [reqOpts]: DecorateRequestOptions[] = requestStub.firstCall.args;
      assert.strictEqual(reqOpts.method, 'POST');
      assert.strictEqual(reqOpts.uri, '/insertAll');

      assert.strictEqual(
        reqOpts.json.ignoreUnknownValues,
        opts.ignoreUnknownValues
      );
      assert.strictEqual(reqOpts.json.skipInvalidRows, opts.skipInvalidRows);
      assert.strictEqual(reqOpts.json.templateSuffix, opts.templateSuffix);

      assert.deepStrictEqual(reqOpts.json.rows, dataApiFormat.rows);
    });

    describe('create table and retry', () => {
      let createStub: sinon.SinonStub;
      let insertCreateSpy: sinon.SinonSpy;

      beforeEach(() => {
        insertCreateSpy = sinon.spy(table, '_insertAndCreateTable');
        createStub = sinon.stub(table, 'create').resolves([{}]);
        requestStub.onFirstCall().rejects({code: 404});
      });

      afterEach(() => {
        insertCreateSpy.restore();
        createStub.restore();
      });

      it('should not include the schema in the insert request', async () => {
        requestStub.reset();
        requestStub.resolves([{}]);

        await table.insert(data, OPTIONS);
        assert(requestStub.calledOnce);
        assert.strictEqual(
          requestStub.firstCall.lastArg.json.schema,
          undefined
        );
      });

      it('should attempt to create table if not created', async () => {
        const reflection = await reflectAfterTimer(() =>
          table.insert(data, OPTIONS)
        );
        assert(reflection.isFulfilled);
        assert(createStub.calledOnce);
        assert.strictEqual(createStub.firstCall.lastArg.schema, SCHEMA_STRING);
      });

      it('should set a timeout to insert rows in the created table', async () => {
        // the implementation uses an explicit 60s delay
        // so this tests at various intervals
        const expectedDelay = 60000;
        const firstCheckDelay = 50000;
        const remainingCheckDelay = expectedDelay - firstCheckDelay;

        pReflect(table.insert(data, OPTIONS)); // gracefully handle async errors
        assert(insertCreateSpy.calledOnce); // just called `insert`, that's 1 so far

        await clock.tickAsync(firstCheckDelay); // first 50s
        assert(insertCreateSpy.calledOnce);
        assert(createStub.calledOnce, 'must create table before inserting');

        await clock.tickAsync(remainingCheckDelay); // first 50s + 10s = 60s
        assert(insertCreateSpy.calledTwice);
        assert.strictEqual(insertCreateSpy.secondCall.args[0], data);
        assert.strictEqual(insertCreateSpy.secondCall.args[1], OPTIONS);

        await clock.runAllAsync(); // for good measure
        assert(
          insertCreateSpy.calledTwice,
          'should not have called insert again'
        );
      });

      it('should reject on table creation errors', async () => {
        const error = new Error('err.');
        createStub.rejects(error);

        const reflection = await reflectAfterTimer(() =>
          table.insert(data, OPTIONS)
        );
        assert(reflection.isRejected);

        const {reason} = reflection as pReflect.PromiseRejectedResult;
        assert.strictEqual(reason, error);
      });

      it('should ignore 409 errors', async () => {
        createStub.rejects({code: 409});

        const reflection = await reflectAfterTimer(() =>
          table.insert(data, OPTIONS)
        );
        assert(reflection.isFulfilled);
        assert(createStub.calledOnce);
        assert(insertCreateSpy.calledTwice);
        assert.strictEqual(insertCreateSpy.secondCall.args[0], data);
        assert.strictEqual(insertCreateSpy.secondCall.args[1], OPTIONS);
      });

      it('should retry the insert', async () => {
        const errorResponse = {code: 404};
        requestStub.onFirstCall().rejects(errorResponse);
        requestStub.onSecondCall().rejects(errorResponse);

        const goodResponse = [{foo: 'bar'}];
        requestStub.onThirdCall().resolves(goodResponse);

        const reflection = await reflectAfterTimer(() =>
          table.insert(data, OPTIONS)
        );
        assert(reflection.isFulfilled);
        assert(requestStub.calledThrice);
        assert(
          requestStub.alwaysCalledWithMatch({
            method: 'POST',
            uri: '/insertAll',
            json: dataApiFormat,
          })
        );

        const {value} = reflection as pReflect.PromiseFulfilledResult<
          InsertRowsResponse
        >;
        assert.deepStrictEqual(value, goodResponse);
      });
    });
  });

  describe('load', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (FakeServiceObject.prototype as any).setMetadata = function(
        metadata: {},
        callback: Function
      ) {
        assert.strictEqual(this, table);
        assert.strictEqual(metadata, formattedMetadata);
        assert.strictEqual(callback, done);
        callback!(null); // the done fn
      };

      table.setMetadata(fakeMetadata, done);
    });
  });
});

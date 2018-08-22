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

'use strict';

import * as arrify from 'arrify';
import * as assert from 'assert';
import * as extend from 'extend';
import * as proxyquire from 'proxyquire';
import * as pfy from '@google-cloud/promisify';
import {ServiceObject, util} from '@google-cloud/common';

let promisified = false;
const fakePfy = extend({}, pfy, {
  promisifyAll: function(Class, options) {
    if (Class.name !== 'Dataset') {
      return;
    }
    promisified = true;
    assert.deepStrictEqual(options.exclude, ['table']);
  },
});

let extended = false;
const fakePaginator = {
  paginator: {
    extend: function(Class, methods) {
      if (Class.name !== 'Dataset') {
        return;
      }
      methods = arrify(methods);
      assert.strictEqual(Class.name, 'Dataset');
      assert.deepStrictEqual(methods, ['getTables']);
      extended = true;
    },
    streamify: function(methodName) {
      return methodName;
    },
  }
};

class FakeServiceObject extends ServiceObject {
  calledWith_;
  constructor(config) {
    super(config)
    this.calledWith_ = arguments;
  }
}

describe('BigQuery/Dataset', function() {
  const BIGQUERY = {
    projectId: 'my-project',
    createDataset: util.noop,
  };
  const DATASET_ID = 'kittens';
  const LOCATION = 'asia-northeast1';

  let Dataset;
  let Table;
  let ds;

  before(function() {
    Dataset = proxyquire('../src/dataset', {
      '@google-cloud/common': {
        ServiceObject: FakeServiceObject,
      },
      '@google-cloud/paginator': fakePaginator,
      '@google-cloud/promisify': fakePfy,
    }).Dataset;
    Table = require('../src/table').Table;
  });

  beforeEach(function() {
    ds = new Dataset(BIGQUERY, DATASET_ID);
  });

  describe('instantiation', function() {
    it('should extend the correct methods', function() {
      assert(extended); // See `fakePaginator.extend`
    });

    it('should streamify the correct methods', function() {
      assert.strictEqual(ds.getTablesStream, 'getTables');
    });

    it('should promisify all the things', function() {
      assert(promisified);
    });

    it('should inherit from ServiceObject', function() {
      assert(ds instanceof ServiceObject);

      const calledWith = ds.calledWith_[0];

      assert.strictEqual(calledWith.parent, BIGQUERY);
      assert.strictEqual(calledWith.baseUrl, '/datasets');
      assert.strictEqual(calledWith.id, DATASET_ID);
      assert.deepStrictEqual(calledWith.methods, {
        create: true,
        exists: true,
        get: true,
        getMetadata: true,
        setMetadata: true,
      });
    });

    it('should capture user provided location', function() {
      const options = {location: LOCATION};
      const ds = new Dataset(BIGQUERY, DATASET_ID, options);

      assert.strictEqual(ds.location, LOCATION);
    });

    describe('createMethod', function() {
      let bq;
      let ds;
      let config;

      beforeEach(function() {
        bq = extend(true, {}, BIGQUERY);
        ds = new Dataset(bq, DATASET_ID);
        config = ds.calledWith_[0];
      });

      it('should call through to BigQuery#createDataset', function(done) {
        const OPTIONS = {};

        bq.createDataset = function(id, options, callback) {
          assert.strictEqual(id, DATASET_ID);
          assert.deepStrictEqual(options, OPTIONS);
          callback(); // the done fn
        };

        config.createMethod(DATASET_ID, OPTIONS, done);
      });

      it('should optionally accept options', function(done) {
        bq.createDataset = function(id, options, callback) {
          callback(); // the done fn
        };

        config.createMethod(DATASET_ID, done);
      });

      it('should pass the location', function(done) {
        bq.createDataset = function(id, options, callback) {
          assert.strictEqual(options.location, LOCATION);
          callback(); // the done fn
        };

        ds.location = LOCATION;
        config.createMethod(DATASET_ID, done);
      });
    });

    describe('etag interceptor', function() {
      const FAKE_ETAG = 'abc';

      it('should apply the If-Match header', function() {
        const interceptor = ds.interceptors.pop();

        const fakeReqOpts = {
          method: 'PATCH',
          json: {
            etag: FAKE_ETAG,
          },
        };

        const reqOpts = interceptor.request(fakeReqOpts);
        assert.deepStrictEqual(reqOpts.headers, {'If-Match': FAKE_ETAG});
      });

      it('should respect already existing headers', function() {
        const interceptor = ds.interceptors.pop();

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

      it('should not apply the header if method is not patch', function() {
        const interceptor = ds.interceptors.pop();

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

  describe('createQueryJob', function() {
    const FAKE_QUERY = 'SELECT * FROM `table`';

    it('should extend the options', function(done) {
      const fakeOptions = {
        query: FAKE_QUERY,
        a: {b: 'c'},
      };

      const expectedOptions = extend(
        true,
        {
          location: LOCATION,
        },
        fakeOptions,
        {
          defaultDataset: {
            datasetId: ds.id,
          },
        }
      );

      ds.bigQuery.createQueryJob = function(options, callback) {
        assert.deepStrictEqual(options, expectedOptions);
        assert.notStrictEqual(fakeOptions, options);
        callback(); // the done fn
      };

      ds.location = LOCATION;
      ds.createQueryJob(fakeOptions, done);
    });

    it('should accept a query string', function(done) {
      ds.bigQuery.createQueryJob = function(options, callback) {
        assert.strictEqual(options.query, FAKE_QUERY);
        callback(); // the done fn
      };

      ds.createQueryJob(FAKE_QUERY, done);
    });
  });

  describe('createQueryStream', function() {
    const options = {
      a: 'b',
      c: 'd',
    };

    it('should call through to bigQuery', function(done) {
      ds.bigQuery.createQueryStream = function() {
        done();
      };

      ds.createQueryStream();
    });

    it('should return the result of the call to bq.query', function(done) {
      ds.bigQuery.createQueryStream = function() {
        return {
          done: done,
        };
      };

      ds.createQueryStream().done();
    });

    it('should accept a string', function(done) {
      const query = 'SELECT * FROM allthedata';

      ds.bigQuery.createQueryStream = function(opts) {
        assert.strictEqual(opts.query, query);
        done();
      };

      ds.createQueryStream(query);
    });

    it('should pass along options', function(done) {
      ds.bigQuery.createQueryStream = function(opts) {
        assert.strictEqual(opts.a, options.a);
        assert.strictEqual(opts.c, options.c);
        done();
      };

      ds.createQueryStream(options);
    });

    it('should extend options with defaultDataset', function(done) {
      ds.bigQuery.createQueryStream = function(opts) {
        assert.deepStrictEqual(opts.defaultDataset, {datasetId: ds.id});
        done();
      };

      ds.createQueryStream(options);
    });

    it('should extend options with the location', function(done) {
      ds.bigQuery.createQueryStream = function(opts) {
        assert.strictEqual(opts.location, LOCATION);
        done();
      };

      ds.location = LOCATION;
      ds.createQueryStream();
    });

    it('should not modify original options object', function(done) {
      ds.bigQuery.createQueryStream = function() {
        assert.deepStrictEqual(options, {a: 'b', c: 'd'});
        done();
      };

      ds.createQueryStream();
    });
  });

  describe('createTable', function() {
    const SCHEMA_OBJECT = {
      fields: [
        {name: 'id', type: 'INTEGER'},
        {name: 'breed', type: 'STRING'},
        {name: 'name', type: 'STRING'},
        {name: 'dob', type: 'TIMESTAMP'},
        {name: 'around', type: 'BOOLEAN'},
      ],
    };
    const SCHEMA_STRING = 'id:integer,breed,name,dob:timestamp,around:boolean';
    const TABLE_ID = 'kittens';

    const API_RESPONSE = {
      tableReference: {
        tableId: TABLE_ID,
      },
    };

    it('should create a table', function(done) {
      const options = {
        schema: SCHEMA_OBJECT,
      };

      ds.request = function(reqOpts) {
        assert.strictEqual(reqOpts.method, 'POST');
        assert.strictEqual(reqOpts.uri, '/tables');

        const body = reqOpts.json;
        assert.deepStrictEqual(body.schema, SCHEMA_OBJECT);
        assert.strictEqual(body.tableReference.datasetId, DATASET_ID);
        assert.strictEqual(
          body.tableReference.projectId,
          ds.bigQuery.projectId
        );
        assert.strictEqual(body.tableReference.tableId, TABLE_ID);

        done();
      };

      ds.createTable(TABLE_ID, options, assert.ifError);
    });

    it('should not require options', function(done) {
      ds.request = function(reqOpts, callback) {
        callback(null, API_RESPONSE);
      };

      ds.createTable(TABLE_ID, done);
    });

    it('should format the metadata', function(done) {
      const formatMetadata_ = Table.formatMetadata_;
      const formatted = {};
      const fakeOptions = {};

      Table.formatMetadata_ = function(options) {
        assert.strictEqual(options, fakeOptions);
        return formatted;
      };

      ds.request = function(reqOpts) {
        assert.strictEqual(reqOpts.json, formatted);

        Table.formatMetadata_ = formatMetadata_;
        done();
      };

      ds.createTable(TABLE_ID, fakeOptions, assert.ifError);
    });

    it('should create a schema object from a string', function(done) {
      ds.request = function(reqOpts) {
        assert.deepStrictEqual(reqOpts.json.schema, SCHEMA_OBJECT);
        done();
      };

      ds.createTable(TABLE_ID, {schema: SCHEMA_STRING}, assert.ifError);
    });

    it('should wrap an array schema', function(done) {
      ds.request = function(reqOpts) {
        assert.deepStrictEqual(
          reqOpts.json.schema.fields,
          SCHEMA_OBJECT.fields
        );
        done();
      };

      ds.createTable(
        TABLE_ID,
        {
          schema: SCHEMA_OBJECT.fields,
        },
        assert.ifError
      );
    });

    it('should assign record type to nested schemas', function(done) {
      const nestedField = {
        id: 'nested',
        fields: [{id: 'nested_name', type: 'STRING'}],
      };

      ds.request = function(reqOpts) {
        assert.strictEqual(reqOpts.json.schema.fields[1].type, 'RECORD');
        done();
      };

      ds.createTable(
        TABLE_ID,
        {
          schema: {
            fields: [{id: 'name', type: 'STRING'}, nestedField],
          },
        },
        assert.ifError
      );
    });

    it('should return an error to the callback', function(done) {
      const error = new Error('Error.');

      ds.request = function(reqOpts, callback) {
        callback(error);
      };

      ds.createTable(TABLE_ID, {schema: SCHEMA_OBJECT}, function(err) {
        assert.strictEqual(err, error);
        done();
      });
    });

    it('should return a Table object', function(done) {
      ds.request = function(reqOpts, callback) {
        callback(null, API_RESPONSE);
      };

      ds.createTable(TABLE_ID, {schema: SCHEMA_OBJECT}, function(err, table) {
        assert.ifError(err);
        assert(table instanceof Table);
        done();
      });
    });

    it('should pass the location to the Table', function(done) {
      const response = extend({location: LOCATION}, API_RESPONSE);

      ds.request = function(reqOpts, callback) {
        callback(null, response);
      };

      ds.table = function(id, options) {
        assert.strictEqual(options.location, LOCATION);
        setImmediate(done);
        return {};
      };

      ds.createTable(TABLE_ID, {schema: SCHEMA_OBJECT}, assert.ifError);
    });

    it('should return an apiResponse', function(done) {
      const opts = {id: TABLE_ID, schema: SCHEMA_OBJECT};

      ds.request = function(reqOpts, callback) {
        callback(null, API_RESPONSE);
      };

      ds.createTable(TABLE_ID, opts, function(err, table, apiResponse) {
        assert.ifError(err);
        assert.strictEqual(apiResponse, API_RESPONSE);
        done();
      });
    });

    it('should assign metadata to the Table object', function(done) {
      const apiResponse = extend(
        {
          a: 'b',
          c: 'd',
        },
        API_RESPONSE
      );

      ds.request = function(reqOpts, callback) {
        callback(null, apiResponse);
      };

      ds.createTable(TABLE_ID, {schema: SCHEMA_OBJECT}, function(err, table) {
        assert.ifError(err);
        assert.strictEqual(table.metadata, apiResponse);
        done();
      });
    });
  });

  describe('delete', function() {
    it('should delete the dataset via the api', function(done) {
      ds.request = function(reqOpts) {
        assert.strictEqual(reqOpts.method, 'DELETE');
        assert.strictEqual(reqOpts.uri, '');
        assert.deepStrictEqual(reqOpts.qs, {deleteContents: false});
        done();
      };

      ds.delete(assert.ifError);
    });

    it('should allow a force delete', function(done) {
      ds.request = function(reqOpts) {
        assert.deepStrictEqual(reqOpts.qs, {deleteContents: true});
        done();
      };

      ds.delete({force: true}, assert.ifError);
    });

    it('should execute callback when done', function(done) {
      ds.request = function(reqOpts, callback) {
        callback();
      };

      ds.delete(done);
    });

    it('should pass error to callback', function(done) {
      const error = new Error('Error.');

      ds.request = function(reqOpts, callback) {
        callback(error);
      };

      ds.delete(function(err) {
        assert.strictEqual(err, error);
        done();
      });
    });

    it('should pass apiResponse to callback', function(done) {
      const apiResponse = {};

      ds.request = function(reqOpts, callback) {
        callback(null, apiResponse);
      };

      ds.delete(function(err, apiResponse_) {
        assert.strictEqual(apiResponse_, apiResponse);
        done();
      });
    });
  });

  describe('getTables', function() {
    it('should get tables from the api', function(done) {
      ds.request = function(reqOpts) {
        assert.strictEqual(reqOpts.uri, '/tables');
        assert.deepStrictEqual(reqOpts.qs, {});
        done();
      };

      ds.getTables(assert.ifError);
    });

    it('should accept a query', function(done) {
      const query = {
        maxResults: 8,
        pageToken: 'token',
      };

      ds.request = function(reqOpts) {
        assert.strictEqual(reqOpts.qs, query);
        done();
      };

      ds.getTables(query, assert.ifError);
    });

    it('should default the query value to an empty object', function(done) {
      ds.request = function(reqOpts) {
        assert.deepStrictEqual(reqOpts.qs, {});
        done();
      };

      ds.getTables(null, assert.ifError);
    });

    it('should return error to callback', function(done) {
      const error = new Error('Error.');

      ds.request = function(reqOpts, callback) {
        callback(error);
      };

      ds.getTables(function(err) {
        assert.strictEqual(err, error);
        done();
      });
    });

    describe('success', function() {
      const tableId = 'tableName';
      const apiResponse = {
        tables: [
          {
            a: 'b',
            c: 'd',
            tableReference: {tableId},
            location: LOCATION,
          },
        ],
      };

      beforeEach(function() {
        ds.request = function(reqOpts, callback) {
          callback(null, apiResponse);
        };
      });

      it('should return Table & apiResponse', function(done) {
        ds.getTables(function(err, tables, nextQuery, apiResponse_) {
          assert.ifError(err);

          const table = tables[0];

          assert(table instanceof Table);
          assert.strictEqual(table.id, tableId);
          assert.strictEqual(table.location, LOCATION);
          assert.strictEqual(apiResponse_, apiResponse);
          done();
        });
      });

      it('should assign metadata to the Table objects', function(done) {
        ds.getTables(function(err, tables) {
          assert.ifError(err);
          assert.strictEqual(tables[0].metadata, apiResponse.tables[0]);
          done();
        });
      });

      it('should return token if more results exist', function(done) {
        const pageToken = 'token';

        const query = {
          maxResults: 5,
        };

        const expectedNextQuery = {
          maxResults: 5,
          pageToken: pageToken,
        };

        ds.request = function(reqOpts, callback) {
          callback(null, {nextPageToken: pageToken});
        };

        ds.getTables(query, function(err, tables, nextQuery) {
          assert.ifError(err);
          assert.deepStrictEqual(nextQuery, expectedNextQuery);
          done();
        });
      });
    });
  });

  describe('query', function() {
    const options = {
      a: 'b',
      c: 'd',
    };

    it('should call through to bigQuery', function(done) {
      ds.bigQuery.query = function() {
        done();
      };

      ds.query();
    });

    it('should accept a string', function(done) {
      const query = 'SELECT * FROM allthedata';

      ds.bigQuery.query = function(opts) {
        assert.strictEqual(opts.query, query);
        done();
      };

      ds.query(query);
    });

    it('should pass along options', function(done) {
      ds.bigQuery.query = function(opts) {
        assert.strictEqual(opts.a, options.a);
        assert.strictEqual(opts.c, options.c);
        done();
      };

      ds.query(options);
    });

    it('should extend options with defaultDataset', function(done) {
      ds.bigQuery.query = function(opts) {
        assert.deepStrictEqual(opts.defaultDataset, {datasetId: ds.id});
        done();
      };

      ds.query(options);
    });

    it('should extend options with the location', function(done) {
      ds.bigQuery.query = function(opts) {
        assert.strictEqual(opts.location, LOCATION);
        done();
      };

      ds.location = LOCATION;
      ds.query();
    });

    it('should not modify original options object', function(done) {
      ds.bigQuery.query = function() {
        assert.deepStrictEqual(options, {a: 'b', c: 'd'});
        done();
      };

      ds.query();
    });

    it('should pass callback', function(done) {
      const callback = util.noop;

      ds.bigQuery.query = function(opts, cb) {
        assert.strictEqual(cb, callback);
        done();
      };

      ds.query(options, callback);
    });
  });

  describe('table', function() {
    it('should return a Table object', function() {
      const tableId = 'tableId';
      const table = ds.table(tableId);
      assert(table instanceof Table);
      assert.strictEqual(table.id, tableId);
    });

    it('should inherit the dataset location', function() {
      ds.location = LOCATION;
      const table = ds.table('tableId');

      assert.strictEqual(table.location, LOCATION);
    });

    it('should pass along the location if provided', function() {
      ds.location = LOCATION;

      const location = 'US';
      const table = ds.table('tableId', {location});

      assert.strictEqual(table.location, location);
    });
  });
});

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

var arrify = require('arrify');
var assert = require('assert');
var extend = require('extend');
var nodeutil = require('util');
var proxyquire = require('proxyquire');

var ServiceObject = require('@google-cloud/common').ServiceObject;
var util = require('@google-cloud/common').util;

var promisified = false;
var fakeUtil = extend({}, util, {
  promisifyAll: function(Class, options) {
    if (Class.name !== 'Dataset') {
      return;
    }

    promisified = true;
    assert.deepEqual(options.exclude, ['table']);
  },
});

var extended = false;
var fakePaginator = {
  extend: function(Class, methods) {
    if (Class.name !== 'Dataset') {
      return;
    }

    methods = arrify(methods);
    assert.equal(Class.name, 'Dataset');
    assert.deepEqual(methods, ['getTables']);
    extended = true;
  },
  streamify: function(methodName) {
    return methodName;
  },
};

function FakeServiceObject() {
  this.calledWith_ = arguments;
  ServiceObject.apply(this, arguments);
}

nodeutil.inherits(FakeServiceObject, ServiceObject);

describe('BigQuery/Dataset', function() {
  var BIGQUERY = {
    projectId: 'my-project',
    createDataset: util.noop,
  };
  var DATASET_ID = 'kittens';
  var LOCATION = 'asia-northeast1';

  var Dataset;
  var Table;
  var ds;

  before(function() {
    Dataset = proxyquire('../src/dataset.js', {
      '@google-cloud/common': {
        paginator: fakePaginator,
        ServiceObject: FakeServiceObject,
        util: fakeUtil,
      },
    });
    Table = require('../src/table.js');
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

      var calledWith = ds.calledWith_[0];

      assert.strictEqual(calledWith.parent, BIGQUERY);
      assert.strictEqual(calledWith.baseUrl, '/datasets');
      assert.strictEqual(calledWith.id, DATASET_ID);
      assert.deepEqual(calledWith.methods, {
        create: true,
        exists: true,
        get: true,
        getMetadata: true,
        setMetadata: true,
      });
    });

    it('should capture user provided location', function() {
      var options = {location: LOCATION};
      var ds = new Dataset(BIGQUERY, DATASET_ID, options);

      assert.strictEqual(ds.location, LOCATION);
    });

    describe('createMethod', function() {
      var bq;
      var ds;
      var config;

      beforeEach(function() {
        bq = extend(true, {}, BIGQUERY);
        ds = new Dataset(bq, DATASET_ID);
        config = ds.calledWith_[0];
      });

      it('should call through to BigQuery#createDataset', function(done) {
        var OPTIONS = {};

        bq.createDataset = function(id, options, callback) {
          assert.strictEqual(id, DATASET_ID);
          assert.deepEqual(options, OPTIONS);
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
      var FAKE_ETAG = 'abc';

      it('should apply the If-Match header', function() {
        var interceptor = ds.interceptors.pop();

        var fakeReqOpts = {
          method: 'PATCH',
          json: {
            etag: FAKE_ETAG,
          },
        };

        var reqOpts = interceptor.request(fakeReqOpts);
        assert.deepEqual(reqOpts.headers, {'If-Match': FAKE_ETAG});
      });

      it('should respect already existing headers', function() {
        var interceptor = ds.interceptors.pop();

        var fakeReqOpts = {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          json: {
            etag: FAKE_ETAG,
          },
        };

        var expectedHeaders = extend({}, fakeReqOpts.headers, {
          'If-Match': FAKE_ETAG,
        });

        var reqOpts = interceptor.request(fakeReqOpts);
        assert.deepEqual(reqOpts.headers, expectedHeaders);
      });

      it('should not apply the header if method is not patch', function() {
        var interceptor = ds.interceptors.pop();

        var fakeReqOpts = {
          method: 'POST',
          json: {
            etag: FAKE_ETAG,
          },
        };

        var reqOpts = interceptor.request(fakeReqOpts);
        assert.deepEqual(reqOpts.headers, undefined);
      });
    });
  });

  describe('createQueryJob', function() {
    var FAKE_QUERY = 'SELECT * FROM `table`';

    it('should extend the options', function(done) {
      var fakeOptions = {
        query: FAKE_QUERY,
        a: {b: 'c'},
      };

      var expectedOptions = extend(
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
        assert.deepEqual(options, expectedOptions);
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
    var options = {
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
      var query = 'SELECT * FROM allthedata';

      ds.bigQuery.createQueryStream = function(opts) {
        assert.equal(opts.query, query);
        done();
      };

      ds.createQueryStream(query);
    });

    it('should pass along options', function(done) {
      ds.bigQuery.createQueryStream = function(opts) {
        assert.equal(opts.a, options.a);
        assert.equal(opts.c, options.c);
        done();
      };

      ds.createQueryStream(options);
    });

    it('should extend options with defaultDataset', function(done) {
      ds.bigQuery.createQueryStream = function(opts) {
        assert.deepEqual(opts.defaultDataset, {datasetId: ds.id});
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
        assert.deepEqual(options, {a: 'b', c: 'd'});
        done();
      };

      ds.createQueryStream();
    });
  });

  describe('createTable', function() {
    var SCHEMA_OBJECT = {
      fields: [
        {name: 'id', type: 'INTEGER'},
        {name: 'breed', type: 'STRING'},
        {name: 'name', type: 'STRING'},
        {name: 'dob', type: 'TIMESTAMP'},
        {name: 'around', type: 'BOOLEAN'},
      ],
    };
    var SCHEMA_STRING = 'id:integer,breed,name,dob:timestamp,around:boolean';
    var TABLE_ID = 'kittens';

    var API_RESPONSE = {
      tableReference: {
        tableId: TABLE_ID,
      },
    };

    it('should create a table', function(done) {
      var options = {
        schema: SCHEMA_OBJECT,
      };

      ds.request = function(reqOpts) {
        assert.strictEqual(reqOpts.method, 'POST');
        assert.strictEqual(reqOpts.uri, '/tables');

        var body = reqOpts.json;
        assert.deepEqual(body.schema, SCHEMA_OBJECT);
        assert.equal(body.tableReference.datasetId, DATASET_ID);
        assert.equal(body.tableReference.projectId, ds.bigQuery.projectId);
        assert.equal(body.tableReference.tableId, TABLE_ID);

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
      var formatMetadata_ = Table.formatMetadata_;
      var formatted = {};
      var fakeOptions = {};

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
        assert.deepEqual(reqOpts.json.schema, SCHEMA_OBJECT);
        done();
      };

      ds.createTable(TABLE_ID, {schema: SCHEMA_STRING}, assert.ifError);
    });

    it('should wrap an array schema', function(done) {
      ds.request = function(reqOpts) {
        assert.deepEqual(reqOpts.json.schema.fields, SCHEMA_OBJECT.fields);
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
      var nestedField = {
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
      var error = new Error('Error.');

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
      var response = extend({location: LOCATION}, API_RESPONSE);

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
      var opts = {id: TABLE_ID, schema: SCHEMA_OBJECT};

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
      var apiResponse = extend(
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
        assert.equal(reqOpts.method, 'DELETE');
        assert.equal(reqOpts.uri, '');
        assert.deepEqual(reqOpts.qs, {deleteContents: false});
        done();
      };

      ds.delete(assert.ifError);
    });

    it('should allow a force delete', function(done) {
      ds.request = function(reqOpts) {
        assert.deepEqual(reqOpts.qs, {deleteContents: true});
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
      var error = new Error('Error.');

      ds.request = function(reqOpts, callback) {
        callback(error);
      };

      ds.delete(function(err) {
        assert.strictEqual(err, error);
        done();
      });
    });

    it('should pass apiResponse to callback', function(done) {
      var apiResponse = {};

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
        assert.equal(reqOpts.uri, '/tables');
        assert.deepEqual(reqOpts.qs, {});
        done();
      };

      ds.getTables(assert.ifError);
    });

    it('should accept a query', function(done) {
      var query = {
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
        assert.deepEqual(reqOpts.qs, {});
        done();
      };

      ds.getTables(null, assert.ifError);
    });

    it('should return error to callback', function(done) {
      var error = new Error('Error.');

      ds.request = function(reqOpts, callback) {
        callback(error);
      };

      ds.getTables(function(err) {
        assert.strictEqual(err, error);
        done();
      });
    });

    describe('success', function() {
      var tableId = 'tableName';
      var apiResponse = {
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

          var table = tables[0];

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
        var pageToken = 'token';

        var query = {
          maxResults: 5,
        };

        var expectedNextQuery = {
          maxResults: 5,
          pageToken: pageToken,
        };

        ds.request = function(reqOpts, callback) {
          callback(null, {nextPageToken: pageToken});
        };

        ds.getTables(query, function(err, tables, nextQuery) {
          assert.ifError(err);
          assert.deepEqual(nextQuery, expectedNextQuery);
          done();
        });
      });
    });
  });

  describe('query', function() {
    var options = {
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
      var query = 'SELECT * FROM allthedata';

      ds.bigQuery.query = function(opts) {
        assert.equal(opts.query, query);
        done();
      };

      ds.query(query);
    });

    it('should pass along options', function(done) {
      ds.bigQuery.query = function(opts) {
        assert.equal(opts.a, options.a);
        assert.equal(opts.c, options.c);
        done();
      };

      ds.query(options);
    });

    it('should extend options with defaultDataset', function(done) {
      ds.bigQuery.query = function(opts) {
        assert.deepEqual(opts.defaultDataset, {datasetId: ds.id});
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
        assert.deepEqual(options, {a: 'b', c: 'd'});
        done();
      };

      ds.query();
    });

    it('should pass callback', function(done) {
      var callback = util.noop;

      ds.bigQuery.query = function(opts, cb) {
        assert.equal(cb, callback);
        done();
      };

      ds.query(options, callback);
    });
  });

  describe('table', function() {
    it('should return a Table object', function() {
      var tableId = 'tableId';
      var table = ds.table(tableId);
      assert(table instanceof Table);
      assert.equal(table.id, tableId);
    });

    it('should inherit the dataset location', function() {
      ds.location = LOCATION;
      var table = ds.table('tableId');

      assert.strictEqual(table.location, LOCATION);
    });

    it('should pass along the location if provided', function() {
      ds.location = LOCATION;

      var location = 'US';
      var table = ds.table('tableId', {location});

      assert.strictEqual(table.location, location);
    });
  });
});

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
var Big = require('big.js');
var extend = require('extend');
var nodeutil = require('util');
var prop = require('propprop');
var proxyquire = require('proxyquire');
var uuid = require('uuid');
var pfy = require('@google-cloud/promisify');

var Service = require('@google-cloud/common').Service;
var Table = require('../src/table.js');
var util = require('@google-cloud/common').util;

var fakeUuid = extend(true, {}, fakeUuid);

function FakeApiError() {
  this.calledWith_ = arguments;
}

var promisified = false;
var fakePfy = extend({}, pfy, {
  promisifyAll: function(Class, options) {
    if (Class.name !== 'BigQuery') {
      return;
    }

    promisified = true;
    assert.deepStrictEqual(options.exclude, [
      'dataset',
      'date',
      'datetime',
      'job',
      'time',
      'timestamp',
    ]);
  },
});
var fakeUtil = extend({}, util, {
  ApiError: FakeApiError,
});
var originalFakeUtil = extend(true, {}, fakeUtil);

function FakeDataset() {
  this.calledWith_ = arguments;
}

function FakeTable(a, b) {
  Table.call(this, a, b);
}

function FakeJob() {
  this.calledWith_ = arguments;
}

var mergeSchemaWithRowsOverride;
FakeTable.mergeSchemaWithRows_ = function() {
  var args = [].slice.apply(arguments);
  return (mergeSchemaWithRowsOverride || Table.mergeSchemaWithRows_).apply(
    null,
    args
  );
};

var extended = false;
var fakePaginator = {
  extend: function(Class, methods) {
    if (Class.name !== 'BigQuery') {
      return;
    }

    methods = arrify(methods);
    assert.strictEqual(Class.name, 'BigQuery');
    assert.deepStrictEqual(methods, ['getDatasets', 'getJobs']);
    extended = true;
  },
  streamify: function(methodName) {
    return methodName;
  },
};

function FakeService() {
  this.calledWith_ = arguments;
  Service.apply(this, arguments);
}

nodeutil.inherits(FakeService, Service);

describe('BigQuery', function() {
  var JOB_ID = 'JOB_ID';
  var PROJECT_ID = 'test-project';
  var LOCATION = 'asia-northeast1';

  var BigQueryCached;
  var BigQuery;
  var bq;

  before(function() {
    BigQuery = proxyquire('../', {
      uuid: fakeUuid,
      './dataset.js': FakeDataset,
      './job.js': FakeJob,
      './table.js': FakeTable,
      '@google-cloud/common': {
        Service: FakeService,
        paginator: fakePaginator,
        util: fakeUtil,
      },
      '@google-cloud/promisify': fakePfy,
    });
    BigQueryCached = extend({}, BigQuery);
  });

  beforeEach(function() {
    extend(fakeUtil, originalFakeUtil);
    BigQuery = extend(BigQuery, BigQueryCached);
    bq = new BigQuery({projectId: PROJECT_ID});
  });

  describe('instantiation', function() {
    it('should extend the correct methods', function() {
      assert(extended); // See `fakePaginator.extend`
    });

    it('should streamify the correct methods', function() {
      assert.strictEqual(bq.getDatasetsStream, 'getDatasets');
      assert.strictEqual(bq.getJobsStream, 'getJobs');
      assert.strictEqual(bq.createQueryStream, 'queryAsStream_');
    });

    it('should promisify all the things', function() {
      assert(promisified);
    });

    it('should work without new', function() {
      assert.doesNotThrow(function() {
        BigQuery({projectId: PROJECT_ID});
      });
    });

    it('should normalize the arguments', function() {
      var normalizeArgumentsCalled = false;
      var options = {};

      fakeUtil.normalizeArguments = function(context, options_) {
        normalizeArgumentsCalled = true;
        assert.strictEqual(options_, options);
        return options_;
      };

      new BigQuery(options);
      assert.strictEqual(normalizeArgumentsCalled, true);
    });

    it('should inherit from Service', function() {
      assert(bq instanceof Service);

      var calledWith = bq.calledWith_[0];

      var baseUrl = 'https://www.googleapis.com/bigquery/v2';
      assert.strictEqual(calledWith.baseUrl, baseUrl);
      assert.deepStrictEqual(calledWith.scopes, [
        'https://www.googleapis.com/auth/bigquery',
      ]);
      assert.deepStrictEqual(
        calledWith.packageJson,
        require('../package.json')
      );
    });

    it('should capture any user specified location', function() {
      var bq = new BigQuery({
        projectId: PROJECT_ID,
        location: LOCATION,
      });

      assert.strictEqual(bq.location, LOCATION);
    });

    it('should pass scopes from options', function() {
      var bq = new BigQuery({
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });

      var expectedScopes = [
        'https://www.googleapis.com/auth/bigquery',
        'https://www.googleapis.com/auth/drive.readonly',
      ];

      var calledWith = bq.calledWith_[0];
      assert.deepStrictEqual(calledWith.scopes, expectedScopes);
    });
  });

  describe('mergeSchemaWithRows_', function() {
    var SCHEMA_OBJECT = {
      fields: [
        {name: 'id', type: 'INTEGER'},
        {name: 'name', type: 'STRING'},
        {name: 'dob', type: 'TIMESTAMP'},
        {name: 'has_claws', type: 'BOOLEAN'},
        {name: 'has_fangs', type: 'BOOL'},
        {name: 'hair_count', type: 'FLOAT'},
        {name: 'teeth_count', type: 'FLOAT64'},
        {name: 'numeric_col', type: 'NUMERIC'},
      ],
    };

    beforeEach(function() {
      BigQuery.date = function(input) {
        return {
          type: 'fakeDate',
          input: input,
        };
      };

      BigQuery.datetime = function(input) {
        return {
          type: 'fakeDatetime',
          input: input,
        };
      };

      BigQuery.time = function(input) {
        return {
          type: 'fakeTime',
          input: input,
        };
      };

      BigQuery.timestamp = function(input) {
        return {
          type: 'fakeTimestamp',
          input: input,
        };
      };
    });

    it('should merge the schema and flatten the rows', function() {
      var now = new Date();
      var buffer = Buffer.from('test');

      var rows = [
        {
          raw: {
            f: [
              {v: '3'},
              {v: 'Milo'},
              {v: String(now.valueOf() / 1000)},
              {v: 'false'},
              {v: 'true'},
              {v: '5.222330009847'},
              {v: '30.2232138'},
              {v: '3.14'},
              {
                v: [
                  {
                    v: '10',
                  },
                ],
              },
              {
                v: [
                  {
                    v: '2',
                  },
                ],
              },
              {v: null},
              {v: buffer.toString('base64')},
              {
                v: [
                  {
                    v: {
                      f: [
                        {
                          v: {
                            f: [
                              {
                                v: 'nested_value',
                              },
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
              {v: 'date-input'},
              {v: 'datetime-input'},
              {v: 'time-input'},
            ],
          },
          expected: {
            id: 3,
            name: 'Milo',
            dob: {
              input: now,
              type: 'fakeTimestamp',
            },
            has_claws: false,
            has_fangs: true,
            hair_count: 5.222330009847,
            teeth_count: 30.2232138,
            numeric_col: new Big(3.14),
            arr: [10],
            arr2: [2],
            nullable: null,
            buffer: buffer,
            objects: [
              {
                nested_object: {
                  nested_property: 'nested_value',
                },
              },
            ],
            date: {
              input: 'date-input',
              type: 'fakeDate',
            },
            datetime: {
              input: 'datetime-input',
              type: 'fakeDatetime',
            },
            time: {
              input: 'time-input',
              type: 'fakeTime',
            },
          },
        },
      ];

      var schemaObject = extend(true, SCHEMA_OBJECT, {});

      schemaObject.fields.push({
        name: 'arr',
        type: 'INTEGER',
        mode: 'REPEATED',
      });

      schemaObject.fields.push({
        name: 'arr2',
        type: 'INT64',
        mode: 'REPEATED',
      });

      schemaObject.fields.push({
        name: 'nullable',
        type: 'STRING',
        mode: 'NULLABLE',
      });

      schemaObject.fields.push({
        name: 'buffer',
        type: 'BYTES',
      });

      schemaObject.fields.push({
        name: 'objects',
        type: 'RECORD',
        mode: 'REPEATED',
        fields: [
          {
            name: 'nested_object',
            type: 'RECORD',
            fields: [
              {
                name: 'nested_property',
                type: 'STRING',
              },
            ],
          },
        ],
      });

      schemaObject.fields.push({
        name: 'date',
        type: 'DATE',
      });

      schemaObject.fields.push({
        name: 'datetime',
        type: 'DATETIME',
      });

      schemaObject.fields.push({
        name: 'time',
        type: 'TIME',
      });

      var rawRows = rows.map(prop('raw'));
      var mergedRows = BigQuery.mergeSchemaWithRows_(schemaObject, rawRows);

      mergedRows.forEach(function(mergedRow, index) {
        assert.deepStrictEqual(mergedRow, rows[index].expected);
      });
    });
  });

  describe('date', function() {
    var INPUT_STRING = '2017-1-1';
    var INPUT_OBJ = {
      year: 2017,
      month: 1,
      day: 1,
    };

    it('should expose static and instance constructors', function() {
      var staticD = BigQuery.date();
      assert(staticD instanceof BigQuery.date);
      assert(staticD instanceof bq.date);

      var instanceD = bq.date();
      assert(instanceD instanceof BigQuery.date);
      assert(instanceD instanceof bq.date);
    });

    it('should have the correct constructor name', function() {
      var date = bq.date(INPUT_STRING);
      assert.strictEqual(date.constructor.name, 'BigQueryDate');
    });

    it('should accept a string', function() {
      var date = bq.date(INPUT_STRING);
      assert.strictEqual(date.value, INPUT_STRING);
    });

    it('should accept an object', function() {
      var date = bq.date(INPUT_OBJ);
      assert.strictEqual(date.value, INPUT_STRING);
    });
  });

  describe('datetime', function() {
    var INPUT_STRING = '2017-1-1T14:2:38.883388Z';

    var INPUT_OBJ = {
      year: 2017,
      month: 1,
      day: 1,
      hours: 14,
      minutes: 2,
      seconds: 38,
      fractional: 883388,
    };

    var EXPECTED_VALUE = '2017-1-1 14:2:38.883388';

    it('should expose static and instance constructors', function() {
      var staticDt = BigQuery.datetime(INPUT_OBJ);
      assert(staticDt instanceof BigQuery.datetime);
      assert(staticDt instanceof bq.datetime);

      var instanceDt = bq.datetime(INPUT_OBJ);
      assert(instanceDt instanceof BigQuery.datetime);
      assert(instanceDt instanceof bq.datetime);
    });

    it('should have the correct constructor name', function() {
      var datetime = bq.datetime(INPUT_STRING);
      assert.strictEqual(datetime.constructor.name, 'BigQueryDatetime');
    });

    it('should accept an object', function() {
      var datetime = bq.datetime(INPUT_OBJ);
      assert.strictEqual(datetime.value, EXPECTED_VALUE);
    });

    it('should not include time if hours not provided', function() {
      var datetime = bq.datetime({
        year: 2016,
        month: 1,
        day: 1,
      });

      assert.strictEqual(datetime.value, '2016-1-1');
    });

    it('should accept a string', function() {
      var datetime = bq.datetime(INPUT_STRING);
      assert.strictEqual(datetime.value, EXPECTED_VALUE);
    });
  });

  describe('time', function() {
    var INPUT_STRING = '14:2:38.883388';
    var INPUT_OBJ = {
      hours: 14,
      minutes: 2,
      seconds: 38,
      fractional: 883388,
    };

    it('should expose static and instance constructors', function() {
      var staticT = BigQuery.time();
      assert(staticT instanceof BigQuery.time);
      assert(staticT instanceof bq.time);

      var instanceT = bq.time();
      assert(instanceT instanceof BigQuery.time);
      assert(instanceT instanceof bq.time);
    });

    it('should have the correct constructor name', function() {
      var time = bq.time(INPUT_STRING);
      assert.strictEqual(time.constructor.name, 'BigQueryTime');
    });

    it('should accept a string', function() {
      var time = bq.time(INPUT_STRING);
      assert.strictEqual(time.value, INPUT_STRING);
    });

    it('should accept an object', function() {
      var time = bq.time(INPUT_OBJ);
      assert.strictEqual(time.value, INPUT_STRING);
    });

    it('should default minutes and seconds to 0', function() {
      var time = bq.time({
        hours: 14,
      });
      assert.strictEqual(time.value, '14:0:0');
    });

    it('should not include fractional digits if not provided', function() {
      var input = extend({}, INPUT_OBJ);
      delete input.fractional;

      var time = bq.time(input);
      assert.strictEqual(time.value, '14:2:38');
    });
  });

  describe('timestamp', function() {
    var INPUT_STRING = '2016-12-06T12:00:00.000Z';
    var INPUT_DATE = new Date(INPUT_STRING);
    var EXPECTED_VALUE = INPUT_DATE.toJSON();

    it('should expose static and instance constructors', function() {
      var staticT = BigQuery.timestamp(INPUT_DATE);
      assert(staticT instanceof BigQuery.timestamp);
      assert(staticT instanceof bq.timestamp);

      var instanceT = bq.timestamp(INPUT_DATE);
      assert(instanceT instanceof BigQuery.timestamp);
      assert(instanceT instanceof bq.timestamp);
    });

    it('should have the correct constructor name', function() {
      var timestamp = bq.timestamp(INPUT_STRING);
      assert.strictEqual(timestamp.constructor.name, 'BigQueryTimestamp');
    });

    it('should accept a string', function() {
      var timestamp = bq.timestamp(INPUT_STRING);
      assert.strictEqual(timestamp.value, EXPECTED_VALUE);
    });

    it('should accept a Date object', function() {
      var timestamp = bq.timestamp(INPUT_DATE);
      assert.strictEqual(timestamp.value, EXPECTED_VALUE);
    });
  });

  describe('getType_', function() {
    it('should return correct types', function() {
      assert.strictEqual(BigQuery.getType_(bq.date()).type, 'DATE');
      assert.strictEqual(BigQuery.getType_(bq.datetime('')).type, 'DATETIME');
      assert.strictEqual(BigQuery.getType_(bq.time()).type, 'TIME');
      assert.strictEqual(BigQuery.getType_(bq.timestamp(0)).type, 'TIMESTAMP');
      assert.strictEqual(BigQuery.getType_(Buffer.alloc(2)).type, 'BYTES');
      assert.strictEqual(BigQuery.getType_(true).type, 'BOOL');
      assert.strictEqual(BigQuery.getType_(8).type, 'INT64');
      assert.strictEqual(BigQuery.getType_(8.1).type, 'FLOAT64');
      assert.strictEqual(BigQuery.getType_('hi').type, 'STRING');
      assert.strictEqual(BigQuery.getType_(new Big('1.1')).type, 'NUMERIC');
    });

    it('should return correct type for an array', function() {
      var type = BigQuery.getType_([1]);

      assert.deepStrictEqual(type, {
        type: 'ARRAY',
        arrayType: {
          type: 'INT64',
        },
      });
    });

    it('should return correct type for a struct', function() {
      var type = BigQuery.getType_({prop: 1});

      assert.deepStrictEqual(type, {
        type: 'STRUCT',
        structTypes: [
          {
            name: 'prop',
            type: {
              type: 'INT64',
            },
          },
        ],
      });
    });

    it('should throw if a type cannot be detected', function() {
      var expectedError = new RegExp(
        [
          'This value could not be translated to a BigQuery data type.',
          undefined,
        ].join('\n')
      );

      assert.throws(function() {
        BigQuery.getType_(undefined);
      }, expectedError);
    });
  });

  describe('valueToQueryParameter_', function() {
    it('should get the type', function(done) {
      var value = {};

      BigQuery.getType_ = function(value_) {
        assert.strictEqual(value_, value);
        setImmediate(done);
        return {
          type: '',
        };
      };

      BigQuery.valueToQueryParameter_(value);
    });

    it('should format a Date', function() {
      var date = new Date();
      var expectedValue = date.toJSON().replace(/(.*)T(.*)Z$/, '$1 $2');

      BigQuery.timestamp = function(value) {
        assert.strictEqual(value, date);
        return {
          value: expectedValue,
        };
      };

      BigQuery.getType_ = function() {
        return {
          type: 'TIMESTAMP',
        };
      };

      var queryParameter = BigQuery.valueToQueryParameter_(date);
      assert.strictEqual(queryParameter.parameterValue.value, expectedValue);
    });

    it('should locate the value on DATETIME objects', function() {
      var datetime = {
        value: 'value',
      };

      BigQuery.getType_ = function() {
        return {
          type: 'DATETIME',
        };
      };

      var queryParameter = BigQuery.valueToQueryParameter_(datetime);
      assert.strictEqual(queryParameter.parameterValue.value, datetime.value);
    });

    it('should locate the value on TIME objects', function() {
      var time = {
        value: 'value',
      };

      BigQuery.getType_ = function() {
        return {
          type: 'TIME',
        };
      };

      var queryParameter = BigQuery.valueToQueryParameter_(time);
      assert.strictEqual(queryParameter.parameterValue.value, time.value);
    });

    it('should format an array', function() {
      var array = [1];

      BigQuery.getType_ = function() {
        return {
          type: 'ARRAY',
        };
      };

      var queryParameter = BigQuery.valueToQueryParameter_(array);
      var arrayValues = queryParameter.parameterValue.arrayValues;

      assert.deepStrictEqual(arrayValues, [
        {
          value: array[0],
        },
      ]);
    });

    it('should format a struct', function() {
      var struct = {
        key: 'value',
      };

      var expectedParameterValue = {};

      BigQuery.getType_ = function() {
        BigQuery.valueToQueryParameter_ = function(value) {
          assert.strictEqual(value, struct.key);
          return {
            parameterValue: expectedParameterValue,
          };
        };

        return {
          type: 'STRUCT',
        };
      };

      var queryParameter = BigQuery.valueToQueryParameter_(struct);
      var structValues = queryParameter.parameterValue.structValues;

      assert.strictEqual(structValues.key, expectedParameterValue);
    });

    it('should format all other types', function() {
      var typeName = 'ANY-TYPE';

      BigQuery.getType_ = function() {
        return {
          type: typeName,
        };
      };

      assert.deepStrictEqual(BigQuery.valueToQueryParameter_(8), {
        parameterType: {
          type: typeName,
        },
        parameterValue: {
          value: 8,
        },
      });
    });
  });

  describe('createDataset', function() {
    var DATASET_ID = 'kittens';

    it('should create a dataset', function(done) {
      bq.request = function(reqOpts) {
        assert.strictEqual(reqOpts.method, 'POST');
        assert.strictEqual(reqOpts.uri, '/datasets');
        assert.deepStrictEqual(reqOpts.json.datasetReference, {
          datasetId: DATASET_ID,
        });

        done();
      };

      bq.createDataset(DATASET_ID, assert.ifError);
    });

    it('should send the location if available', function(done) {
      var bq = new BigQuery({
        projectId: PROJECT_ID,
        location: LOCATION,
      });

      bq.request = function(reqOpts) {
        assert.strictEqual(reqOpts.json.location, LOCATION);
        done();
      };

      bq.createDataset(DATASET_ID, assert.ifError);
    });

    it('should not modify the original options object', function(done) {
      var options = {
        a: 'b',
        c: 'd',
      };

      var originalOptions = extend({}, options);

      bq.request = function(reqOpts) {
        assert.notStrictEqual(reqOpts.json, options);
        assert.deepStrictEqual(options, originalOptions);
        done();
      };

      bq.createDataset(DATASET_ID, options, assert.ifError);
    });

    it('should return an error to the callback', function(done) {
      var error = new Error('Error.');

      bq.request = function(reqOpts, callback) {
        callback(error);
      };

      bq.createDataset(DATASET_ID, function(err) {
        assert.strictEqual(err, error);
        done();
      });
    });

    it('should return a Dataset object', function(done) {
      bq.request = function(reqOpts, callback) {
        callback(null, {});
      };

      bq.createDataset(DATASET_ID, function(err, dataset) {
        assert.ifError(err);
        assert(dataset instanceof FakeDataset);
        done();
      });
    });

    it('should return an apiResponse', function(done) {
      var resp = {success: true};

      bq.request = function(reqOpts, callback) {
        callback(null, resp);
      };

      bq.createDataset(DATASET_ID, function(err, dataset, apiResponse) {
        assert.ifError(err);
        assert.deepStrictEqual(apiResponse, resp);
        done();
      });
    });

    it('should assign metadata to the Dataset object', function(done) {
      var metadata = {a: 'b', c: 'd'};

      bq.request = function(reqOpts, callback) {
        callback(null, metadata);
      };

      bq.createDataset(DATASET_ID, function(err, dataset) {
        assert.ifError(err);
        assert.deepStrictEqual(dataset.metadata, metadata);
        done();
      });
    });
  });

  describe('createJob', function() {
    var RESPONSE = {
      status: {
        state: 'RUNNING',
      },
      jobReference: {
        location: LOCATION,
      },
    };

    var fakeJobId;

    beforeEach(function() {
      fakeJobId = uuid.v4();

      fakeUuid.v4 = function() {
        return fakeJobId;
      };
    });

    it('should make the correct request', function(done) {
      var fakeOptions = {
        a: 'b',
      };

      var expectedOptions = extend({}, fakeOptions, {
        jobReference: {
          projectId: bq.projectId,
          jobId: fakeJobId,
          location: undefined,
        },
      });

      bq.request = function(reqOpts) {
        assert.strictEqual(reqOpts.method, 'POST');
        assert.strictEqual(reqOpts.uri, '/jobs');
        assert.deepStrictEqual(reqOpts.json, expectedOptions);
        assert.notStrictEqual(reqOpts.json, fakeOptions);
        done();
      };

      bq.createJob(fakeOptions, assert.ifError);
    });

    it('should accept a job prefix', function(done) {
      var jobPrefix = 'abc-';
      var expectedJobId = jobPrefix + fakeJobId;
      var options = {
        jobPrefix: jobPrefix,
      };

      bq.request = function(reqOpts) {
        assert.strictEqual(reqOpts.json.jobReference.jobId, expectedJobId);
        assert.strictEqual(reqOpts.json.jobPrefix, undefined);
        done();
      };

      bq.createJob(options, assert.ifError);
    });

    it('should accept a location', function(done) {
      var options = {
        location: LOCATION,
      };

      bq.request = function(reqOpts) {
        assert.strictEqual(reqOpts.json.jobReference.location, LOCATION);
        assert.strictEqual(reqOpts.json.location, undefined);
        done();
      };

      bq.createJob(options, assert.ifError);
    });

    it('should accept a job id', function(done) {
      var jobId = 'job-id';
      var options = {jobId};

      bq.request = function(reqOpts) {
        assert.strictEqual(reqOpts.json.jobReference.jobId, jobId);
        assert.strictEqual(reqOpts.json.jobId, undefined);
        done();
      };

      bq.createJob(options, assert.ifError);
    });

    it('should use the user defined location if available', function(done) {
      var bq = new BigQuery({
        projectId: PROJECT_ID,
        location: LOCATION,
      });

      bq.request = function(reqOpts) {
        assert.strictEqual(reqOpts.json.jobReference.location, LOCATION);
        done();
      };

      bq.createJob({}, assert.ifError);
    });

    it('should return any request errors', function(done) {
      var response = {};
      var error = new Error('err.');

      bq.request = function(reqOpts, callback) {
        callback(error, response);
      };

      bq.createJob({}, function(err, job, resp) {
        assert.strictEqual(err, error);
        assert.strictEqual(job, null);
        assert.strictEqual(resp, response);
        done();
      });
    });

    it('should return any status errors', function(done) {
      var errors = [{reason: 'notFound'}];
      var response = extend(true, {}, RESPONSE, {
        status: {errors},
      });

      bq.request = function(reqOpts, callback) {
        callback(null, response);
      };

      bq.createJob({}, function(err) {
        assert(err instanceof FakeApiError);

        var errorOpts = err.calledWith_[0];
        assert.deepStrictEqual(errorOpts.errors, errors);
        assert.strictEqual(errorOpts.response, response);
        done();
      });
    });

    it('should return a job object', function(done) {
      var fakeJob = {};

      bq.job = function(jobId, options) {
        assert.strictEqual(jobId, fakeJobId);
        assert.strictEqual(options.location, LOCATION);
        return fakeJob;
      };

      bq.request = function(reqOpts, callback) {
        callback(null, RESPONSE);
      };

      bq.createJob({}, function(err, job, resp) {
        assert.ifError(err);
        assert.strictEqual(job, fakeJob);
        assert.strictEqual(job.metadata, RESPONSE);
        assert.strictEqual(resp, RESPONSE);
        done();
      });
    });
  });

  describe('createQueryJob', function() {
    var QUERY_STRING = 'SELECT * FROM [dataset.table]';

    it('should throw if a query is not provided', function() {
      assert.throws(function() {
        bq.createQueryJob();
      }, /SQL query string is required/);

      assert.throws(function() {
        bq.createQueryJob({noQuery: 'here'});
      }, /SQL query string is required/);
    });

    describe('with destination', function() {
      var dataset;
      var TABLE_ID = 'table-id';

      beforeEach(function() {
        dataset = {
          bigQuery: bq,
          id: 'dataset-id',
          createTable: util.noop,
        };
      });

      it('should throw if a destination is not a table', function() {
        assert.throws(function() {
          bq.createQueryJob({
            query: 'query',
            destination: 'not a table',
          });
        }, /Destination must be a Table/);
      });

      it('should assign destination table to request body', function(done) {
        bq.request = function(reqOpts) {
          assert.deepStrictEqual(
            reqOpts.json.configuration.query.destinationTable,
            {
              datasetId: dataset.id,
              projectId: dataset.bigQuery.projectId,
              tableId: TABLE_ID,
            }
          );

          done();
        };

        bq.createQueryJob({
          query: 'query',
          destination: new FakeTable(dataset, TABLE_ID),
        });
      });

      it('should delete `destination` prop from request body', function(done) {
        bq.request = function(reqOpts) {
          var body = reqOpts.json;
          assert.strictEqual(body.configuration.query.destination, undefined);
          done();
        };

        bq.createQueryJob({
          query: 'query',
          destination: new FakeTable(dataset, TABLE_ID),
        });
      });
    });

    describe('SQL parameters', function() {
      var NAMED_PARAMS = {
        key: 'value',
      };

      var POSITIONAL_PARAMS = ['value'];

      it('should delete the params option', function(done) {
        bq.createJob = function(reqOpts) {
          assert.strictEqual(reqOpts.params, undefined);
          done();
        };

        bq.createQueryJob(
          {
            query: QUERY_STRING,
            params: NAMED_PARAMS,
          },
          assert.ifError
        );
      });

      describe('named', function() {
        it('should set the correct parameter mode', function(done) {
          bq.createJob = function(reqOpts) {
            var query = reqOpts.configuration.query;
            assert.strictEqual(query.parameterMode, 'named');
            done();
          };

          bq.createQueryJob(
            {
              query: QUERY_STRING,
              params: NAMED_PARAMS,
            },
            assert.ifError
          );
        });

        it('should get set the correct query parameters', function(done) {
          var queryParameter = {};

          BigQuery.valueToQueryParameter_ = function(value) {
            assert.strictEqual(value, NAMED_PARAMS.key);
            return queryParameter;
          };

          bq.createJob = function(reqOpts) {
            var query = reqOpts.configuration.query;
            assert.strictEqual(query.queryParameters[0], queryParameter);
            assert.strictEqual(query.queryParameters[0].name, 'key');
            done();
          };

          bq.createQueryJob(
            {
              query: QUERY_STRING,
              params: NAMED_PARAMS,
            },
            assert.ifError
          );
        });
      });

      describe('positional', function() {
        it('should set the correct parameter mode', function(done) {
          bq.createJob = function(reqOpts) {
            var query = reqOpts.configuration.query;
            assert.strictEqual(query.parameterMode, 'positional');
            done();
          };

          bq.createQueryJob(
            {
              query: QUERY_STRING,
              params: POSITIONAL_PARAMS,
            },
            assert.ifError
          );
        });

        it('should get set the correct query parameters', function(done) {
          var queryParameter = {};

          BigQuery.valueToQueryParameter_ = function(value) {
            assert.strictEqual(value, POSITIONAL_PARAMS[0]);
            return queryParameter;
          };

          bq.createJob = function(reqOpts) {
            var query = reqOpts.configuration.query;
            assert.strictEqual(query.queryParameters[0], queryParameter);
            done();
          };

          bq.createQueryJob(
            {
              query: QUERY_STRING,
              params: POSITIONAL_PARAMS,
            },
            assert.ifError
          );
        });
      });
    });

    it('should accept the dryRun options', function(done) {
      var options = {
        query: QUERY_STRING,
        dryRun: true,
      };

      bq.createJob = function(reqOpts) {
        assert.strictEqual(reqOpts.configuration.query.dryRun, undefined);
        assert.strictEqual(reqOpts.configuration.dryRun, options.dryRun);
        done();
      };

      bq.createQueryJob(options, assert.ifError);
    });

    it('should accept a job prefix', function(done) {
      var options = {
        query: QUERY_STRING,
        jobPrefix: 'hi',
      };

      bq.createJob = function(reqOpts) {
        assert.strictEqual(reqOpts.configuration.query.jobPrefix, undefined);
        assert.strictEqual(reqOpts.jobPrefix, options.jobPrefix);
        done();
      };

      bq.createQueryJob(options, assert.ifError);
    });

    it('should accept a location', function(done) {
      var options = {
        query: QUERY_STRING,
        location: LOCATION,
      };

      bq.createJob = function(reqOpts) {
        assert.strictEqual(reqOpts.configuration.query.location, undefined);
        assert.strictEqual(reqOpts.location, LOCATION);
        done();
      };

      bq.createQueryJob(options, assert.ifError);
    });

    it('should accept a job id', function(done) {
      var options = {
        query: QUERY_STRING,
        jobId: 'jobId',
      };

      bq.createJob = function(reqOpts) {
        assert.strictEqual(reqOpts.configuration.query.jobId, undefined);
        assert.strictEqual(reqOpts.jobId, options.jobId);
        done();
      };

      bq.createQueryJob(options, assert.ifError);
    });

    it('should pass the callback to createJob', function(done) {
      bq.createJob = function(reqOpts, callback) {
        callback(); // the done fn
      };

      bq.createQueryJob(QUERY_STRING, done);
    });
  });

  describe('dataset', function() {
    var DATASET_ID = 'dataset-id';

    it('returns a Dataset instance', function() {
      var ds = bq.dataset(DATASET_ID);
      assert(ds instanceof FakeDataset);
    });

    it('should scope the correct dataset', function() {
      var ds = bq.dataset(DATASET_ID);
      var args = ds.calledWith_;

      assert.strictEqual(args[0], bq);
      assert.strictEqual(args[1], DATASET_ID);
    });

    it('should accept dataset metadata', function() {
      var options = {location: 'US'};
      var ds = bq.dataset(DATASET_ID, options);
      var args = ds.calledWith_;

      assert.strictEqual(args[2], options);
    });

    it('should pass the location if available', function() {
      var bq = new BigQuery({
        projectId: PROJECT_ID,
        location: LOCATION,
      });

      var options = {a: 'b'};
      var expectedOptions = extend({location: LOCATION}, options);

      var ds = bq.dataset(DATASET_ID, options);
      var args = ds.calledWith_;

      assert.deepStrictEqual(args[2], expectedOptions);
      assert.notStrictEqual(args[2], options);
    });
  });

  describe('getDatasets', function() {
    it('should get datasets from the api', function(done) {
      bq.request = function(reqOpts) {
        assert.strictEqual(reqOpts.uri, '/datasets');
        assert.deepStrictEqual(reqOpts.qs, {});

        done();
      };

      bq.getDatasets(assert.ifError);
    });

    it('should accept query', function(done) {
      var queryObject = {all: true, maxResults: 8, pageToken: 'token'};

      bq.request = function(reqOpts) {
        assert.strictEqual(reqOpts.qs, queryObject);
        done();
      };

      bq.getDatasets(queryObject, assert.ifError);
    });

    it('should default the query to an empty object', function(done) {
      bq.request = function(reqOpts) {
        assert.deepStrictEqual(reqOpts.qs, {});
        done();
      };

      bq.getDatasets(null, assert.ifError);
    });

    it('should return error to callback', function(done) {
      var error = new Error('Error.');

      bq.request = function(reqOpts, callback) {
        callback(error);
      };

      bq.getDatasets(function(err) {
        assert.strictEqual(err, error);
        done();
      });
    });

    it('should return Dataset objects', function(done) {
      var datasetId = 'datasetName';

      bq.request = function(reqOpts, callback) {
        callback(null, {
          datasets: [
            {
              datasetReference: {datasetId},
              location: LOCATION,
            },
          ],
        });
      };

      bq.getDatasets(function(err, datasets) {
        assert.ifError(err);

        var dataset = datasets[0];
        var args = dataset.calledWith_;

        assert(dataset instanceof FakeDataset);
        assert.strictEqual(args[0], bq);
        assert.strictEqual(args[1], datasetId);
        assert.deepStrictEqual(args[2], {location: LOCATION});
        done();
      });
    });

    it('should return Dataset objects', function(done) {
      var resp = {success: true};

      bq.request = function(reqOpts, callback) {
        callback(null, resp);
      };

      bq.getDatasets(function(err, datasets, nextQuery, apiResponse) {
        assert.ifError(err);
        assert.strictEqual(apiResponse, resp);
        done();
      });
    });

    it('should assign metadata to the Dataset objects', function(done) {
      var datasetObjects = [
        {
          a: 'b',
          c: 'd',
          datasetReference: {
            datasetId: 'datasetName',
          },
        },
      ];

      bq.request = function(reqOpts, callback) {
        callback(null, {datasets: datasetObjects});
      };

      bq.getDatasets(function(err, datasets) {
        assert.ifError(err);
        assert.strictEqual(datasets[0].metadata, datasetObjects[0]);
        done();
      });
    });

    it('should return token if more results exist', function(done) {
      var token = 'token';

      bq.request = function(reqOpts, callback) {
        callback(null, {nextPageToken: token});
      };

      bq.getDatasets(function(err, datasets, nextQuery) {
        assert.deepStrictEqual(nextQuery, {
          pageToken: token,
        });
        done();
      });
    });
  });

  describe('getJobs', function() {
    it('should get jobs from the api', function(done) {
      bq.request = function(reqOpts) {
        assert.strictEqual(reqOpts.uri, '/jobs');
        assert.deepStrictEqual(reqOpts.qs, {});
        assert.deepStrictEqual(reqOpts.useQuerystring, true);
        done();
      };

      bq.getJobs(assert.ifError);
    });

    it('should accept query', function(done) {
      var queryObject = {
        allUsers: true,
        maxResults: 8,
        pageToken: 'token',
        projection: 'full',
        stateFilter: 'done',
      };

      bq.request = function(reqOpts) {
        assert.deepStrictEqual(reqOpts.qs, queryObject);
        done();
      };

      bq.getJobs(queryObject, assert.ifError);
    });

    it('should default the query to an object', function(done) {
      bq.request = function(reqOpts) {
        assert.deepStrictEqual(reqOpts.qs, {});
        done();
      };

      bq.getJobs(null, assert.ifError);
    });

    it('should return error to callback', function(done) {
      var error = new Error('Error.');

      bq.request = function(reqOpts, callback) {
        callback(error);
      };

      bq.getJobs(function(err) {
        assert.strictEqual(err, error);
        done();
      });
    });

    it('should return Job objects', function(done) {
      bq.request = function(reqOpts, callback) {
        callback(null, {
          jobs: [
            {
              id: JOB_ID,
              jobReference: {
                jobId: JOB_ID,
                location: LOCATION,
              },
            },
          ],
        });
      };

      bq.getJobs(function(err, jobs) {
        assert.ifError(err);

        var job = jobs[0];
        var args = job.calledWith_;

        assert(job instanceof FakeJob);
        assert.strictEqual(args[0], bq);
        assert.strictEqual(args[1], JOB_ID);
        assert.deepStrictEqual(args[2], {location: LOCATION});
        done();
      });
    });

    it('should return apiResponse', function(done) {
      var resp = {
        jobs: [
          {
            id: JOB_ID,
            jobReference: {
              jobId: JOB_ID,
            },
          },
        ],
      };

      bq.request = function(reqOpts, callback) {
        callback(null, resp);
      };

      bq.getJobs(function(err, jobs, nextQuery, apiResponse) {
        assert.ifError(err);
        assert.strictEqual(resp, apiResponse);
        done();
      });
    });

    it('should assign metadata to the Job objects', function(done) {
      var jobObjects = [
        {
          a: 'b',
          c: 'd',
          id: JOB_ID,
          jobReference: {
            jobId: JOB_ID,
          },
        },
      ];

      bq.request = function(reqOpts, callback) {
        callback(null, {jobs: jobObjects});
      };

      bq.getJobs(function(err, jobs) {
        assert.ifError(err);
        assert.strictEqual(jobs[0].metadata, jobObjects[0]);
        done();
      });
    });

    it('should return token if more results exist', function(done) {
      var token = 'token';

      bq.request = function(reqOpts, callback) {
        callback(null, {nextPageToken: token});
      };

      bq.getJobs(function(err, jobs, nextQuery) {
        assert.ifError(err);
        assert.deepStrictEqual(nextQuery, {
          pageToken: token,
        });
        done();
      });
    });
  });

  describe('job', function() {
    it('should return a Job instance', function() {
      var job = bq.job(JOB_ID);
      assert(job instanceof FakeJob);
    });

    it('should scope the correct job', function() {
      var job = bq.job(JOB_ID);
      var args = job.calledWith_;

      assert.strictEqual(args[0], bq);
      assert.strictEqual(args[1], JOB_ID);
    });

    it('should pass the options object', function() {
      var options = {a: 'b'};
      var job = bq.job(JOB_ID, options);

      assert.strictEqual(job.calledWith_[2], options);
    });

    it('should pass in the user specified location', function() {
      var bq = new BigQuery({
        projectId: PROJECT_ID,
        location: LOCATION,
      });

      var options = {a: 'b'};
      var expectedOptions = extend({location: LOCATION}, options);

      var job = bq.job(JOB_ID, options);
      var args = job.calledWith_;

      assert.deepStrictEqual(args[2], expectedOptions);
      assert.notStrictEqual(args[2], options);
    });
  });

  describe('query', function() {
    var FAKE_ROWS = [{}, {}, {}];
    var FAKE_RESPONSE = {};
    var QUERY_STRING = 'SELECT * FROM [dataset.table]';

    it('should return any errors from createQueryJob', function(done) {
      var error = new Error('err');

      bq.createQueryJob = function(query, callback) {
        callback(error, null, FAKE_RESPONSE);
      };

      bq.query(QUERY_STRING, function(err, rows, resp) {
        assert.strictEqual(err, error);
        assert.strictEqual(rows, null);
        assert.strictEqual(resp, FAKE_RESPONSE);
        done();
      });
    });

    it('should exit early if dryRun is set', function(done) {
      var options = {
        query: QUERY_STRING,
        dryRun: true,
      };

      bq.createQueryJob = function(query, callback) {
        assert.strictEqual(query, options);
        callback(null, null, FAKE_RESPONSE);
      };

      bq.query(options, function(err, rows, resp) {
        assert.ifError(err);
        assert.deepStrictEqual(rows, []);
        assert.strictEqual(resp, FAKE_RESPONSE);
        done();
      });
    });

    it('should call job#getQueryResults', function(done) {
      var fakeJob = {
        getQueryResults: function(options, callback) {
          assert.deepStrictEqual(options, {});
          callback(null, FAKE_ROWS, FAKE_RESPONSE);
        },
      };

      bq.createQueryJob = function(query, callback) {
        callback(null, fakeJob, FAKE_RESPONSE);
      };

      bq.query(QUERY_STRING, function(err, rows, resp) {
        assert.ifError(err);
        assert.strictEqual(rows, FAKE_ROWS);
        assert.strictEqual(resp, FAKE_RESPONSE);
        done();
      });
    });

    it('should optionally accept options', function(done) {
      var fakeOptions = {};
      var fakeJob = {
        getQueryResults: function(options) {
          assert.strictEqual(options, fakeOptions);
          done();
        },
      };

      bq.createQueryJob = function(query, callback) {
        callback(null, fakeJob, FAKE_RESPONSE);
      };

      bq.query(QUERY_STRING, fakeOptions, assert.ifError);
    });
  });

  describe('queryAsStream_', function() {
    it('should call query correctly', function(done) {
      var query = 'SELECT';

      bq.query = function(query_, options, callback) {
        assert.strictEqual(query_, query);
        assert.deepStrictEqual(options, {autoPaginate: false});
        callback(); // done()
      };

      bq.queryAsStream_(query, done);
    });
  });
});

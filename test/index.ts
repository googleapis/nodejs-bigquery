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

import {DecorateRequestOptions, Service, ServiceConfig, ServiceOptions, util} from '@google-cloud/common';
import * as pfy from '@google-cloud/promisify';
import * as arrify from 'arrify';
import * as assert from 'assert';
import Big from 'big.js';
import * as extend from 'extend';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as uuid from 'uuid';

import {BigQueryDate, Dataset, Job, Query, Table} from '../src';
import {JobOptions} from '../src/job';
import {TableField} from '../src/table';

const fakeUuid = extend(true, {}, uuid);

class FakeApiError {
  calledWith_: IArguments;
  constructor() {
    this.calledWith_ = arguments;
  }
}

let promisified = false;
const fakePfy = extend({}, pfy, {
  promisifyAll: (c: Function, options: pfy.PromisifyAllOptions) => {
    if (c.name !== 'BigQuery') {
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
const fakeUtil = extend({}, util, {
  ApiError: FakeApiError,
});
const originalFakeUtil = extend(true, {}, fakeUtil);

class FakeDataset {
  calledWith_: IArguments;
  constructor() {
    this.calledWith_ = arguments;
  }
}

class FakeTable extends Table {
  constructor(a: Dataset, b: string) {
    super(a, b);
  }
}

class FakeJob {
  calledWith_: IArguments;
  constructor() {
    this.calledWith_ = arguments;
  }
}

let extended = false;
const fakePaginator = {
  paginator: {
    extend: (c: Function, methods: string[]) => {
      if (c.name !== 'BigQuery') {
        return;
      }
      methods = arrify(methods);
      assert.strictEqual(c.name, 'BigQuery');
      assert.deepStrictEqual(methods, ['getDatasets', 'getJobs']);
      extended = true;
    },
    streamify: (methodName: string) => {
      return methodName;
    },
  }
};

class FakeService extends Service {
  calledWith_: IArguments;
  constructor(config: ServiceConfig, options: ServiceOptions) {
    super(config, options);
    this.calledWith_ = arguments;
  }
}

const sandbox = sinon.createSandbox();
afterEach(() => sandbox.restore());

describe('BigQuery', () => {
  const JOB_ID = 'JOB_ID';
  const PROJECT_ID = 'test-project';
  const LOCATION = 'asia-northeast1';

  // tslint:disable-next-line no-any variable-name
  let BigQueryCached: any;
  // tslint:disable-next-line no-any variable-name
  let BigQuery: any;
  // tslint:disable-next-line no-any
  let bq: any;

  before(() => {
    BigQuery = proxyquire('../src', {
                 uuid: fakeUuid,
                 './dataset': {
                   Dataset: FakeDataset,
                 },
                 './job': {
                   Job: FakeJob,
                 },
                 './table': {
                   Table: FakeTable,
                 },
                 '@google-cloud/common': {
                   Service: FakeService,
                   util: fakeUtil,
                 },
                 '@google-cloud/paginator': fakePaginator,
                 '@google-cloud/promisify': fakePfy,
               }).BigQuery;
    BigQueryCached = extend({}, BigQuery);
  });

  beforeEach(() => {
    extend(fakeUtil, originalFakeUtil);
    BigQuery = extend(BigQuery, BigQueryCached);
    bq = new BigQuery({projectId: PROJECT_ID});
  });

  describe('instantiation', () => {
    it('should extend the correct methods', () => {
      assert(extended);  // See `fakePaginator.extend`
    });

    it('should streamify the correct methods', () => {
      assert.strictEqual(bq.getDatasetsStream, 'getDatasets');
      assert.strictEqual(bq.getJobsStream, 'getJobs');
      assert.strictEqual(bq.createQueryStream, 'queryAsStream_');
    });

    it('should promisify all the things', () => {
      assert(promisified);
    });

    it('should inherit from Service', () => {
      assert(bq instanceof Service);

      const calledWith = bq.calledWith_[0];

      const baseUrl = 'https://www.googleapis.com/bigquery/v2';
      assert.strictEqual(calledWith.baseUrl, baseUrl);
      assert.deepStrictEqual(calledWith.scopes, [
        'https://www.googleapis.com/auth/bigquery',
      ]);
      assert.deepStrictEqual(
          calledWith.packageJson, require('../../package.json'));
    });

    it('should capture any user specified location', () => {
      const bq = new BigQuery({
        projectId: PROJECT_ID,
        location: LOCATION,
      });

      assert.strictEqual(bq.location, LOCATION);
    });

    it('should pass scopes from options', () => {
      const bq = new BigQuery({
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });

      const expectedScopes = [
        'https://www.googleapis.com/auth/bigquery',
        'https://www.googleapis.com/auth/drive.readonly',
      ];

      const calledWith = bq.calledWith_[0];
      assert.deepStrictEqual(calledWith.scopes, expectedScopes);
    });
  });

  describe('mergeSchemaWithRows_', () => {
    const SCHEMA_OBJECT = {
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
    } as {fields: TableField[]};

    beforeEach(() => {
      sandbox.stub(BigQuery, 'date').callsFake(input => {
        return {
          type: 'fakeDate',
          input,
        };
      });

      sandbox.stub(BigQuery, 'datetime').callsFake(input => {
        return {
          type: 'fakeDatetime',
          input,
        };
      });

      sandbox.stub(BigQuery, 'time').callsFake(input => {
        return {
          type: 'fakeTime',
          input,
        };
      });

      sandbox.stub(BigQuery, 'timestamp').callsFake(input => {
        return {
          type: 'fakeTimestamp',
          input,
        };
      });
    });

    it('should merge the schema and flatten the rows', () => {
      const now = new Date();
      const buffer = Buffer.from('test');

      const rows = [
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
            buffer,
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

      const schemaObject = extend(true, SCHEMA_OBJECT, {});

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

      const rawRows = rows.map(x => x.raw);
      const mergedRows = BigQuery.mergeSchemaWithRows_(schemaObject, rawRows);

      mergedRows.forEach((mergedRow: {}, index: number) => {
        assert.deepStrictEqual(mergedRow, rows[index].expected);
      });
    });
  });

  describe('date', () => {
    const INPUT_STRING = '2017-1-1';
    const INPUT_OBJ = {
      year: 2017,
      month: 1,
      day: 1,
    };

    it.skip('should expose static and instance constructors', () => {
      const staticD = BigQuery.date();
      assert(staticD instanceof BigQueryDate);
      assert(staticD instanceof bq.date);

      const instanceD = bq.date();
      assert(instanceD instanceof BigQueryDate);
      assert(instanceD instanceof bq.date);
    });

    it('should have the correct constructor name', () => {
      const date = bq.date(INPUT_STRING);
      assert.strictEqual(date.constructor.name, 'BigQueryDate');
    });

    it('should accept a string', () => {
      const date = bq.date(INPUT_STRING);
      assert.strictEqual(date.value, INPUT_STRING);
    });

    it('should accept an object', () => {
      const date = bq.date(INPUT_OBJ);
      assert.strictEqual(date.value, INPUT_STRING);
    });
  });

  describe('datetime', () => {
    const INPUT_STRING = '2017-1-1T14:2:38.883388Z';

    const INPUT_OBJ = {
      year: 2017,
      month: 1,
      day: 1,
      hours: 14,
      minutes: 2,
      seconds: 38,
      fractional: 883388,
    };

    const EXPECTED_VALUE = '2017-1-1 14:2:38.883388';

    it.skip('should expose static and instance constructors', () => {
      const staticDt = BigQuery.datetime(INPUT_OBJ);
      assert(staticDt instanceof BigQuery.datetime);
      assert(staticDt instanceof bq.datetime);

      const instanceDt = bq.datetime(INPUT_OBJ);
      assert(instanceDt instanceof BigQuery.datetime);
      assert(instanceDt instanceof bq.datetime);
    });

    it('should have the correct constructor name', () => {
      const datetime = bq.datetime(INPUT_STRING);
      assert.strictEqual(datetime.constructor.name, 'BigQueryDatetime');
    });

    it('should accept an object', () => {
      const datetime = bq.datetime(INPUT_OBJ);
      assert.strictEqual(datetime.value, EXPECTED_VALUE);
    });

    it('should not include time if hours not provided', () => {
      const datetime = bq.datetime({
        year: 2016,
        month: 1,
        day: 1,
      });

      assert.strictEqual(datetime.value, '2016-1-1');
    });

    it('should accept a string', () => {
      const datetime = bq.datetime(INPUT_STRING);
      assert.strictEqual(datetime.value, EXPECTED_VALUE);
    });
  });

  describe('time', () => {
    const INPUT_STRING = '14:2:38.883388';
    const INPUT_OBJ = {
      hours: 14,
      minutes: 2,
      seconds: 38,
      fractional: 883388,
    };

    it.skip('should expose static and instance constructors', () => {
      const staticT = BigQuery.time();
      assert(staticT instanceof BigQuery.time);
      assert(staticT instanceof bq.time);

      const instanceT = bq.time();
      assert(instanceT instanceof BigQuery.time);
      assert(instanceT instanceof bq.time);
    });

    it('should have the correct constructor name', () => {
      const time = bq.time(INPUT_STRING);
      assert.strictEqual(time.constructor.name, 'BigQueryTime');
    });

    it('should accept a string', () => {
      const time = bq.time(INPUT_STRING);
      assert.strictEqual(time.value, INPUT_STRING);
    });

    it('should accept an object', () => {
      const time = bq.time(INPUT_OBJ);
      assert.strictEqual(time.value, INPUT_STRING);
    });

    it('should default minutes and seconds to 0', () => {
      const time = bq.time({
        hours: 14,
      });
      assert.strictEqual(time.value, '14:0:0');
    });

    it('should not include fractional digits if not provided', () => {
      const input = extend({}, INPUT_OBJ);
      delete input.fractional;

      const time = bq.time(input);
      assert.strictEqual(time.value, '14:2:38');
    });
  });

  describe('timestamp', () => {
    const INPUT_STRING = '2016-12-06T12:00:00.000Z';
    const INPUT_DATE = new Date(INPUT_STRING);
    const EXPECTED_VALUE = INPUT_DATE.toJSON();

    it.skip('should expose static and instance constructors', () => {
      const staticT = BigQuery.timestamp(INPUT_DATE);
      assert(staticT instanceof BigQuery.timestamp);
      assert(staticT instanceof bq.timestamp);

      const instanceT = bq.timestamp(INPUT_DATE);
      assert(instanceT instanceof BigQuery.timestamp);
      assert(instanceT instanceof bq.timestamp);
    });

    it('should have the correct constructor name', () => {
      const timestamp = bq.timestamp(INPUT_STRING);
      assert.strictEqual(timestamp.constructor.name, 'BigQueryTimestamp');
    });

    it('should accept a string', () => {
      const timestamp = bq.timestamp(INPUT_STRING);
      assert.strictEqual(timestamp.value, EXPECTED_VALUE);
    });

    it('should accept a Date object', () => {
      const timestamp = bq.timestamp(INPUT_DATE);
      assert.strictEqual(timestamp.value, EXPECTED_VALUE);
    });
  });

  describe('getType_', () => {
    it('should return correct types', () => {
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

    it('should return correct type for an array', () => {
      const type = BigQuery.getType_([1]);

      assert.deepStrictEqual(type, {
        type: 'ARRAY',
        arrayType: {
          type: 'INT64',
        },
      });
    });

    it('should return correct type for a struct', () => {
      const type = BigQuery.getType_({prop: 1});

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

    it('should throw if a type cannot be detected', () => {
      const expectedError = new RegExp([
        'This value could not be translated to a BigQuery data type.',
        undefined,
      ].join('\n'));

      assert.throws(() => {
        BigQuery.getType_(undefined);
      }, expectedError);
    });
  });

  describe('valueToQueryParameter_', () => {
    it('should get the type', done => {
      const value = {};

      sandbox.stub(BigQuery, 'getType_').callsFake(value_ => {
        assert.strictEqual(value_, value);
        setImmediate(done);
        return {
          type: '',
        };
      });

      BigQuery.valueToQueryParameter_(value);
    });

    it('should format a Date', () => {
      const date = new Date();
      const expectedValue = date.toJSON().replace(/(.*)T(.*)Z$/, '$1 $2');

      sandbox.stub(BigQuery, 'timestamp').callsFake(value => {
        assert.strictEqual(value, date);
        return {
          value: expectedValue,
        };
      });

      sandbox.stub(BigQuery, 'getType_').returns({
        type: 'TIMESTAMP',
      });

      const queryParameter = BigQuery.valueToQueryParameter_(date);
      assert.strictEqual(queryParameter.parameterValue.value, expectedValue);
    });

    it('should locate the value on DATETIME objects', () => {
      const datetime = {
        value: 'value',
      };

      sandbox.stub(BigQuery, 'getType_').returns({
        type: 'DATETIME',
      });

      const queryParameter = BigQuery.valueToQueryParameter_(datetime);
      assert.strictEqual(queryParameter.parameterValue.value, datetime.value);
    });

    it('should locate the value on TIME objects', () => {
      const time = {
        value: 'value',
      };

      sandbox.stub(BigQuery, 'getType_').returns({
        type: 'TIME',
      });

      const queryParameter = BigQuery.valueToQueryParameter_(time);
      assert.strictEqual(queryParameter.parameterValue.value, time.value);
    });

    it('should format an array', () => {
      const array = [1];
      sandbox.stub(BigQuery, 'getType_').returns({type: 'ARRAY'});
      const queryParameter = BigQuery.valueToQueryParameter_(array);
      const arrayValues = queryParameter.parameterValue.arrayValues;
      assert.deepStrictEqual(arrayValues, [
        {
          value: array[0],
        },
      ]);
    });

    it('should format a struct', () => {
      const struct = {
        key: 'value',
      };

      const expectedParameterValue = {};

      sandbox.stub(BigQuery, 'getType_').callsFake(() => {
        sandbox.stub(BigQuery, 'valueToQueryParameter_').callsFake(value => {
          assert.strictEqual(value, struct.key);
          return {
            parameterValue: expectedParameterValue,
          };
        });

        return {
          type: 'STRUCT',
        };
      });

      const queryParameter = BigQuery.valueToQueryParameter_(struct);
      const structValues = queryParameter.parameterValue.structValues;

      assert.strictEqual(structValues.key, expectedParameterValue);
    });

    it('should format all other types', () => {
      const typeName = 'ANY-TYPE';
      sandbox.stub(BigQuery, 'getType_').returns({
        type: typeName,
      });
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

  describe('createDataset', () => {
    const DATASET_ID = 'kittens';

    it('should create a dataset', done => {
      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.method, 'POST');
        assert.strictEqual(reqOpts.uri, '/datasets');
        assert.deepStrictEqual(reqOpts.json.datasetReference, {
          datasetId: DATASET_ID,
        });

        done();
      };

      bq.createDataset(DATASET_ID, assert.ifError);
    });

    it('should send the location if available', done => {
      const bq = new BigQuery({
        projectId: PROJECT_ID,
        location: LOCATION,
      });

      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.json.location, LOCATION);
        done();
      };

      bq.createDataset(DATASET_ID, assert.ifError);
    });

    it('should not modify the original options object', done => {
      const options = {
        a: 'b',
        c: 'd',
      };

      const originalOptions = extend({}, options);

      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.notStrictEqual(reqOpts.json, options);
        assert.deepStrictEqual(options, originalOptions);
        done();
      };

      bq.createDataset(DATASET_ID, options, assert.ifError);
    });

    it('should return an error to the callback', done => {
      const error = new Error('Error.');

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(error);
      };

      bq.createDataset(DATASET_ID, (err: Error) => {
        assert.strictEqual(err, error);
        done();
      });
    });

    it('should return a Dataset object', done => {
      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, {});
      };

      bq.createDataset(DATASET_ID, (err: Error, dataset: Dataset) => {
        assert.ifError(err);
        assert(dataset instanceof FakeDataset);
        done();
      });
    });

    it('should return an apiResponse', done => {
      const resp = {success: true};

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, resp);
      };

      bq.createDataset(
          DATASET_ID, (err: Error, dataset: Dataset, apiResponse: {}) => {
            assert.ifError(err);
            assert.deepStrictEqual(apiResponse, resp);
            done();
          });
    });

    it('should assign metadata to the Dataset object', done => {
      const metadata = {a: 'b', c: 'd'};

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, metadata);
      };

      bq.createDataset(DATASET_ID, (err: Error, dataset: Dataset) => {
        assert.ifError(err);
        assert.deepStrictEqual(dataset.metadata, metadata);
        done();
      });
    });
  });

  describe('createJob', () => {
    const RESPONSE = {
      status: {
        state: 'RUNNING',
      },
      jobReference: {
        location: LOCATION,
      },
    };

    let fakeJobId: string;

    beforeEach(() => {
      fakeJobId = uuid.v4();

      // tslint:disable-next-line no-any
      (fakeUuid as any).v4 = () => {
        return fakeJobId;
      };
    });

    it('should make the correct request', done => {
      const fakeOptions = {
        a: 'b',
      };

      const expectedOptions = extend({}, fakeOptions, {
        jobReference: {
          projectId: bq.projectId,
          jobId: fakeJobId,
          location: undefined,
        },
      });

      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.method, 'POST');
        assert.strictEqual(reqOpts.uri, '/jobs');
        assert.deepStrictEqual(reqOpts.json, expectedOptions);
        assert.notStrictEqual(reqOpts.json, fakeOptions);
        done();
      };

      bq.createJob(fakeOptions, assert.ifError);
    });

    it('should accept a job prefix', done => {
      const jobPrefix = 'abc-';
      const expectedJobId = jobPrefix + fakeJobId;
      const options = {
        jobPrefix,
      };

      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.json.jobReference.jobId, expectedJobId);
        assert.strictEqual(reqOpts.json.jobPrefix, undefined);
        done();
      };

      bq.createJob(options, assert.ifError);
    });

    it('should accept a location', done => {
      const options = {
        location: LOCATION,
      };

      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.json.jobReference.location, LOCATION);
        assert.strictEqual(reqOpts.json.location, undefined);
        done();
      };

      bq.createJob(options, assert.ifError);
    });

    it('should accept a job id', done => {
      const jobId = 'job-id';
      const options = {jobId};

      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.json.jobReference.jobId, jobId);
        assert.strictEqual(reqOpts.json.jobId, undefined);
        done();
      };

      bq.createJob(options, assert.ifError);
    });

    it('should use the user defined location if available', done => {
      const bq = new BigQuery({
        projectId: PROJECT_ID,
        location: LOCATION,
      });

      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.json.jobReference.location, LOCATION);
        done();
      };

      bq.createJob({}, assert.ifError);
    });

    it('should return any request errors', done => {
      const response = {};
      const error = new Error('err.');

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(error, response);
      };

      bq.createJob({}, (err: Error, job: Job, resp: {}) => {
        assert.strictEqual(err, error);
        assert.strictEqual(job, null);
        assert.strictEqual(resp, response);
        done();
      });
    });

    it('should return any status errors', done => {
      const errors = [{reason: 'notFound'}];
      const response = extend(true, {}, RESPONSE, {
        status: {errors},
      });

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, response);
      };

      bq.createJob({}, (err: FakeApiError) => {
        assert(err instanceof FakeApiError);

        const errorOpts = err.calledWith_[0];
        assert.deepStrictEqual(errorOpts.errors, errors);
        assert.strictEqual(errorOpts.response, response);
        done();
      });
    });

    it('should return a job object', done => {
      const fakeJob = {};

      bq.job = (jobId: string, options: JobOptions) => {
        assert.strictEqual(jobId, fakeJobId);
        assert.strictEqual(options.location, LOCATION);
        return fakeJob;
      };

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, RESPONSE);
      };

      bq.createJob({}, (err: Error, job: Job, resp: {}) => {
        assert.ifError(err);
        assert.strictEqual(job, fakeJob);
        assert.strictEqual(job.metadata, RESPONSE);
        assert.strictEqual(resp, RESPONSE);
        done();
      });
    });
  });

  describe('createQueryJob', () => {
    const QUERY_STRING = 'SELECT * FROM [dataset.table]';

    it('should throw if a query is not provided', () => {
      assert.throws(() => {
        bq.createQueryJob();
      }, /SQL query string is required/);

      assert.throws(() => {
        bq.createQueryJob({noQuery: 'here'});
      }, /SQL query string is required/);
    });

    describe('with destination', () => {
      // tslint:disable-next-line no-any
      let dataset: any;
      const TABLE_ID = 'table-id';

      beforeEach(() => {
        dataset = {
          bigQuery: bq,
          id: 'dataset-id',
          createTable: util.noop,
        };
      });

      it('should throw if a destination is not a table', () => {
        assert.throws(() => {
          bq.createQueryJob({
            query: 'query',
            destination: 'not a table',
          });
        }, /Destination must be a Table/);
      });

      it('should assign destination table to request body', done => {
        bq.request = (reqOpts: DecorateRequestOptions) => {
          assert.deepStrictEqual(
              reqOpts.json.configuration.query.destinationTable, {
                datasetId: dataset.id,
                projectId: dataset.bigQuery.projectId,
                tableId: TABLE_ID,
              });

          done();
        };

        bq.createQueryJob({
          query: 'query',
          destination: new FakeTable(dataset, TABLE_ID),
        });
      });

      it('should delete `destination` prop from request body', done => {
        bq.request = (reqOpts: DecorateRequestOptions) => {
          const body = reqOpts.json;
          assert.strictEqual(body.configuration.query.destination, undefined);
          done();
        };

        bq.createQueryJob({
          query: 'query',
          destination: new FakeTable(dataset, TABLE_ID),
        });
      });
    });

    describe('SQL parameters', () => {
      const NAMED_PARAMS = {
        key: 'value',
      };

      const POSITIONAL_PARAMS = ['value'];

      it('should delete the params option', done => {
        bq.createJob = (reqOpts: JobOptions) => {
          assert.strictEqual(reqOpts.params, undefined);
          done();
        };

        bq.createQueryJob(
            {
              query: QUERY_STRING,
              params: NAMED_PARAMS,
            },
            assert.ifError);
      });

      describe('named', () => {
        it('should set the correct parameter mode', done => {
          bq.createJob = (reqOpts: JobOptions) => {
            const query = reqOpts.configuration.query;
            assert.strictEqual(query.parameterMode, 'named');
            done();
          };

          bq.createQueryJob(
              {
                query: QUERY_STRING,
                params: NAMED_PARAMS,
              },
              assert.ifError);
        });

        it('should get set the correct query parameters', done => {
          const queryParameter = {};

          BigQuery.valueToQueryParameter_ = (value: {}) => {
            assert.strictEqual(value, NAMED_PARAMS.key);
            return queryParameter;
          };

          bq.createJob = (reqOpts: JobOptions) => {
            const query = reqOpts.configuration.query;
            assert.strictEqual(query.queryParameters[0], queryParameter);
            assert.strictEqual(query.queryParameters[0].name, 'key');
            done();
          };

          bq.createQueryJob(
              {
                query: QUERY_STRING,
                params: NAMED_PARAMS,
              },
              assert.ifError);
        });
      });

      describe('positional', () => {
        it('should set the correct parameter mode', done => {
          bq.createJob = (reqOpts: JobOptions) => {
            const query = reqOpts.configuration.query;
            assert.strictEqual(query.parameterMode, 'positional');
            done();
          };

          bq.createQueryJob(
              {
                query: QUERY_STRING,
                params: POSITIONAL_PARAMS,
              },
              assert.ifError);
        });

        it('should get set the correct query parameters', done => {
          const queryParameter = {};

          BigQuery.valueToQueryParameter_ = (value: {}) => {
            assert.strictEqual(value, POSITIONAL_PARAMS[0]);
            return queryParameter;
          };

          bq.createJob = (reqOpts: JobOptions) => {
            const query = reqOpts.configuration.query;
            assert.strictEqual(query.queryParameters[0], queryParameter);
            done();
          };

          bq.createQueryJob(
              {
                query: QUERY_STRING,
                params: POSITIONAL_PARAMS,
              },
              assert.ifError);
        });
      });
    });

    it('should accept the dryRun options', done => {
      const options = {
        query: QUERY_STRING,
        dryRun: true,
      };

      bq.createJob = (reqOpts: JobOptions) => {
        assert.strictEqual(reqOpts.configuration.query.dryRun, undefined);
        assert.strictEqual(reqOpts.configuration.dryRun, options.dryRun);
        done();
      };

      bq.createQueryJob(options, assert.ifError);
    });

    it('should accept a job prefix', done => {
      const options = {
        query: QUERY_STRING,
        jobPrefix: 'hi',
      };

      bq.createJob = (reqOpts: JobOptions) => {
        assert.strictEqual(reqOpts.configuration.query.jobPrefix, undefined);
        assert.strictEqual(reqOpts.jobPrefix, options.jobPrefix);
        done();
      };

      bq.createQueryJob(options, assert.ifError);
    });

    it('should accept a location', done => {
      const options = {
        query: QUERY_STRING,
        location: LOCATION,
      };

      bq.createJob = (reqOpts: JobOptions) => {
        assert.strictEqual(reqOpts.configuration.query.location, undefined);
        assert.strictEqual(reqOpts.location, LOCATION);
        done();
      };

      bq.createQueryJob(options, assert.ifError);
    });

    it('should accept a job id', done => {
      const options = {
        query: QUERY_STRING,
        jobId: 'jobId',
      };

      bq.createJob = (reqOpts: JobOptions) => {
        assert.strictEqual(reqOpts.configuration.query.jobId, undefined);
        assert.strictEqual(reqOpts.jobId, options.jobId);
        done();
      };

      bq.createQueryJob(options, assert.ifError);
    });

    it('should pass the callback to createJob', done => {
      bq.createJob = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback();  // the done fn
      };

      bq.createQueryJob(QUERY_STRING, done);
    });
  });

  describe('dataset', () => {
    const DATASET_ID = 'dataset-id';

    it('returns a Dataset instance', () => {
      const ds = bq.dataset(DATASET_ID);
      assert(ds instanceof FakeDataset);
    });

    it('should scope the correct dataset', () => {
      const ds = bq.dataset(DATASET_ID);
      const args = ds.calledWith_;

      assert.strictEqual(args[0], bq);
      assert.strictEqual(args[1], DATASET_ID);
    });

    it('should accept dataset metadata', () => {
      const options = {location: 'US'};
      const ds = bq.dataset(DATASET_ID, options);
      const args = ds.calledWith_;

      assert.strictEqual(args[2], options);
    });

    it('should pass the location if available', () => {
      const bq = new BigQuery({
        projectId: PROJECT_ID,
        location: LOCATION,
      });

      const options = {a: 'b'};
      const expectedOptions = extend({location: LOCATION}, options);

      const ds = bq.dataset(DATASET_ID, options);
      const args = ds.calledWith_;

      assert.deepStrictEqual(args[2], expectedOptions);
      assert.notStrictEqual(args[2], options);
    });
  });

  describe('getDatasets', () => {
    it('should get datasets from the api', done => {
      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.uri, '/datasets');
        assert.deepStrictEqual(reqOpts.qs, {});

        done();
      };

      bq.getDatasets(assert.ifError);
    });

    it('should accept query', done => {
      const queryObject = {all: true, maxResults: 8, pageToken: 'token'};

      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.qs, queryObject);
        done();
      };

      bq.getDatasets(queryObject, assert.ifError);
    });

    it('should default the query to an empty object', done => {
      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.deepStrictEqual(reqOpts.qs, {});
        done();
      };
      bq.getDatasets(assert.ifError);
    });

    it('should return error to callback', done => {
      const error = new Error('Error.');

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(error);
      };

      bq.getDatasets((err: Error) => {
        assert.strictEqual(err, error);
        done();
      });
    });

    it('should return Dataset objects', done => {
      const datasetId = 'datasetName';

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, {
          datasets: [
            {
              datasetReference: {datasetId},
              location: LOCATION,
            },
          ],
        });
      };

      bq.getDatasets((err: Error, datasets: Dataset[]) => {
        assert.ifError(err);

        const dataset = datasets[0];
        const args = dataset.calledWith_;

        assert(dataset instanceof FakeDataset);
        assert.strictEqual(args[0], bq);
        assert.strictEqual(args[1], datasetId);
        assert.deepStrictEqual(args[2], {location: LOCATION});
        done();
      });
    });

    it('should return Dataset objects', done => {
      const resp = {success: true};

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, resp);
      };

      bq.getDatasets(
          (err: Error, datasets: {}, nextQuery: {}, apiResponse: {}) => {
            assert.ifError(err);
            assert.strictEqual(apiResponse, resp);
            done();
          });
    });

    it('should assign metadata to the Dataset objects', done => {
      const datasetObjects = [
        {
          a: 'b',
          c: 'd',
          datasetReference: {
            datasetId: 'datasetName',
          },
        },
      ];

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, {datasets: datasetObjects});
      };

      bq.getDatasets((err: Error, datasets: Dataset[]) => {
        assert.ifError(err);
        assert.strictEqual(datasets[0].metadata, datasetObjects[0]);
        done();
      });
    });

    it('should return token if more results exist', done => {
      const token = 'token';

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, {nextPageToken: token});
      };

      bq.getDatasets((err: Error, datasets: Dataset[], nextQuery: {}) => {
        assert.deepStrictEqual(nextQuery, {
          pageToken: token,
        });
        done();
      });
    });
  });

  describe('getJobs', () => {
    it('should get jobs from the api', done => {
      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.uri, '/jobs');
        assert.deepStrictEqual(reqOpts.qs, {});
        assert.deepStrictEqual(reqOpts.useQuerystring, true);
        done();
      };

      bq.getJobs(assert.ifError);
    });

    it('should accept query', done => {
      const queryObject = {
        allUsers: true,
        maxResults: 8,
        pageToken: 'token',
        projection: 'full',
        stateFilter: 'done',
      };

      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.deepStrictEqual(reqOpts.qs, queryObject);
        done();
      };

      bq.getJobs(queryObject, assert.ifError);
    });

    it('should default the query to an object', done => {
      bq.request = (reqOpts: DecorateRequestOptions) => {
        assert.deepStrictEqual(reqOpts.qs, {});
        done();
      };
      bq.getJobs(assert.ifError);
    });

    it('should return error to callback', done => {
      const error = new Error('Error.');

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(error);
      };

      bq.getJobs((err: Error) => {
        assert.strictEqual(err, error);
        done();
      });
    });

    it('should return Job objects', done => {
      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
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

      bq.getJobs((err: Error, jobs: Job[]) => {
        assert.ifError(err);

        const job = jobs[0];
        const args = job.calledWith_;

        assert(job instanceof FakeJob);
        assert.strictEqual(args[0], bq);
        assert.strictEqual(args[1], JOB_ID);
        assert.deepStrictEqual(args[2], {location: LOCATION});
        done();
      });
    });

    it('should return apiResponse', done => {
      const resp = {
        jobs: [
          {
            id: JOB_ID,
            jobReference: {
              jobId: JOB_ID,
            },
          },
        ],
      };

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, resp);
      };

      bq.getJobs((err: Error, jobs: Job[], nextQuery: {}, apiResponse: {}) => {
        assert.ifError(err);
        assert.strictEqual(resp, apiResponse);
        done();
      });
    });

    it('should assign metadata to the Job objects', done => {
      const jobObjects = [
        {
          a: 'b',
          c: 'd',
          id: JOB_ID,
          jobReference: {
            jobId: JOB_ID,
          },
        },
      ];

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, {jobs: jobObjects});
      };

      bq.getJobs((err: Error, jobs: Job[]) => {
        assert.ifError(err);
        assert.strictEqual(jobs[0].metadata, jobObjects[0]);
        done();
      });
    });

    it('should return token if more results exist', done => {
      const token = 'token';

      bq.request = (reqOpts: DecorateRequestOptions, callback: Function) => {
        callback(null, {nextPageToken: token});
      };

      bq.getJobs((err: Error, jobs: Job[], nextQuery: {}) => {
        assert.ifError(err);
        assert.deepStrictEqual(nextQuery, {
          pageToken: token,
        });
        done();
      });
    });
  });

  describe('job', () => {
    it('should return a Job instance', () => {
      const job = bq.job(JOB_ID);
      assert(job instanceof FakeJob);
    });

    it('should scope the correct job', () => {
      const job = bq.job(JOB_ID);
      const args = job.calledWith_;

      assert.strictEqual(args[0], bq);
      assert.strictEqual(args[1], JOB_ID);
    });

    it('should pass the options object', () => {
      const options = {a: 'b'};
      const job = bq.job(JOB_ID, options);

      assert.strictEqual(job.calledWith_[2], options);
    });

    it('should pass in the user specified location', () => {
      const bq = new BigQuery({
        projectId: PROJECT_ID,
        location: LOCATION,
      });

      const options = {a: 'b'};
      const expectedOptions = extend({location: LOCATION}, options);

      const job = bq.job(JOB_ID, options);
      const args = job.calledWith_;

      assert.deepStrictEqual(args[2], expectedOptions);
      assert.notStrictEqual(args[2], options);
    });
  });

  describe('query', () => {
    const FAKE_ROWS = [{}, {}, {}];
    const FAKE_RESPONSE = {};
    const QUERY_STRING = 'SELECT * FROM [dataset.table]';

    it('should return any errors from createQueryJob', done => {
      const error = new Error('err');

      bq.createQueryJob = (query: {}, callback: Function) => {
        callback(error, null, FAKE_RESPONSE);
      };

      bq.query(QUERY_STRING, (err: Error, rows: {}, resp: {}) => {
        assert.strictEqual(err, error);
        assert.strictEqual(rows, null);
        assert.strictEqual(resp, FAKE_RESPONSE);
        done();
      });
    });

    it('should exit early if dryRun is set', done => {
      const options = {
        query: QUERY_STRING,
        dryRun: true,
      };

      bq.createQueryJob = (query: {}, callback: Function) => {
        assert.strictEqual(query, options);
        callback(null, null, FAKE_RESPONSE);
      };

      bq.query(options, (err: Error, rows: {}, resp: {}) => {
        assert.ifError(err);
        assert.deepStrictEqual(rows, []);
        assert.strictEqual(resp, FAKE_RESPONSE);
        done();
      });
    });

    it('should call job#getQueryResults', done => {
      const fakeJob = {
        getQueryResults: (options: {}, callback: Function) => {
          assert.deepStrictEqual(options, {});
          callback(null, FAKE_ROWS, FAKE_RESPONSE);
        },
      };

      bq.createQueryJob = (query: {}, callback: Function) => {
        callback(null, fakeJob, FAKE_RESPONSE);
      };

      bq.query(QUERY_STRING, (err: Error, rows: {}, resp: {}) => {
        assert.ifError(err);
        assert.strictEqual(rows, FAKE_ROWS);
        assert.strictEqual(resp, FAKE_RESPONSE);
        done();
      });
    });

    it('should optionally accept options', done => {
      const fakeOptions = {};
      const fakeJob = {
        getQueryResults: (options: {}) => {
          assert.strictEqual(options, fakeOptions);
          done();
        },
      };

      bq.createQueryJob = (query: {}, callback: Function) => {
        callback(null, fakeJob, FAKE_RESPONSE);
      };

      bq.query(QUERY_STRING, fakeOptions, assert.ifError);
    });
  });

  describe('queryAsStream_', () => {
    it('should call query correctly', done => {
      const query = 'SELECT';
      bq.query = (query_: {}, options: {}, callback: Function) => {
        assert.strictEqual(query_, query);
        assert.deepStrictEqual(options, {autoPaginate: false});
        callback();  // done()
      };
      bq.queryAsStream_(query, done);
    });
  });
});

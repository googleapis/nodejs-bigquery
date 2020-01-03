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

import {DecorateRequestOptions, util} from '@google-cloud/common';
import * as pfy from '@google-cloud/promisify';
import arrify = require('arrify');
import * as assert from 'assert';
import {describe, it} from 'mocha';
import * as extend from 'extend';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import {BigQuery} from '../src/bigquery';
import {QueryResultsOptions} from '../src/job';

class FakeOperation {
  calledWith_: IArguments;
  interceptors: Array<{}>;
  id: {};
  constructor() {
    this.calledWith_ = arguments;
    this.interceptors = [];
    this.id = this.calledWith_[0].id;
  }
}

let promisified = false;
const fakePfy = extend({}, pfy, {
  promisifyAll: (c: Function) => {
    if (c.name === 'Job') {
      promisified = true;
    }
  },
});

let extended = false;
const fakePaginator = {
  paginator: {
    extend: (c: Function, methods: string[]) => {
      if (c.name !== 'Job') {
        return;
      }

      methods = arrify(methods);
      assert.deepStrictEqual(methods, ['getQueryResults']);
      extended = true;
    },
    streamify: (methodName: string) => {
      return methodName;
    },
  },
};

let sandbox: sinon.SinonSandbox;
beforeEach(() => (sandbox = sinon.createSandbox()));
afterEach(() => sandbox.restore());

describe('BigQuery/Job', () => {
  // tslint:disable-next-line no-any
  const BIGQUERY: any = {
    projectId: 'my-project',
    Promise,
  };
  const JOB_ID = 'job_XYrk_3z';
  const LOCATION = 'asia-northeast1';

  // tslint:disable-next-line no-any variable-name
  let Job: any;
  // tslint:disable-next-line no-any
  let job: any;

  before(() => {
    Job = proxyquire('../src/job.js', {
      '@google-cloud/common': {Operation: FakeOperation},
      '@google-cloud/paginator': fakePaginator,
      '@google-cloud/promisify': fakePfy,
    }).Job;
  });

  beforeEach(() => {
    job = new Job(BIGQUERY, JOB_ID);
  });

  describe('initialization', () => {
    it('should paginate all the things', () => {
      assert(extended);
    });

    it('should promisify all the things', () => {
      assert(promisified);
    });

    it('should assign this.bigQuery', () => {
      assert.deepStrictEqual(job.bigQuery, BIGQUERY);
    });

    it('should inherit from Operation', () => {
      assert(job instanceof FakeOperation);

      const calledWith = job.calledWith_[0];

      assert.strictEqual(calledWith.parent, BIGQUERY);
      assert.strictEqual(calledWith.baseUrl, '/jobs');
      assert.strictEqual(calledWith.id, JOB_ID);
      assert.deepStrictEqual(calledWith.methods, {
        exists: true,
        get: true,
        getMetadata: {
          reqOpts: {
            qs: {location: undefined},
          },
        },
      });
    });

    it('should accept a location option', () => {
      const options = {location: 'US'};
      const job = new Job(BIGQUERY, JOB_ID, options);

      assert.strictEqual(job.location, options.location);
    });

    it('should send the location via getMetadata', () => {
      const job = new Job(BIGQUERY, JOB_ID, {location: LOCATION});
      const calledWith = job.calledWith_[0];

      assert.deepStrictEqual(calledWith.methods.getMetadata, {
        reqOpts: {
          qs: {location: LOCATION},
        },
      });
    });
  });

  describe('cancel', () => {
    it('should make the correct API request', done => {
      job.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.method, 'POST');
        assert.strictEqual(reqOpts.uri, '/cancel');
        done();
      };

      job.cancel(assert.ifError);
    });

    it('should include the job location', done => {
      const job = new Job(BIGQUERY, JOB_ID, {location: LOCATION});

      job.request = (reqOpts: DecorateRequestOptions) => {
        assert.deepStrictEqual(reqOpts.qs, {location: LOCATION});
        done();
      };

      job.cancel(assert.ifError);
    });
  });

  describe('getQueryResults', () => {
    const pageToken = 'token';
    const options = {
      a: 'a',
      b: 'b',
      location: 'US',
    };

    const RESPONSE = {
      pageToken,
      jobReference: {jobId: JOB_ID},
    };

    beforeEach(() => {
      BIGQUERY.request = (
        reqOpts: DecorateRequestOptions,
        callback: Function
      ) => {
        callback(null, RESPONSE);
      };

      BIGQUERY.mergeSchemaWithRows_ = (schema: {}, rows: {}) => {
        return rows;
      };
    });

    it('should make the correct request', done => {
      BIGQUERY.request = (reqOpts: DecorateRequestOptions) => {
        assert.strictEqual(reqOpts.uri, '/queries/' + JOB_ID);
        done();
      };

      job.getQueryResults(assert.ifError);
    });

    it('should optionally accept options', done => {
      const options = {a: 'b'};
      const expectedOptions = extend({location: undefined}, options);

      BIGQUERY.request = (reqOpts: DecorateRequestOptions) => {
        assert.deepStrictEqual(reqOpts.qs, expectedOptions);
        done();
      };

      job.getQueryResults(options, assert.ifError);
    });

    it('should inherit the location', done => {
      const job = new Job(BIGQUERY, JOB_ID, {location: LOCATION});

      BIGQUERY.request = (reqOpts: DecorateRequestOptions) => {
        assert.deepStrictEqual(reqOpts.qs, {location: LOCATION});
        done();
      };

      job.getQueryResults(assert.ifError);
    });

    it('should delete any cached jobs', done => {
      const options = {job: {}, a: 'b'};
      const expectedOptions = {location: undefined, a: 'b'};

      BIGQUERY.request = (reqOpts: DecorateRequestOptions) => {
        assert.deepStrictEqual(reqOpts.qs, expectedOptions);
        done();
      };

      job.getQueryResults(options, assert.ifError);
    });

    it('should return any errors to the callback', done => {
      const error = new Error('err');
      const response = {};

      BIGQUERY.request = (
        reqOpts: DecorateRequestOptions,
        callback: Function
      ) => {
        callback(error, response);
      };

      job.getQueryResults((err: Error, rows: {}, nextQuery: {}, resp: {}) => {
        assert.strictEqual(err, error);
        assert.strictEqual(rows, null);
        assert.strictEqual(nextQuery, null);
        assert.strictEqual(resp, response);
        done();
      });
    });

    it('should return the rows and response to the callback', done => {
      job.getQueryResults((err: {}, rows: {}, nextQuery: {}, resp: {}) => {
        assert.ifError(err);
        assert.deepStrictEqual(rows, []);
        assert.strictEqual(resp, RESPONSE);
        done();
      });
    });

    it('should merge the rows with the schema', done => {
      const response = {
        schema: {},
        rows: [],
      };

      const mergedRows: Array<{}> = [];

      BIGQUERY.request = (
        reqOpts: DecorateRequestOptions,
        callback: Function
      ) => {
        callback(null, response);
      };

      sandbox
        .stub(BigQuery, 'mergeSchemaWithRows_')
        .callsFake((schema, rows) => {
          assert.strictEqual(schema, response.schema);
          assert.strictEqual(rows, response.rows);
          return mergedRows;
        });

      job.getQueryResults((err: Error, rows: {}) => {
        assert.ifError(err);
        assert.strictEqual(rows, mergedRows);
        done();
      });
    });

    it('should return the query when the job is not complete', done => {
      BIGQUERY.request = (
        reqOpts: DecorateRequestOptions,
        callback: Function
      ) => {
        callback(null, {
          jobComplete: false,
        });
      };

      job.getQueryResults(options, (err: Error, rows: {}, nextQuery: {}) => {
        assert.ifError(err);
        assert.deepStrictEqual(nextQuery, options);
        assert.notStrictEqual(nextQuery, options);
        done();
      });
    });

    it('should populate nextQuery when more results exist', done => {
      job.getQueryResults(
        options,
        (err: Error, rows: {}, nextQuery: QueryResultsOptions) => {
          assert.ifError(err);
          assert.strictEqual(nextQuery.pageToken, pageToken);
          done();
        }
      );
    });
  });

  describe('getQueryResultsStream', () => {
    it('should have streamified getQueryResults', () => {
      assert.strictEqual(job.getQueryResultsStream, 'getQueryResultsAsStream_');
    });
  });

  describe('getQueryResultsAsStream_', () => {
    it('should call getQueryResults correctly', done => {
      const options = {a: 'b', c: 'd'};

      job.getQueryResults = (
        options_: QueryResultsOptions,
        callback: Function
      ) => {
        assert.deepStrictEqual(options_, {
          a: 'b',
          c: 'd',
          autoPaginate: false,
        });
        callback(); // done()
      };

      job.getQueryResultsAsStream_(options, done);
    });
  });

  describe('poll_', () => {
    it('should call getMetadata', done => {
      job.getMetadata = () => {
        done();
      };

      job.poll_(assert.ifError);
    });

    describe('API error', () => {
      const error = new Error('Error.');

      beforeEach(() => {
        job.getMetadata = (callback: Function) => {
          callback(error);
        };
      });

      it('should return an error', done => {
        job.poll_((err: Error) => {
          assert.strictEqual(err, error);
          done();
        });
      });
    });

    describe('job failure', () => {
      const error = new Error('Error.');
      const apiResponse = {
        status: {
          errorResult: error,
          errors: [error],
        },
      };

      const sandbox = sinon.createSandbox();

      beforeEach(() => {
        job.getMetadata = (callback: Function) => {
          callback(null, apiResponse);
        };
      });

      it('should detect and return an error from the response', done => {
        sandbox.stub(util, 'ApiError').callsFake(body => {
          assert.strictEqual(body, apiResponse.status);
          return error;
        });

        job.poll_((err: Error) => {
          assert.strictEqual(err, error);
          done();
        });
      });

      afterEach(() => {
        sandbox.restore();
      });
    });

    describe('job pending', () => {
      const apiResponse = {
        status: {
          state: 'PENDING',
        },
      };

      beforeEach(() => {
        job.getMetadata = (callback: Function) => {
          callback(null, apiResponse, apiResponse);
        };
      });

      it('should execute callback', done => {
        job.poll_((err: Error, metadata: {}) => {
          assert.ifError(err);
          assert.strictEqual(metadata, undefined);
          done();
        });
      });
    });

    describe('job complete', () => {
      const apiResponse = {
        status: {
          state: 'DONE',
        },
      };

      beforeEach(() => {
        job.getMetadata = (callback: Function) => {
          callback(null, apiResponse, apiResponse);
        };
      });

      it('should emit complete with metadata', done => {
        job.poll_((err: Error, metadata: {}) => {
          assert.ifError(err);
          assert.strictEqual(metadata, apiResponse);
          done();
        });
      });
    });
  });
});

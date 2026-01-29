// Copyright 2024 Google LLC
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

import * as assert from 'assert';
import {describe, it, before, afterEach} from 'mocha';
import * as sinon from 'sinon';
import {BigQuery} from '../src';

describe.only('High Precision Query Server Results', () => {
  let bigquery: BigQuery;
  let sandbox: sinon.SinonSandbox;

  before(() => {
    bigquery = new BigQuery();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  const testCases = [
    {
      name: 'TOF: omitted, UI64: omitted (default INT64)',
      timestampOutputFormat: undefined,
      useInt64Timestamp: undefined,
      expectedTsValue: '2024-07-15T14:00:00.123Z',
      expectedError: undefined,
    },
    {
      name: 'TOF: omitted, UI64: true',
      timestampOutputFormat: undefined,
      useInt64Timestamp: true,
      expectedTsValue: '2024-07-15T14:00:00.123Z',
      expectedError: undefined,
    },
    {
      name: 'TOF: omitted, UI64: false (default ISO8601_STRING)',
      timestampOutputFormat: undefined,
      useInt64Timestamp: false,
      expectedTsValue: '2024-07-15T10:00:00.123456789Z',
      expectedError: undefined,
    },
    {
      name: 'TOF: TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED, UI64: omitted (default INT64)',
      timestampOutputFormat: 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
      useInt64Timestamp: undefined,
      expectedTsValue: '1721037600123456789',
      expectedError: undefined,
    },
    {
      name: 'TOF: TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED, UI64: true',
      timestampOutputFormat: 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
      useInt64Timestamp: true,
      expectedTsValue: '1721037600123456789',
      expectedError: undefined,
    },
    {
      name: 'TOF: TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED, UI64: false (default ISO8601_STRING)',
      timestampOutputFormat: 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
      useInt64Timestamp: false,
      expectedTsValue: '2024-07-15T10:00:00.123456789Z',
      expectedError: undefined,
    },
    {
      name: 'TOF: FLOAT64, UI64: omitted (error)',
      timestampOutputFormat: 'FLOAT64',
      useInt64Timestamp: undefined,
      expectedTsValue: undefined,
      expectedError: 400,
    },
    {
      name: 'TOF: FLOAT64, UI64: true (error)',
      timestampOutputFormat: 'FLOAT64',
      useInt64Timestamp: true,
      expectedTsValue: undefined,
      expectedError: 400,
    },
    {
      name: 'TOF: FLOAT64, UI64: false',
      timestampOutputFormat: 'FLOAT64',
      useInt64Timestamp: false,
      expectedTsValue: 1721037600.123456789,
      expectedError: undefined,
    },
    {
      name: 'TOF: INT64, UI64: omitted',
      timestampOutputFormat: 'INT64',
      useInt64Timestamp: undefined,
      expectedTsValue: '1721037600123456789',
      expectedError: undefined,
    },
    {
      name: 'TOF: INT64, UI64: true',
      timestampOutputFormat: 'INT64',
      useInt64Timestamp: true,
      expectedTsValue: '1721037600123456789',
      expectedError: undefined,
    },
    {
      name: 'TOF: INT64, UI64: false (error)',
      timestampOutputFormat: 'INT64',
      useInt64Timestamp: false,
      expectedTsValue: undefined,
      expectedError: 400,
    },
    {
      name: 'TOF: ISO8601_STRING, UI64: omitted (error)',
      timestampOutputFormat: 'ISO8601_STRING',
      useInt64Timestamp: undefined,
      expectedTsValue: undefined,
      expectedError: 400,
    },
    {
      name: 'TOF: ISO8601_STRING, UI64: true (error)',
      timestampOutputFormat: 'ISO8601_STRING',
      useInt64Timestamp: true,
      expectedTsValue: undefined,
      expectedError: 400,
    },
    {
      name: 'TOF: ISO8601_STRING, UI64: false',
      timestampOutputFormat: 'ISO8601_STRING',
      useInt64Timestamp: false,
      expectedTsValue: '2024-07-15T10:00:00.123456789Z',
      expectedError: undefined,
    },
  ];

  testCases.forEach(testCase => {
    it(`should handle ${testCase.name}`, done => {
      const query = {
        query: 'SELECT ? as ts',
        params: [bigquery.timestamp('2024-07-15 10:00:00.123456789123')],
      };

      const options: any = {};
      if (testCase.timestampOutputFormat !== undefined) {
        options.formatOptions = {
          ...options.formatOptions,
          timestampOutputFormat: testCase.timestampOutputFormat,
        };
      }
      if (testCase.useInt64Timestamp !== undefined) {
        options.formatOptions = {
          ...options.formatOptions,
          useInt64Timestamp: testCase.useInt64Timestamp,
        };
      }

      const mockRes = {
        rows: [{f: [{v: testCase.expectedTsValue}]}],
        schema: {
          fields: [{name: 'ts', type: 'TIMESTAMP'}],
        },
      };

      // bigquery.runJobsQuery
      // @ts-ignore
      sandbox.stub(bigquery, 'runJobsQuery').callsFake((req, opts, callback) => {
        if (testCase.expectedError) {
          const err: any = new Error('mock error');
          err.code = testCase.expectedError;
          callback(err, undefined);
        } else {
          callback(null, mockRes);
        }
        return {
            abort: () => {},
        } as any;
      });

      bigquery.query(query, options, (err, rows) => {
        if (testCase.expectedError) {
          assert.ok(err);
          assert.strictEqual(err!.message, testCase.expectedError);
        } else {
          assert.ifError(err);
          assert.ok(rows);
          assert.ok(rows!.length > 0);
          assert.ok(rows![0].ts.value !== undefined);
          assert.strictEqual(rows![0].ts.value, testCase.expectedTsValue);
        }
        done();
      });
    });
  });
});

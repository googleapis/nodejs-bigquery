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
import {describe, it, before} from 'mocha';
import {BigQuery} from '../src';

describe.only('High Precision Query System Tests', () => {
  let bigquery: BigQuery;
  const expectedTsValueMicroseconds = '2023-01-01T12:00:00.123456000Z';
  const expectedTsValueNanoseconds = '2023-01-01T12:00:00.123456789123Z';
  const expectedErrorMessage = 'Cannot specify both timestamp_as_int and timestamp_output_format.';

  before(function () {
    bigquery = new BigQuery();
  });

  const testCases = [
    {
      name: 'TOF: TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED, UI64: true',
      timestampOutputFormat: 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
      useInt64Timestamp: true,
      expectedTsValue: expectedTsValueMicroseconds,
    },
    {
      name: 'TOF: TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED, UI64: false (default ISO8601_STRING)',
      timestampOutputFormat: 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
      useInt64Timestamp: false,
      expectedTsValue: expectedTsValueMicroseconds,
    },
    {
      name: 'TOF: FLOAT64, UI64: true (error)',
      timestampOutputFormat: 'FLOAT64',
      useInt64Timestamp: true,
      expectedTsValue: undefined,
      expectedError: expectedErrorMessage,
    },
    {
      name: 'TOF: FLOAT64, UI64: false',
      timestampOutputFormat: 'FLOAT64',
      useInt64Timestamp: false,
      expectedTsValue: expectedTsValueMicroseconds,
    },
    {
      name: 'TOF: INT64, UI64: true',
      timestampOutputFormat: 'INT64',
      useInt64Timestamp: true,
      expectedTsValue: expectedTsValueMicroseconds,
    },
    {
      name: 'TOF: INT64, UI64: false (error)',
      timestampOutputFormat: 'INT64',
      useInt64Timestamp: false,
      expectedTsValue: expectedTsValueMicroseconds,
    },
    {
      name: 'TOF: ISO8601_STRING, UI64: true (error)',
      timestampOutputFormat: 'ISO8601_STRING',
      useInt64Timestamp: true,
      expectedTsValue: undefined,
      expectedError: expectedErrorMessage,
    },
    {
      name: 'TOF: ISO8601_STRING, UI64: false',
      timestampOutputFormat: 'ISO8601_STRING',
      useInt64Timestamp: false,
      expectedTsValue: expectedTsValueNanoseconds,
    },
    {
      name: 'TOF: omitted, UI64: omitted (default INT64)',
      timestampOutputFormat: undefined,
      useInt64Timestamp: undefined,
      expectedTsValue: expectedTsValueNanoseconds,
    },
    {
      name: 'TOF: omitted, UI64: true',
      timestampOutputFormat: undefined,
      useInt64Timestamp: true,
      expectedTsValue: expectedTsValueMicroseconds,
    },
    {
      name: 'TOF: omitted, UI64: false (default ISO8601_STRING)',
      timestampOutputFormat: undefined,
      useInt64Timestamp: false,
      expectedTsValue: expectedTsValueMicroseconds,
    },
    {
      name: 'TOF: TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED, UI64: omitted (default INT64)',
      timestampOutputFormat: 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
      useInt64Timestamp: undefined,
      expectedTsValue: expectedTsValueMicroseconds,
    },
    {
      name: 'TOF: FLOAT64, UI64: omitted (error)',
      timestampOutputFormat: 'FLOAT64',
      useInt64Timestamp: undefined,
      expectedTsValue: expectedTsValueMicroseconds,
    },
    {
      name: 'TOF: INT64, UI64: omitted',
      timestampOutputFormat: 'INT64',
      useInt64Timestamp: undefined,
      expectedTsValue: expectedTsValueMicroseconds,
    },
    {
      name: 'TOF: ISO8601_STRING, UI64: omitted (error)',
      timestampOutputFormat: 'ISO8601_STRING',
      useInt64Timestamp: undefined,
      expectedTsValue: expectedTsValueNanoseconds,
    },
  ];

  testCases.forEach(testCase => {
    it(`should handle ${testCase.name}`, async function () {
      const query = {
        query: 'SELECT ? as ts',
        params: [bigquery.timestamp('2023-01-01T12:00:00.123456789123Z')],
      };

      const options: any = {};
      if (testCase.timestampOutputFormat !== undefined) {
        options['formatOptions.timestampOutputFormat'] =
          testCase.timestampOutputFormat;
      }
      if (testCase.useInt64Timestamp !== undefined) {
        options['formatOptions.useInt64Timestamp'] =
          testCase.useInt64Timestamp;
      }

      try {
        const [rows] = await bigquery.query(query, options);
        if (testCase.expectedError) {
          assert.fail(
            `Query should have failed for ${testCase.name}, but succeeded`
          );
        }
        assert.ok(rows.length > 0);
        assert.ok(rows[0].ts.value !== undefined);
        assert.strictEqual(rows[0].ts.value, testCase.expectedTsValue);
      } catch (err: any) {
        const isAuthError =
          err.message.includes('unauthenticated') ||
          err.message.includes('permission denied') ||
          err.message.includes('Could not load the default credentials') ||
          err.message.includes('Unable to detect a Project Id');

        if (isAuthError) {
          this.skip();
        }

        if (!testCase.expectedError) {
          throw err;
        }

        const message = err.message;
        assert.strictEqual(
          message,
          testCase.expectedError,
          `Expected ${testCase.expectedError} error for ${testCase.name}, got ${message} (${err.message})`
        );
      }
    });
  });
});

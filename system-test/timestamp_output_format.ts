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
import {describe, it, before, after} from 'mocha';
import {BigQuery} from '../src';
import {randomUUID} from 'crypto';

const bigquery = new BigQuery();

describe.only('Timestamp Output Format System Tests', () => {
  const datasetId = `timestamp_test_${randomUUID().replace(/-/g, '_')}`;
  const tableId = `timestamp_table_${randomUUID().replace(/-/g, '_')}`;
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(tableId);
  const expectedValue = '2023-01-01T12:00:00.123456000Z';
  const highPrecisionExpectedValue = '2023-01-01T12:00:00.123456789123Z';

  before(async () => {
    await dataset.create();
    await table.create({
      schema: [{name: 'ts', type: 'TIMESTAMP', timestampPrecision: '12'}],
    });
    // Insert a row to test retrieval
    await table.insert([{ts: highPrecisionExpectedValue}]);
  });

  after(async () => {
    try {
        await dataset.delete({force: true});
    } catch (e) {
        console.error('Error deleting dataset:', e);
    }
  });

  interface TestCase {
    description: string;
    options: {
      'formatOptions.timestampOutputFormat'?: 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED' | 'FLOAT64' | 'INT64' | 'ISO8601_STRING';
      'formatOptions.useInt64Timestamp'?: boolean;
    };
    expectedValue?: string;
    shouldFail?: boolean;
    expectedErrorMessage?: string;
  }

  const testCases: TestCase[] = [
    {
      description: 'should call getRows with TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED and useInt64Timestamp=true',
      options: {
        'formatOptions.timestampOutputFormat': 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
        'formatOptions.useInt64Timestamp': true,
      },
      expectedValue: expectedValue,
    },
    {
      description: 'should call getRows with TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED and useInt64Timestamp=false',
      options: {
        'formatOptions.timestampOutputFormat': 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
        'formatOptions.useInt64Timestamp': false,
      },
      expectedValue: expectedValue,
    },
    {
      description: 'should call getRows with FLOAT64 and useInt64Timestamp=true',
      options: {
        'formatOptions.timestampOutputFormat': 'FLOAT64',
        'formatOptions.useInt64Timestamp': true,
      },
      shouldFail: true,
      expectedErrorMessage: 'Cannot specify both use_int64_timestamp and timestamp_output_format.',
    },
    {
      description: 'should call getRows with FLOAT64 and useInt64Timestamp=false',
      options: {
        'formatOptions.timestampOutputFormat': 'FLOAT64',
        'formatOptions.useInt64Timestamp': false,
      },
      expectedValue: expectedValue,
    },
    {
      description: 'should call getRows with INT64 and useInt64Timestamp=true',
      options: {
        'formatOptions.timestampOutputFormat': 'INT64',
        'formatOptions.useInt64Timestamp': true,
      },
      expectedValue: expectedValue,
    },
    {
      description: 'should call getRows with INT64 and useInt64Timestamp=false',
      options: {
        'formatOptions.timestampOutputFormat': 'INT64',
        'formatOptions.useInt64Timestamp': false,
      },
      expectedValue: expectedValue,
    },
    {
      description: 'should call getRows with ISO8601_STRING and useInt64Timestamp=true',
      options: {
        'formatOptions.timestampOutputFormat': 'ISO8601_STRING',
        'formatOptions.useInt64Timestamp': true,
      },
      shouldFail: true,
      expectedErrorMessage: 'Cannot specify both use_int64_timestamp and timestamp_output_format.',
    },
    {
      description: 'should call getRows with ISO8601_STRING and useInt64Timestamp=false',
      options: {
        'formatOptions.timestampOutputFormat': 'ISO8601_STRING',
        'formatOptions.useInt64Timestamp': false,
      },
      expectedValue: '2023-01-01T12:00:00.123456789123',
    },
    {
      description: 'should call getRows with timestampOutputFormat undefined and useInt64Timestamp=true',
      options: {
        'formatOptions.useInt64Timestamp': true,
      },
      expectedValue: expectedValue,
    },
    {
      description: 'should call getRows with timestampOutputFormat undefined and useInt64Timestamp=false',
      options: {
        'formatOptions.useInt64Timestamp': false,
      },
      expectedValue: expectedValue,
    },
    {
      description: 'should call getRows with TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED and useInt64Timestamp undefined',
      options: {
        'formatOptions.timestampOutputFormat': 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
      },
      expectedValue: expectedValue,
    },
    {
      description: 'should call getRows with FLOAT64 and useInt64Timestamp undefined',
      options: {
        'formatOptions.timestampOutputFormat': 'FLOAT64',
      },
      shouldFail: true,
      expectedErrorMessage: 'Cannot specify both use_int64_timestamp and timestamp_output_format.',
    },
    {
      description: 'should call getRows with INT64 and useInt64Timestamp undefined',
      options: {
        'formatOptions.timestampOutputFormat': 'INT64',
      },
      expectedValue: expectedValue,
    },
    {
      description: 'should call getRows with ISO8601_STRING and useInt64Timestamp undefined',
      options: {
        'formatOptions.timestampOutputFormat': 'ISO8601_STRING',
      },
      shouldFail: true,
      expectedErrorMessage: 'Cannot specify both use_int64_timestamp and timestamp_output_format.',
    },
    {
      description: 'should call getRows with timestampOutputFormat undefined and useInt64Timestamp undefined',
      options: {},
      expectedValue: expectedValue,
    },
  ];

  testCases.forEach(testCase => {
    it(testCase.description, async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [rows] = await table.getRows(testCase.options as any);
        if (testCase.shouldFail) {
          assert.fail('The call should not have succeeded');
        }
        assert(rows.length > 0);
        assert.strictEqual(rows[0].ts.value, testCase.expectedValue);
      } catch (e) {
        if (testCase.shouldFail) {
          assert.strictEqual((e as Error).message, testCase.expectedErrorMessage);
        } else {
          throw e;
        }
      }
    });
  });
});

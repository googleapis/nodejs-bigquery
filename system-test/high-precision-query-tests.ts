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

describe('High Precision Query System Tests', () => {
  let bigquery: BigQuery;

  before(function () {
    bigquery = new BigQuery();
  });

  const timestampOutputFormats = [
    undefined,
    'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
    'FLOAT64',
    'INT64',
    'ISO8601_STRING',
  ];

  const useInt64Timestamps = [undefined, true, false];

  timestampOutputFormats.forEach(TOF => {
    useInt64Timestamps.forEach(UI64 => {
      const testName = `TOF: ${TOF ?? 'omitted'}, UI64: ${UI64 ?? 'omitted'}`;

      // Logic to determine expected success based on BigQuery API validation:
      // - FLOAT64 and ISO8601_STRING require useInt64Timestamp to be false.
      // - INT64 requires useInt64Timestamp to be true (or omitted).
      // - Default useInt64Timestamp is true.
      let expectedSuccess = true;
      const actualUI64 = UI64 ?? true;

      if (TOF === 'FLOAT64' || TOF === 'ISO8601_STRING') {
        if (actualUI64 === true) {
          expectedSuccess = false;
        }
      } else if (TOF === 'INT64') {
        if (actualUI64 === false) {
          expectedSuccess = false;
        }
      }

      it(`should handle ${testName}`, async function () {
        // Use a parameter to avoid potential library bugs with simple query strings
        // and to ensure we are testing the high-precision path.
        const query = {
          query: 'SELECT ? as ts',
          params: [bigquery.timestamp('2024-07-15 10:00:00.123456789123')],
        };

        // The library currently expects flattened keys for formatOptions in bigquery.query
        // to match the underlying API's query parameter names.
        const options: any = {};
        if (TOF !== undefined) {
          options['formatOptions.timestampOutputFormat'] = TOF;
        }
        if (UI64 !== undefined) {
          options['formatOptions.useInt64Timestamp'] = UI64;
        }

        try {
          const [rows] = await bigquery.query(query, options);
          if (!expectedSuccess) {
            assert.fail(
              `Query should have failed for ${testName}, but succeeded`
            );
          }
          assert.ok(rows.length > 0);
          assert.ok(rows[0].ts);
        } catch (err: any) {
          // Check for authentication or environment errors
          const isAuthError =
            err.message.includes('unauthenticated') ||
            err.message.includes('permission denied') ||
            err.message.includes('Could not load the default credentials') ||
            err.message.includes('Unable to detect a Project Id');

          if (isAuthError) {
            this.skip();
          }

          if (expectedSuccess) {
            throw err;
          }

          // If expected to fail, it should be a validation error (e.g., 400 Bad Request)
          const statusCode =
            err.code || (err.response && err.response.statusCode);
          assert.strictEqual(
            statusCode,
            400,
            `Expected 400 error for ${testName}, got ${statusCode} (${err.message})`
          );
        }
      });
    });
  });
});

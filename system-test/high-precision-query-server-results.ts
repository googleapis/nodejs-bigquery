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
import {BigQuery, Query, QueryOptions} from '../src';
import bigquery from '../src/types';
import {randomUUID} from 'crypto';
import {Service} from '@google-cloud/common';

function testBuildQueryRequest_(
    query: string | Query,
    options: QueryOptions,
): bigquery.IQueryRequest | undefined {
  if (process.env.FAST_QUERY_PATH === 'DISABLED') {
    return undefined;
  }
  const queryObj: Query =
      typeof query === 'string'
          ? {
            query: query,
          }
          : query;
  // This is a denylist of settings which prevent us from composing an equivalent
  // bq.QueryRequest due to differences between configuration parameters accepted
  // by jobs.insert vs jobs.query.
  if (
      !!queryObj.destination ||
      !!queryObj.tableDefinitions ||
      !!queryObj.createDisposition ||
      !!queryObj.writeDisposition ||
      (!!queryObj.priority && queryObj.priority !== 'INTERACTIVE') ||
      queryObj.useLegacySql ||
      !!queryObj.maximumBillingTier ||
      !!queryObj.timePartitioning ||
      !!queryObj.rangePartitioning ||
      !!queryObj.clustering ||
      !!queryObj.destinationEncryptionConfiguration ||
      !!queryObj.schemaUpdateOptions ||
      !!queryObj.jobTimeoutMs ||
      // User has defined the jobID generation behavior
      !!queryObj.jobId
  ) {
    return undefined;
  }

  if (queryObj.dryRun) {
    return undefined;
  }

  if (options.job) {
    return undefined;
  }
  const req: bigquery.IQueryRequest = {
    useQueryCache: queryObj.useQueryCache,
    labels: queryObj.labels,
    defaultDataset: queryObj.defaultDataset,
    createSession: queryObj.createSession,
    maximumBytesBilled: queryObj.maximumBytesBilled,
    timeoutMs: options.timeoutMs,
    location: queryObj.location || options.location,
    formatOptions: {
      timestampOutputFormat: options['formatOptions.timestampOutputFormat'],
      useInt64Timestamp: options['formatOptions.useInt64Timestamp'] ?? true,
    },
    maxResults: queryObj.maxResults || options.maxResults,
    query: queryObj.query,
    useLegacySql: false,
    requestId: randomUUID(),
    jobCreationMode: undefined,
    reservation: queryObj.reservation,
    continuous: queryObj.continuous,
    destinationEncryptionConfiguration:
    queryObj.destinationEncryptionConfiguration,
    writeIncrementalResults: queryObj.writeIncrementalResults,
    connectionProperties: queryObj.connectionProperties,
    preserveNulls: queryObj.preserveNulls,
  };
  if (queryObj.jobCreationMode) {
    // override default job creation mode
    req.jobCreationMode = queryObj.jobCreationMode;
  }
  const parameterMode = 'positional';
  const params = [
    {
      parameterType: {type: 'TIMESTAMP', timestampPrecision: '12'},
      parameterValue: {value: '2024-07-15T14:00:00.123456789123Z'}
    }
  ]
  if (params) {
    req.queryParameters = params;
  }
  if (parameterMode) {
    req.parameterMode = parameterMode;
  }
  return req;
}

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
      /*
    {
      name: 'TOF: omitted, UI64: omitted (default INT64)',
      timestampOutputFormat: undefined,
      useInt64Timestamp: undefined,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: omitted, UI64: true',
      timestampOutputFormat: undefined,
      useInt64Timestamp: true,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: omitted, UI64: false (default ISO8601_STRING)',
      timestampOutputFormat: undefined,
      useInt64Timestamp: false,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED, UI64: omitted (default INT64)',
      timestampOutputFormat: 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
      useInt64Timestamp: undefined,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED, UI64: true',
      timestampOutputFormat: 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
      useInt64Timestamp: true,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED, UI64: false (default ISO8601_STRING)',
      timestampOutputFormat: 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
      useInt64Timestamp: false,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: FLOAT64, UI64: omitted (error)',
      timestampOutputFormat: 'FLOAT64',
      useInt64Timestamp: undefined,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: FLOAT64, UI64: true (error)',
      timestampOutputFormat: 'FLOAT64',
      useInt64Timestamp: true,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: FLOAT64, UI64: false',
      timestampOutputFormat: 'FLOAT64',
      useInt64Timestamp: false,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: INT64, UI64: omitted',
      timestampOutputFormat: 'INT64',
      useInt64Timestamp: undefined,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: INT64, UI64: true',
      timestampOutputFormat: 'INT64',
      useInt64Timestamp: true,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: INT64, UI64: false (error)',
      timestampOutputFormat: 'INT64',
      useInt64Timestamp: false,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: ISO8601_STRING, UI64: omitted (error)',
      timestampOutputFormat: 'ISO8601_STRING',
      useInt64Timestamp: undefined,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
    {
      name: 'TOF: ISO8601_STRING, UI64: true (error)',
      timestampOutputFormat: 'ISO8601_STRING',
      useInt64Timestamp: true,
      expectedTsValue: '1721052000123456',
      expectedError: undefined,
    },
      */
    {
      name: 'TOF: ISO8601_STRING, UI64: false',
      timestampOutputFormat: 'ISO8601_STRING',
      useInt64Timestamp: false,
      expectedTsValue: '2024-07-15T14:00:00.123456789123Z',
      expectedError: undefined,
    },
  ];

  testCases.forEach(
    ({
      expectedError,
      expectedTsValue,
      name,
      timestampOutputFormat,
      useInt64Timestamp,
    }) => {
      it(`should handle ${name}`, done => {
        const query = {
          query: 'SELECT ? as ts',
          params: [bigquery.timestamp('2024-07-15 10:00:00.123456789123')],
        };

        const options: any = {
          wrapIntegers: undefined,
          parseJSON: undefined,
        };
        if (timestampOutputFormat !== undefined) {
          options['formatOptions.timestampOutputFormat'] = timestampOutputFormat;
        }
        if (useInt64Timestamp !== undefined) {
          options['formatOptions.useInt64Timestamp'] = useInt64Timestamp;
        }

        const queryReq = testBuildQueryRequest_(query, options);
        bigquery.request(
          {
            method: 'POST',
            uri: '/queries',
            json: queryReq,
          },
          async (err, res: bigquery.IQueryResponse) => {
            try {
              if (!err) {
                const rowValue = res.rows?.at(0)?.f?.at(0)?.v;
                assert.strictEqual(rowValue, expectedTsValue);
              }
              assert.strictEqual(err?.message, expectedError);
              done();
            } catch (e) {
              done(e);
            }
          },
        );
      });
    },
  );
});

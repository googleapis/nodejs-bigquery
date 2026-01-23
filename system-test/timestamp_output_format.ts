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

describe('Timestamp Output Format System Tests', () => {
  const datasetId = `timestamp_test_${randomUUID().replace(/-/g, '_')}`;
  const tableId = `timestamp_table_${randomUUID().replace(/-/g, '_')}`;
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(tableId);

  before(async () => {
    await dataset.create();
    await table.create({
      schema: [{name: 'ts', type: 'TIMESTAMP'}],
    });
    // Insert a row to test retrieval
    await table.insert([{ts: '2023-01-01T12:00:00.123456Z'}]);
  });

  after(async () => {
    try {
        await dataset.delete({force: true});
    } catch (e) {
        console.error('Error deleting dataset:', e);
    }
  });

  it('should call getRows with TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED and useInt64Timestamp=true', async () => {
    const [rows] = await table.getRows({
        'formatOptions.timestampOutputFormat': 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
        'formatOptions.useInt64Timestamp': true
    });
    assert(rows.length > 0);
  });

  it('should call getRows with TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED and useInt64Timestamp=false', async () => {
    const [rows] = await table.getRows({
        'formatOptions.timestampOutputFormat': 'TIMESTAMP_OUTPUT_FORMAT_UNSPECIFIED',
        'formatOptions.useInt64Timestamp': false
    });
    assert(rows.length > 0);
  });

  it('should call getRows with FLOAT64 and useInt64Timestamp=true', async () => {
    const [rows] = await table.getRows({
        'formatOptions.timestampOutputFormat': 'FLOAT64',
        'formatOptions.useInt64Timestamp': true
    });
    assert(rows.length > 0);
  });

  it('should call getRows with FLOAT64 and useInt64Timestamp=false', async () => {
    const [rows] = await table.getRows({
        'formatOptions.timestampOutputFormat': 'FLOAT64',
        'formatOptions.useInt64Timestamp': false
    });
    assert(rows.length > 0);
  });

  it('should call getRows with INT64 and useInt64Timestamp=true', async () => {
    const [rows] = await table.getRows({
        'formatOptions.timestampOutputFormat': 'INT64',
        'formatOptions.useInt64Timestamp': true
    });
    assert(rows.length > 0);
  });

  it('should call getRows with INT64 and useInt64Timestamp=false', async () => {
    const [rows] = await table.getRows({
        'formatOptions.timestampOutputFormat': 'INT64',
        'formatOptions.useInt64Timestamp': false
    });
    assert(rows.length > 0);
  });

  it('should call getRows with ISO8601_STRING and useInt64Timestamp=true', async () => {
    const [rows] = await table.getRows({
        'formatOptions.timestampOutputFormat': 'ISO8601_STRING',
        'formatOptions.useInt64Timestamp': true
    });
    assert(rows.length > 0);
  });

  it('should call getRows with ISO8601_STRING and useInt64Timestamp=false', async () => {
    const [rows] = await table.getRows({
        'formatOptions.timestampOutputFormat': 'ISO8601_STRING',
        'formatOptions.useInt64Timestamp': false
    });
    assert(rows.length > 0);
  });
});

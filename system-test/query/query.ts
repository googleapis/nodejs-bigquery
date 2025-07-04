// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as assert from 'assert';
import * as sinon from 'sinon';
import {describe, it} from 'mocha';
import {query, protos} from '../../src';

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

describe('Run Query', () => {
  const client = new query.QueryClient();
  let getQueryResultsSpy: sinon.SinonSpy;

  beforeEach(() => {
    const {jobClient} = client.getBigQueryClient();
    getQueryResultsSpy = sinon.spy(jobClient, 'getQueryResults');
  });

  afterEach(() => {
    getQueryResultsSpy.restore();
  });

  it('should run a stateless query', async () => {
    const req = client.queryFromSQL(
      'SELECT CURRENT_TIMESTAMP() as foo, SESSION_USER() as bar',
    );
    req.queryRequest!.jobCreationMode =
      protos.google.cloud.bigquery.v2.QueryRequest.JobCreationMode.JOB_CREATION_OPTIONAL;

    const q = await client.startQuery(req);
    await q.wait();

    const it = q.read();
    const rows = [];
    for await (const row of it) {
      rows.push(row.toJSON());
    }
    assert.strictEqual(rows.length, 1);
  });

  it('should stop waiting for query to complete', async () => {
    const req = client.queryFromSQL(
      'SELECT num FROM UNNEST(GENERATE_ARRAY(1,1000000)) as num',
    );
    req.queryRequest!.useQueryCache = {value: false};
    req.queryRequest!.jobCreationMode =
      protos.google.cloud.bigquery.v2.QueryRequest.JobCreationMode.JOB_CREATION_REQUIRED;
    req.queryRequest!.timeoutMs = {value: 500};

    const abortCtrl = new AbortController();
    const q = await client.startQuery(req);
    q.wait({
      signal: abortCtrl.signal,
    }).catch(err => {
      assert(err, 'aborted');
    });
    await sleep(1000);
    abortCtrl.abort();

    assert(getQueryResultsSpy.callCount >= 1);
    assert(getQueryResultsSpy.callCount <= 2);
  }).timeout(5000);

  it('should read a query job without cache', async () => {
    const req = client.queryFromSQL(
      'SELECT CURRENT_TIMESTAMP() as foo, SESSION_USER() as bar',
    );
    req.queryRequest!.jobCreationMode =
      protos.google.cloud.bigquery.v2.QueryRequest.JobCreationMode.JOB_CREATION_REQUIRED;

    const q = await client.startQuery(req);
    await q.wait();

    const reader = client.newQueryReader();
    const jobRef = q.jobReference();

    const it = await reader.read(jobRef, q.schema);
    const rows = [];
    for await (const row of it) {
      rows.push(row.toJSON());
    }
    assert.strictEqual(rows.length, 1);
  });

  it('should insert a query job', async () => {
    const q = await client.startQueryJob({
      configuration: {
        query: {
          query: 'SELECT CURRENT_DATETIME() as foo, SESSION_USER() as bar',
          useLegacySql: {value: false},
        },
      },
    });
    await q.wait();

    const it = q.read();
    const rows = [];
    for await (const row of it) {
      rows.push(row);
    }
    assert.strictEqual(rows.length, 1);
  });
});

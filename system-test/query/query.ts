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
import {it} from 'mocha';
import {QueryClient} from '../../src/query';
import {protos} from '../../src';

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

// the GCLOUD_PROJECT environment variable is set as part of test harness setup
const projectId = process.env.GCLOUD_PROJECT;
const transports = ['grpc', 'rest'];

// run tests with the gRPC client and the REST fallback client
transports.forEach(transport => {
  let client;
  if (transport === 'grpc') {
    client = new QueryClient({});
  } else {
    client = new QueryClient({fallback: true});
  }

  describe('Run Query', () => {
    describe(transport, () => {
      let getQueryResultsSpy: sinon.SinonSpy;

      beforeEach(async () => {
        await client.initialize();
        const {jobClient} = client.getBigQueryClient();

        getQueryResultsSpy = sinon.spy(jobClient, 'getQueryResults');
      });

      afterEach(() => {
        getQueryResultsSpy.restore();
      });

      it('should run a stateless query', async () => {
        const req: protos.google.cloud.bigquery.v2.IPostQueryRequest = {
          queryRequest: {
            query: 'SELECT CURRENT_TIMESTAMP() as foo, SESSION_USER() as bar',
            useLegacySql: {value: false},
            formatOptions: {
              useInt64Timestamp: true,
            },
            jobCreationMode:
              protos.google.cloud.bigquery.v2.QueryRequest.JobCreationMode
                .JOB_CREATION_OPTIONAL,
          },
          projectId,
        };

        const q = await client.startQuery(req);
        await q.wait();

        assert(q.complete);

        // TODO: read rows and assert row count
      });

      it('should stop waiting for query to complete', async () => {
        const req: protos.google.cloud.bigquery.v2.IPostQueryRequest = {
          queryRequest: {
            query: 'SELECT num FROM UNNEST(GENERATE_ARRAY(1,1000000)) as num',
            useLegacySql: {value: false},
            formatOptions: {
              useInt64Timestamp: true,
            },
            useQueryCache: {value: false},
            jobCreationMode:
              protos.google.cloud.bigquery.v2.QueryRequest.JobCreationMode
                .JOB_CREATION_REQUIRED,
            timeoutMs: {value: 500},
          },
          projectId,
        };

        const q = await client.startQuery(req);
        const abortCtrl = new AbortController();
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

      it('should allow attach with job reference to a query handler', async () => {
        const req: protos.google.cloud.bigquery.v2.IPostQueryRequest = {
          queryRequest: {
            query: 'SELECT CURRENT_TIMESTAMP() as foo, SESSION_USER() as bar',
            useLegacySql: {value: false},
            formatOptions: {
              useInt64Timestamp: true,
            },
            jobCreationMode:
              protos.google.cloud.bigquery.v2.QueryRequest.JobCreationMode
                .JOB_CREATION_REQUIRED,
          },
          projectId,
        };

        let q = await client.startQuery(req);
        await q.wait();

        const jobRef = q.jobReference;
        q = await client.attachJob(jobRef);
        await q.wait();

        assert(q.complete);

        // TODO: read rows and assert row count
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

        assert(q.complete);

        // TODO: read rows and assert row count
      });
    });
  });
});

// Copyright 2025 Google LLC
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

'use strict';

const {BigQueryClient} = require('@google-cloud/bigquery');
const {assert} = require('chai');
const {describe, it, after, before, beforeEach} = require('mocha');
const cp = require('child_process');
const {randomUUID} = require('crypto');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const GCLOUD_TESTS_PREFIX = 'nodejs_samples_tests';


// the GCLOUD_PROJECT environment variable is set as part of test harness setup
const projectId = process.env.GCLOUD_PROJECT;

const transports = ["grpc","rest"]
// run tests with the gRPC client and the REST fallback client
transports.forEach(transport => {
  let bigquery;
  if(transport === "grpc"){
    bigquery = new BigQueryClient({});
  }else{
    bigquery = new BigQueryClient({fallback: true})
  }

describe(`Datasets ${transport}`, () => {
    const datasetId = `${GCLOUD_TESTS_PREFIX}_datasets_${randomUUID()}`.replace(
    /-/gi,
    '_',
    );
    // Only delete a resource if it is older than 24 hours. That will prevent
    // collisions with parallel CI test runs.
    function isResourceStale(creationTime) {
      const oneDayMs = 86400000;
      const now = new Date();
      const created = new Date(creationTime);
      return now.getTime() - created.getTime() >= oneDayMs;
    }

    // utility function to clean up stale resources
    async function deleteDatasets() {
      const listRequest = {
        projectId: projectId,
      };
      let [datasets] = await bigquery.listDatasets(listRequest);
      datasets = datasets.filter(dataset =>
        dataset.id.includes(GCLOUD_TESTS_PREFIX),
      );

      for (const dataset of datasets) {
        const datasetRequest = {
          projectId: projectId,
          datasetId: dataset.datasetReference.datasetId,
        };
        let datasetInfo;
        try {
          datasetInfo = await bigquery.getDataset(datasetRequest);
        } catch (e) {
          console.log(`dataset(${dataset.id}).getDataset failed`);
          console.log(e);
          return;
        }
        const creationTime = Number(datasetInfo.creationTime);
        if (isResourceStale(creationTime)) {
          try {
            await bigquery.deleteDataset(datasetRequest);
          } catch (e) {
            console.log(`dataset ${dataset.id} deletion failed`);
            console.log(e);
          }
        }
      }
    }
    before(async () => {
      // // Delete any stale datasets from samples tests
      await deleteDatasets();
      if (projectId === undefined) {
        throw Error(
          'GCLOUD_PROJECT must be defined as an environment variable before tests can be run',
        );
      }
    });

    beforeEach(async function () {
      this.currentTest.retries(2);
    });

    describe('dataset creation', () => {
      after(async () => {
        const request = {
          projectId: projectId,
          datasetId: datasetId,
        };
        await bigquery.deleteDataset(request);
      });
      it('should create a dataset', async () => {
        const location = 'US';
        const output = execSync(
          `node datasets/createDataset.js ${projectId} ${datasetId} ${location} ${transport}`,
        );
        assert.include(output, `Dataset ${projectId}:${datasetId} created`);
        const request = {
          projectId: projectId,
          datasetId: datasetId,
        };
        const [exists] = await bigquery.getDataset(request);
        assert.ok(exists);
      });
    });

    describe('list + get datasets', async () => {
      before('create two datasets to be gotten/listed', async () => {
        const dataset = {
          datasetReference: {
            datasetId: datasetId,
          },
          location: 'US',
        };
        const dataset2 = {
          datasetReference: {
            datasetId: datasetId + '_2',
          },
          location: 'US',
        };
        const request = {
          projectId: projectId,
          dataset: dataset,
        };
        const request2 = {
          projectId: projectId,
          dataset: dataset2,
        };
        const [response] = await bigquery.insertDataset(request);
        assert.ok(response);
        const [response2] = await bigquery.insertDataset(request2);

        assert.ok(response2);
      });
      after('delete two datasets that were created for these tests', async () => {
        const request = {
          projectId: projectId,
          datasetId: datasetId,
        };
        const request2 = {
          projectId: projectId,
          datasetId: datasetId + '_2',
        };
        await bigquery.deleteDataset(request);
        await bigquery.deleteDataset(request2);
      });
      it('should list datasets', async () => {
        const output = execSync(`node datasets/listDatasets.js ${projectId} ${transport}`);
        assert.match(output, /Datasets:/);
        assert.match(output, new RegExp(datasetId));
      });

    it('should list datasets on a different project', async () => {
      const output = execSync(
        'node datasets/listDatasets.js bigquery-public-data',
      );
      assert.match(output, /Datasets:/);
      assert.match(output, new RegExp('census_bureau_usa'));
    });

      it('should retrieve a dataset if it exists', async () => {
        const output = execSync(
          `node datasets/getDataset.js ${projectId} ${datasetId} ${transport}`,
        );
        assert.include(output, 'Dataset');
        assert.include(output, 'retrieved successfully');
        assert.include(output, datasetId);
      });
    });

    describe('update dataset', async () => {
      before('create a dataset to be updated', async () => {
        const dataset = {
          datasetReference: {
            datasetId: datasetId,
          },
          location: 'US',
        };
        const request = {
          projectId: projectId,
          dataset: dataset,
        };

        const [response] = await bigquery.insertDataset(request);
        assert.ok(response);
      });
      after('delete two datasets that were created for these tests', async () => {
        const request = {
          projectId: projectId,
          datasetId: datasetId,
        };
        await bigquery.deleteDataset(request);
      });
      it("should update dataset's description", async () => {
        const request = {
          projectId: projectId,
          datasetId: datasetId,
        };
        const [dataset] = await bigquery.getDataset(request);
        assert.ok(dataset, dataset.description);
        assert.isNull(dataset.description);
        const output = execSync(
          `node datasets/updateDataset.js ${projectId} ${datasetId} description ${transport}`,
        );
        assert.include(
          output,
          `${projectId}:${datasetId} description: This is a new description`,
        );
      });

      it("should update dataset's expiration", async () => {
        const request = {
          projectId: projectId,
          datasetId: datasetId,
        };
        const [dataset] = await bigquery.getDataset(request);
        assert.ok(dataset, dataset.defaultTableExpirationMs);
        assert.isNull(dataset.defaultTableExpirationMs);
        const output = execSync(
          `node datasets/updateDataset.js ${projectId} ${datasetId} expiration ${transport}`,
        );
        assert.include(output, `${datasetId} expiration: 86400000`);
      });
    });
    describe('delete dataset', () => {
      // create the dataset we need to delete
      before('create a dataset to be deleted', async () => {
        const dataset = {
          datasetReference: {
            datasetId: datasetId,
          },
          location: 'US',
        };
        const request = {
          projectId: projectId,
          dataset: dataset,
        };
        const [response] = await bigquery.insertDataset(request);
        assert.ok(response);
      });

      it('should delete a dataset', async () => {
        const request = {
          projectId: projectId,
          datasetId: datasetId,
        };
        const [dataset] = await bigquery.getDataset(request);
        assert.ok(dataset);

        const output = execSync(
          `node datasets/deleteDataset.js ${projectId} ${datasetId} ${transport}`,
        );
        assert.include(output, `Dataset ${datasetId} deleted.`);

        try {
          await bigquery.getDataset(request);
        } catch (err) {
          if (transport === "grpc"){
            assert.strictEqual(
              err.details,
              `Not found: Dataset ${projectId}:${datasetId}`,
            );
          }else{
            // REST errors are not surfacing full details
            // tracked internally b/429419330
            // we rely on the 404 error code to validate that it is not found
            assert.strictEqual(
              err.code,
              404
            )
          }
        }
      });
    });
  });
})  


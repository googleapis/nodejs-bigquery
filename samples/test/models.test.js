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
const {describe, it, before, beforeEach, after} = require('mocha');
const cp = require('child_process');
const {randomUUID} = require('crypto');
const {setInterval} = require('node:timers/promises');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const GCLOUD_TESTS_PREFIX = 'nodejs_samples_tests_models';

// the GCLOUD_PROJECT environment variable is set as part of test harness setup
const projectId = process.env.GCLOUD_PROJECT;

const transports = ['grpc', 'rest'];
// run tests with the gRPC client and the REST fallback client
transports.forEach(transport => {
  let bigquery;
  if (transport === 'grpc') {
    bigquery = new BigQueryClient({});
  } else {
    bigquery = new BigQueryClient({fallback: true});
  }

  describe(`Models ${transport}`, function () {
    // Increase timeout to accommodate model creation.
    this.timeout(300000);
    const datasetId = `${GCLOUD_TESTS_PREFIX}_${randomUUID()}`.replace(
      /-/gi,
      '_',
    );
    const modelId = `${GCLOUD_TESTS_PREFIX}_${randomUUID()}`.replace(
      /-/gi,
      '_',
    );
    const query = `CREATE MODEL \`${projectId}.${datasetId}.${modelId}\`
                    OPTIONS ( 
                              model_type='linear_reg',
                              max_iterations=1,
                              learn_rate=0.4,
                              learn_rate_strategy='constant'
                    ) AS (
                            SELECT 'a' AS f1, 2.0 AS label
                            UNION ALL
                            SELECT 'b' AS f1, 3.8 AS label
                      )`;
    before(async () => {
      if (projectId === undefined) {
        throw Error(
          'GCLOUD_PROJECT must be defined as an environment variable before tests can be run',
        );
      }

      const datasetObject = {
        datasetReference: {
          datasetId: datasetId,
        },
        location: 'US',
      };
      const datasetRequest = {
        projectId: projectId,
        dataset: datasetObject,
      };
      const [datasetResponse] = await bigquery.insertDataset(datasetRequest);
      assert.ok(datasetResponse);
    });

    beforeEach(async function () {
      this.currentTest.retries(2);
    });

    after(async () => {
      const deleteRequest = {
        projectId: projectId,
        datasetId: datasetId,
        deleteContents: true,
      };
      await bigquery.deleteDataset(deleteRequest);
      const getDatasetRequest = {
        projectId: projectId,
        datasetId: datasetId,
      };
      try {
        await bigquery.getDataset(getDatasetRequest);
      } catch (err) {
        if (transport === 'grpc') {
          assert.strictEqual(
            err.details,
            `Not found: Dataset ${projectId}:${datasetId}`,
          );
        } else {
          // REST errors are not surfacing full details
          // tracked internally b/429419330
          // we rely on the 404 error code to validate that it is not found
          assert.strictEqual(err.code, 404);
        }
      }
    });

    describe('get/list/update model', async () => {
      before('create a model to get/list/update', async () => {
        const insertJobRequest = {
          projectId: projectId,
          job: {
            configuration: {
              query: {
                query: query,
                useLegacySql: {value: false},
              },
            },
          },
        };

        // Run query to create a model
        const [job] = await bigquery.insertJob(insertJobRequest);
        assert.ok(job);
        const jobReference = job.jobReference;
        const getQueryResultsRequest = {
          projectId: projectId,
          jobId: jobReference.jobId,
          location: jobReference.location.value,
        };

        // poll the job status every 3 seconds until complete
        // eslint-disable-next-line
        for await (const t of setInterval(3000)) { // no-unused-vars - this is the syntax for promise based setInterval
          const [resp] = await bigquery.jobClient.getQueryResults(
            getQueryResultsRequest,
          );
          if (resp.errors.length !== 0) {
            throw new Error('Something failed in model creation');
          }
          if (resp.jobComplete.value) {
            break;
          }
        }
      });

      it('should retrieve a model if it exists', async () => {
        const output = execSync(
          `node models/getModel.js ${projectId} ${datasetId} ${modelId} ${transport}`,
        );
        assert.include(output, 'Model:');
        assert.include(output, datasetId && modelId);
      });

      it('should list models', async () => {
        const output = execSync(
          `node models/listModels.js ${projectId} ${datasetId} ${transport}`,
        );
        assert.include(output, 'Models:');
        assert.include(output, datasetId && modelId);
      });

      it('should list models streaming', async () => {
        const output = execSync(
          `node models/listModelsStreaming.js ${projectId} ${datasetId} ${transport}`,
        );
        assert.include(output, 'Models:');
        assert.include(output, datasetId && modelId);
        assert.include(output, 'All models have been retrieved.');
      });

      // Skipping for gRPC - known issue tracked internally
      // at b/439612831
      if (transport === 'rest') {
        it("should update model's description", async () => {
          const getModelRequest = {
            projectId: projectId,
            datasetId: datasetId,
            modelId: modelId,
          };
          const [model] = await bigquery.getModel(getModelRequest);
          assert.strictEqual(model.description, '');

          const output = execSync(
            `node models/updateModel.js ${projectId} ${datasetId} ${modelId} ${transport}`,
          );
          assert.include(
            output,
            `${modelId} description: A really great model.`,
          );
        });
      }
    });

    describe('Create/Delete Model', () => {
      const modelIdCreateDelete = modelId + '_2';
      const modelRequest = {
        projectId: projectId,
        datasetId: datasetId,
        modelId: modelIdCreateDelete,
      };

      beforeEach(async function () {
        this.currentTest.retries(2);
      });

      it('should create a model', async () => {
        const output = execSync(
          `node models/createModel.js ${projectId} ${datasetId} ${modelIdCreateDelete} ${transport}`,
        );
        assert.include(output, `Model ${modelIdCreateDelete} created.`);
        const [exists] = await bigquery.getModel(modelRequest);
        assert.ok(exists);
      });

      it('should delete a model', async () => {
        const output = execSync(
          `node models/deleteModel.js ${projectId} ${datasetId} ${modelIdCreateDelete} ${transport}`,
        );
        assert.include(output, `Model ${modelIdCreateDelete} deleted.`);
        try {
          await bigquery.getModel(modelRequest);
        } catch (err) {
          if (transport === 'grpc') {
            assert.strictEqual(
              err.details,
              `Not found: Model ${projectId}:${datasetId}.${modelIdCreateDelete}`,
            );
          } else {
            // REST errors are not surfacing full details
            // tracked internally b/429419330
            // we rely on the 404 error code to validate that it is not found
            assert.strictEqual(err.code, 404);
          }
        }
      });
    });
  });
});

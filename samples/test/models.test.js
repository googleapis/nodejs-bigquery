// Copyright 2019 Google LLC
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

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const GCLOUD_TESTS_PREFIX = 'nodejs_samples_tests_models';

// the GCLOUD_PROJECT environment variable is set as part of test harness setup
const projectId = process.env.GCLOUD_PROJECT;

const bigquery = new BigQueryClient({}, {opts: {fallback: false}});

//TODO(coleleah): update
describe.only('Models', function () {
  // Increase timeout to accommodate model creation.
  this.timeout(300000);
  const datasetId = `${GCLOUD_TESTS_PREFIX}_${randomUUID()}`.replace(
    /-/gi,
    '_',
  );
  const modelId = `${GCLOUD_TESTS_PREFIX}_${randomUUID()}`.replace(/-/gi, '_');
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
    assert.ok(datasetResponse)

  });
//TODO(coleleah): update

  beforeEach(async function () {
    this.currentTest.retries(2);
  });

  after(async () => {
const deleteRequest = {
      projectId: projectId,
      datasetId: datasetId,
      deleteContents: true
    };
    await bigquery.deleteDataset(deleteRequest);  
  });
//TODO(coleleah): update

describe.only('get/list/update model', async () => {
  before('create a model to get/list/update', async() => {
    const insertJobRequest = {
      projectId: projectId,
      job: {
        configuration: {
          query: {
            query: query,
            useLegacySql: {value: false}
          },
        },
      },
    };
  

    // Run query to create a model
    const [job] = await bigquery.insertJob(insertJobRequest);
    assert.ok(job)
    const jobReference = job.jobReference;
       const getQueryResultsRequest = {
      projectId: projectId,
      jobId: jobReference.jobId,
      location: jobReference.location.value,
      timeoutMs: {value:120000}

    }

    // Wait for the query to finish
    let [resp] = await bigquery.jobClient.getQueryResults(getQueryResultsRequest)
    // poll the job status every 3 seconds until complete
    while(resp.status==="RUNNING"){
      setTimeout([resp] = await bigquery.jobClient.getQueryResults(getQueryResultsRequest), 3000)
    }
    if (resp.errors.length!==0){
      throw new Error(`Something failed in model creation`)
    }

  })
    //TODO(coleleah): update

  // after('delete the model we created', async () => {
  //   console.log('to be implemented')
  // })

   it.only('should retrieve a model if it exists', async () => {
    const output = execSync(`node models/getModel.js ${projectId} ${datasetId} ${modelId}`);
    assert.include(output, 'Model:');
    assert.include(output, datasetId && modelId);
  });

  it.only('should list models', async () => {
    const output = execSync(`node models/listModels.js ${projectId} ${datasetId}`);
    assert.include(output, 'Models:');
    assert.include(output, datasetId);
  });
//TODO(coleleah): update

  it('should list models streaming', async () => {
    const output = execSync(`node getModel.js ${datasetId} ${modelId}`);
    assert.include(output, modelId);
  });
//TODO(coleleah): update

  it("should update model's metadata", async () => {
    const output = execSync(`node updateModel.js ${datasetId} ${modelId}`);
    assert.include(output, `${modelId} description: A really great model.`);
  });

})

//TODO(coleleah): update
  describe('Create/Delete Model', () => {
    const modelRequest = {
      projectId: projectId,
      datasetId: datasetId,
      modelId: modelId
    }
    // const datasetId = `${GCLOUD_TESTS_PREFIX}_delete_${randomUUID()}`.replace(
    //   /-/gi,
    //   '_',
    // );
    // const modelId = `${GCLOUD_TESTS_PREFIX}_delete_${randomUUID()}`.replace(
    //   /-/gi,
    //   '_',
    // );
  //TODO(coleleah): update

    // before(async () => {
    //   const datasetOptions = {
    //     location: 'US',
    //   };
    //   await bigquery.createDataset(datasetId, datasetOptions);
    // });
  //TODO(coleleah): update

    beforeEach(async function () {
      this.currentTest.retries(2);
    });
  // //TODO(coleleah): update

  //   after(async () => {
  //     await bigquery.dataset(datasetId).delete({force: true}).catch(console.warn);
  //   });

    it('should create a model', async () => {
      const output = execSync(`node models/createModel.js ${projectId} ${datasetId} ${modelId}`);
      assert.include(output, `Model ${modelId} created.`);
      const [exists] = await bigquery.getModel(modelRequest)
      assert.ok(exists)
    });

    it('should delete a model', async () => {
      const output = execSync(`node models/deleteModel.js ${projectId} ${datasetId} ${modelId}`);
      assert.include(output, `Model ${modelId} deleted.`);
      try{
        await bigquery.getModel(modelRequest)
      }catch(err){
        assert.strictEqual(err.details, `Not found: Model ${projectId}:${datasetId}.${modelId}`)
      }
    });
  });
});

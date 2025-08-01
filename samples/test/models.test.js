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

const bigquery = new BigQueryClient();

//TODO(coleleah): update
describe.only('Models', function () {
  // Increase timeout to accommodate model creation.
  this.timeout(300000);
  const datasetId = `${GCLOUD_TESTS_PREFIX}_${randomUUID()}`.replace(
    /-/gi,
    '_',
  );
  const modelId = `${GCLOUD_TESTS_PREFIX}_${randomUUID()}`.replace(/-/gi, '_');
//TODO(coleleah): update
    // const query = `CREATE OR REPLACE MODEL \`${projectId}.${datasetId}.${modelId}\`
    //     OPTIONS(model_type='logistic_reg') AS
    //     SELECT
    //       IF(totals.transactions IS NULL, 0, 1) AS label,
    //       IFNULL(device.operatingSystem, "") AS os,
    //       device.isMobile AS is_mobile,
    //       IFNULL(geoNetwork.country, "") AS country,
    //       IFNULL(totals.pageviews, 0) AS pageviews
    //     FROM
    //       \`bigquery-public-data.google_analytics_sample.ga_sessions_*\`
    //     WHERE
    //       _TABLE_SUFFIX BETWEEN '20160801' AND '20170631'
    //     LIMIT  100000;`;
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
    };
    await bigquery.deleteDataset(deleteRequest);  });
//TODO(coleleah): update

describe('get/list/update model', async () => {
  before('create a model to get/list/update', async() => {
    const jobConfig = {
      jobType: "query",
      query: {query:query, useLegacySql: {value:false}},
      destinationTable: {tableId: tableId, datasetId: datasetId, projectId: projectId},
      defaultDataset:{
        datasetId: datasetId,
        projectId: projectId
      }

    }
    const jobObject = {
      id: modelId,
      configuration: jobConfig,

    }
    const insertJobRequest = {
      projectId: projectId,
      job: jobObject

    }

    // Run query to create a model
    const [job] = await bigquery.insertJob(insertJobRequest);
    assert.ok(job)
    console.log("JOB!", job)
    // Wait for the query to finish
    const resp = await bigquery.jobClient.getQueryResults();
    console.log('resp', resp)

  })
    //TODO(coleleah): update

  after('delete the model we created', async () => {
    console.log('to be implemented')
  })
  //TODO(coleleah): update

   it.only('should retrieve a model if it exists', async () => {
    const output = execSync(`node getModel.js ${datasetId} ${modelId}`);
    assert.include(output, 'Model:');
    assert.include(output, datasetId && modelId);
  });
//TODO(coleleah): update

  it('should list models', async () => {
    const output = execSync(`node listModels.js ${datasetId}`);
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
    const datasetId = `${GCLOUD_TESTS_PREFIX}_delete_${randomUUID()}`.replace(
      /-/gi,
      '_',
    );
    const modelId = `${GCLOUD_TESTS_PREFIX}_delete_${randomUUID()}`.replace(
      /-/gi,
      '_',
    );
  //TODO(coleleah): update

    before(async () => {
      const datasetOptions = {
        location: 'US',
      };
      await bigquery.createDataset(datasetId, datasetOptions);
    });

    beforeEach(async function () {
      this.currentTest.retries(2);
    });

    after(async () => {
      await bigquery.dataset(datasetId).delete({force: true}).catch(console.warn);
    });
  //TODO(coleleah): update

    it('should create a model', async () => {
      const output = execSync(`node createModel.js ${datasetId} ${modelId}`);
      assert.include(output, `Model ${modelId} created.`);
      const [exists] = await bigquery.dataset(datasetId).model(modelId).exists();
      assert.strictEqual(exists, true);
    });
  //TODO(coleleah): update

    it('should delete a model', async () => {
      const output = execSync(`node deleteModel.js ${datasetId} ${modelId}`);
      assert.include(output, `Model ${modelId} deleted.`);
      const [exists] = await bigquery.dataset(datasetId).model(modelId).exists();
      assert.strictEqual(exists, false);
    });
  });
});

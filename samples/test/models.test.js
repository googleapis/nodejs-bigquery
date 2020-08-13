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

const {BigQuery} = require('@google-cloud/bigquery');
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const GCLOUD_TESTS_PREFIX = 'nodejs_samples_tests_models';

const bigquery = new BigQuery();

describe('Models', () => {
  const datasetId = `${GCLOUD_TESTS_PREFIX}_${uuid.v4()}`.replace(/-/gi, '_');
  const modelId = `${GCLOUD_TESTS_PREFIX}_${uuid.v4()}`.replace(/-/gi, '_');

  before(async () => {
    await deleteDatasets();

    const query = `CREATE OR REPLACE MODEL \`${datasetId}.${modelId}\`
        OPTIONS(model_type='logistic_reg') AS
        SELECT
          IF(totals.transactions IS NULL, 0, 1) AS label,
          IFNULL(device.operatingSystem, "") AS os,
          device.isMobile AS is_mobile,
          IFNULL(geoNetwork.country, "") AS country,
          IFNULL(totals.pageviews, 0) AS pageviews
        FROM
          \`bigquery-public-data.google_analytics_sample.ga_sessions_*\`
        WHERE
          _TABLE_SUFFIX BETWEEN '20160801' AND '20170631'
        LIMIT  100000;`;

    const datasetOptions = {
      location: 'US',
    };

    const queryOptions = {
      query: query,
    };

    await bigquery.createDataset(datasetId, datasetOptions);

    // Run query to create a model
    const [job] = await bigquery.createQueryJob(queryOptions);

    // Wait for the query to finish
    await job.getQueryResults();
  });

  after(async () => {
    await bigquery
      .dataset(datasetId)
      .delete({force: true})
      .catch(console.warn);
  });

  it('should retrieve a model if it exists', async () => {
    const output = execSync(`node getModel.js ${datasetId} ${modelId}`);
    assert.include(output, 'Model:');
    assert.include(output, datasetId && modelId);
  });

  it('should list models', async () => {
    const output = execSync(`node listModels.js ${datasetId}`);
    assert.include(output, 'Models:');
    assert.include(output, datasetId);
  });

  it('should list models streaming', async () => {
    const output = execSync(`node getModel.js ${datasetId} ${modelId}`);
    assert.include(output, modelId);
  });

  it("should update model's metadata", async () => {
    const output = execSync(`node updateModel.js ${datasetId} ${modelId}`);
    assert.include(output, `${modelId} description: A really great model.`);
  });

  // Only delete a resource if it is older than 24 hours. That will prevent
  // collisions with parallel CI test runs.
  function isResourceStale(creationTime) {
    const oneDayMs = 86400000;
    const now = new Date();
    const created = new Date(creationTime);
    return now.getTime() - created.getTime() >= oneDayMs;
  }

  async function deleteDatasets() {
    let [datasets] = await bigquery.getDatasets();
    datasets = datasets.filter(dataset =>
      dataset.id.includes(GCLOUD_TESTS_PREFIX)
    );

    for (const dataset of datasets) {
      const [metadata] = await dataset.getMetadata();
      const creationTime = Number(metadata.creationTime);

      if (isResourceStale(creationTime)) {
        try {
          await dataset.delete({force: true});
        } catch (e) {
          console.log(`dataset(${dataset.id}).delete() failed`);
          console.log(e);
        }
      }
    }
  }
});

describe('Delete Model', () => {
  const datasetId = `${GCLOUD_TESTS_PREFIX}_delete_${uuid.v4()}`.replace(
    /-/gi,
    '_'
  );
  const modelId = `${GCLOUD_TESTS_PREFIX}_delete_${uuid.v4()}`.replace(
    /-/gi,
    '_'
  );

  before(async () => {
    const query = `CREATE OR REPLACE MODEL \`${datasetId}.${modelId}\`
         OPTIONS(model_type='logistic_reg') AS
         SELECT
           IF(totals.transactions IS NULL, 0, 1) AS label,
           IFNULL(device.operatingSystem, "") AS os,
           device.isMobile AS is_mobile,
           IFNULL(geoNetwork.country, "") AS country,
           IFNULL(totals.pageviews, 0) AS pageviews
         FROM
           \`bigquery-public-data.google_analytics_sample.ga_sessions_*\`
         WHERE
           _TABLE_SUFFIX BETWEEN '20160801' AND '20170631'
         LIMIT  100000;`;

    const datasetOptions = {
      location: 'US',
    };

    const queryOptions = {
      query: query,
    };

    await bigquery.createDataset(datasetId, datasetOptions);

    // Run query to create a model
    const [job] = await bigquery.createQueryJob(queryOptions);

    // Wait for the query to finish
    await job.getQueryResults();
  });

  after(async () => {
    await bigquery
      .dataset(datasetId)
      .delete({force: true})
      .catch(console.warn);
  });

  it('should delete a model', async () => {
    const output = execSync(`node deleteModel.js ${datasetId} ${modelId}`);
    assert.include(output, `Model ${modelId} deleted.`);
    const [exists] = await bigquery
      .dataset(datasetId)
      .model(modelId)
      .exists();
    assert.strictEqual(exists, false);
  });
});

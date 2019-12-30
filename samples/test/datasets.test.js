// Copyright 2017 Google LLC
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
const {describe, it, after} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const datasetId = `gcloud_tests_${uuid.v4()}`.replace(/-/gi, '_');
const bigquery = new BigQuery();

describe(`Datasets`, () => {
  after(async () => {
    await bigquery
      .dataset(datasetId)
      .delete({force: true})
      .catch(console.warn);
  });

  it(`should create a dataset`, async () => {
    const output = execSync(`node createDataset.js ${datasetId}`);
    assert.include(output, `Dataset ${datasetId} created.`);
    const [exists] = await bigquery.dataset(datasetId).exists();
    assert.ok(exists);
  });

  it(`should list datasets`, async () => {
    const output = execSync(`node listDatasets.js`);
    assert.match(output, /Datasets:/);
    assert.match(output, new RegExp(datasetId));
  });

  it(`should retrieve a dataset if it exists`, async () => {
    const output = execSync(`node getDataset.js ${datasetId}`);
    assert.include(output, 'Dataset:');
    assert.include(output, datasetId);
  });

  it(`should update dataset's description`, async () => {
    const output = execSync(`node updateDatasetDescription.js ${datasetId}`);
    assert.include(
      output,
      `${datasetId} description: New dataset description.`
    );
  });

  it(`should update dataset's expiration`, async () => {
    const output = execSync(`node updateDatasetExpiration.js ${datasetId}`);
    assert.include(output, `${datasetId} expiration: 86400000`);
  });

  it(`should add label to a dataset`, async () => {
    const output = execSync(`node labelDataset.js ${datasetId}`);
    assert.include(output, `${datasetId} labels:`);
    assert.include(output, "{ color: 'green' }");
  });

  it(`should list a dataset's labels`, async () => {
    const output = execSync(`node getDatasetLabels.js ${datasetId}`);
    assert.include(output, `${datasetId} Labels:`);
    assert.include(output, 'color: green');
  });

  it(`should delete a label from a dataset`, async () => {
    const output = execSync(`node deleteLabelDataset.js ${datasetId}`);
    assert.include(output, `${datasetId} labels:`);
    assert.include(output, 'undefined');
  });

  it(`should update dataset's access`, async () => {
    const output = execSync(`node updateDatasetAccess.js ${datasetId}`);
    assert.include(output, `role: 'READER'`);
    assert.include(output, `userByEmail: 'sample.bigquery.dev@gmail.com'`);
  });

  it(`should filter datasets by label`, async () => {
    execSync(`node labelDataset.js ${datasetId}`);
    const output = execSync(`node listDatasetsByLabel.js`);
    assert.match(output, /Datasets:/);
    assert.match(output, new RegExp(datasetId));
  });

  it(`should delete a dataset`, async () => {
    const output = execSync(`node deleteDataset.js ${datasetId}`);
    assert.include(output, `Dataset ${datasetId} deleted.`);
    const [exists] = await bigquery.dataset(datasetId).exists();
    assert.strictEqual(exists, false);
  });
});

/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const {BigQuery} = require('@google-cloud/bigquery');
const {assert} = require('chai');
const execa = require('execa');
const uuid = require('uuid');

const exec = async cmd => (await execa.shell(cmd)).stdout;
const DATASET_ID = `gcloud_tests_${uuid.v4()}`.replace(/-/gi, '_');
const bigquery = new BigQuery();

describe(`Datasets`, () => {
  after(async () => {
    await bigquery
      .dataset(DATASET_ID)
      .delete({force: true})
      .catch(console.warn);
  });

  it(`should create a dataset`, async () => {
    const output = await exec(`node createDataset.js ${DATASET_ID}`);
    assert.strictEqual(output, `Dataset ${DATASET_ID} created.`);
    const [exists] = await bigquery.dataset(DATASET_ID).exists();
    assert.ok(exists);
  });

  it(`should list datasets`, async () => {
    const output = await exec(`node listDatasets.js`);
    assert.match(output, /Datasets:/);
    assert.match(output, new RegExp(DATASET_ID));
  });

  it(`should delete a dataset`, async () => {
    const output = await exec(`node deleteDataset.js ${DATASET_ID}`);
    assert.strictEqual(output, `Dataset ${DATASET_ID} deleted.`);
    const [exists] = await bigquery.dataset(DATASET_ID).exists();
    assert.strictEqual(exists, false);
  });
});

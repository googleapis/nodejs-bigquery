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

const {BigQuery} = require(`@google-cloud/bigquery`);
const path = require(`path`);
const assert = require(`assert`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const cwd = path.join(__dirname, `..`);
const cmd = `node datasets.js`;
const datasetId = `nodejs-docs-samples-test-${uuid.v4()}`.replace(/-/gi, '_');
const projectId = process.env.GCLOUD_PROJECT;
const bigquery = new BigQuery();

describe(`Datasets`, () => {
  before(tools.checkCredentials);
  after(async () => {
    try {
      await bigquery.dataset(datasetId).delete({force: true});
    } catch (err) {} // ignore error
  });

  it(`should create a dataset`, async () => {
    const output = await tools.runAsync(
      `${cmd} create ${projectId} ${datasetId}`,
      cwd
    );
    assert.strictEqual(output, `Dataset ${datasetId} created.`);
    const [exists] = await bigquery.dataset(datasetId).exists();
    assert.ok(exists);
  });

  it(`should list datasets`, async () => {
    const output = await tools.runAsync(`${cmd} list ${projectId}`, cwd);
    assert.ok(output.includes(`Datasets:`));
    assert.ok(output.includes(datasetId));
  });

  it(`should delete a dataset`, async () => {
    const output = await tools.runAsync(
      `${cmd} delete ${projectId} ${datasetId}`,
      cwd
    );
    assert.strictEqual(output, `Dataset ${datasetId} deleted.`);
    const [exists] = await bigquery.dataset(datasetId).exists();
    assert.strictEqual(exists, false);
  });
});

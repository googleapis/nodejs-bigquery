/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const authUserFlow = require('../authUserFlow.js');
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const sinon = require('sinon');
const {assert} = require('chai');
const {BigQuery} = require('@google-cloud/bigquery');
const uuid = require('uuid');

const generateUuid = () => `gcloud-tests-${uuid.v4()}`.replace(/-/gi, '_');
const datasetId = generateUuid();
const tableId = generateUuid();
let projectId;

const bigquery = new BigQuery();

describe('authUserFlow()', function() {
  before(async () => {
    await bigquery.createDataset(datasetId);
    const [tableData] = await bigquery.dataset(datasetId).createTable(tableId);
    projectId = tableData.metadata.tableReference.projectId;
    sinon.stub(authUserFlow.main, 'authFlow');
  });
  after(async () => {
    await bigquery
      .dataset(datasetId)
      .delete({force: true})
      .catch(console.warn);
  });

  it('should run a query', async function() {
    const output = await authUserFlow.main.query(projectId);
    assert.include(output[0].name, 'William');
  });
});

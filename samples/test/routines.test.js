// Copyright 2020 Google LLC
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

const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');

const {BigQuery} = require('@google-cloud/bigquery');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const generateUuid = () =>
  `nodejs-samples-tests-authView-${uuid.v4()}`.replace(/-/gi, '_');
const datasetId = generateUuid();
const routineId = generateUuid();

const bigquery = new BigQuery();

describe.only('Routines', () => {
  after(async () => {
    await bigquery
      .dataset(datasetId)
      .delete({force: true})
      .catch(console.warn);
  });

  before(async () => {
    await bigquery.createDataset(datasetId);
  });

  it('should create a routine', async () => {
    const output = execSync(`node createRoutine.js ${datasetId} ${routineId}`);
    assert.include(output, `Routine ${routineId} created.`);
  });
});

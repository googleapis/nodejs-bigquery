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
const {describe, it, before} = require('mocha');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

// const datasetId = `gcloud_tests_${uuid.v4()}`.replace(/-/gi, '_');
const bigquery = new BigQuery();
let jobId;

describe(`Jobs`, () => {
  before(async () => {
    const query = `SELECT name
        FROM \`bigquery-public-data.usa_names.usa_1910_2013\`
        WHERE state = 'TX'
        LIMIT 100`;

    const queryOptions = {
      query: query,
    };

    const [job] = await bigquery.createQueryJob(queryOptions);
    jobId = job.metadata.jobReference.jobId;
  });

  it(`should list jobs`, async () => {
    const output = execSync(`node listJobs.js`);
    assert.match(output, /Jobs:/);
    assert.include(output, jobId);
  });

  it(`should retrieve a job`, async () => {
    const output = execSync(`node getJob.js ${jobId}`);
    assert.include(output, `jobId: '${jobId}'`);
  });

  it(`should attempt to cancel a job`, async () => {
    const output = execSync(`node cancelJob.js ${jobId}`);
    assert.include(output, `state:`);
  });
});

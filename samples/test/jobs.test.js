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

const {BigQueryClient} = require('@google-cloud/bigquery');
const {assert} = require('chai');
const {describe, it, before, beforeEach} = require('mocha');
const {randomUUID} = require('crypto');
const {setInterval} = require('node:timers/promises');

const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const bigquery = new BigQueryClient();
let jobId;
const GCLOUD_TESTS_PREFIX = 'nodejs_samples_tests_jobs';

// the GCLOUD_PROJECT environment variable is set as part of test harness setup
const projectId = process.env.GCLOUD_PROJECT;
//TODO(coleleah): update

describe('Jobs', () => {
    const datasetId = `${GCLOUD_TESTS_PREFIX}_${randomUUID()}`.replace(
    /-/gi,
    '_',
  );
    //TODO(coleleah): update

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
  

  describe('get + list jobs', () => {
   const query = `SELECT country_name 
                FROM \`bigquery-public-data.utility_us.country_code_iso\` 
                LIMIT 10`
    before('create a job to get/list', async () => {
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
      jobId = getQueryResultsRequest.jobId
      // poll the job status every 3 seconds until complete
      // eslint-disable-next-line
      for await (const t of setInterval(3000)) { // no-unused-vars - this is the syntax for promise based setInterval
        const [resp] = await bigquery.jobClient.getQueryResults(
          getQueryResultsRequest,
        );
        if (resp.errors.length !== 0) {
          throw new Error('Something failed in job creation');
        }
        if (resp.jobComplete.value) {
          break;
        }
      }
    });
      
    it('should list jobs', async () => {
      const output = execSync(`node jobs/listJobs.js ${projectId}`);
      assert.match(output, /Jobs:/);
      assert.include(output, jobId);

    });

    it('should retrieve a job', async () => {
      const output = execSync(`node jobs/getJob.js ${projectId} ${jobId}`);
      assert.include(output, `Job ${projectId}:US.${jobId}`);
    });

  })

  describe('create + cancel jobs', () => {
//TODO(coleleah): update

  it('should attempt to cancel a job', async () => {
    const output = execSync(`node cancelJob.js ${jobId}`);
    assert.include(output, 'state:');
  });

  it.only('should create a job', async () => {
    const output = execSync(`node jobs/createJob.js ${projectId}`);
    assert.include(output, 'Rows:');
    assert.include(output, 'Tromelin Island');

  });
  })

});
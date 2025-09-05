// Copyright 2025 Google LLC
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

function main(projectId = 'my-project', transport = 'grpc') {
  // [START bigquery_create_job_preview]
  // Import the Google Cloud client library and create a client
  const {BigQueryClient} = require('@google-cloud/bigquery');
  const {setInterval} = require('node:timers/promises');

  let bigqueryClient;
  if (transport==='grpc'){
    bigqueryClient = new BigQueryClient()
  }else{
    bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}})
  }

  async function createJob() {
    // Run a BigQuery query job.

    const query = `SELECT country_name 
            FROM 
              bigquery-public-data.utility_us.country_code_iso 
            LIMIT 10`;

    const request = {
      projectId: projectId,
      job: {
        configuration: {
          query: {
            query: query,
            useLegacySql: {value: false},
          },
          labels: {'example-label': 'example-value'},
        },
      },
    };

    // Make API request.
    const [job] = await bigqueryClient.insertJob(request);
    const jobReference = job.jobReference;
    const jobId = jobReference.jobId;
    const getQueryResultsRequest = {
      projectId: projectId,
      jobId: jobId,
      location: jobReference.location.value,
    };
    // poll the job status every 3 seconds until complete
    // eslint-disable-next-line
    for await (const t of setInterval(3000)) { // no-unused-vars - this is the syntax for promise based setInterval
      const [resp] = await bigqueryClient.jobClient.getQueryResults(
        getQueryResultsRequest,
      );
      if (resp.errors.length !== 0) {
        throw new Error('Something failed in job creation');
      }
      if (resp.jobComplete.value) {
        const rows = resp.rows;
        console.log('Rows:');
        rows.forEach(row => console.log(JSON.stringify(row)));
        break;
      }
    }
  }
  // [END bigquery_create_job_preview]
  createJob();
}
main(...process.argv.slice(2));

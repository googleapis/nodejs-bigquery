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

function main(jobId) {
  // [START bigquery_get_job]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  async function getJob(
      jobId = '80390a60-e2b4-4104-a2ff-236cac5057bf'
  ) {
    // Get job properties.

    // Create a client
    const bigqueryClient = new BigQuery();

    // Create a job reference
    const job = bigqueryClient.job(jobId);

    // Retrieve job
    const [jobResult] = await job.get()
    
    console.log(jobResult.metadata.jobReference);
  }
  getJob(jobId);
  // [END bigquery_get_job]
}
main(...process.argv.slice(2));

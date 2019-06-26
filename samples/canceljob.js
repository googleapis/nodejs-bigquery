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
  // [START bigquery_cancel_job]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  async function cancelJob(
      jobId = 'existing-job-id'
  ) {
    // Attempt to cancel a job.

    // Create a client
    const bigqueryClient = new BigQuery();

    // Create a job reference
    const job = bigqueryClient.job(jobId);

    // Attempt to cancel job
    const [apiResult] = await job.cancel()
    
    console.log(apiResult.job.status);
  }
  cancelJob(jobId);
  // [END bigquery_cancel_job]
}
main(...process.argv.slice(2));

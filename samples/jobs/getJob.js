/**
 * Copyright 2025 Google LLC
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

function main(projectId = 'my_project', jobId = 'existing-job-id', transport = 'grpc') {
  // [START bigquery_get_job_preview]
  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');
  let bigqueryClient;
  if (transport==='grpc'){
    bigqueryClient = new BigQueryClient()
  }else{
    bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}})
  }

  async function getJob() {
    // Get job properties.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = "my_project";
    // const jobId = "existing-job-id";

    const request = {
      projectId,
      jobId,
      location: 'US',
    };
    const [job] = await bigqueryClient.getJob(request);

    console.log(`Job ${job.id} status: ${job.status.state}`);
  }
  // [END bigquery_get_job_preview]
  getJob();
}
main(...process.argv.slice(2));

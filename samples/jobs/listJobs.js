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

function main(projectId = 'my_project', transport = 'grpc') {
  // [START bigquery_list_jobs_preview]
  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');
  let bigqueryClient;
  if (transport==='grpc'){
    bigqueryClient = new BigQueryClient()
  }else{
    bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}})
  }

  async function listJobs() {
    // Lists all jobs in current GCP project.
    const request = {projectId: projectId};
    // limit results to 10
    const maxResults = 10;
    const iterable = bigqueryClient.listJobsAsync(request);
    console.log('Jobs:');
    let i = 0;
    for await (const job of iterable) {
      if (i >= maxResults) {
        break;
      }
      console.log(job.id);
      i++;
    }
  }
  // [END bigquery_list_jobs_preview]
  listJobs();
}
main(...process.argv.slice(2));

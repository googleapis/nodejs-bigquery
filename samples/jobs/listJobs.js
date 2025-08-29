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

function main(projectId = 'my_project') {
  // [START bigquery_list_jobs]
  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');
  const bigquery = new BigQueryClient();

  async function listJobs() {
    // Lists all jobs in current GCP project.
    const request = {projectId: projectId};
    // utilize the async listJobs method to fetch results
    // in an iterable manner
    // see https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#auto-pagination
    // for more info on using *Async versus *Stream list methods
    const iterable = bigquery.listJobsAsync(request);
    console.log('Jobs:');
    let i = 0;
    for await (const job of iterable) {
      //limit number of iterations to 5 to speed up results
      if (i >= 5) {
        break;
      }
      console.log(job.id);
      i++;
    }
  }
  // [END bigquery_list_jobs]
  listJobs();
}
main(...process.argv.slice(2));

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

function main(
  datasetId = 'my_dataset', // Existing dataset
  transport = 'grpc',
) {
  // [START bigquery_list_routines_preview]
  // Import the Google Cloud client library.
  const {BigQueryClient} = require('@google-cloud/bigquery');

  let bigqueryClient;
  if (transport === 'grpc') {
    bigqueryClient = new BigQueryClient();
  } else {
    bigqueryClient = new BigQueryClient({fallback: true});
  }

  async function listRoutines() {
    // Lists routines in "my_dataset".

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'my-project';
    // const datasetId = 'my_dataset';

    const projectId = await bigqueryClient.routineClient.getProjectId();
    const listRequest = {
      projectId: projectId,
      datasetId: datasetId,
    };
    // List all routines in the dataset
    // limit results to 10
    const maxResults = 10;
    const iterable = bigqueryClient.listRoutinesAsync(listRequest);
    console.log('Routines:');
    let i = 0;
    for await (const routine of iterable) {
      if (i >= maxResults) {
        break;
      }
      console.log(routine.routineReference.routineId);
      i++;
    }
  }
  listRoutines();
  // [END bigquery_list_routines_preview]
}
main(...process.argv.slice(2));

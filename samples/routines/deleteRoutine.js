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
  routineId = 'my_routine', // Routine to be deleted
) {
  // [START bigquery_delete_routine_preview]
  // Import the Google Cloud client library.
  const {BigQueryClient} = require('@google-cloud/bigquery');

  //TODO(coleleah): remove fallback:false if obsolete
  // tracked in b/429226336
  const bigqueryClient = new BigQueryClient({}, {opts: {fallback: false}});

  async function deleteRoutine() {
    // Deletes a routine named "my_routine" in "my_dataset".

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const projectId = 'my-project';
    // const datasetId = 'my_dataset';
    // const routineId = 'my_routine';
    const projectId = await bigqueryClient.routineClient.getProjectId();

    const deleteRequest = {
      projectId: projectId,
      datasetId: datasetId,
      routineId: routineId,
    };
    // Make API call
    await bigqueryClient.deleteRoutine(deleteRequest);

    console.log(`Routine ${routineId} deleted.`);
  }
  deleteRoutine();
  // [END bigquery_delete_routine_preview]
}
main(...process.argv.slice(2));

// Copyright 2020 Google LLC
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
  routineId = 'my_routine' // Routine to be created
) {
  // [START bigquery_get_routine]
  // Import the Google Cloud client library and get a client
  const {BigQuery} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  async function getRoutine() {
    // Gets a routine named "my_routine" in "my_dataset", if it exists.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const datasetId = 'my_dataset';
    // const routineId = 'my_routine';

    const dataset = bigquery.dataset(datasetId);

    // Create routine reference
    let routine = dataset.routine(routineId);

    // Make API call
    [routine] = await routine.get();

    console.log(`Routine ${routineId} retrieved.`);
  }
  // [END bigquery_get_routine]
  getRoutine();
}
main(...process.argv.slice(2));

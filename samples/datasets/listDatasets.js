// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function main(projectId) {
  // [START bigquery_list_datasets_preview]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID'; // Optional: Defaults to the project ID of the client

  // Imports the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');

  // Creates a client
  const bigqueryClient = new BigQueryClient();

  async function listDatasets() {
    // Construct the request object.
    const request = {
      projectId: projectId,
    };

    try {
      // Make the API request.
      const iterable = bigqueryClient.listDatasetsAsync(request);
      console.log('Datasets:');
      for await (const dataset of iterable) {
        console.log('-' + dataset.id);
      }
    } catch (err) {
      console.error('ERROR listing datasets:', err);
      if (err.errors) {
        err.errors.forEach(e => console.error(e.message));
      }
    }
  }

  await listDatasets();
  // [END bigquery_list_datasets_preview]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

if (process.argv.length < 3) {
  console.log('Usage: node listDatasets.js [projectId]');
}
main(...process.argv.slice(2)).catch(console.error);

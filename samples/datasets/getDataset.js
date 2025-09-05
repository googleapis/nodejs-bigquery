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

async function main(projectId, datasetId, transport = 'grpc') {
  // [START bigquery_get_dataset_preview]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const datasetId = 'YOUR_DATASET_ID';

  // Imports the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');

  // Creates a client
  let bigqueryClient;
  if (transport === 'grpc') {
    bigqueryClient = new BigQueryClient();
  } else {
    bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}});
  }

  async function getDataset() {
    // Construct the request object.
    const request = {
      projectId: projectId,
      datasetId: datasetId,
    };

    try {
      // Make the API request.
      const [response] = await bigqueryClient.getDataset(request);
      console.log(`Dataset ${response.id} retrieved successfully.`);
      console.log('Details:', response);
    } catch (err) {
      console.error('ERROR getting dataset:', err);
      if (err.errors) {
        err.errors.forEach(e => console.error(e.message));
      }
    }
  }

  await getDataset();
  // [END bigquery_get_dataset_preview]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

if (process.argv.length < 4) {
  console.error('Usage: node getDataset.js <projectId> <datasetId>');
  process.exitCode = 1;
}
main(...process.argv.slice(2)).catch(console.error);

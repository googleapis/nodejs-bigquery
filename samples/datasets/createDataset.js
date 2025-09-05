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
async function main(projectId, datasetId, location = 'US', transport = 'grpc') {
  // [START bigquery_create_dataset_preview]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const datasetId = 'YOUR_DATASET_ID';
  // const location = 'US'; // Optional: Default is 'US'

  // Imports the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');
  let bigqueryClient;

  if (transport === 'grpc') {
    bigqueryClient = new BigQueryClient();
  } else {
    bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}});
  }
  async function createDataset() {
    // Construct the dataset resource.
    const dataset = {
      datasetReference: {
        datasetId: datasetId,
      },
      location: location,
    };

    // Construct the request object.
    const request = {
      projectId: projectId,
      dataset: dataset,
    };

    try {
      // Make the API request.
      const [response] = await bigqueryClient.insertDataset(request);
      console.log(`Dataset ${response.id} created successfully.`);
    } catch (err) {
      console.error('ERROR creating dataset:', err);
      if (err.errors) {
        err.errors.forEach(e => console.error(e.message));
      }
    }
  }

  await createDataset();
  // [END bigquery_create_dataset_preview]
}
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

if (process.argv.length < 4) {
  console.error(
    'Usage: node createDataset.js <projectId> <datasetId> [location]',
  );
  process.exitCode = 1;
}
main(...process.argv.slice(2)).catch(console.error);

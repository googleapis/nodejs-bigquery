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

async function main(projectId, datasetId, updateOption, transport = 'grpc') {
  // [START bigquery_update_dataset_description_preview]
  // [START bigquery_update_dataset_expiration_preview]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID'; // Optional: Defaults to the project ID of the client

  // Imports the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');

  // Creates a client
  let bigqueryClient;
  if (transport === 'grpc'){
    bigqueryClient = new BigQueryClient(); 
  }else{
    bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}})
  }
  // [END bigquery_update_dataset_expiration_preview]

  async function updateDatasetDescription() {
    const description = 'This is a new description';
    const datasetToUpdate = {
      projectId: projectId,
      datasetId: datasetId,
      datasetReference: {
        datasetId: datasetId,
      },
      description: {value: description},
    };
    // Construct the request object.
    const request = {
      projectId: projectId,
      datasetId: datasetId,
      dataset: datasetToUpdate,
    };

    try {
      // Make the API request.
      const [response] = await bigqueryClient.updateDataset(request);
      console.log(
        `Dataset ${response.id} description: ${response.description.value}`,
      );
    } catch (err) {
      console.error('ERROR updating dataset:', err);
      if (err.errors) {
        err.errors.forEach(e => console.error(e.message));
      }
    }
  }
  // [END bigquery_update_dataset_description_preview]

  // [START bigquery_update_dataset_expiration_preview]

  async function updateDatasetExpiration() {
    const expirationTime = 24 * 60 * 60 * 1000;
    const datasetToUpdate = {
      projectId: projectId,
      datasetId: datasetId,
      datasetReference: {
        datasetId: datasetId,
      },
      defaultTableExpirationMs: {value: expirationTime},
    };
    // Construct the request object.
    const request = {
      projectId: projectId,
      datasetId: datasetId,
      dataset: datasetToUpdate,
    };

    try {
      // Make the API request.
      const [response] = await bigqueryClient.updateDataset(request);
      console.log(
        `Dataset ${response.id} expiration: ${response.defaultTableExpirationMs.value}`,
      );
    } catch (err) {
      console.error('ERROR updating dataset:', err);
      if (err.errors) {
        err.errors.forEach(e => console.error(e.message));
      }
    }
  }
  // [END bigquery_update_dataset_expiration_preview]

  switch (updateOption) {
    case 'description':
      await updateDatasetDescription();
      break;
    case 'expiration':
      await updateDatasetExpiration();
      break;
    default:
      console.log(
        'Invalid update option - please choose "description" or "expiration"',
      );
  }
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

if (process.argv.length < 3) {
  console.log(
    'Usage: node updateDataset.js <projectId> <datasetId> <updateOption>',
  );
}
main(...process.argv.slice(2)).catch(console.error);

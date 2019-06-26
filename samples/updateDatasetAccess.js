/**
 * Copyright 2019 Google LLC
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

function main(datasetId) {
  // [START bigquery_update_dataset_access]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  async function updateDatasetAccess(
    datasetId = 'my_dataset' // Existing dataset
  ) {
    // Updates a datasets's access controls.

    // Create new role metadata
    const newRole = {
      role: 'READER',
      entity_type: 'userByEmail',
      userByEmail: 'sample.bigquery.dev@gmail.com',
    };

    // Create a client
    const bigqueryClient = new BigQuery();

    // Retreive current dataset metadata
    const dataset = bigqueryClient.dataset(datasetId);
    const [metadata] = await dataset.getMetadata();

    // Add new role to role acess array
    metadata.access.push(newRole);
    const [apiResponse] = await dataset.setMetadata(metadata);
    const newAccessRoles = apiResponse.access;
    newAccessRoles.forEach(role => console.log(role));
  }
  // [END bigquery_update_dataset_access]
  updateDatasetAccess(datasetId);
}
main(...process.argv.slice(2));

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

// sample-metadata:
//   title: BigQuery Update Model
//   description: Updates a model's metadata.
//   usage: node updateModel.js <DATASET_ID> <MODEL_ID>

function main(datasetId) {
  // [START bigquery_get_dataset_labels]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  async function getDatasetLabels(
    datasetId = 'my_dataset' // Existing dataset
  ) {
    // Gets labels on a dataset.

    // Create a client
    const bigqueryClient = new BigQuery();

    // Retrieve current dataset metadata.
    const dataset = bigqueryClient.dataset(datasetId);
    const [metadata] = await dataset.getMetadata();
    const labels = metadata.labels;

    console.log(`${datasetId} Labels:`);
    for (const [key, value] of Object.entries(labels)) {
      console.log(`${key}: ${value}`);
    }
  }
  // [END bigquery_get_dataset_labels]
  getDatasetLabels(datasetId);
}
main(...process.argv.slice(2));

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
  // [START bigquery_create_dataset]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  async function createDataset() {
    // Creates a new dataset named "my_dataset".

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const datasetId = "my_new_dataset";

    // Create a client
    const bigqueryClient = new BigQuery();

    // Specify the geographic location where the dataset should reside
    const options = {
      location: 'US',
    };

    // Create a new dataset
    const [dataset] = await bigqueryClient.createDataset(datasetId, options);
    console.log(`Dataset ${dataset.id} created.`);
  }

  createDataset();
  // [END bigquery_create_dataset]
}

main(...process.argv.slice(2));

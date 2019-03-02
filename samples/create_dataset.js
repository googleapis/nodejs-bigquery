/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

async function createDataset() {
  // Imports the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_new_dataset";

  // Creates a client
  const bigquery = new BigQuery({projectId});

  // Creates a new dataset
  await bigquery
    .createDataset(datasetId)
    .then(response => {
      console.log(`Dataset ${response[0].id} created.`);
    })
    .catch(error => {
      console.log(error.errors[0].message);
    });
}

createDataset();

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

// [START bigquery_list_datasets]
async function bigquery_list_datasets(PROJECT_ID = 'YOUR_PROJECT_ID') {
  // Imports the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  // Creates a client
  const bigquery = new BigQuery({PROJECT_ID});

  // Lists all datasets in the specified project
  await bigquery
    .getDatasets()
    .then(response => {
      console.log('Datasets:');
      response[0].forEach(dataset => console.log(dataset.id));
    })
    .catch(error => {
      console.log(error);
    });
}
// [END bigquery_list_datasets]

bigquery_list_datasets(...process.argv.slice(2));

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

function main(datasetId, tableId) {
  // [START bigquery_create_table]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  async function createTable(
    datasetId = 'my_dataset', // Existing dataset
    tableId = 'my_new_table' // Table to be created
  ) {
    // Creates a new table named "my_table" in "my_dataset".

    const schema = 'Name:string, Age:integer, Weight:float, IsMagic:boolean';

    // Create a client
    const bigqueryClient = new BigQuery();

    // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
    const options = {
      schema: schema,
      location: 'US',
    };

    // Create a new table in the dataset
    const [table] = await bigqueryClient
      .dataset(datasetId)
      .createTable(tableId, options);

    console.log(`Table ${table.id} created.`);
  }
  // [END bigquery_create_table]
  createTable(datasetId, tableId);
}
main(...process.argv.slice(2));

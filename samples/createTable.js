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

async function createTable(datasetId, tableId, schema) {
  // Creates a new table named "my_table" in "my_dataset".

  // [START bigquery_create_table]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  /**
   * TODO(developer): Uncomment the following lines before running the sample
   */
  // const datasetId = "my_new_dataset";
  // const tableId = "my_new_table";
  // const schema = "Name:string, Age:integer, Weight:float, IsMagic:boolean";

  // Create a client
  const bigquery = new BigQuery();

  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  const options = {
    schema: schema,
    location: 'US',
  };

  // Create a new table in the dataset
  const [table] = await bigquery
    .dataset(datasetId)
    .createTable(tableId, options);

  console.log(`Table ${table.id} created.`);
  // [END bigquery_create_table]
}

createTable(...process.argv.slice(2)).catch(console.error);

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

async function browseRows(datasetId, tableId) {
  // Displays rows from "my_table" in "my_dataset".

  // [START bigquery_browse_table]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const datasetId = "my_dataset";
  // const tableId = "my_table";

  // Create a client
  const bigquery = new BigQuery();

  // List rows in the table
  const [rows] = await bigquery
    .dataset(datasetId)
    .table(tableId)
    .getRows();

  console.log('Rows:');
  rows.forEach(row => console.log(row));
  // [END bigquery_browse_table]
}

browseRows(...process.argv.slice(2)).catch(console.error);

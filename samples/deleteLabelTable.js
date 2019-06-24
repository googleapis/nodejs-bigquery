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
  // [START bigquery_delete_label_table]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  async function deleteLabelTable(
    datasetId = 'funtimes123', // Existing dataset
    tableId = 'testing' // Existing table
  ) {
    // Deletes a label from an existing table.
    // This example dataset starts with existing label { color: 'green' }

    // Create a client
    const bigqueryClient = new BigQuery();

    const dataset = bigqueryClient.dataset(datasetId);
    const [table] = await dataset.table(tableId).get();

    // Retrieve current table metadata
    const [metadata] = await table.getMetadata();

    // Add label to table metadata
    metadata.labels = {color: null};
    const [apiResponse] = await table.setMetadata(metadata);

    console.log(`${tableId} labels:`);
    console.log(apiResponse.labels);
  }
  // [END bigquery_delete_label_table]
  deleteLabelTable(datasetId, tableId);
}
main(...process.argv.slice(2));

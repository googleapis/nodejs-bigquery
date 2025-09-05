// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

function main(
  datasetId = 'my_dataset', // Existing dataset
  tableId = 'my_new_table', // Table to be created
  schema = [
    {name: 'Name', type: 'STRING', mode: 'REQUIRED'},
    {name: 'Age', type: 'INTEGER'},
    {name: 'Weight', type: 'FLOAT'},
    {name: 'IsMagic', type: 'BOOLEAN'},
  ],
  transport = 'grpc'
) {
  // [START bigquery_create_table_preview]
  // Import the Google Cloud client library and create a client
  const {BigQueryClient} = require('@google-cloud/bigquery');

  let bigqueryClient;
  if (transport==='grpc'){
    bigqueryClient = new BigQueryClient()
  }else{
    bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}})
  }

  async function createTable() {
    // Creates a new table named "my_table" in "my_dataset".

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const datasetId = "my_dataset";
    // const tableId = "my_table";
    /* const schema = [
      {name: 'Name', type: 'STRING', mode: 'REQUIRED'},
      {name: 'Age', type: 'INTEGER'},
      {name: 'Weight', type: 'FLOAT'},
      {name: 'IsMagic', type: 'BOOLEAN'},
    ]; */

    const projectId = await bigqueryClient.tableClient.getProjectId();

    // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
    const request = {
      projectId,
      datasetId,
      table: {
        tableReference: {
          projectId,
          datasetId,
          tableId,
        },
        schema: {fields: schema},
        location: 'US',
      },
    };

    // Create a new table in the dataset
    const [table] = await bigqueryClient.insertTable(request);

    console.log(`Table ${table.tableReference.tableId} created.`);
  }
  // [END bigquery_create_table_preview]
  createTable();
}
main(...process.argv.slice(2));

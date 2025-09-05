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
  datasetId = 'my_dataset',
  tableId = 'my_table',
  transport = 'grpc',
) {
  // [START bigquery_get_table_preview]
  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');

  let bigqueryClient;
  if (transport === 'grpc') {
    bigqueryClient = new BigQueryClient();
  } else {
    bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}});
  }

  async function getTable() {
    // Retrieves table named "my_table" in "my_dataset".

    const projectId = await bigqueryClient.tableClient.getProjectId();
    /**
     * TODO(developer): Uncomment the following lines before running the sample
     */
    // const datasetId = "my_dataset";
    // const tableId = "my_table";

    const request = {
      projectId: projectId,
      datasetId: datasetId,
      tableId: tableId,
    };

    const [table] = await bigqueryClient.getTable(request);

    console.log('Table:');
    console.log(table.id);
  }
  getTable();
  // [END bigquery_get_table_preview]
}
main(...process.argv.slice(2));

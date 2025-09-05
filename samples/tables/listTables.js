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
function main(datasetId = 'my_dataset', transport = 'grpc') {
  // [START bigquery_list_tables_preview]
  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');

  let bigqueryClient;
  if (transport === 'grpc') {
    bigqueryClient = new BigQueryClient();
  } else {
    bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}});
  }

  async function listTables() {
    // Lists tables in 'my_dataset'.

    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const datasetId = 'my_dataset';
    const projectId = await bigqueryClient.tableClient.getProjectId();

    const request = {
      projectId,
      datasetId,
    };

    // List all tables in the dataset
    // limit results to 10
    const maxResults = 10;
    const iterable = bigquery.listTablesAsync(request);
    console.log('Tables:');
    let i = 0;
    for await (const table of iterable) {
      if (i >= maxResults) {
        break;
      }
      console.log(table.id);
      i++;
    }
  }
  // [END bigquery_list_tables_preview]
  listTables();
}

main(...process.argv.slice(2));

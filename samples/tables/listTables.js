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
function main(datasetId = 'my_dataset') {
  // [START bigquery_list_tables_preview]
  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');
  //TODO(coleleah): remove fallback: false if needed
  // tracked in b/429226336
  const bigquery = new BigQueryClient({}, {opts: {fallback: false}});

  async function listTables() {
    // Lists tables in 'my_dataset'.

    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    // const datasetId = 'my_dataset';
    const projectId = await bigquery.tableClient.getProjectId();

    const request = {
      projectId,
      datasetId,
    };

    // List all tables in the dataset
    const [tables] = await bigquery.listTables(request);

    console.log('Tables:');
    tables.forEach(table => console.log(table.tableReference.tableId));
  }
  // [END bigquery_list_tables_preview]
  listTables();
}

main(...process.argv.slice(2));

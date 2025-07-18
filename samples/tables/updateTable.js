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
function main(datasetId = 'my_dataset', tableId = 'my_table') {
  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');
  //TODO(coleleah): remove fallback: false if needed
  // tracked in b/429226336
  const bigquery = new BigQueryClient({}, {opts: {fallback: false}});

  async function updateTableDescription() {
    // Updates a table's description.
    const projectId = await bigquery.tableClient.getProjectId();

    // Set new table description
    const description = {value: 'New table description.'};

    const request = {
      projectId: projectId,
      datasetId: datasetId,
      tableId: tableId,
      table: {
        tableReference: {tableId: tableId},
        description: description,
      },
    };

    const [response] = await bigquery.updateTable(request);

    console.log(`${tableId} description: ${response.description.value}`);
  }
  updateTableDescription();
}
main(...process.argv.slice(2));

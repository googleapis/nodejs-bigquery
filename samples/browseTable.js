// Copyright 2020 Google LLC
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
  tableId = 'my_table' // Existing table
) {
  // [START bigquery_browse_table]
  // Import the Google Cloud client library using default credentials
  const {BigQuery} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  async function browseTable() {
    // Retrieve a table's rows using manual pagination.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const datasetId = 'my_dataset'; // Existing dataset
    // const tableId = 'my_table'; // Existing table

    // Create table reference.
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);

    function manualPaginationCallback(err, rows, nextQuery) {
      console.log('Rows:');
      rows.forEach(row => console.log(row));

      if (nextQuery) {
        // More results exist.
        table.getRows(nextQuery, manualPaginationCallback);
      }
    }

    // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tabledata/list
    const options = {
      autoPaginate: false,
      maxResults: 10,
    };

    // Retrieve rows.
    table.getRows(options, manualPaginationCallback);
  }
  // [END bigquery_browse_table]
  browseTable();
}
main(...process.argv.slice(2));

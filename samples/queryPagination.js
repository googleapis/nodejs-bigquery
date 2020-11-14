// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

function main(
  datasetId = 'my_dataset', // Existing dataset
  tableId = 'my_new_table'
) {
  // [START bigquery_query_pagination]
  // Import the Google Cloud client library using default credentials
  const {BigQuery} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  async function queryPagination() {
    // Run a query with a destination table and get rows using automatic pagination.

    const query = `SELECT name, SUM(number) as total_people
    FROM \`bigquery-public-data.usa_names.usa_1910_2013\`
    GROUP BY name
    ORDER BY total_people DESC`;

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const datasetId = 'my_dataset'; // Existing dataset
    // const tableId = 'my_new_table';

    // Create destination table reference.
    const dataset = bigquery.dataset(datasetId);
    const destinationTable = dataset.table(tableId);

    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
    const queryOptions = {
      query: query,
      destination: destinationTable,
    };

    // Run the query as a job.
    const [job] = await bigquery.createQueryJob(queryOptions);

    // Wait for job to complete.
    await job.getQueryResults();

    // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tabledata/list
    const getRowsOptions = {
      maxResults: 20,
    };

    // Get rows.
    const [rows] = await destinationTable.getRows(getRowsOptions);

    console.log('Rows:');
    rows.forEach(row => {
      console.log(row);
    });
  }
  // [END bigquery_query_pagination]
  queryPagination();
}
main(...process.argv.slice(2));

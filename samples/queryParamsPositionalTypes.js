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
  projectId = 'my_project',
  datasetId = 'my_dataset',
  tableId = 'my_table'
) {
  // [START bigquery_query_params_positional_types]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  async function queryParamsPositionalTypes() {
    // Run a query using positional query parameters and provided parameter types.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // projectId = 'my_project';
    // const datasetId = 'my_dataset';
    // const tableId = 'my_table';

    // Describe the schema of the table
    // For more information on supported data types, see
    // https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types
    const schema = [
      {
        name: 'name',
        type: 'STRING',
      },
      {
        name: 'age',
        type: 'INT64',
      },
    ];
    const tableOptions = {
      schema: schema,
    };

    // Create a new table in the dataset
    const [table] = await bigquery
      .dataset(datasetId)
      .createTable(tableId, tableOptions);

    console.log(`Table ${table.id} created.`);

    // The SQL query to run
    const sqlQuery = `SELECT name , age
          FROM \`${projectId}.${datasetId}.${tableId}\`
          WHERE name IN UNNEST(?)`;

    const queryOptions = {
      query: sqlQuery,
      params: [[['jane', 'bob', 'sally']]],
      types: [['STRING']],
    };

    // Run the query
    const [rows] = await bigquery.query(queryOptions);

    console.log('Rows:');
    rows.forEach(row => console.log(row));
  }
  // [END bigquery_query_params_positional_types]
  queryParamsPositionalTypes();
}
main(...process.argv.slice(2));

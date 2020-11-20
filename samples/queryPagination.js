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

function main() {
  // [START bigquery_query_pagination]
  // Import the Google Cloud client library using default credentials
  const {BigQuery} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  async function queryPagination() {
    // Run a query and get rows using automatic pagination.

    const query = `SELECT name, SUM(number) as total_people
    FROM \`bigquery-public-data.usa_names.usa_1910_2013\`
    GROUP BY name
    ORDER BY total_people DESC`;

    // Run the query as a job.
    const [job] = await bigquery.createQueryJob(query);

    // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/getQueryResults
    const options = {
      maxResults: 20,
    };

    // Wait for job to complete and get rows.
    const [rows] = await job.getQueryResults(options);

    console.log('Query results:');
    rows.forEach(row => {
      console.log(`name: ${row.name}, ${row.total_people} total people`);
    });
  }
  queryPagination();
  // [END bigquery_query_pagination]
}
main(...process.argv.slice(2));

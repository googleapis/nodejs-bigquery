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

// [START bigquery_auth_user_flow]
// [START bigquery_auth_user_query]
const sampleClient = require('./sampleClient');

async function query(credentials) {
  const {BigQuery} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery(credentials);

  // Queries the U.S. given names dataset for the state of Texas.
  const query = `SELECT name, SUM(number) as total
  FROM \`bigquery-public-data.usa_names.usa_1910_current\`
  WHERE name = 'William'
  GROUP BY name;`;

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs/query
  const options = {
    query: query,
  };

  // Run the query as a job
  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);

  // Wait for the query to finish
  const [rows] = await job.getQueryResults();

  // Print the results
  console.log('Rows:');
  rows.forEach(row => console.log(row));

  return rows;
}

async function run() {
  await sampleClient.authenticate(['https://www.googleapis.com/auth/bigquery']);
  const credentials = sampleClient.oAuth2Client.credentials;
  return query(credentials);
}

// run();
module.exports = {run};

// [END bigquery_auth_user_query]
// [END bigquery_auth_user_flow]

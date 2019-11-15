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

// const projectId = 'google.com:bq-rampup'

// [START bigquery_auth_user_flow]
function authFlow(keyPath = './oauth2.keys.json', projectId = 'projectId') {
  /**
   * TODO(developer):
   * Save Project ID as environment variable PROJECT_ID="project_id"
   *
   *
   * Obtain a refresh token by following instructions at
   * https://github.com/googleapis/google-auth-library-nodejs
   *
   * Once a refresh token is obtained,
   * save as environment variable REFRESH_TOKEN='my_refresh_token'
   *
   * Uncomment the following line before running the sample.
   */
  // const projectId = process.env.PROJECT_ID;
  const keys = require(keyPath);

  const credentials = {
    type: 'authorized_user',
    client_id: keys.installed.client_id,
    client_secret: keys.installed.client_secret,
    refresh_token: process.env.REFRESH_TOKEN,
  };

  return {
    projectId,
    credentials,
  };
}
// [END bigquery_auth_user_flow]
// [START bigquery_auth_user_query]
async function query() {
  const {BigQuery} = require('@google-cloud/bigquery');
  const credentials = main.authFlow();
  const bigquery = new BigQuery(credentials);
  // Queries the U.S. given names dataset for the state of Texas.
  const query = ` SELECT name, SUM(number) as total
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
const main = {
  query,
  authFlow,
};
module.exports = {
  main,
};
// [END bigquery_auth_user_query]

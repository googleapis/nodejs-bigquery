6/**
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
function authFlow(keyPath = './oauth2.keys.json') {
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = projectId
  // const keys = require(keyPath);
  /**
   * TODO(developer):
   * Obtain a refresh token by following instructions at
   * https://github.com/googleapis/google-auth-library-nodejs
   *
   * Once a refresh token is obtained,
   * save as environment variable REFRESH_TOKEN='my_refresh_token'
   *
   * Uncomment the following lines before running the sample.
   */
  const credentials = {
    type: 'authorized_user',
    client_id: keys.installed.client_id,
    client_secret: keys.installed.client_secret,
    refresh_token: process.env.REFRESH_TOKEN
  }

  return credentials
}
// [END bigquery_auth_user_flow]

async function query(projectId) {
  const credentials = authFlow()
// [START bigquery_auth_user_query]
const {BigQuery} = require('@google-cloud/bigquery');

const bigquery = new BigQuery({
  projectId,
  credentials
});
  // Queries the U.S. given names dataset for the state of Texas.
  const query = `SELECT name
          FROM \`bigquery-public-data.usa_names.usa_1910_2013\`
          WHERE state = 'TX'
          LIMIT 100`;

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
}
// [END bigquery_auth_user_query]
// query(projectId);
module.exports = {
  query,
  authFlow
};

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

const {OAuth2Client} = require('google-auth-library');
const readline = require('readline');

function startRl() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return rl;
}

// Download your OAuth2 configuration from the Google
const keys = require('./oauth2.keys.json');

/**
 * Create a new OAuth2Client, and go through the OAuth2 content
 * workflow. Return the full client to the callback.
 */
async function getRedirectUrl() {
  const rl = main.startRl();
  // Create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
  // which should be downloaded from the Google Developers Console.
  const oAuth2Client = new OAuth2Client(
    keys.installed.client_id,
    keys.installed.client_secret,
    keys.installed.redirect_uris[0]
  );

  // Generate the url that will be used for the consent dialog.
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/bigquery',
    prompt: 'consent',
  });

  console.info(
    `Please visit this URL to authorize this application: ${authorizeUrl}`
  );
  rl.question('Enter the authorization code: ', function(code) {
    rl.close();
    return main.exchangeCode(code);
  });
}

// Exchange an authorization code for an access token
async function exchangeCode(code) {
  // Which should be downloaded from the Google Developers Console.
  const oAuth2Client = new OAuth2Client(
    keys.installed.client_id,
    keys.installed.client_secret,
    keys.installed.redirect_uris[0]
  );

  try {
    const r = await oAuth2Client.getToken(code);
    console.info(r.tokens);
    return r.tokens;
  } catch (err) {
    console.log(err);
  }
}

// [START bigquery_auth_user_flow]
async function authFlow(projectId = 'project_id') {
  /**
   * TODO(developer):
   * Save Project ID as environment variable PROJECT_ID="project_id"
   * Uncomment the following line before running the sample.
   */
  // const projectId = process.env.PROJECT_ID;
  const tokens = await main.getRedirectUrl();

  const credentials = {
    type: 'authorized_user',
    client_id: keys.installed.client_id,
    client_secret: keys.installed.client_secret,
    refresh_token: tokens.refresh_token,
  };

  return {
    projectId,
    credentials,
  };
}
// [END bigquery_auth_user_flow]
// [START bigquery_auth_user_query]
async function query(credentials) {
  const {BigQuery} = require('@google-cloud/bigquery');
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
  try {
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} started.`);

    // Wait for the query to finish
    const [rows] = await job.getQueryResults();

    // Print the results
    console.log('Rows:');
    rows.forEach(row => console.log(row));

    return rows;
  } catch (err) {
    console.log(err);
  }
}

async function run() {
  const credentials = await main.authFlow();
  main.query(credentials);
}

const main = {
  query,
  authFlow,
  exchangeCode,
  getRedirectUrl,
  startRl,
};
module.exports = {
  main,
};

run()
// [END bigquery_auth_user_query]

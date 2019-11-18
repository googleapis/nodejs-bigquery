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
const puppeteer = require('puppeteer');
const url = require('url');
const http = require('http');

// Download your OAuth2 configuration from the Google
const keys = require('./oauth2.keys.json');

/**
 * Keep a config.keys.json with a username and password
 * that correspond to your test google account:
 * {
 *   "username": "your-user-name@gmail.com",
 *   "password": "your-password"
 * }
 */
const config = require('./config.keys.json');

/**
 *
 * Obtain a refresh token.
 *
 * Once a refresh token is obtained, save as
 * environment variable REFRESH_TOKEN='my_refresh_token'
 */
async function retrieveTokens() {
  const oAuth2Client = await main.getAuthenticatedClient();
  const url = 'https://people.googleapis.com/v1/people/me?personFields=names';
  const res = await oAuth2Client.request({url});
  console.log(res.data);
}

function getAuthenticatedClient() {
  let browser = null;
  return new Promise(resolve => {
    // Create an oAuth client to authorize the API call.
    // Secrets are kept in a `keys.json` file,
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

    // Open an http server to accept the oauth callback. In this simple example, the
    // only request to our webserver is to /oauth2callback?code=<code>
    const server = http
      .createServer(async (req, res) => {
        if (req.url.indexOf('/oauth2callback') > -1) {
          // acquire the code from the querystring, and close the web server.
          const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
          const code = qs.get('code');
          console.log(`Code is ${code}`);
          res.end('Authentication successful! Please return to the console.');
          server.close();

          // Now that we have the code, use that to acquire tokens.
          const r = await oAuth2Client.getToken(code);
          // Make sure to set the credentials on the OAuth2 client.
          oAuth2Client.setCredentials(r.tokens);
          console.info('Tokens acquired.');
          console.log(r.tokens);
          await browser.close();
          resolve(oAuth2Client);
        }
      })
      .listen(3000, async () => {
        // open the browser to the authorize url to start the workflow
        browser = await doLogin(authorizeUrl);
      });
  });
}

/**
 * Use the puppeteer library to sign into Google
 */
async function doLogin(authorizeUrl) {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(authorizeUrl);
  await page.mainFrame().waitForSelector('#identifierId');
  console.log('typing email...');
  await page.type('#identifierId', config.username);
  await page.mainFrame().waitForSelector('#identifierNext');
  console.log('clicking next button...');
  await page.click('#identifierNext');
  console.log('waiting for password field...');
  await page
    .mainFrame()
    .waitForSelector('#password input[type="password"]', {visible: true});
  console.log('typing password...');
  await page.type('#password input[type="password"]', config.password, {
    delay: 100,
  });
  console.log('clicking sign in button...');
  await page.click('#passwordNext', {delay: 100});
  return browser;
}

// [START bigquery_auth_user_flow]
function authFlow(projectId = 'project_id') {
  /**
   * TODO(developer):
   * Save Project ID as environment variable PROJECT_ID="project_id"
   * Uncomment the following line before running the sample.
   */
  // const projectId = process.env.PROJECT_ID;

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

// retrieveTokens();
// query();

const main = {
  query,
  authFlow,
  retrieveTokens,
  getAuthenticatedClient,
};
module.exports = {
  main,
};
// [END bigquery_auth_user_query]

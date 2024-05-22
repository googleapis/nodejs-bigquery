// Copyright 2017 Google LLC
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

const {GoogleAuth, OAuth2Client} = require('google-auth-library');

function main(datasetName) {
  // [START bigquery_tpc_quickstart]
  // Imports the Google Cloud client library
  const {BigQuery} = require('./build/src');

  async function testTPC() {
    // Creates a client
    //const projectId = 'google-tpc-testing-environment:cloudsdk-test-project';
    const projectId = 'google-tpc-testing-environment:cloudsdk-wrong-project';
    const universeDomain = 'apis-tpclp.goog';
    const location = 'tpcl-us-central13';

    const bigqueryClient = new BigQuery({
      location,
      universeDomain,
      projectId,
    });

    const universe = await bigqueryClient.authClient.getUniverseDomain();
    console.log('Universe from auth client', universe);

    const [dataset] = await bigqueryClient.createDataset(datasetName);
    console.log(`Dataset ${dataset.id} created.`);

    const [datasets] = await bigqueryClient.getDatasets();
    console.log('Datasets:');
    datasets.forEach(dataset => console.log(dataset.id));

    const ds = await bigqueryClient.dataset(datasetName);
    await ds.delete();
    console.log(`Dataset ${datasetName} deleted.`);

    const [rows] = await bigqueryClient.query({
      query: 'SELECT SESSION_USER() whoami',
    });
    console.log('Rows:');
    rows.forEach(row => console.log(row));
  }

  testTPC();
  // [END bigquery_tpc_quickstart]
}

const args = process.argv.slice(2);
main(...args);

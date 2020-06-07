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

function main() {
  // [START bigquery_query_stream]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  async function query() {
    // Create a client
    const bigquery = new BigQuery();

    const query = `SELECT name
      FROM \`bigquery-public-data.usa_names.usa_1910_2013\` LIMIT 100`;

    const options = {
      query: query,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'US',
    };

    // Run the query
    bigquery
      .createQueryStream(options)
      .on('error', console.error)
      .on('data', row => {
        console.log('Row:', row);
      })
      .on('end', () => {
        console.log('End');
      });
  }
  // [END bigquery_query_stream]
  query();
}

main(...process.argv.slice(2));

/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function queryStackOverflow() {
  // [START bigquery_simple_app_all]
  // [START bigquery_simple_app_deps]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');
  // [END bigquery_simple_app_deps]

  // [START bigquery_simple_app_client]
  // Creates a client
  const bigquery = new BigQuery();
  // [END bigquery_simple_app_client]

  // [START bigquery_simple_app_query]
  // The SQL query to run
  const sqlQuery = `SELECT
    CONCAT(
      'https://stackoverflow.com/questions/',
      CAST(id as STRING)) as url,
    view_count
    FROM \`bigquery-public-data.stackoverflow.posts_questions\`
    WHERE tags like '%google-bigquery%'
    ORDER BY view_count DESC
    LIMIT 10`;

  const options = {
    query: sqlQuery,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
  };

  // Runs the query
  const [rows] = await bigquery.query(options);
  // [END bigquery_simple_app_query]

  // [START bigquery_simple_app_print]
  console.log('Query Results:');
  rows.forEach(row => {
    const url = row['url'];
    const viewCount = row['view_count'];
    console.log(`url: ${url}, ${viewCount} views`);
  });
  // [END bigquery_simple_app_print]
}
// [END bigquery_simple_app_all]

async function query() {
  // [START bigquery_query]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // Creates a client
  const bigquery = new BigQuery();

  const query = `SELECT name
    FROM \`bigquery-public-data.usa_names.usa_1910_2013\`
    WHERE state = 'TX'
    LIMIT 100`
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
  };

  // Runs the query as a job
  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);

  // Waits for the query to finish
  const [rows] = await job.getQueryResults();

  // Prints the results
  console.log('Rows:');
  rows.forEach(row => console.log(row));
  // [END bigquery_query]
}

async function queryDisableCache() {
  // [START bigquery_query_no_cache]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  // Creates a client
  const bigquery = new BigQuery();

  const query = `SELECT corpus
    FROM \`bigquery-public-data.samples.shakespeare\`
    GROUP BY corpus;`
  const options = {
    query: query,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
    useQueryCache: false,
  };

  // Runs the query as a job
  const [job] = await bigquery.createQueryJob(options);
  console.log(`Job ${job.id} started.`);

  // Waits for the query to finish
  const [rows] = await job.getQueryResults();

  // Prints the results
  console.log('Rows:');
  rows.forEach(row => console.log(row));
  // [END bigquery_query_no_cache]
}

require(`yargs`)
  .demand(1)
  .command(
    `stackoverflow`,
    `Queries a public Stack Overflow dataset.`,
    {},
    opts => queryStackOverflow()
  )
  .command(
    `query`,
    `Queries the US Names dataset.`,
    {},
    opts => query()
  )
  .command(
    `disable-cache`,
    `Queries the Shakespeare dataset with the cache disabled.`,
    {},
    opts => queryDisableCache()
  )
  .example(
    `node $0 stackoverflow`,
    `Queries a public Stackoverflow dataset.`
  )
  .example(
    `node $0 query`,
    `Queries the US Names dataset.`
  )
  .example(
    `node $0 disable-cache`,
    `Queries the Shakespeare dataset with the cache disabled.`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/bigquery/docs`)
  .help()
  .strict().argv;

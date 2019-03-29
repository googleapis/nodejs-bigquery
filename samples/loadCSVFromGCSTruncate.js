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

function main(datasetId, tableId) {
  // [START bigquery_load_table_gcs_csv_truncate]
  // Import the Google Cloud client libraries
  const {BigQuery} = require('@google-cloud/bigquery');
  const {Storage} = require('@google-cloud/storage');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const datasetId = "my_dataset";
  // const tableId = "my_table";

  /**
   * This sample loads the CSV file at
   * https://storage.googleapis.com/cloud-samples-data/bigquery/us-states/us-states.csv
   *
   * TODO(developer): Replace the following lines with the path to your file.
   */
  const bucketName = 'cloud-samples-data';
  const filename = 'bigquery/us-states/us-states.csv';

  async function loadCSVFromGCSTruncate() {
    /**
     * Imports a GCS file into a table and overwrites
     * table data if table already exists.
     */

    // Instantiate clients
    const bigqueryClient = new BigQuery();
    const storageClient = new Storage();

    // Configure the load job. For full list of options, see:
    // https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs#configuration.load
    const metadata = {
      sourceFormat: 'CSV',
      skipLeadingRows: 1,
      schema: {
        fields: [
          {name: 'name', type: 'STRING'},
          {name: 'post_abbr', type: 'STRING'},
        ],
      },
      // Set the write disposition to overwrite existing table data.
      writeDisposition: 'WRITE_TRUNCATE',
      location: 'US',
    };

    // Load data from a Google Cloud Storage file into the table
    const [job] = await bigqueryClient
      .dataset(datasetId)
      .table(tableId)
      .load(storageClient.bucket(bucketName).file(filename), metadata);
    // load() waits for the job to finish
    console.log(`Job ${job.id} completed.`);

    // Check the job's status for errors
    const errors = job.status.errors;
    if (errors && errors.length > 0) {
      throw errors;
    }
  }
  loadCSVFromGCSTruncate();
  // [END bigquery_load_table_gcs_csv_truncate]
}
main(...process.argv.slice(2));

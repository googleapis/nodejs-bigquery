// Copyright 2019 Google LLC
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

// sample-metadata:
//   title: Delete Label Dataset
//   description: Deletes a label on a dataset.
//   usage: node deleteLabelDataset.js <DATASET_ID>

function main(
  datasetId = 'my_dataset', // Existing dataset
) {
  // [START bigquery_delete_label_dataset]
  // Import the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();

  async function deleteLabelDataset() {
    // Deletes a label on a dataset.
    // This example dataset starts with existing label { color: 'green' }

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const datasetId = 'my_dataset';

    // Retrieve current dataset metadata.
    const dataset = bigquery.dataset(datasetId);
    const [metadata] = await dataset.getMetadata();

    // Add label to dataset metadata
    metadata.labels = {color: null};
    const [apiResponse] = await dataset.setMetadata(metadata);

    console.log(`${datasetId} labels:`);
    console.log(apiResponse.labels);
  }
  // [END bigquery_delete_label_dataset]
  deleteLabelDataset();
}
main(...process.argv.slice(2));

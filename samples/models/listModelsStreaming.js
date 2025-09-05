// Copyright 2025 Google LLC
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
//   title: BigQuery List Models Streaming
//   description: Lists all existing models in the dataset using streaming method.
//   usage: node listModelsStreaming.js <DATASET_ID>

function main(
  projectId = 'my_project',
  datasetId = 'my_dataset',
  transport = 'grpc',
) {
  // [START bigquery_list_models_streaming_preview]

  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');

  async function listModels() {
    // Lists all existing models in the dataset using streaming method.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const datasetId = "my_dataset";

    let bigqueryClient;
    if (transport === 'grpc') {
      bigqueryClient = new BigQueryClient();
    } else {
      bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}});
    }

    const request = {
      projectId: projectId,
      datasetId: datasetId,
    };

    const stream = bigqueryClient.listModelsStream(request);
    console.log('Models:');

    stream.on('error', err => {
      console.error(err);
    });

    stream
      .on('data', model => {
        console.log(model);
      })
      .on('end', () => {
        console.log('All models have been retrieved.');
      });
  }

  // [END bigquery_list_models_streaming_preview]
  listModels();
}

main(...process.argv.slice(2));

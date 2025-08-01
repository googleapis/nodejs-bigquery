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
//   title: BigQuery Update Model
//   description: Updates a model's metadata.
//   usage: node updateModel.js <DATASET_ID> <MODEL_ID>
//TODO(coleleah): update

function main(datasetId = 'my_datset', modelId = 'my_model') {
  // [START bigquery_update_model_description]
  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');

  async function updateModel() {
    // Updates a model's metadata.

    /**
     * TODO(developer): Uncomment the following lines before running the sample
     */
    // const datasetId = "my_dataset";
    // const modelId = "my__model";

    const metadata = {
      description: 'A really great model.',
    };

    const bigqueryClient = new BigQueryClient();

    const request = {
      projectId: bigqueryClient.projectId,
      datasetId: datasetId,
      modelId: modelId,
      model: {
        description: metadata.description,
      },
    };

    const [model] = await bigqueryClient.patchModel(request);

    console.log(`${modelId} description: ${model.description}`);
  }
  // [END bigquery_update_model_description]
  updateModel();
}

main(...process.argv.slice(2));

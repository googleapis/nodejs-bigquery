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

function main(
  projectId = 'my_project',
  datasetId = 'my_dataset',
  modelId = 'my_existing_model',
  transport = 'grpc',
) {
  // [START bigquery_get_model_preview]
  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');

  async function getModel() {
    // Retrieves model named "my_existing_model" in "my_dataset".

    /**
     * TODO(developer): Uncomment the following lines before running the sample
     */
    // const datasetId = "my_dataset";
    // const modelId = "my_existing_model";

    let bigqueryClient;
    if (transport === 'grpc') {
      bigqueryClient = new BigQueryClient();
    } else {
      bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}});
    }

    const request = {
      projectId: projectId,
      datasetId: datasetId,
      modelId: modelId,
    };

    const [model] = await bigqueryClient.getModel(request);

    console.log('Model:');
    console.log(model);
  }
  // [END bigquery_get_model_preview]
  getModel();
}
main(...process.argv.slice(2));

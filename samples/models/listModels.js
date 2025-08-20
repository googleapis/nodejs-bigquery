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

function main(projectId = 'my_project', datasetId = 'my_dataset') {
  // [START bigquery_list_models]

  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');

  async function listModels() {
    // Lists all existing models in the dataset.

    /**
     * TODO(developer): Uncomment the following lines before running the sample.
     */
    // const datasetId = "my_dataset";

    const bigqueryClient = new BigQueryClient();

    const request = {
      projectId: projectId,
      datasetId: datasetId,
    };

    const [models] = await bigqueryClient.listModels(request);

    if (models && models.length > 0) {
      console.log('Models:');
      models.forEach(model => console.log(model));
    } else {
      console.log(`No models found in dataset ${datasetId}.`);
    }
  }
  // [END bigquery_list_models]
  listModels();
}

main(...process.argv.slice(2));

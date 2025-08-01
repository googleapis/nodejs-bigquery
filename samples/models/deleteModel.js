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
//TODO(coleleah): update

function main(datasetId = 'my_dataset', modelId = 'my_model') {
  // [START bigquery_delete_model]
  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');

  async function deleteModel() {
    // Deletes a model named "my_model" from "my_dataset".

    /**
     * TODO(developer): Uncomment the following lines before running the sample
     */
    // const datasetId = "my_dataset";
    // const modelId = "my_model";

    const bigqueryClient = new BigQueryClient();

    const request = {
      projectId: bigqueryClient.projectId,
      datasetId: datasetId,
      modelId: modelId,
    };

    await bigqueryClient.deleteModel(request);

    console.log(`Model ${modelId} deleted.`);
  }
  // [END bigquery_delete_model]
  deleteModel();
}
main(...process.argv.slice(2));

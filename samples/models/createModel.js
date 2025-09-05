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
  modelId = 'my_model',
  transport = 'grpc'
) {
  // [START bigquery_create_model_preview]
  // Import the Google Cloud client library
  const {setInterval} = require('node:timers/promises');
  const {BigQueryClient} = require('@google-cloud/bigquery');
  let bigqueryClient;
  if (transport==='grpc'){
    bigqueryClient = new BigQueryClient()
  }else{
    bigqueryClient = new BigQueryClient({}, {opts: {fallback: true}})
  }

  async function createModel() {
    // Creates a model named "my_model" in "my_dataset".

    /**
     * TODO(developer): Uncomment the following lines before running the sample
     */
    // const datasetId = "my_dataset";
    // const modelId = "my_model";

    const query = `CREATE OR REPLACE MODEL \`${projectId}.${datasetId}.${modelId}\`
    OPTIONS (
			model_type='linear_reg',
			max_iterations=1,
			learn_rate=0.4,
			learn_rate_strategy='constant'
		) AS (
			SELECT 'a' AS f1, 2.0 AS label
			UNION ALL
			SELECT 'b' AS f1, 3.8 AS label
		)`;

    const request = {
      projectId: projectId,
      job: {
        configuration: {
          query: {
            query: query,
            useLegacySql: {value: false},
          },
        },
      },
    };

    // Run query to create a model
    const [jobResponse] = await bigqueryClient.insertJob(request);
    const jobReference = jobResponse.jobReference;

    const getQueryResultsRequest = {
      projectId: projectId,
      jobId: jobReference.jobId,
      location: jobReference.location.value,
    };

    // poll the job status every 3 seconds until complete
    // eslint-disable-next-line
    for await (const t of setInterval(3000)) { // no-unused-vars - this is the syntax for promise based setInterval
      const [resp] = await bigqueryClient.jobClient.getQueryResults(
        getQueryResultsRequest,
      );
      if (resp.errors.length !== 0) {
        throw new Error('Something failed in model creation');
      }
      if (resp.jobComplete.value) {
        break;
      }
    }

    console.log(`Model ${modelId} created.`);
  }
  createModel();
  // [END bigquery_create_model_preview]
}
main(...process.argv.slice(2));

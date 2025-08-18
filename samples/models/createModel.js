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


function main(projectId = 'my_project', datasetId = 'my_dataset', modelId = 'my_model') {
  // [START bigquery_create_model]
  // Import the Google Cloud client library
  const {BigQueryClient} = require('@google-cloud/bigquery');
  const bigquery = new BigQueryClient();

  async function createModel() {
    // Creates a model named "my_model" in "my_dataset".

    /**
     * TODO(developer): Uncomment the following lines before running the sample
     */
    // const datasetId = "my_dataset";
    // const modelId = "my_model";

    const query = `CREATE OR REPLACE MODEL \`${projectId}.${datasetId}.${modelId}\`
         OPTIONS(model_type='logistic_reg') AS
         SELECT
           IF(totals.transactions IS NULL, 0, 1) AS label,
           IFNULL(device.operatingSystem, "") AS os,
           device.isMobile AS is_mobile,
           IFNULL(geoNetwork.country, "") AS country,
           IFNULL(totals.pageviews, 0) AS pageviews
         FROM
           \`bigquery-public-data.google_analytics_sample.ga_sessions_*\`
         WHERE
           _TABLE_SUFFIX BETWEEN '20160801' AND '20170631'
         LIMIT  100000;`;


    const request = {
      projectId: projectId,
      job: {
        configuration: {
          query: {
            query: query,
            useLegacySql: {value: false}
          },
        },
      },
    };

    // Run query to create a model
    const [jobResponse] = await bigquery.insertJob(request);
    const jobReference = jobResponse.jobReference;

    const getQueryResultsRequest = {
      projectId: projectId,
      jobId: jobReference.jobId,
      location: jobReference.location.value,
      timeoutMs: {value:120000}

    }
    let [resp] = await bigquery.jobClient.getQueryResults(getQueryResultsRequest)
    // poll the job status every 3 seconds until complete
    while(resp.status==="RUNNING"){
      setTimeout([resp] = await bigquery.jobClient.getQueryResults(getQueryResultsRequest), 3000)
    }
    if (resp.errors.length!==0){
      throw new Error(`Something failed in model creation`)
    }
    console.log(`Model ${modelId} created.`);
    

    
   
    

  }
  createModel();
  // [END bigquery_create_model]
}
main(...process.argv.slice(2));

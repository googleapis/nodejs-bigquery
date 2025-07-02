// Copyright 2017 Google LLC
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

const {BigQueryClient} = require('@google-cloud/bigquery');
const {assert} = require('chai');
const {describe, it, after, before, beforeEach} = require('mocha');
const cp = require('child_process');
const {randomUUID} = require('crypto');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const GCLOUD_TESTS_PREFIX = 'nodejs_samples_tests';
const datasetId = `${GCLOUD_TESTS_PREFIX}_datasets_${randomUUID()}`.replace(
  /-/gi,
  '_',
);

//TODO(coleleah): remove fallback: false if needed
const bigquery = new BigQueryClient({}, {opts:{fallback: false}});
// the GCLOUD_PROJECT environment variable is set as part of test harness setup
const projectId = process.env.GCLOUD_PROJECT;

describe.only('Datasets', () => {
  //TODO(coleleah): update
  before(async () => {
    // // Delete any stale datasets from samples tests
    // await deleteDatasets();
    if (projectId===undefined){
      throw Error("GCLOUD_PROJECT must be defined as an environment variable before tests can be run")

    }
  });

  // beforeEach(async function () {
  //   this.currentTest.retries(2);
  // });

  // after(async () => {
  //   await bigquery.dataset(datasetId).delete({force: true}).catch(console.warn);
  // });
  describe('dataset creation', () => {
  //TODO(coleleah): update
  after(async () => {
    const request = {
      projectId: projectId,
      datasetId: datasetId,
    };
    await bigquery.deleteDataset(request)

  })
  it('should create a dataset', async () => {
    const output = execSync(`node datasets/createDataset.js ${projectId} ${datasetId}`);
    assert.include(output, `Dataset ${projectId}:${datasetId} created`);
    const request = {
      projectId: projectId,
      datasetId: datasetId,
    };
    const [exists] = await bigquery.getDataset(request);
    assert.ok(exists);
  });

  //   //TODO(coleleah): update

  // it('should create a dataset using a regional endpoint', async () => {
  //   const euBigquery = new BigQuery({
  //     apiEndpoint: 'eu-bigquery.googleapis.com',
  //   });
  //   const euDatasetId = datasetId + '_eu';
  //   await euBigquery.createDataset(euDatasetId, {
  //     location: 'eu',
  //   });
  //   const [exists] = await euBigquery.dataset(euDatasetId).exists();
  //   assert.ok(exists);
  // });
  // //TODO(coleleah): update

  // it('should fail to create a dataset using a different region from the client endpoint', async () => {
  //   const usEast4Bigquery = new BigQuery({
  //     apiEndpoint: 'us-east4-bigquery.googleapis.com',
  //   });
  //   const usDatasetId = datasetId + '_us';
  //   let error;
  //   try {
  //     await usEast4Bigquery.createDataset(usDatasetId, {
  //       location: 'us-central1',
  //     });
  //   } catch (err) {
  //     error = err;
  //   }
  //   assert.isNotNull(error);
  //   assert.include(error.message, 'Invalid storage region');
  // });

  })


  // //TODO(coleleah): update

  // it('should create/update a dataset with a different default collation', async () => {
  //   const bigquery = new BigQuery({});
  //   const collationDatasetId = datasetId + '_collation_test';
  //   await bigquery.createDataset(collationDatasetId, {
  //     defaultCollation: 'und:ci',
  //   });
  //   const dataset = await bigquery.dataset(collationDatasetId);
  //   const [exists] = await dataset.exists();
  //   assert.ok(exists);
  //   let [md] = await dataset.getMetadata();
  //   assert.equal(md.defaultCollation, 'und:ci');
  //   md.defaultCollation = '';
  //   await dataset.setMetadata(md);
  //   [md] = await dataset.getMetadata();
  //   assert.equal(md.defaultCollation, '');
  // });
  // //TODO(coleleah): update

  describe.only('list + get datasets', async() => {
     before('create two datasets to be gotten/listed', async () => {
      const dataset = {
      datasetReference: {
        datasetId: datasetId,
      },
      location: 'US',
    };
    const dataset2 = {
      datasetReference: {
        datasetId: datasetId+"_2",
      },
      location: 'US',
    };
      const request = {
      projectId: projectId,
      dataset: dataset,
    };
      const request2 = {
      projectId: projectId,
      dataset: dataset2,
    };
    const [response] = await bigquery.insertDataset(request)
    assert.ok(response)
    const [response2] = await bigquery.insertDataset(request2)

    assert.ok(response2)

    })
    after('delete two datasets that were created for these tests', async () => {
    const request = {
      projectId: projectId,
      datasetId: datasetId,
    };
    const request2 = {
      projectId: projectId,
      datasetId: datasetId+"_2",
    };
    await bigquery.deleteDataset(request)
    await bigquery.deleteDataset(request2)

  })
    it('should list datasets', async () => {
      const output = execSync(`node datasets/listDatasets.js ${projectId}`);
      console.log('output', output)
      assert.match(output, /Datasets:/);
      assert.match(output, new RegExp(datasetId));
    });

    it('should list datasets on a different project', async () => {
      const output = execSync('node datasets/listDatasets.js bigquery-public-data');
      assert.match(output, /Datasets:/);
      assert.match(output, new RegExp('usa_names'));
    });

    it('should retrieve a dataset if it exists', async () => {
      const output = execSync(`node datasets/getDataset.js ${projectId} ${datasetId}`);
      assert.include(output, 'Dataset');
      assert.include(output, 'retrieved successfully');
      assert.include(output, datasetId);
    });

  })
  
  // //TODO(coleleah): update

  // it("should update dataset's description", async () => {
  //   const output = execSync(`node updateDatasetDescription.js ${datasetId}`);
  //   assert.include(
  //     output,
  //     `${datasetId} description: New dataset description.`,
  //   );
  // });
  // //TODO(coleleah): update

  // it("should update dataset's expiration", async () => {
  //   const output = execSync(`node updateDatasetExpiration.js ${datasetId}`);
  //   assert.include(output, `${datasetId} expiration: 86400000`);
  // });
  // //TODO(coleleah): update

  // it('should add label to a dataset', async () => {
  //   const output = execSync(`node labelDataset.js ${datasetId}`);
  //   assert.include(output, `${datasetId} labels:`);
  //   assert.include(output, "{ color: 'green' }");
  // });
  // //TODO(coleleah): update

  // it("should list a dataset's labels", async () => {
  //   const output = execSync(`node getDatasetLabels.js ${datasetId}`);
  //   assert.include(output, `${datasetId} Labels:`);
  //   assert.include(output, 'color: green');
  // });
  // //TODO(coleleah): update

  // it('should delete a label from a dataset', async () => {
  //   const output = execSync(`node deleteLabelDataset.js ${datasetId}`);
  //   assert.include(output, `${datasetId} labels:`);
  //   assert.include(output, 'undefined');
  // });
  // //TODO(coleleah): update

  // it("should update dataset's access", async () => {
  //   const output = execSync(`node updateDatasetAccess.js ${datasetId}`);
  //   assert.include(output, "role: 'READER'");
  //   assert.include(output, "userByEmail: 'sample.bigquery.dev@gmail.com'");
  // });
  // //TODO(coleleah): update

  // it('should filter datasets by label', async () => {
  //   execSync(`node labelDataset.js ${datasetId}`);
  //   const output = execSync('node listDatasetsByLabel.js');
  //   assert.match(output, /Datasets:/);
  //   assert.match(output, new RegExp(datasetId));
  // });

  describe('delete dataset', () => {
    // create the dataset we need to delete
    before('create a dataset to be deleted', async () => {
      const dataset = {
      datasetReference: {
        datasetId: datasetId,
      },
      location: 'US',
    };
      const request = {
      projectId: projectId,
      dataset: dataset,
    };
    const [response] = await bigquery.insertDataset(request)
    assert.ok(response)

    })

    it('should delete a dataset', async () => {
    const request = {
      projectId: projectId,
      datasetId: datasetId,
    };
    let [dataset] = await bigquery.getDataset(request);
    assert.ok(dataset);

    const output = execSync(`node datasets/deleteDataset.js ${projectId} ${datasetId}`);
    assert.include(output, `Dataset ${datasetId} deleted.`);

    try{
      await bigquery.getDataset(request);
    }catch(err){
      assert.strictEqual(err.details, `Not found: Dataset ${projectId}:${datasetId}`)
    }
  });
})
  
  // // TODO(coleleah): update

  // // Only delete a resource if it is older than 24 hours. That will prevent
  // // collisions with parallel CI test runs.
  // function isResourceStale(creationTime) {
  //   const oneDayMs = 86400000;
  //   const now = new Date();
  //   const created = new Date(creationTime);
  //   return now.getTime() - created.getTime() >= oneDayMs;
  // }
  // //TODO(coleleah): update

  // async function deleteDatasets() {
  //   let [datasets] = await bigquery.getDatasets();
  //   datasets = datasets.filter(dataset =>
  //     dataset.id.includes(GCLOUD_TESTS_PREFIX),
  //   );

  //   for (const dataset of datasets) {
  //     let metadata;
  //     try {
  //       [metadata] = await dataset.getMetadata();
  //     } catch (e) {
  //       console.log(`dataset(${dataset.id}).getMetadata() failed`);
  //       console.log(e);
  //       return;
  //     }
  //     const creationTime = Number(metadata.creationTime);
  //     if (isResourceStale(creationTime)) {
  //       try {
  //         await dataset.delete({force: true});
  //       } catch (e) {
  //         console.log(`dataset(${dataset.id}).delete() failed`);
  //         console.log(e);
  //       }
  //     }
  //   }
  // }
});
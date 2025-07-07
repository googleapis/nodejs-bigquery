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

import * as protos from '../protos/protos'
import {BigQueryClient} from '../src';
import assert = require('assert')
const cp = require('child_process');
const {randomUUID} = require('crypto');

const GCLOUD_TESTS_PREFIX = 'nodejs_samples_tests';
const datasetId = `${GCLOUD_TESTS_PREFIX}_datasets_${randomUUID()}`.replace(
  /-/gi,
  '_',
);

//TODO(coleleah): remove fallback: false if needed
const bigquery = new BigQueryClient({}, {opts:{fallback: false}});
// the GCLOUD_PROJECT environment variable is set as part of test harness setup
const projectId = process.env.GCLOUD_PROJECT;

describe('Datasets', () => {
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
    const usCentral1Bigquery = new BigQueryClient({}, {opts: {
      apiEndpoint: 'bigquery.us-central1.rep.googleapis.com',
  }});
      const usCentral1DatasetId = datasetId + '_uscentral1';

  after('clean up dataset creation tests', async () => {
    const usCentral1Request = {
      projectId: projectId,
      datasetId: usCentral1DatasetId,
    };
    await usCentral1Bigquery.deleteDataset(usCentral1Request)

  })

  it('should create a dataset using a regional endpoint', async () => {
   // Construct the dataset resource.
    const dataset = {
      datasetReference: {
        datasetId: usCentral1DatasetId,
      },
      location: 'us-central1'
    };

    // Construct the request object.
    const request = {
      projectId: projectId,
      dataset: dataset,
    };
    await usCentral1Bigquery.insertDataset(request);
    const getRequest = {
        projectId: projectId, 
        datasetId: usCentral1DatasetId
    }

    // we have to typecast this because response can be void when getDataset is called synchronously
    // it is safe to typecast here because we are calling asynchronously
    const response = await usCentral1Bigquery.getDataset(getRequest) as [
          protos.google.cloud.bigquery.v2.IDataset,
          protos.google.cloud.bigquery.v2.IGetDatasetRequest | undefined,
          {} | undefined,
        ] 
    assert.strictEqual(response[0].id, `${projectId}:${usCentral1DatasetId}`);
  });
  
  //TODO(coleleah): fix
  //captured in b/429419330
  it.skip('should fail to create a dataset using a different region from the client endpoint', async () => {
    const usEast4DatasetId = datasetId + '_us-east4';

    // Construct the dataset resource
    // with a location that does not match the client
    // which uses us-central1
    const dataset = {
      datasetReference: {
        datasetId: usEast4DatasetId,
      },
      location: 'us-east4'
    };

    // Construct the request object.
    const request = {
      projectId: projectId,
      dataset: dataset,
    };
    let error;
    try {
      await usCentral1Bigquery.insertDataset(request);
    } catch (err: unknown) {
      console.log(err)
      error = err;
    }
    assert.notStrictEqual(error, null);
    //TODO(coleleah) fix typing
    //@ts-ignore
    assert.strictEqual(error.message, 'Invalid storage region');
  });

  })



  
  
});
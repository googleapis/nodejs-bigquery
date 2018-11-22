/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const proxyquire = require(`proxyquire`).noPreserveCache();
const sinon = require(`sinon`);
const assert = require(`assert`);
const uuid = require(`uuid`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const {BigQuery} = proxyquire(`@google-cloud/bigquery`, {});
const bigquery = new BigQuery();

const expectedDatasetId = `my_new_dataset`;
let datasetId = `nodejs-docs-samples-test-${uuid.v4()}`;
datasetId = datasetId.replace(/-/gi, `_`);

describe(`Quickstart`, () => {
  beforeEach(tools.stubConsole);
  afterEach(tools.restoreConsole);

  after(async () => {
    try {
      await bigquery.dataset(datasetId).delete({force: true});
    } catch (err) {} // ignore error
  });

  it(`quickstart should create a dataset`, async () => {
    await new Promise((resolve, reject) => {
      const bigqueryMock = {
        createDataset: async _datasetId => {
          assert.strictEqual(_datasetId, expectedDatasetId);

          const [dataset] = await bigquery.createDataset(datasetId);
          assert.notStrictEqual(dataset, undefined);

          setTimeout(() => {
            try {
              assert.ok(console.log.calledOnce);
              assert.deepStrictEqual(console.log.firstCall.args, [
                `Dataset ${dataset.id} created.`,
              ]);
              resolve();
            } catch (err) {
              reject(err);
            }
          }, 200);

          return [dataset];
        },
      };

      proxyquire(`../quickstart`, {
        '@google-cloud/bigquery': {
          BigQuery: sinon.stub().returns(bigqueryMock),
        },
      });
    });
  });
});

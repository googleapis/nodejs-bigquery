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

const {assert} = require('chai');
const {describe, it, before, after, beforeEach} = require('mocha');
const {randomUUID} = require('crypto');
const cp = require('child_process');
const {BigQueryClient} = require('@google-cloud/bigquery');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const GCLOUD_TESTS_PREFIX = 'nodejs_samples_tests';

const generateUuid = () =>
  `${GCLOUD_TESTS_PREFIX}_${randomUUID()}`.replace(/-/gi, '_');



// the GCLOUD_PROJECT environment variable is set as part of test harness setup
const projectId = process.env.GCLOUD_PROJECT;
const transports = ["grpc","rest"]
// run tests with the gRPC client and the REST fallback client
transports.forEach(transport => {
  let bigquery;
  if(transport === "grpc"){
    bigquery = new BigQueryClient({});
  }else{
    bigquery = new BigQueryClient({}, {opts: {fallback: true}})
  }

  describe(`Tables ${transport}`, () => {
    const datasetId = generateUuid();

    const tableId = generateUuid();
    beforeEach(async function () {
      this.currentTest.retries(2);

      if (!this.currentTest) {
        return;
      }
      const retryCount = this.currentTest.currentRetry();

      if (retryCount > 0) {
        // Calculate delay (e.g., exponential backoff)
        const defaultBackOffTime = 5000; // milliseconds
        const backOffTime = retryCount * defaultBackOffTime * retryCount;

        console.log({
          message: `Retrying test '${this.currentTest.title}'`,
          retryCount,
          backOffTime,
        });
        await new Promise(resolve => setTimeout(resolve, backOffTime));
      }
    });
    // there is logic in the datasets samples test that will clean up stale
    // datasets - they follow the same prefix logic as we do in this file
    before(async () => {
      if (projectId === undefined) {
        throw Error(
          'GCLOUD_PROJECT must be defined as an environment variable before tests can be run',
        );
      }
      const datasetObject = {
        datasetReference: {
          datasetId: datasetId,
        },
        location: 'US',
      };
      const datasetRequest = {
        projectId: projectId,
        dataset: datasetObject,
      };
      await bigquery.insertDataset(datasetRequest);
    });
    after(async () => {
      const deleteRequest = {
        projectId: projectId,
        datasetId: datasetId,
        deleteContents: true,
      };
      await bigquery.deleteDataset(deleteRequest);
    });

    describe('table creation', () => {
      after(async () => {
        const table1DeleteRequest = {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId,
        };
        await bigquery.deleteTable(table1DeleteRequest);
      });

      it('should create a table', async () => {
        const output = execSync(
          `node tables/createTable.js ${datasetId} ${tableId}`,
        );
        assert.include(output, `Table ${tableId} created.`);
        const tableRequest = {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId,
        };
        const [response] = await bigquery.getTable(tableRequest);
        assert.ok(response);
      });
    });
    describe('table list/get', () => {
      const schema = [
        {name: 'Name', type: 'STRING', mode: 'REQUIRED'},
        {name: 'Age', type: 'INTEGER'},
        {name: 'Weight', type: 'FLOAT'},
        {name: 'IsMagic', type: 'BOOLEAN'},
      ];
      const table2Id = tableId + '_2';
      const table1Request = {
        projectId,
        datasetId,
        table: {
          tableReference: {
            projectId: projectId,
            datasetId: datasetId,
            tableId: tableId,
          },
          schema: {fields: schema},
          location: 'US',
        },
      };
      const table2Request = {
        projectId,
        datasetId,
        table: {
          tableReference: {
            projectId: projectId,
            datasetId: datasetId,
            tableId: table2Id,
          },
          schema: {fields: schema},
          location: 'US',
        },
      };

      // create two tables for listing
      before(async () => {
        const [table1] = await bigquery.insertTable(table1Request);
        const [table2] = await bigquery.insertTable(table2Request);
        assert.ok(table1);
        assert.ok(table2);
      });
      // tear down tables created
      after(async () => {
        const table1DeleteRequest = {
          projectId: projectId,
          datasetId: datasetId,
          tableId: table1Request.table.tableReference.tableId,
        };
        const table2DeleteRequest = {
          projectId: projectId,
          datasetId: datasetId,
          tableId: table2Request.table.tableReference.tableId,
        };
        await bigquery.deleteTable(table1DeleteRequest);
        await bigquery.deleteTable(table2DeleteRequest);
      });
      it('should retrieve a table if it exists', async () => {
        const output = execSync(
          `node tables/getTable.js ${datasetId} ${tableId}`,
        );
        assert.include(output, 'Table:');
        assert.include(output, datasetId);
        assert.include(output, tableId);
      });
      it('should list tables', async () => {
        const output = execSync(`node tables/listTables.js ${datasetId}`);
        assert.match(output, /Tables:/);
        assert.match(output, new RegExp(tableId));
        assert.match(output, new RegExp(table2Id));
      });
    });
    describe('table update', () => {
      const schema = [
        {name: 'Name', type: 'STRING', mode: 'REQUIRED'},
        {name: 'Age', type: 'INTEGER'},
        {name: 'Weight', type: 'FLOAT'},
        {name: 'IsMagic', type: 'BOOLEAN'},
      ];
      const tableRequest = {
        projectId,
        datasetId,
        table: {
          tableReference: {
            projectId: projectId,
            datasetId: datasetId,
            tableId: tableId,
          },
          schema: {fields: schema},
          location: 'US',
        },
      };

      // create a table to update
      before(async () => {
        const [table1] = await bigquery.insertTable(tableRequest);
        assert.ok(table1);
      });
      // tear down table
      after(async () => {
        const tableDeleteRequest = {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableRequest.table.tableReference.tableId,
        };

        await bigquery.deleteTable(tableDeleteRequest);
      });
      it("should update table's description", async () => {
        const tableGetRequest = {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId,
        };
        const [table] = await bigquery.getTable(tableGetRequest);
        assert.ok(table, table.description);
        assert.isNull(table.description);
        const output = execSync(
          `node tables/updateTable.js ${datasetId} ${tableId}`,
        );
        assert.include(output, `${tableId} description: New table description`);
      });
    });

    describe('table deletion', () => {
      const schema = [
        {name: 'Name', type: 'STRING', mode: 'REQUIRED'},
        {name: 'Age', type: 'INTEGER'},
        {name: 'Weight', type: 'FLOAT'},
        {name: 'IsMagic', type: 'BOOLEAN'},
      ];
      const tableRequest = {
        projectId,
        datasetId,
        table: {
          tableReference: {
            projectId: projectId,
            datasetId: datasetId,
            tableId: tableId,
          },
          schema: {fields: schema},
          location: 'US',
        },
      };
      // create a table for deleting
      before(async () => {
        const [table1] = await bigquery.insertTable(tableRequest);
        assert.ok(table1);
      });
      // tear down tables created if needed
      after(async () => {
        const tableDeleteRequest = {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableRequest.table.tableReference.tableId,
        };
        try {
          await bigquery.getTable(tableDeleteRequest);
        } catch (err) {
          if(transport==='grpc'){
             if (
              err.details !==
              `Not found: Table ${projectId}:${datasetId}.${tableId}`
            ) {
              await bigquery.deleteTable(tableDeleteRequest);
              throw err;
            }
          }else{
            // REST errors are not surfacing full details
            // tracked internally b/429419330
            // we rely on the 404 error code to validate that it is not found
            if (
              err.code !==404
            ) {
              await bigquery.deleteTable(tableDeleteRequest);
              throw err;
            }
          }
         
        }
      });
      it('should delete a table', async () => {
        const tableGetRequest = {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId,
        };
        const [response] = await bigquery.getTable(tableGetRequest);
        assert.ok(response); // confirm it exists before deleting it
        const output = execSync(
          `node tables/deleteTable.js ${datasetId} ${tableId}`,
        );
        assert.include(output, `Table ${tableId} deleted.`);

        try {
          await bigquery.getTable(tableGetRequest);
        } catch (err) {
          if(transport==='grpc'){
            assert.strictEqual(
              err.details,
              `Not found: Table ${projectId}:${datasetId}.${tableId}`,
            );
          }else{
            // REST errors are not surfacing full details
            // tracked internally b/429419330
            // we rely on the 404 error code to validate that it is not found
            assert.strictEqual(
              err.code,
              404
            )
          }
        }
      });
    });
  });
});

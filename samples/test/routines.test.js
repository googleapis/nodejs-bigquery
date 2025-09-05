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
const {describe, it, before, beforeEach, after} = require('mocha');
const cp = require('child_process');
const {randomUUID} = require('crypto');

const {BigQueryClient} = require('@google-cloud/bigquery');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const GCLOUD_TESTS_PREFIX = 'nodejs_samples_tests_routines';

const generateUuid = () =>
  `${GCLOUD_TESTS_PREFIX}_${randomUUID()}`.replace(/-/gi, '_');

// the GCLOUD_PROJECT environment variable is set as part of test harness setup
const projectId = process.env.GCLOUD_PROJECT;

// helper function used in before/after blocks
function buildRoutineObject(projectId, datasetId, routineId) {
  const routine = {
    routineReference: {
      projectId,
      datasetId,
      routineId,
    },
    arguments: [
      {
        name: 'x',
        dataType: {typeKind: 'INT64'},
      },
    ],
    definitionBody: 'x * 3',
    routineType: 'SCALAR_FUNCTION',
    returnType: {typeKind: 'INT64'},
  };
  return routine;
}
const transports = ['grpc', 'rest'];
// run tests with the gRPC client and the REST fallback client
transports.forEach(transport => {
  let bigquery;
  if (transport === 'grpc') {
    bigquery = new BigQueryClient({});
  } else {
    bigquery = new BigQueryClient({}, {opts: {fallback: true}});
  }

  describe(`Routines ${transport}`, () => {
    const datasetId = generateUuid();
    const routineId = generateUuid();
    const newRoutineId = generateUuid();
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
      };
      await bigquery.deleteDataset(deleteRequest);
    });

    beforeEach(async function () {
      this.currentTest.retries(2);
    });

    describe('routine creation', () => {
      it('should create a routine', async () => {
        const output = execSync(
          `node routines/createRoutine.js ${datasetId} ${newRoutineId} ${transport}`,
        );
        assert.include(output, `Routine ${newRoutineId} created.`);
      });

      after('deletes created routine', async () => {
        const deleteRequest = {
          projectId: projectId,
          datasetId: datasetId,
          routineId: newRoutineId,
        };
        await bigquery.deleteRoutine(deleteRequest);
      });
    });

    describe('list, get, update routines', async () => {
      const routineId2 = routineId + '_2';
      const routine = buildRoutineObject(projectId, datasetId, routineId);
      const routine2 = buildRoutineObject(projectId, datasetId, routineId2);

      before('create two routines to list/get/update', async () => {
        const [response] = await bigquery.insertRoutine({
          projectId: projectId,
          datasetId: datasetId,
          routine: routine,
        });
        const [response2] = await bigquery.insertRoutine({
          projectId: projectId,
          datasetId: datasetId,
          routine: routine2,
        });
        assert.ok(response);
        assert.ok(response2);
      });

      after('delete created routines', async () => {
        const deleteRequest = {
          projectId: projectId,
          datasetId: datasetId,
          routineId: routineId,
        };
        const deleteRequest2 = {
          projectId: projectId,
          datasetId: datasetId,
          routineId: routineId2,
        };
        await bigquery.deleteRoutine(deleteRequest);
        await bigquery.deleteRoutine(deleteRequest2);
      });

      it('should get a routine', async () => {
        const output = execSync(
          `node routines/getRoutine.js ${datasetId} ${routineId} ${transport}`,
        );
        assert.include(output, `Routine ${routineId} retrieved.`);
      });

      it('should list routines', async () => {
        const output = execSync(
          `node routines/listRoutines.js ${datasetId} ${transport}`,
        );
        assert.match(output, /Routines:/);
        assert.include(output, routineId);
        assert.include(output, routineId2);
      });
      it('should update routine', async () => {
        const getRequest = {
          projectId: projectId,
          datasetId: datasetId,
          routineId: routineId,
        };
        const [getResponse] = await bigquery.getRoutine(getRequest);
        assert.isEmpty(getResponse.description);
        const output = execSync(
          `node routines/updateRoutine.js ${datasetId} ${routineId} ${transport}`,
        );
        assert.include(
          output,
          'Routine description: This is a new description',
        );
      });
    });

    describe('Delete Routine', () => {
      const routine = buildRoutineObject(projectId, datasetId, routineId);

      before(async () => {
        const [response] = await bigquery.insertRoutine({
          projectId: projectId,
          datasetId: datasetId,
          routine: routine,
        });
        assert.ok(response);
      });

      beforeEach(async function () {
        this.currentTest.retries(2);
      });

      it('should delete a routine', async () => {
        const getRequest = {
          projectId: projectId,
          datasetId: datasetId,
          routineId: routineId,
        };
        const [beforeGetResponse] = await bigquery.getRoutine(getRequest);
        assert.ok(beforeGetResponse);
        const output = execSync(
          `node routines/deleteRoutine.js ${datasetId} ${routineId} ${transport}`,
        );
        assert.include(output, `Routine ${routineId} deleted.`);
        try {
          await bigquery.getRoutine(getRequest);
        } catch (err) {
          if (transport === 'grpc') {
            assert.strictEqual(
              err.details,
              `Not found: Routine ${projectId}:${datasetId}.${routineId}`,
            );
          } else {
            // REST errors are not surfacing full details
            // tracked internally b/429419330
            // we rely on the 404 error code to validate that it is not found
            assert.strictEqual(err.code, 404);
          }
        }
      });
    });
  });
});

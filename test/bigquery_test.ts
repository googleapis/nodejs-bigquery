// TODO - tests
// that the file exists
// file compiles
// user passes zero clients and no options
// user passes all their own clients and options
// user passes zero clients but passes
// tests that call the various combinations and permutations of options/callback
import {
  BigQueryClient,
  bigQueryClientOptions,
  subClientOptions,
} from '../src/bigquery';

import * as protos from '../protos/protos';
import * as assert from 'assert';
import * as sinon from 'sinon';
import {describe, it} from 'mocha';

describe('BigQueryClient should be able to handle passing in clients', () => {});
describe('BigQueryClient should call underlying client methods', () => {
  const subOptions: subClientOptions = {
    opts: {
      credentials: {client_email: 'fake', private_key: 'fake'},
      projectId: 'fake',
    },
  };
  // TODO possibly update these
  const options: bigQueryClientOptions = {};
  const client = new BigQueryClient(options, subOptions);
  // TODO refactor to not have to pass all three options
  describe('BigQuery client should call underlying methods in the Dataset Client', () => {
    after(() => {
      sinon.restore();
    });
    // TODO fix list
    it('should call getDataset', async () => {
      const datasetRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
      } as protos.google.cloud.bigquery.v2.IGetDatasetRequest;
      const getStub = sinon
        .stub(client.datasetClient, 'getDataset')
        .resolves('Dataset');
      await client.getDataset(datasetRequest, {}, () => {});
      assert.ok(getStub.calledOnce);
    });
    it('should call insertDataset', async () => {
      const datasetRequest = {
        projectId: 'projectId',
        dataset: {datasetReference: {datasetId: 'datasetId'}},
      } as protos.google.cloud.bigquery.v2.IInsertDatasetRequest;
      const insertStub = sinon
        .stub(client.datasetClient, 'insertDataset')
        .resolves('Dataset');
      await client.insertDataset(datasetRequest, {}, () => {});
      assert.ok(insertStub.calledOnce);
    });
    it('should call undeleteDataset', async () => {
      const datasetRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
      } as protos.google.cloud.bigquery.v2.IUndeleteDatasetRequest;
      const undeleteStub = sinon
        .stub(client.datasetClient, 'undeleteDataset')
        .resolves('Dataset');
      await client.undeleteDataset(datasetRequest, {}, () => {});
      assert.ok(undeleteStub.calledOnce);
    });

    //   it('should call listDatasets', async () => {
    //     const datasetRequest = {
    //       projectId: 'projectId',
    //     } as protos.google.cloud.bigquery.v2.IListDatasetsRequest;
    //     const listStub = sinon.stub(client.datasetClient, 'listDatasets').returns(new gax.FakePagedAsyncIterable(['dataset']));
    //     await client.listDatasets(datasetRequest, {}, () => {});
    //     assert.ok(listStub.calledOnce);
    //   });

    it('should call patchDataset', async () => {
      const datasetRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        dataset: {datasetReference: {datasetId: 'datasetId'}},
      } as protos.google.cloud.bigquery.v2.IUpdateOrPatchDatasetRequest;
      const patchStub = sinon
        .stub(client.datasetClient, 'patchDataset')
        .resolves('Dataset');
      await client.patchDataset(datasetRequest, {}, () => {});
      assert.ok(patchStub.calledOnce);
    });

    it('should call updateDataset', async () => {
      const datasetRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        dataset: {datasetReference: {datasetId: 'datasetId'}},
      } as protos.google.cloud.bigquery.v2.IUpdateOrPatchDatasetRequest;
      const updateStub = sinon
        .stub(client.datasetClient, 'updateDataset')
        .resolves('Dataset');
      await client.updateDataset(datasetRequest, {}, () => {});
      assert.ok(updateStub.calledOnce);
    });
  });

  describe('BigQuery client should call underlying methods in the Job Client', () => {
    after(() => {
      sinon.restore();
    });
    it('should call getJob', async () => {
      const jobRequest = {
        projectId: 'projectId',
        jobId: 'jobId',
      } as protos.google.cloud.bigquery.v2.IGetJobRequest;
      const getStub = sinon.stub(client.jobClient, 'getJob').resolves('Job');
      await client.getJob(jobRequest, {}, () => {});
      assert.ok(getStub.calledOnce);
    });

    it('should call insertJob', async () => {
      const jobRequest = {
        projectId: 'projectId', // Add required fields to the request
        job: {}, // Add required fields to the job object if needed
      } as protos.google.cloud.bigquery.v2.IInsertJobRequest;
      const insertStub = sinon
        .stub(client.jobClient, 'insertJob')
        .resolves('Job');
      await client.insertJob(jobRequest, {}, () => {});
      assert.ok(insertStub.calledOnce);
    });

    it('should call cancelJob', async () => {
      const jobRequest = {
        projectId: 'projectId',
        jobId: 'jobId',
      } as protos.google.cloud.bigquery.v2.ICancelJobRequest;
      const cancelStub = sinon
        .stub(client.jobClient, 'cancelJob')
        .resolves('Job');
      await client.cancelJob(jobRequest, {}, () => {});
      assert.ok(cancelStub.calledOnce);
    });

    it('should call deleteJob', async () => {
      const jobRequest = {
        projectId: 'projectId',
        jobId: 'jobId',
      } as protos.google.cloud.bigquery.v2.IDeleteJobRequest;
      const deleteStub = sinon.stub(client.jobClient, 'deleteJob').resolves({});
      await client.deleteJob(jobRequest, {}, () => {});
      assert.ok(deleteStub.calledOnce);
    });
    // TODO fix
    //   it('should call listJobs', async () => {
    //     const jobRequest = {
    //       projectId: 'projectId',
    //     } as protos.google.cloud.bigquery.v2.IListJobsRequest;
    //     const listStub = sinon.stub(client.jobClient, 'listJobs').returns(new gax.FakePagedAsyncIterable(['job']));
    //     await client.listJobs(jobRequest, {}, () => {});
    //     assert.ok(listStub.calledOnce);
    //   });
  });

  describe('BigQuery client should call underlying methods in the Model Client', () => {
    after(() => {
      sinon.restore();
    });

    it('should call getModel', async () => {
      const modelRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        modelId: 'modelId',
      } as protos.google.cloud.bigquery.v2.IGetModelRequest;
      const getStub = sinon
        .stub(client.modelClient, 'getModel')
        .resolves('Model');
      await client.getModel(modelRequest, {}, () => {});
      assert.ok(getStub.calledOnce);
    });

    it('should call patchModel', async () => {
      const modelRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        modelId: 'modelId',
        model: {modelReference: {modelId: 'modelId'}}, // Add required fields
      } as protos.google.cloud.bigquery.v2.IPatchModelRequest;
      const patchStub = sinon
        .stub(client.modelClient, 'patchModel')
        .resolves('Model');
      await client.patchModel(modelRequest, {}, () => {});
      assert.ok(patchStub.calledOnce);
    });

    it('should call deleteModel', async () => {
      const modelRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        modelId: 'modelId',
      } as protos.google.cloud.bigquery.v2.IDeleteModelRequest;
      const deleteStub = sinon
        .stub(client.modelClient, 'deleteModel')
        .resolves({});
      await client.deleteModel(modelRequest, {}, () => {});
      assert.ok(deleteStub.calledOnce);
    });

    // it('should call listModels', async () => {
    //   const modelRequest = {
    //     projectId: 'projectId',
    //     datasetId: 'datasetId',
    //   } as protos.google.cloud.bigquery.v2.IListModelsRequest;
    //   const listStub = sinon.stub(client.modelClient, 'listModels').returns(new gax.FakePagedAsyncIterable(['model']));
    //   await client.listModels(modelRequest, {}, () => {});
    //   assert.ok(listStub.calledOnce);
    // });
  });

  describe('BigQuery client should call underlying methods in the Routine Client', () => {
    after(() => {
      sinon.restore();
    });

    it('should call getRoutine', async () => {
      const routineRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        routineId: 'routineId',
      } as protos.google.cloud.bigquery.v2.IGetRoutineRequest;
      const getStub = sinon
        .stub(client.routineClient, 'getRoutine')
        .resolves('Routine');
      await client.getRoutine(routineRequest, {}, () => {});
      assert.ok(getStub.calledOnce);
    });

    it('should call insertRoutine', async () => {
      const routineRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        routine: {routineReference: {routineId: 'routineId'}}, // Add required fields
      } as protos.google.cloud.bigquery.v2.IInsertRoutineRequest;
      const insertStub = sinon
        .stub(client.routineClient, 'insertRoutine')
        .resolves('Routine');
      await client.insertRoutine(routineRequest, {}, () => {});
      assert.ok(insertStub.calledOnce);
    });

    it('should call updateRoutine', async () => {
      const routineRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        routineId: 'routineId',
        routine: {routineReference: {routineId: 'routineId'}}, // Add required fields
      } as protos.google.cloud.bigquery.v2.IUpdateRoutineRequest;
      const updateStub = sinon
        .stub(client.routineClient, 'updateRoutine')
        .resolves('Routine');
      await client.updateRoutine(routineRequest, {}, () => {});
      assert.ok(updateStub.calledOnce);
    });

    it('should call patchRoutine', async () => {
      const routineRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        routineId: 'routineId',
        routine: {routineReference: {routineId: 'routineId'}}, // Add required fields
      } as protos.google.cloud.bigquery.v2.IPatchRoutineRequest;
      const patchStub = sinon
        .stub(client.routineClient, 'patchRoutine')
        .resolves('Routine');
      await client.patchRoutine(routineRequest, {}, () => {});
      assert.ok(patchStub.calledOnce);
    });

    it('should call deleteRoutine', async () => {
      const routineRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        routineId: 'routineId',
      } as protos.google.cloud.bigquery.v2.IDeleteRoutineRequest;
      const deleteStub = sinon
        .stub(client.routineClient, 'deleteRoutine')
        .resolves({});
      await client.deleteRoutine(routineRequest, {}, () => {});
      assert.ok(deleteStub.calledOnce);
    });

    // it('should call listRoutines', async () => {
    //   const routineRequest = {
    //     projectId: 'projectId',
    //     datasetId: 'datasetId',
    //   } as protos.google.cloud.bigquery.v2.IListRoutinesRequest;
    //   const listStub = sinon.stub(client.routineClient, 'listRoutines').returns(new gax.FakePagedAsyncIterable(['routine']));
    //   await client.listRoutines(routineRequest, {}, () => {});
    //   assert.ok(listStub.calledOnce);
    // });
  });

  describe('BigQuery client should call underlying methods in the Table Client', () => {
    after(() => {
      sinon.restore();
    });

    it('should call getTable', async () => {
      const tableRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        tableId: 'tableId',
      } as protos.google.cloud.bigquery.v2.IGetTableRequest;
      const getStub = sinon
        .stub(client.tableClient, 'getTable')
        .resolves('Table');
      await client.getTable(tableRequest, {}, () => {});
      assert.ok(getStub.calledOnce);
    });

    it('should call insertTable', async () => {
      const tableRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        table: {tableReference: {tableId: 'tableId'}}, // Add required fields
      } as protos.google.cloud.bigquery.v2.IInsertTableRequest;
      const insertStub = sinon
        .stub(client.tableClient, 'insertTable')
        .resolves('Table');
      await client.insertTable(tableRequest, {}, () => {});
      assert.ok(insertStub.calledOnce);
    });

    it('should call updateTable', async () => {
      const tableRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        tableId: 'tableId',
        table: {tableReference: {tableId: 'tableId'}}, // Add required fields
      } as protos.google.cloud.bigquery.v2.IUpdateOrPatchTableRequest;
      const updateStub = sinon
        .stub(client.tableClient, 'updateTable')
        .resolves('Table');
      await client.updateTable(tableRequest, {}, () => {});
      assert.ok(updateStub.calledOnce);
    });

    it('should call patchTable', async () => {
      const tableRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        tableId: 'tableId',
        table: {tableReference: {tableId: 'tableId'}}, // Add required fields
      } as protos.google.cloud.bigquery.v2.IUpdateOrPatchTableRequest;
      const patchStub = sinon
        .stub(client.tableClient, 'patchTable')
        .resolves('Table');
      await client.patchTable(tableRequest, {}, () => {});
      assert.ok(patchStub.calledOnce);
    });

    it('should call deleteTable', async () => {
      const tableRequest = {
        projectId: 'projectId',
        datasetId: 'datasetId',
        tableId: 'tableId',
      } as protos.google.cloud.bigquery.v2.IDeleteTableRequest;
      const deleteStub = sinon
        .stub(client.tableClient, 'deleteTable')
        .resolves({});
      await client.deleteTable(tableRequest, {}, () => {});
      assert.ok(deleteStub.calledOnce);
    });

    // it('should call listTables', async () => {
    //   const tableRequest = {
    //     projectId: 'projectId',
    //     datasetId: 'datasetId',
    //   } as protos.google.cloud.bigquery.v2.IListTablesRequest;
    //   const listStub = sinon.stub(client.tableClient, 'listTables').returns(new gax.FakePagedAsyncIterable(['table']));
    //   await client.listTables(tableRequest, {}, () => {});
    //   assert.ok(listStub.calledOnce);
    // });
  });
  describe('BigQuery client should call underlying methods in the Row Access Policy Client', () => {
    after(() => {
      sinon.restore();
    });
    // TODO fix
    // it('should call listRowAccessPolicies', async () => {
    //   const rowAccessPolicyRequest = {
    //     projectId: 'projectId',
    //     datasetId: 'datasetId',
    //     tableId: 'tableId', // Ensure all required fields are present
    //   } as protos.google.cloud.bigquery.v2.IListRowAccessPoliciesRequest;
    //   const listStub = sinon
    //     .stub(client.rowaccesspolicyClient, 'listRowAccessPolicies')
    //     .returns(new gax.FakePagedAsyncIterable(['rowAccessPolicy'])); // Use correct return type
    //   await client.listRowAccessPolicies(rowAccessPolicyRequest, {}, () => {});
    //   assert.ok(listStub.calledOnce);
    // });
  });
});

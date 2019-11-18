const authUserFlow = require('../authUserFlow.js');
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const sinon = require('sinon');
const {assert} = require('chai');
const {BigQuery} = require('@google-cloud/bigquery');
const uuid = require('uuid');

const generateUuid = () => `gcloud-tests-${uuid.v4()}`.replace(/-/gi, '_');
const datasetId = generateUuid();
const tableId = generateUuid();
let projectId;

const bigquery = new BigQuery();

describe('authUserFlow()', function() {
  before(async () => {
    await bigquery.createDataset(datasetId);
    const [tableData] = await bigquery.dataset(datasetId).createTable(tableId);
    projectId = tableData.metadata.tableReference.projectId;
    sinon.stub(authUserFlow.main, 'authFlow');
  });
  after(async () => {
    await bigquery
      .dataset(datasetId)
      .delete({force: true})
      .catch(console.warn);
  });

  it('should run a query', async function() {
    const output = await authUserFlow.main.query(projectId);
    assert.include(output[0].name, 'William');
  });
});

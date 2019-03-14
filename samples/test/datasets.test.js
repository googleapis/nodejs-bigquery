'use strict';

const {BigQuery} = require('@google-cloud/bigquery');
const {assert} = require('chai');
const execa = require('execa');
const uuid = require('uuid');

const exec = async cmd => (await execa.shell(cmd)).stdout;
const datasetId = `gcloud_tests_${uuid.v4()}`.replace(/-/gi, '_');
const bigquery = new BigQuery();

describe(`Datasets`, () => {
  after(async () => {
    await bigquery
      .dataset(datasetId)
      .delete({force: true})
      .catch(console.warn);
  });

  it(`should create a dataset`, async () => {
    const REGION_TAG = 'bigquery_create_dataset';
    const output = await exec(`node ${REGION_TAG}.js ${datasetId}`);
    assert.strictEqual(output, `Dataset ${datasetId} created.`);
    const [exists] = await bigquery.dataset(datasetId).exists();
    assert.ok(exists);
  });

  it(`should list datasets`, async () => {
    const REGION_TAG = 'bigquery_list_datasets';
    const output = await exec(`node ${REGION_TAG}.js`);
    assert.match(output, /Datasets:/);
    assert.match(output, new RegExp(datasetId));
  });

  it(`should delete a dataset`, async () => {
    const REGION_TAG = 'bigquery_delete_dataset';
    const output = await exec(`node ${REGION_TAG}.js ${datasetId}`);
    assert.strictEqual(output, `Dataset ${datasetId} deleted.`);
    const [exists] = await bigquery.dataset(datasetId).exists();
    assert.strictEqual(exists, false);
  });
});

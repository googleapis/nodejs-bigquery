'use strict';

const {BigQuery} = require('@google-cloud/bigquery');
const {assert} = require('chai');
const execa = require('execa');
const uuid = require('uuid');

const exec = async cmd => (await execa.shell(cmd)).stdout;
const DATASET_ID = `gcloud_tests_${uuid.v4()}`.replace(/-/gi, '_');
const bigquery = new BigQuery();

describe(`Datasets`, () => {
  after(async () => {
    await bigquery
      .dataset(DATASET_ID)
      .delete({force: true})
      .catch(console.warn);
  });

  it(`should create a dataset`, async () => {
    const REGION_TAG = 'bigquery_create_dataset';
    const output = await exec(`node ${REGION_TAG}.js ${DATASET_ID}`);
    assert.strictEqual(output, `Dataset ${DATASET_ID} created.`);
    const [exists] = await bigquery.dataset(DATASET_ID).exists();
    assert.ok(exists);
  });

  it(`should list datasets`, async () => {
    const REGION_TAG = 'bigquery_list_datasets';
    const output = await exec(`node ${REGION_TAG}.js`);
    assert.match(output, /Datasets:/);
    assert.match(output, new RegExp(DATASET_ID));
  });

  it(`should delete a dataset`, async () => {
    const REGION_TAG = 'bigquery_delete_dataset';
    const output = await exec(`node ${REGION_TAG}.js ${DATASET_ID}`);
    assert.strictEqual(output, `Dataset ${DATASET_ID} deleted.`);
    const [exists] = await bigquery.dataset(DATASET_ID).exists();
    assert.strictEqual(exists, false);
  });
});

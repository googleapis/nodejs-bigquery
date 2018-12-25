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

const {assert} = require('chai');
const path = require('path');
const uuid = require('uuid');
const execa = require('execa');
const {Storage} = require('@google-cloud/storage');
const {BigQuery} = require('@google-cloud/bigquery');

const storage = new Storage();
const exec = async cmd => {
  const res = await execa.shell(cmd);
  assert.isEmpty(res.stderr);
  return res.stdout;
};
const cmd = `node tables.js`;
const generateUuid = () => `gcloud-tests-${uuid.v4()}`.replace(/-/gi, '_');

const datasetId = generateUuid();
const srcDatasetId = datasetId;
const destDatasetId = generateUuid();
const tableId = generateUuid();
const srcTableId = tableId;
const destTableId = generateUuid();
const schema = `Name:string, Age:integer, Weight:float, IsMagic:boolean`;
const bucketName = generateUuid();
const exportFileName = `data.json`;
const importFileName = `data.avro`;
const localFilePath = path.join(__dirname, `../resources/${importFileName}`);
const rows = [
  {Name: `foo`, Age: 27, Weight: 80.3, IsMagic: true},
  {Name: `bar`, Age: 13, Weight: 54.6, IsMagic: false},
];

const bigquery = new BigQuery();

describe('Tables', () => {
  let projectId;
  before(async () => {
    projectId = await bigquery.getProjectId();
    const [bucket] = await storage.createBucket(bucketName);
    await Promise.all([
      bucket.upload(localFilePath),
      bigquery.createDataset(srcDatasetId),
      bigquery.createDataset(destDatasetId),
    ]);
  });

  after(async () => {
    await bigquery
      .dataset(srcDatasetId)
      .delete({force: true})
      .catch(console.warn);
    await bigquery
      .dataset(destDatasetId)
      .delete({force: true})
      .catch(console.warn);
    await storage
      .bucket(bucketName)
      .deleteFiles({force: true})
      .catch(console.warn);
    await storage
      .bucket(bucketName)
      .deleteFiles({force: true})
      .catch(console.warn);
    await bigquery
      .dataset(srcDatasetId)
      .delete({force: true})
      .catch(console.warn);
    await storage
      .bucket(bucketName)
      .delete()
      .catch(console.warn);
  });

  it(`should create a table`, async () => {
    const output = await exec(
      `${cmd} create ${projectId} ${datasetId} ${tableId} "${schema}"`
    );
    assert.strictEqual(output, `Table ${tableId} created.`);
    const [exists] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .exists();
    assert.ok(exists);
  });

  it(`should list tables`, async () => {
    const output = await exec(`${cmd} list ${projectId} ${datasetId}`);
    assert.match(output, /Tables:/);
    assert.match(output, new RegExp(tableId));
  });

  it(`should load a local CSV file`, async () => {
    const output = await exec(
      `${cmd} load-local-csv ${projectId} ${datasetId} ${tableId} ${localFilePath}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.strictEqual(rows.length, 1);
  });

  it(`should browse table rows`, async () => {
    const output = await exec(
      `${cmd} browse ${projectId} ${datasetId} ${tableId}`
    );
    assert.strictEqual(
      output,
      `Rows:\n{ Name: 'Gandalf', Age: 2000, Weight: 140, IsMagic: true }`
    );
  });

  it(`should extract a table to GCS`, async () => {
    const output = await exec(
      `${cmd} extract ${projectId} ${datasetId} ${tableId} ${bucketName} ${exportFileName}`
    );

    assert.match(output, /completed\./);
    const [exists] = await storage
      .bucket(bucketName)
      .file(exportFileName)
      .exists();
    assert.ok(exists);
  });

  it(`should load a GCS ORC file`, async () => {
    const tableId = generateUuid();
    const output = await exec(
      `${cmd} load-gcs-orc ${projectId} ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS Parquet file`, async () => {
    const tableId = generateUuid();
    const output = await exec(
      `${cmd} load-gcs-parquet ${projectId} ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS CSV file with explicit schema`, async () => {
    const tableId = generateUuid();
    const output = await exec(
      `${cmd} load-gcs-csv ${projectId} ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS JSON file with explicit schema`, async () => {
    const tableId = generateUuid();
    const output = await exec(
      `${cmd} load-gcs-json ${projectId} ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS CSV file with autodetected schema`, async () => {
    const tableId = generateUuid();
    const output = await exec(
      `${cmd} load-gcs-csv-autodetect ${projectId} ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS JSON file with autodetected schema`, async () => {
    const tableId = generateUuid();
    const output = await exec(
      `${cmd} load-gcs-json-autodetect ${projectId} ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS CSV file truncate table`, async () => {
    const tableId = generateUuid();
    const output = await exec(
      `${cmd} load-gcs-csv-truncate ${projectId} ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS JSON file truncate table`, async () => {
    const tableId = generateUuid();
    const output = await exec(
      `${cmd} load-gcs-json-truncate ${projectId} ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS parquet file truncate table`, async () => {
    const tableId = generateUuid();
    const output = await exec(
      `${cmd} load-gcs-parquet-truncate ${projectId} ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS ORC file truncate table`, async () => {
    const tableId = generateUuid();
    const output = await exec(
      `${cmd} load-gcs-orc-truncate ${projectId} ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should copy a table`, async () => {
    const output = await exec(
      `${cmd} copy ${projectId} ${srcDatasetId} ${srcTableId} ${destDatasetId} ${destTableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(destDatasetId)
      .table(destTableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should insert rows`, async () => {
    const res = await execa.shell(
      `${cmd} insert ${projectId} ${datasetId} ${tableId} 'foo.bar'`
    );
    assert.match(
      res.stderr,
      /"json_or_file" \(or the file it points to\) is not a valid JSON array\./
    );
    const output = await exec(
      `${cmd} insert ${projectId} ${datasetId} ${tableId} '${JSON.stringify(
        rows
      )}'`
    );
    assert.match(output, /Inserted 2 rows/);
  });

  it(`should delete a table`, async () => {
    const output = await exec(
      `${cmd} delete ${projectId} ${datasetId} ${tableId}`
    );
    assert.strictEqual(output, `Table ${tableId} deleted.`);
    const [exists] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .exists();
    assert.strictEqual(exists, false);
  });
});

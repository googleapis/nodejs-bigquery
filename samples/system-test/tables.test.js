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

const assert = require(`assert`);
const path = require(`path`);
const uuid = require(`uuid`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const {Storage} = require(`@google-cloud/storage`);
const {BigQuery} = require(`@google-cloud/bigquery`);

const storage = new Storage();

const cwd = path.join(__dirname, `..`);
const cmd = `node tables.js`;
const generateUuid = () =>
  `nodejs_docs_samples_${uuid.v4().replace(/-/gi, '_')}`;
const projectId = process.env.GCLOUD_PROJECT;

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

describe(`Tables`, () => {
  before(tools.checkCredentials);

  before(async () => {
    const [bucket] = await storage.createBucket(bucketName);
    await Promise.all([
      bucket.upload(localFilePath),
      bigquery.createDataset(srcDatasetId),
      bigquery.createDataset(destDatasetId),
    ]);
  });

  after(async () => {
    try {
      await bigquery.dataset(srcDatasetId).delete({force: true});
    } catch (err) {} // ignore error
    try {
      await bigquery.dataset(destDatasetId).delete({force: true});
    } catch (err) {} // ignore error
    try {
      await storage.bucket(bucketName).deleteFiles({force: true});
    } catch (err) {} // ignore error
    try {
      // Try deleting files a second time
      await storage.bucket(bucketName).deleteFiles({force: true});
    } catch (err) {} // ignore error
    try {
      await bigquery.dataset(srcDatasetId).delete({force: true});
    } catch (err) {} // ignore error
    try {
      await storage.bucket(bucketName).delete();
    } catch (err) {} // ignore error
  });

  it(`should create a table`, async () => {
    const output = await tools.runAsync(
      `${cmd} create ${projectId} ${datasetId} ${tableId} "${schema}"`,
      cwd
    );
    assert.strictEqual(output, `Table ${tableId} created.`);
    const [exists] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .exists();
    assert.ok(exists);
  });

  it(`should list tables`, async () => {
    const output = await tools.runAsync(
      `${cmd} list ${projectId} ${datasetId}`,
      cwd
    );
    assert.ok(output.includes(`Tables:`));
    assert.ok(output.includes(tableId));
  });

  it(`should load a local CSV file`, async () => {
    const output = await tools.runAsync(
      `${cmd} load-local-csv ${projectId} ${datasetId} ${tableId} ${localFilePath}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.strictEqual(rows.length, 1);
  });

  it(`should browse table rows`, async () => {
    const output = await tools.runAsync(
      `${cmd} browse ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.strictEqual(
      output,
      `Rows:\n{ Name: 'Gandalf', Age: 2000, Weight: 140, IsMagic: true }`
    );
  });

  it(`should extract a table to GCS`, async () => {
    const output = await tools.runAsync(
      `${cmd} extract ${projectId} ${datasetId} ${tableId} ${bucketName} ${exportFileName}`,
      cwd
    );

    assert.ok(new RegExp(/completed\./).test(output));
    const [exists] = await storage
      .bucket(bucketName)
      .file(exportFileName)
      .exists();
    assert.ok(exists);
  });

  it(`should load a GCS ORC file`, async () => {
    const tableId = generateUuid();

    const output = await tools.runAsync(
      `${cmd} load-gcs-orc ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS Parquet file`, async () => {
    const tableId = generateUuid();

    const output = await tools.runAsync(
      `${cmd} load-gcs-parquet ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS CSV file with explicit schema`, async () => {
    const tableId = generateUuid();

    const output = await tools.runAsync(
      `${cmd} load-gcs-csv ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS JSON file with explicit schema`, async () => {
    const tableId = generateUuid();

    const output = await tools.runAsync(
      `${cmd} load-gcs-json ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS CSV file with autodetected schema`, async () => {
    const tableId = generateUuid();

    const output = await tools.runAsync(
      `${cmd} load-gcs-csv-autodetect ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS JSON file with autodetected schema`, async () => {
    const tableId = generateUuid();

    const output = await tools.runAsync(
      `${cmd} load-gcs-json-autodetect ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS CSV file truncate table`, async () => {
    const tableId = generateUuid();

    const output = await tools.runAsync(
      `${cmd} load-gcs-csv-truncate ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS JSON file truncate table`, async () => {
    const tableId = generateUuid();

    const output = await tools.runAsync(
      `${cmd} load-gcs-json-truncate ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS parquet file truncate table`, async () => {
    const tableId = generateUuid();

    const output = await tools.runAsync(
      `${cmd} load-gcs-parquet-truncate ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS ORC file truncate table`, async () => {
    const tableId = generateUuid();

    const output = await tools.runAsync(
      `${cmd} load-gcs-orc-truncate ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should copy a table`, async () => {
    const output = await tools.runAsync(
      `${cmd} copy ${projectId} ${srcDatasetId} ${srcTableId} ${destDatasetId} ${destTableId}`,
      cwd
    );
    assert.ok(new RegExp(/completed\./).test(output));
    const [rows] = await bigquery
      .dataset(destDatasetId)
      .table(destTableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should insert rows`, async () => {
    tools
      .runAsync(
        `${cmd} insert ${projectId} ${datasetId} ${tableId} 'foo.bar'`,
        cwd
      )
      .catch(err => {
        assert.ok(
          err.message.includes(
            `"json_or_file" (or the file it points to) is not a valid JSON array.`
          )
        );
      });

    const output = await tools.runAsync(
      `${cmd} insert ${projectId} ${datasetId} ${tableId} '${JSON.stringify(
        rows
      )}'`,
      cwd
    );
    assert.ok(output.includes(`Inserted 2 rows`));
  });

  it(`should delete a table`, async () => {
    const output = await tools.runAsync(
      `${cmd} delete ${projectId} ${datasetId} ${tableId}`,
      cwd
    );
    assert.strictEqual(output, `Table ${tableId} deleted.`);
    const [exists] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .exists();
    assert.strictEqual(exists, false);
  });
});

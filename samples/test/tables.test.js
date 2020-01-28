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

const {assert} = require('chai');
const {describe, it, before, after, beforeEach} = require('mocha');
const path = require('path');
const uuid = require('uuid');
const cp = require('child_process');
const {Storage} = require('@google-cloud/storage');
const {BigQuery} = require('@google-cloud/bigquery');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const storage = new Storage();
const generateUuid = () => `gcloud-tests-${uuid.v4()}`.replace(/-/gi, '_');

const datasetId = generateUuid();
const srcDatasetId = datasetId;
const destDatasetId = generateUuid();
const tableId = generateUuid();
const nestedTableId = generateUuid();
const partitionedTableId = generateUuid();
const srcTableId = tableId;
const destTableId = generateUuid();
const bucketName = generateUuid();
const exportCSVFileName = `data.json`;
const exportJSONFileName = `data.json`;
const importFileName = `data.avro`;
const partialDataFileName = `partialdata.csv`;
const localFilePath = path.join(__dirname, `../resources/${importFileName}`);
const partialDataFilePath = path.join(
  __dirname,
  `../resources/${partialDataFileName}`
);
const bigquery = new BigQuery();

describe('Tables', () => {
  before(async () => {
    const [bucket] = await storage.createBucket(bucketName);
    await Promise.all([
      bucket.upload(localFilePath),
      bigquery.createDataset(srcDatasetId),
      bigquery.createDataset(destDatasetId),
    ]);
  });

  // to avoid getting rate limited
  beforeEach(done => setTimeout(done, 500));

  after(async () => {
    await bigquery
      .dataset(srcDatasetId)
      .delete({force: true})
      .catch(console.warn);
    await bigquery
      .dataset(destDatasetId)
      .delete({force: true})
      .catch(console.warn);
    await bigquery
      .dataset(datasetId)
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
    const output = execSync(`node createTable.js ${datasetId} ${tableId}`);
    assert.include(output, `Table ${tableId} created.`);
    const [exists] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .exists();
    assert.ok(exists);
  });

  it(`should create a partitioned table`, async () => {
    const output = execSync(
      `node createTablePartitioned.js ${datasetId} ${partitionedTableId}`
    );
    assert.include(
      output,
      `Table ${partitionedTableId} created with partitioning:`
    );
    assert.include(output, `{ type: 'DAY', field: 'date' }`);
    const [exists] = await bigquery
      .dataset(datasetId)
      .table(partitionedTableId)
      .exists();
    assert.ok(exists);
  });

  it(`should create a table with nested schema`, async () => {
    const output = execSync(
      `node nestedRepeatedSchema.js ${datasetId} ${nestedTableId}`
    );
    assert.include(output, `Table ${nestedTableId} created.`);
    const [exists] = await bigquery
      .dataset(datasetId)
      .table(nestedTableId)
      .exists();
    assert.ok(exists);
  });

  it(`should retrieve a table if it exists`, async () => {
    const output = execSync(`node getTable.js ${datasetId} ${tableId}`);
    assert.include(output, 'Table:');
    assert.include(output, datasetId);
    assert.include(output, tableId);
  });

  it(`should list tables`, async () => {
    const output = execSync(`node listTables.js ${datasetId}`);
    assert.match(output, /Tables:/);
    assert.match(output, new RegExp(tableId));
  });

  it(`should update table's description`, async () => {
    const output = execSync(
      `node updateTableDescription.js ${datasetId} ${tableId}`
    );
    assert.include(output, `${tableId} description: New table description.`);
  });

  it(`should update table's expiration`, async () => {
    const currentTime = Date.now();
    const expirationTime = currentTime + 1000 * 60 * 60 * 24 * 5;
    const output = execSync(
      `node updateTableExpiration.js ${datasetId} ${tableId} ${expirationTime}`
    );
    assert.include(output, `${tableId}`);
    assert.include(output, `expiration: ${expirationTime}`);
  });

  it(`should add label to a table`, async () => {
    const output = execSync(`node labelTable.js ${datasetId} ${tableId}`);
    assert.include(output, `${tableId} labels:`);
    assert.include(output, "{ color: 'green' }");
  });

  it(`should delete a label from a table`, async () => {
    const output = execSync(`node deleteLabelTable.js ${datasetId} ${tableId}`);
    assert.include(output, `${tableId} labels:`);
    assert.include(output, 'undefined');
  });

  it(`should load a local CSV file`, async () => {
    const output = execSync(
      `node loadLocalFile.js ${datasetId} ${tableId} ${localFilePath}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.strictEqual(rows.length, 1);
  });

  it(`should browse table rows`, async () => {
    const output = execSync(`node browseRows.js ${datasetId} ${tableId}`);
    assert.include(
      output,
      `Rows:\n{ Name: 'Gandalf', Age: 2000, Weight: 140, IsMagic: true }`
    );
  });

  it(`should extract a table to GCS CSV file`, async () => {
    const output = execSync(
      `node extractTableToGCS.js ${datasetId} ${tableId} ${bucketName} ${exportCSVFileName}`
    );

    assert.match(output, /completed\./);
    const [exists] = await storage
      .bucket(bucketName)
      .file(exportCSVFileName)
      .exists();
    assert.ok(exists);
  });

  it(`should extract a table to GCS JSON file`, async () => {
    const output = execSync(
      `node extractTableJSON.js ${datasetId} ${tableId} ${bucketName} ${exportJSONFileName}`
    );

    assert.match(output, /completed\./);
    const [exists] = await storage
      .bucket(bucketName)
      .file(exportJSONFileName)
      .exists();
    assert.ok(exists);
  });

  it(`should extract a table to GCS compressed file`, async () => {
    const output = execSync(
      `node extractTableCompressed.js ${datasetId} ${tableId} ${bucketName} ${exportCSVFileName}`
    );

    assert.match(output, /completed\./);
    const [exists] = await storage
      .bucket(bucketName)
      .file(exportCSVFileName)
      .exists();
    assert.ok(exists);
  });

  it(`should load a GCS ORC file`, async () => {
    const tableId = generateUuid();
    const output = execSync(`node loadTableGCSORC.js ${datasetId} ${tableId}`);
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS Parquet file`, async () => {
    const tableId = generateUuid();
    const output = execSync(
      `node loadTableGCSParquet.js ${datasetId} ${tableId}`
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
    const output = execSync(`node loadCSVFromGCS.js ${datasetId} ${tableId}`);
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS JSON file with explicit schema`, async () => {
    const tableId = generateUuid();
    const output = execSync(`node loadJSONFromGCS.js ${datasetId} ${tableId}`);
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should load a GCS CSV file to partitioned table`, async () => {
    const tableId = generateUuid();
    const output = execSync(
      `node loadTablePartitioned.js ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should add a new column via a GCS file load job`, async () => {
    const destTableId = generateUuid();
    execSync(
      `node createTable.js ${datasetId} ${destTableId} 'Name:STRING, Age:INTEGER, Weight:FLOAT'`
    );
    const output = execSync(
      `node addColumnLoadAppend.js ${datasetId} ${destTableId} ${localFilePath}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should relax a column via a GCS file load job`, async () => {
    const destTableId = generateUuid();
    execSync(`node createTable.js ${datasetId} ${destTableId}`);
    const output = execSync(
      `node relaxColumnLoadAppend.js ${datasetId} ${destTableId} ${partialDataFilePath}`
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
    const output = execSync(
      `node loadCSVFromGCSAutodetect.js ${datasetId} ${tableId}`
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
    const output = execSync(
      `node loadJSONFromGCSAutodetect.js ${datasetId} ${tableId}`
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
    const output = execSync(
      `node loadCSVFromGCSTruncate.js ${datasetId} ${tableId}`
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
    const output = execSync(
      `node loadJSONFromGCSTruncate.js ${datasetId} ${tableId}`
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
    const output = execSync(
      `node loadParquetFromGCSTruncate.js ${datasetId} ${tableId}`
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
    const output = execSync(
      `node loadOrcFromGCSTruncate.js ${datasetId} ${tableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should copy a table`, async () => {
    const output = execSync(
      `node copyTable.js ${srcDatasetId} ${srcTableId} ${destDatasetId} ${destTableId}`
    );
    assert.match(output, /completed\./);
    const [rows] = await bigquery
      .dataset(destDatasetId)
      .table(destTableId)
      .getRows();
    assert.ok(rows.length > 0);
  });

  it(`should insert rows`, async () => {
    const output = execSync(
      `node insertRowsAsStream.js ${datasetId} ${tableId}`
    );
    assert.match(output, /Inserted 2 rows/);
  });

  it(`copy multiple source tables to a given destination`, async () => {
    execSync(`node createTable.js ${datasetId} destinationTable`);
    const output = execSync(
      `node copyTableMultipleSource.js ${datasetId} ${tableId} destinationTable`
    );
    assert.include(output, 'sourceTable');
    assert.include(output, 'destinationTable');
    assert.include(output, 'createDisposition');
    assert.include(output, 'writeDisposition');
  });

  it(`should add a column to the schema`, async () => {
    const column = `name: 'size', type: 'STRING'`;
    const output = execSync(`node addEmptyColumn.js ${datasetId} ${tableId}`);
    assert.include(output, column);
  });

  it(`should update a column from 'REQUIRED' TO 'NULLABLE'`, async () => {
    const column = `name: 'Name', type: 'STRING', mode: 'NULLABLE'`;
    execSync(`node createTable.js ${datasetId} newTable`);
    const output = execSync(`node relaxColumn.js ${datasetId} newTable`);
    assert.include(output, column);
  });

  it(`should get labels on a table`, async () => {
    execSync(`node labelTable.js ${datasetId} ${tableId}`);
    const output = execSync(`node getTableLabels.js ${datasetId} ${tableId}`);
    assert.include(output, `${tableId} Labels:`);
    assert.include(output, 'color: green');
  });

  describe(`Delete Table`, () => {
    const datasetId = `gcloud_tests_${uuid.v4()}`.replace(/-/gi, '_');
    const tableId = `gcloud_tests_${uuid.v4()}`.replace(/-/gi, '_');

    before(async () => {
      const datasetOptions = {
        location: 'US',
      };
      const tableOptions = {
        location: 'US',
      };

      await bigquery.createDataset(datasetId, datasetOptions);
      // Create a new table in the dataset
      await bigquery.dataset(datasetId).createTable(tableId, tableOptions);
    });

    after(async () => {
      await bigquery
        .dataset(datasetId)
        .delete({force: true})
        .catch(console.warn);
    });

    it(`should delete a table`, async () => {
      const output = execSync(`node deleteTable.js ${datasetId} ${tableId}`);
      assert.include(output, `Table ${tableId} deleted.`);
      const [exists] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .exists();
      assert.strictEqual(exists, false);
    });
  });
});

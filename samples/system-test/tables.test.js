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

const test = require(`ava`);
const path = require(`path`);
const uuid = require(`uuid`);

const tools = require(`@google-cloud/nodejs-repo-tools`);
const {Storage} = require(`@google-cloud/storage`);

const BigQuery = require(`@google-cloud/bigquery`);

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

test.before(tools.checkCredentials);
test.before(async () => {
  const [bucket] = await storage.createBucket(bucketName);
  await Promise.all([
    bucket.upload(localFilePath),
    bigquery.createDataset(srcDatasetId),
    bigquery.createDataset(destDatasetId),
  ]);
});
test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);
test.after.always(async () => {
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

test.serial(`should create a table`, async t => {
  const output = await tools.runAsync(
    `${cmd} create ${projectId} ${datasetId} ${tableId} "${schema}"`,
    cwd
  );
  t.is(output, `Table ${tableId} created.`);
  const [exists] = await bigquery
    .dataset(datasetId)
    .table(tableId)
    .exists();
  t.true(exists);
});

test.serial(`should list tables`, async t => {
  t.plan(0);
  await tools
    .tryTest(async assert => {
      const output = await tools.runAsync(
        `${cmd} list ${projectId} ${datasetId}`,
        cwd
      );
      assert(output.includes(`Tables:`));
      assert(output.includes(tableId));
    })
    .start();
});

test.serial(`should load a local CSV file`, async t => {
  t.plan(1);
  const output = await tools.runAsync(
    `${cmd} load-local-csv ${projectId} ${datasetId} ${tableId} ${localFilePath}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows();
      assert.strictEqual(rows.length, 1);
    })
    .start();
});

test.serial(`should browse table rows`, async t => {
  const output = await tools.runAsync(
    `${cmd} browse ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.is(
    output,
    `Rows:\n{ Name: 'Gandalf', Age: 2000, Weight: 140, IsMagic: true }`
  );
});

test.serial(`should extract a table to GCS`, async t => {
  t.plan(1);
  const output = await tools.runAsync(
    `${cmd} extract ${projectId} ${datasetId} ${tableId} ${bucketName} ${exportFileName}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [exists] = await storage
        .bucket(bucketName)
        .file(exportFileName)
        .exists();
      assert(exists);
    })
    .start();
});

test(`should load a GCS ORC file`, async t => {
  t.plan(1);
  const tableId = generateUuid();

  const output = await tools.runAsync(
    `${cmd} load-gcs-orc ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows();
      assert(rows.length > 0);
    })
    .start();
});

test(`should load a GCS Parquet file`, async t => {
  t.plan(1);
  const tableId = generateUuid();

  const output = await tools.runAsync(
    `${cmd} load-gcs-parquet ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows();
      assert(rows.length > 0);
    })
    .start();
});

test(`should load a GCS CSV file with explicit schema`, async t => {
  t.plan(1);
  const tableId = generateUuid();

  const output = await tools.runAsync(
    `${cmd} load-gcs-csv ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows();
      assert(rows.length > 0);
    })
    .start();
});

test(`should load a GCS JSON file with explicit schema`, async t => {
  t.plan(1);
  const tableId = generateUuid();

  const output = await tools.runAsync(
    `${cmd} load-gcs-json ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows();
      assert(rows.length > 0);
    })
    .start();
});

test(`should load a GCS CSV file with autodetected schema`, async t => {
  t.plan(1);
  const tableId = generateUuid();

  const output = await tools.runAsync(
    `${cmd} load-gcs-csv-autodetect ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows();
      assert(rows.length > 0);
    })
    .start();
});

test(`should load a GCS JSON file with autodetected schema`, async t => {
  t.plan(1);
  const tableId = generateUuid();

  const output = await tools.runAsync(
    `${cmd} load-gcs-json-autodetect ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows();
      assert(rows.length > 0);
    })
    .start();
});

test(`should load a GCS CSV file truncate table`, async t => {
  t.plan(1);
  const tableId = generateUuid();

  const output = await tools.runAsync(
    `${cmd} load-gcs-csv-truncate ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows();
      assert(rows.length > 0);
    })
    .start();
});

test(`should load a GCS JSON file truncate table`, async t => {
  t.plan(1);
  const tableId = generateUuid();

  const output = await tools.runAsync(
    `${cmd} load-gcs-json-truncate ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows();
      assert(rows.length > 0);
    })
    .start();
});

test(`should load a GCS parquet file truncate table`, async t => {
  t.plan(1);
  const tableId = generateUuid();

  const output = await tools.runAsync(
    `${cmd} load-gcs-parquet-truncate ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows();
      assert(rows.length > 0);
    })
    .start();
});

test(`should load a GCS ORC file truncate table`, async t => {
  t.plan(1);
  const tableId = generateUuid();

  const output = await tools.runAsync(
    `${cmd} load-gcs-orc-truncate ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(datasetId)
        .table(tableId)
        .getRows();
      assert(rows.length > 0);
    })
    .start();
});

test.serial(`should copy a table`, async t => {
  t.plan(1);
  const output = await tools.runAsync(
    `${cmd} copy ${projectId} ${srcDatasetId} ${srcTableId} ${destDatasetId} ${destTableId}`,
    cwd
  );
  t.regex(output, /completed\./);
  await tools
    .tryTest(async assert => {
      const [rows] = await bigquery
        .dataset(destDatasetId)
        .table(destTableId)
        .getRows();
      assert(rows.length > 0);
    })
    .start();
});

test.serial(`should insert rows`, async t => {
  t.plan(3);
  const err = await t.throws(
    tools.runAsync(
      `${cmd} insert ${projectId} ${datasetId} ${tableId} 'foo.bar'`,
      cwd
    )
  );
  t.true(
    err.message.includes(
      `"json_or_file" (or the file it points to) is not a valid JSON array.`
    )
  );
  const output = await tools.runAsync(
    `${cmd} insert ${projectId} ${datasetId} ${tableId} '${JSON.stringify(
      rows
    )}'`,
    cwd
  );
  t.is(output.includes(`Inserted 2 rows`), true);
});

test.serial(`should delete a table`, async t => {
  const output = await tools.runAsync(
    `${cmd} delete ${projectId} ${datasetId} ${tableId}`,
    cwd
  );
  t.is(output, `Table ${tableId} deleted.`);
  const [exists] = await bigquery
    .dataset(datasetId)
    .table(tableId)
    .exists();
  t.false(exists);
});

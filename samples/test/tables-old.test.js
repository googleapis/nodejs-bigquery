// // Copyright 2017 Google LLC
// //
// // Licensed under the Apache License, Version 2.0 (the "License");
// // you may not use this file except in compliance with the License.
// // You may obtain a copy of the License at
// //
// //      http://www.apache.org/licenses/LICENSE-2.0
// //
// // Unless required by applicable law or agreed to in writing, software
// // distributed under the License is distributed on an "AS IS" BASIS,
// // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// // See the License for the specific language governing permissions and
// // limitations under the License.

// 'use strict';

// const {assert} = require('chai');
// const {describe, it, before, after, beforeEach} = require('mocha');
// const path = require('path');
// const {randomUUID} = require('crypto');
// const cp = require('child_process');
// // const {Storage} = require('@google-cloud/storage');
// const {BigQueryClient} = require('@google-cloud/bigquery');
// // const {DataCatalogClient, PolicyTagManagerClient} =
// //   require('@google-cloud/datacatalog').v1;
// // const dataCatalog = new DataCatalogClient();
// // const policyTagManager = new PolicyTagManagerClient();

// const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

// const GCLOUD_TESTS_PREFIX = 'nodejs_samples_tests';

// // const storage = new Storage();

// const generateUuid = () =>
//   `${GCLOUD_TESTS_PREFIX}_${randomUUID()}`.replace(/-/gi, '_');

// const datasetId = generateUuid();
// const srcDatasetId = datasetId;
// const destDatasetId = generateUuid();
// const tableId = generateUuid();
// const nestedTableId = generateUuid();
// const partitionedTableId = generateUuid();
// const srcTableId = tableId;
// const aclTableId = generateUuid();
// const destTableId = generateUuid();
// const viewId = generateUuid();
// const bucketName = generateUuid();
// const exportCSVFileName = 'data.json';
// const exportJSONFileName = 'data.json';
// const importFileName = 'data.avro';
// const partialDataFileName = 'partialdata.csv';
// const localFilePath = path.join(__dirname, `../resources/${importFileName}`);
// const testExpirationTime = Date.now() + 2 * 60 * 60 * 1000; // Add two hours
// let policyTag0;
// let policyTag1;
// const partialDataFilePath = path.join(
//   __dirname,
//   `../resources/${partialDataFileName}`,
// );
// //TODO(coleleah): remove fallback: false if needed
// // tracked in b/429226336

// const bigquery = new BigQueryClient({}, {opts: {fallback: false}});
// // the GCLOUD_PROJECT environment variable is set as part of test harness setup
// const projectId = process.env.GCLOUD_PROJECT;

// // TODO(coleleah): update
// describe('Tables', () => {
//     // // TODO(coleleah): update
// //   // Only delete a resource if it is older than 24 hours. That will prevent
// //   // collisions with parallel CI test runs.
// //   function isResourceStale(creationTime) {
// //     const oneDayMs = 86400000;
// //     const now = new Date();
// //     const created = new Date(creationTime * 1000);
// //     return now.getTime() - created.getTime() >= oneDayMs;
// //   }
// // // TODO(coleleah): update
// //   async function deleteStaleTaxonomies() {
// //     const location = 'us';
// //     const listTaxonomiesRequest = {
// //       parent: dataCatalog.locationPath(projectId, location),
// //     };
// //     let [taxonomies] = await policyTagManager.listTaxonomies(
// //       listTaxonomiesRequest,
// //     );

// //     taxonomies = taxonomies.filter(taxonomy => {
// //       return taxonomy.displayName.includes(GCLOUD_TESTS_PREFIX);
// //     });
// //     taxonomies.forEach(async taxonomy => {
// //       if (isResourceStale(taxonomy.taxonomyTimestamps.createTime.seconds)) {
// //         try {
// //           await policyTagManager.deleteTaxonomy({name: taxonomy.name});
// //         } catch (e) {
// //           console.error(e);
// //         }
// //       }
// //     });
// //   }
// //   // TODO(coleleah): update
//   before(async () => {
//     if (projectId === undefined) {
//       throw Error(
//         'GCLOUD_PROJECT must be defined as an environment variable before tests can be run',
//       );
//     }
//     const datasetObject = {
//         datasetReference: {
//           datasetId: datasetId,
//         },
//         location: 'US',
//       };
//     const datasetRequest = {
//         projectId: projectId,
//         dataset: datasetObject,
//       };
//     await bigquery.insertDataset(datasetRequest)
// //     const [bucket] = await storage.createBucket(bucketName);
// //     await Promise.all([
// //       bucket.upload(localFilePath),
// //       bigquery.createDataset(srcDatasetId),
// //       bigquery.createDataset(destDatasetId),
// //     ]);

// //     // Delete stale Data Catalog resources
// //     projectId = await dataCatalog.getProjectId();
// //     await deleteStaleTaxonomies();

// //     // Create Data Catalog resources
// //     const parent = dataCatalog.locationPath(projectId, 'us');
// //     const taxRequest = {
// //       parent,
// //       taxonomy: {
// //         displayName: generateUuid(),
// //         activatedPolicyTypes: ['FINE_GRAINED_ACCESS_CONTROL'],
// //       },
// //     };
// //     const [taxonomy] = await policyTagManager.createTaxonomy(taxRequest);
// //     const tagRequest = {
// //       parent: taxonomy.name,
// //       policyTag: {
// //         displayName: generateUuid(),
// //       },
// //     };
// //     [policyTag0] = await policyTagManager.createPolicyTag(tagRequest);
// //     tagRequest.policyTag.displayName = generateUuid();
// //     [policyTag1] = await policyTagManager.createPolicyTag(tagRequest);
//   });
//   after(async () => {
//     const deleteRequest = {
//         projectId: projectId,
//         datasetId: datasetId,
//         deleteContents: true
//     }
//     await bigquery.deleteDataset(deleteRequest)
//   });

// //   // TODO(coleleah): update
// //   // to avoid getting rate limited
// //   beforeEach(async function () {
// //     this.currentTest.retries(2);
// //   });
// // // TODO(coleleah): update
// //   after(async () => {
// //     await bigquery
// //       .dataset(srcDatasetId)
// //       .delete({force: true})
// //       .catch(console.warn);
// //     await bigquery
// //       .dataset(destDatasetId)
// //       .delete({force: true})
// //       .catch(console.warn);
// //     await bigquery.dataset(datasetId).delete({force: true}).catch(console.warn);
// //     await storage
// //       .bucket(bucketName)
// //       .deleteFiles({force: true})
// //       .catch(console.warn);
// //     await storage
// //       .bucket(bucketName)
// //       .deleteFiles({force: true})
// //       .catch(console.warn);
// //     await bigquery
// //       .dataset(srcDatasetId)
// //       .delete({force: true})
// //       .catch(console.warn);
// //     await storage.bucket(bucketName).delete().catch(console.warn);
// //   });
//     describe('table creation', () => {
//       it('should create a table', async () => {
//         const output = execSync(`node tables/createTable.js ${datasetId} ${tableId}`);
//         assert.include(output, `Table ${tableId} created.`);
//         const tableRequest = {
//             projectId: projectId,
//             datasetId: datasetId,
//             tableId: tableId
//         }
//         const [response] = await bigquery.getTable(tableRequest)
//         assert.ok(response);
//       });
//     // // TODO(coleleah): update
// //   it('should create a partitioned table', async () => {
// //     const output = execSync(
// //       `node createTablePartitioned.js ${datasetId} ${partitionedTableId}`,
// //     );
// //     assert.include(
// //       output,
// //       `Table ${partitionedTableId} created with partitioning:`,
// //     );
// //     assert.include(output, "type: 'DAY'");
// //     assert.include(output, "field: 'date'");
// //     const [exists] = await bigquery
// //       .dataset(datasetId)
// //       .table(partitionedTableId)
// //       .exists();
// //     assert.ok(exists);
// //   });
// // // TODO(coleleah): update
// //   it('should create an integer range partitioned table', async () => {
// //     const rangePartTableId = generateUuid();
// //     const output = execSync(
// //       `node createTableRangePartitioned.js ${datasetId} ${rangePartTableId}`,
// //     );
// //     assert.include(
// //       output,
// //       `Table ${rangePartTableId} created with integer range partitioning:`,
// //     );
// //     assert.include(
// //       output,
// //       "range: { start: '0', end: '100000', interval: '10' }",
// //     );
// //     const [exists] = await bigquery
// //       .dataset(datasetId)
// //       .table(rangePartTableId)
// //       .exists();
// //     assert.ok(exists);
// //   });
// // // TODO(coleleah): update
// //   it('should create a clustered table', async () => {
// //     const clusteredTableId = generateUuid();
// //     const output = execSync(
// //       `node createTableClustered.js ${datasetId} ${clusteredTableId}`,
// //     );
// //     assert.include(
// //       output,
// //       `Table ${clusteredTableId} created with clustering:`,
// //     );
// //     assert.include(output, "{ fields: [ 'city', 'zipcode' ] }");
// //     const [exists] = await bigquery
// //       .dataset(datasetId)
// //       .table(clusteredTableId)
// //       .exists();
// //     assert.ok(exists);
// //   });
// // // TODO(coleleah): update
// //   it('should create a table with nested schema', async () => {
// //     const output = execSync(
// //       `node nestedRepeatedSchema.js ${datasetId} ${nestedTableId}`,
// //     );
// //     assert.include(output, `Table ${nestedTableId} created.`);
// //     const [exists] = await bigquery
// //       .dataset(datasetId)
// //       .table(nestedTableId)
// //       .exists();
// //     assert.ok(exists);
// //   });
// // // TODO(coleleah): update
// //   it('should create a table with column-level security', async () => {
// //     const output = execSync(
// //       `node createTableColumnACL.js ${datasetId} ${aclTableId} ${policyTag0.name}`,
// //     );
// //     assert.include(output, `Created table ${aclTableId} with schema:`);
// //     assert.include(output, policyTag0.name);
// //     const [exists] = await bigquery
// //       .dataset(datasetId)
// //       .table(aclTableId)
// //       .exists();
// //     assert.ok(exists);
// //   });

//     })
//     describe('table list/get', () => {
//     const schema = [
//         {name: 'Name', type: 'STRING', mode: 'REQUIRED'},
//         {name: 'Age', type: 'INTEGER'},
//         {name: 'Weight', type: 'FLOAT'},
//         {name: 'IsMagic', type: 'BOOLEAN'},
//     ]
//         const table2Id = tableId + '_2';
//             const table1Request = {
//                 projectId,
//                 datasetId,
//                 table: {
//                     tableReference: {
//                     projectId: projectId,
//                     datasetId: datasetId,
//                     tableId: tableId,
//                     },
//                     schema: {fields: schema},
//                     location: 'US',
//                 },
//             };
//             const table2Request = {
//                 projectId,
//                 datasetId,
//                 table: {
//                     tableReference: {
//                     projectId: projectId,
//                     datasetId: datasetId,
//                     tableId: table2Id,
//                     },
//                     schema: {fields: schema},
//                     location: 'US',
//                 },
//             };

//         // create two tables for listing
//         before(async () => {
//             const [table1] = await bigquery.insertTable(table1Request);
//             const [table2] = await bigquery.insertTable(table2Request);
//             assert.ok(table1);
//             assert.ok(table2);
//         })
//         // tear down tables created
//         after(async () => {
//             const table1DeleteRequest = {
//                 projectId: projectId,
//                 datasetId: datasetId,
//                 tableId: table1Request.table.tableReference.tableId
//             }
//             const table2DeleteRequest = {
//                 projectId: projectId,
//                 datasetId: datasetId,
//                 tableId: table2Request.table.tableReference.tableId

//             }
//             await bigquery.deleteTable(table1DeleteRequest)
//             await bigquery.deleteTable(table2DeleteRequest);

//         })
//     it('should retrieve a table if it exists', async () => {
//         const output = execSync(`node tables/getTable.js ${datasetId} ${tableId}`);
//         assert.include(output, 'Table:');
//         assert.include(output, datasetId);
//         assert.include(output, tableId);
//     });
//     it('should list tables', async () => {
//         const output = execSync(`node tables/listTables.js ${datasetId}`);
//         assert.match(output, /Tables:/);
//         assert.match(output, new RegExp(tableId));
//         assert.match(output, new RegExp(table2Id));

//     });
// // // TODO(coleleah): update
// //   it('should check whether a table exists', async () => {
// //     const nonexistentTableId = 'foobar';
// //     const output = execSync(
// //       `node tableExists.js ${datasetId} ${nonexistentTableId}`,
// //     );
// //     assert.include(output, 'Not found');
// //     assert.include(output, datasetId);
// //     assert.include(output, nonexistentTableId);
// //   });

// // // TODO(coleleah): update
// //   it('should get labels on a table', async () => {
// //     execSync(`node labelTable.js ${datasetId} ${tableId}`);
// //     const output = execSync(`node getTableLabels.js ${datasetId} ${tableId}`);
// //     assert.include(output, `${tableId} Labels:`);
// //     assert.include(output, 'color: green');
// //   });

//     })
//     describe('table update', () => {
//         // // TODO(coleleah): update
// //   it('should update table clustering', async () => {
// //     const clusteredTableId = generateUuid();
// //     const output = execSync(
// //       `node removeTableClustering.js ${datasetId} ${clusteredTableId}`,
// //     );
// //     assert.include(
// //       output,
// //       `Table ${clusteredTableId} created with clustering.`,
// //     );
// //     assert.include(output, `Table ${clusteredTableId} updated clustering:`);
// //     const [exists] = await bigquery
// //       .dataset(datasetId)
// //       .table(clusteredTableId)
// //       .exists();
// //     assert.ok(exists);
// //   });

// // // TODO(coleleah): update
// //   it('should update a table with column-level security', async () => {
// //     const output = execSync(
// //       `node updateTableColumnACL.js ${datasetId} ${aclTableId} ${policyTag1.name}`,
// //     );
// //     assert.include(output, `Updated table ${aclTableId} with schema:`);
// //     assert.include(output, policyTag1.name);
// //     const [exists] = await bigquery
// //       .dataset(datasetId)
// //       .table(aclTableId)
// //       .exists();
// //     assert.ok(exists);
// //   });

// // // TODO(coleleah): update
// //   it('should create/update a table with default collation', async () => {
// //     const collationTableId = tableId + '_collation_test';
// //     const [table] = await bigquery
// //       .dataset(datasetId)
// //       .createTable(collationTableId, {
// //         schema: [
// //           {name: 'name', type: 'STRING'},
// //           {name: 'nums', type: 'INTEGER'},
// //         ],
// //         defaultCollation: 'und:ci',
// //         expirationTime: testExpirationTime,
// //       });
// //     let [md] = await table.getMetadata();
// //     assert.equal(md.defaultCollation, 'und:ci');
// //     for (const field of md.schema.fields) {
// //       if (field.type === 'STRING') {
// //         assert.equal(field.collation, 'und:ci');
// //       }
// //     }
// //     // update table collation to case sensitive
// //     md.defaultCollation = '';
// //     await table.setMetadata(md);
// //     [md] = await table.getMetadata();
// //     assert.equal(md.defaultCollation, '');

// //     // add field with different collation
// //     md.schema.fields.push({
// //       name: 'another_name',
// //       type: 'STRING',
// //       collation: 'und:ci',
// //     });
// //     await table.setMetadata(md);

// //     [md] = await table.getMetadata();
// //     for (const field of md.schema.fields) {
// //       if (field.type === 'STRING') {
// //         assert.equal(field.collation, 'und:ci');
// //       }
// //     }
// //   });
// // // TODO(coleleah): update
// //   it("should update table's description", async () => {
// //     const output = execSync(
// //       `node updateTableDescription.js ${datasetId} ${tableId}`,
// //     );
// //     assert.include(output, `${tableId} description: New table description.`);
// //   });
// // // TODO(coleleah): update
// //   it("should update table's expiration", async () => {
// //     const currentTime = Date.now();
// //     const expirationTime = currentTime + 1000 * 60 * 60 * 24 * 5;
// //     const output = execSync(
// //       `node updateTableExpiration.js ${datasetId} ${tableId} ${expirationTime}`,
// //     );
// //     assert.include(output, `${tableId}`);
// //     assert.include(output, `expiration: ${expirationTime}`);
// //   });
// // // TODO(coleleah): update
// //   it('should add label to a table', async () => {
// //     const output = execSync(`node labelTable.js ${datasetId} ${tableId}`);
// //     assert.include(output, `${tableId} labels:`);
// //     assert.include(output, "{ color: 'green' }");
// //   });
// // // TODO(coleleah): update
// //   it('should delete a label from a table', async () => {
// //     const output = execSync(`node deleteLabelTable.js ${datasetId} ${tableId}`);
// //     assert.include(output, `${tableId} labels:`);
// //     assert.include(output, 'undefined');
// //   });
// // // TODO(coleleah): update
// //   it('should add a column to the schema', async () => {
// //     const column = "name: 'size', type: 'STRING'";
// //     const output = execSync(`node addEmptyColumn.js ${datasetId} ${tableId}`);
// //     assert.include(output, column);
// //   });
// // // TODO(coleleah): update
// //   it("should update a column from 'REQUIRED' TO 'NULLABLE'", async () => {
// //     const column = "name: 'Name', type: 'STRING', mode: 'NULLABLE'";
// //     execSync(`node createTable.js ${datasetId} newTable`);
// //     const output = execSync(`node relaxColumn.js ${datasetId} newTable`);
// //     assert.include(output, column);
// //   });
//     })
//     describe('table deletion', () => {
//        const schema = [
//         {name: 'Name', type: 'STRING', mode: 'REQUIRED'},
//         {name: 'Age', type: 'INTEGER'},
//         {name: 'Weight', type: 'FLOAT'},
//         {name: 'IsMagic', type: 'BOOLEAN'},
//     ]
//         const tableRequest = {
//             projectId,
//             datasetId,
//             table: {
//                 tableReference: {
//                 projectId: projectId,
//                 datasetId: datasetId,
//                 tableId: tableId,
//                 },
//                 schema: {fields: schema},
//                 location: 'US',
//             },
//         };
//         // create a table for deleting
//         before(async () => {
//             const [table1] = await bigquery.insertTable(tableRequest);
//             assert.ok(table1);
//         })
//         // tear down tables created if needed
//         after(async () => {
//             const tableDeleteRequest = {
//                 projectId: projectId,
//                 datasetId: datasetId,
//                 tableId: tableRequest.table.tableReference.tableId
//             }
//         try{
//             await bigquery.getTable(tableDeleteRequest)
//         }catch (err) {

//             if(err.details!==`Not found: Table ${projectId}:${datasetId}.${tableId}`){
//                 await bigquery.deleteTable(tableDeleteRequest)
//                 throw err;

//             }
//         }
//         })
//         it('should delete a table', async () => {
//             const tableGetRequest = {
//             projectId: projectId,
//             datasetId: datasetId,
//             tableId: tableId
//         }
//             const [response] = await bigquery.getTable(tableGetRequest)
//             assert.ok(response) // confirm it exists before deleting it
//             const output = execSync(`node tables/deleteTable.js ${datasetId} ${tableId}`);
//         assert.include(output, `Table ${tableId} deleted.`);

//         try{
//             await bigquery.getTable(tableGetRequest)
//         }catch (err) {
//                 assert.strictEqual(
//                   err.details,
//                   `Not found: Table ${projectId}:${datasetId}.${tableId}`,
//                 );
//             }
//         });

// // // TODO(coleleah): update
// //     before(async () => {
// //       const datasetOptions = {
// //         location: 'US',
// //       };
// //       const tableOptions = {
// //         location: 'US',
// //       };

// // // TODO(coleleah): update
// //     it('should undelete a table', async () => {
// //       const tableId = generateUuid();
// //       const recoveredTableId = generateUuid();

// //       execSync(`node createTable.js ${datasetId} ${tableId}`);
// //       const output = execSync(
// //         `node undeleteTable.js ${datasetId} ${tableId} ${recoveredTableId}`,
// //       );

// //       assert.include(output, `Table ${tableId} deleted.`);
// //       assert.match(output, /Copied data from deleted table/);
// //       const [exists] = await bigquery
// //         .dataset(datasetId)
// //         .table(recoveredTableId)
// //         .exists();
// //       assert.strictEqual(exists, true);
// //     });

//     })
//     describe('data operations', () => {
//         // // TODO(coleleah): update
// //   it('should load a local CSV file', async () => {
// //     const output = execSync(
// //       `node loadLocalFile.js ${datasetId} ${tableId} ${localFilePath}`,
// //     );
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.strictEqual(rows.length, 1);
// //   });
// // // TODO(coleleah): update
// //   it('should browse table rows', async () => {
// //     const browseDestTable = generateUuid();
// //     const output = execSync(
// //       `node browseTable.js ${datasetId} ${browseDestTable}`,
// //     );
// //     assert.match(output, /name/);
// //     assert.match(output, /total people/);
// //   });
// // // TODO(coleleah): update
// //   it('should extract a table to GCS CSV file', async () => {
// //     const output = execSync(
// //       `node extractTableToGCS.js ${datasetId} ${tableId} ${bucketName} ${exportCSVFileName}`,
// //     );

// //     assert.match(output, /created\./);
// //     const [exists] = await storage
// //       .bucket(bucketName)
// //       .file(exportCSVFileName)
// //       .exists();
// //     assert.ok(exists);
// //   });
// // // TODO(coleleah): update
// //   it('should extract a table to GCS JSON file', async () => {
// //     const output = execSync(
// //       `node extractTableJSON.js ${datasetId} ${tableId} ${bucketName} ${exportJSONFileName}`,
// //     );

// //     assert.match(output, /created\./);
// //     const [exists] = await storage
// //       .bucket(bucketName)
// //       .file(exportJSONFileName)
// //       .exists();
// //     assert.ok(exists);
// //   });
// // // TODO(coleleah): update
// //   it('should extract a table to GCS compressed file', async () => {
// //     const output = execSync(
// //       `node extractTableCompressed.js ${datasetId} ${tableId} ${bucketName} ${exportCSVFileName}`,
// //     );

// //     assert.match(output, /created\./);
// //     const [exists] = await storage
// //       .bucket(bucketName)
// //       .file(exportCSVFileName)
// //       .exists();
// //     assert.ok(exists);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS ORC file', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(`node loadTableGCSORC.js ${datasetId} ${tableId}`);
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS Parquet file', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(
// //       `node loadTableGCSParquet.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS Avro file', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(`node loadTableGCSAvro.js ${datasetId} ${tableId}`);
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS Firestore backup file', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(
// //       `node loadTableURIFirestore.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS CSV file with explicit schema', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(`node loadCSVFromGCS.js ${datasetId} ${tableId}`);
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS JSON file with explicit schema', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(`node loadJSONFromGCS.js ${datasetId} ${tableId}`);
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS CSV file to partitioned table', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(
// //       `node loadTablePartitioned.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS CSV file to clustered table', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(
// //       `node loadTableClustered.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should add a new column via a GCS file load job', async () => {
// //     const destTableId = generateUuid();
// //     execSync(
// //       `node createTable.js ${datasetId} ${destTableId} 'Name:STRING, Age:INTEGER, Weight:FLOAT'`,
// //     );
// //     const output = execSync(
// //       `node addColumnLoadAppend.js ${datasetId} ${destTableId} ${localFilePath}`,
// //     );
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should relax a column via a GCS file load job', async () => {
// //     const destTableId = generateUuid();
// //     execSync(`node createTable.js ${datasetId} ${destTableId}`);
// //     const output = execSync(
// //       `node relaxColumnLoadAppend.js ${datasetId} ${destTableId} ${partialDataFilePath}`,
// //     );
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS CSV file with autodetected schema', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(
// //       `node loadCSVFromGCSAutodetect.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS JSON file with autodetected schema', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(
// //       `node loadJSONFromGCSAutodetect.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS CSV file truncate table', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(
// //       `node loadCSVFromGCSTruncate.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     assert.include(output, 'Write disposition used: WRITE_TRUNCATE.');
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS JSON file truncate table', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(
// //       `node loadJSONFromGCSTruncate.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     assert.include(output, 'Write disposition used: WRITE_TRUNCATE.');
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS parquet file truncate table', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(
// //       `node loadParquetFromGCSTruncate.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     assert.include(output, 'Write disposition used: WRITE_TRUNCATE.');
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS ORC file truncate table', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(
// //       `node loadOrcFromGCSTruncate.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     assert.include(output, 'Write disposition used: WRITE_TRUNCATE.');
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should load a GCS Avro file truncate table', async () => {
// //     const tableId = generateUuid();
// //     const output = execSync(
// //       `node loadTableGCSAvroTruncate.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     assert.include(output, 'Write disposition used: WRITE_TRUNCATE.');
// //     const [rows] = await bigquery.dataset(datasetId).table(tableId).getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should copy a table', async () => {
// //     const output = execSync(
// //       `node copyTable.js ${srcDatasetId} ${srcTableId} ${destDatasetId} ${destTableId}`,
// //     );
// //     assert.match(output, /completed\./);
// //     const [rows] = await bigquery
// //       .dataset(destDatasetId)
// //       .table(destTableId)
// //       .getRows();
// //     assert.ok(rows.length > 0);
// //   });
// // // TODO(coleleah): update
// //   it('should insert rows', async () => {
// //     const output = execSync(
// //       `node insertRowsAsStream.js ${datasetId} ${tableId}`,
// //     );
// //     assert.match(output, /Inserted 2 rows/);
// //   });
// // // TODO(coleleah): update
// //   it('should insert rows with supported data types', async () => {
// //     const typesTableId = generateUuid();
// //     const output = execSync(
// //       `node insertingDataTypes.js ${datasetId} ${typesTableId}`,
// //     );
// //     assert.match(output, /Inserted 2 rows/);
// //   });
// // // TODO(coleleah): update
// //   it('copy multiple source tables to a given destination', async () => {
// //     execSync(`node createTable.js ${datasetId} destinationTable`);
// //     const output = execSync(
// //       `node copyTableMultipleSource.js ${datasetId} ${tableId} destinationTable`,
// //     );
// //     assert.include(output, 'sourceTable');
// //     assert.include(output, 'destinationTable');
// //     assert.include(output, 'createDisposition');
// //     assert.include(output, 'writeDisposition');
// //   });
//     })
//     describe('Views', () => {
//     //     // TODO(coleleah): update
//     //     beforeEach(async function () {
//     //       this.currentTest.retries(2);
//     //     });
//     // // TODO(coleleah): update
//     //     it('should create a view', async () => {
//     //       const output = execSync(`node createView.js ${datasetId} ${viewId}`);
//     //       assert.include(output, `View ${viewId} created.`);
//     //       const [exists] = await bigquery.dataset(datasetId).table(viewId).exists();
//     //       assert.ok(exists);
//     //     });
//     // // TODO(coleleah): update
//     //     it('should get a view', async () => {
//     //       const viewId = generateUuid();
//     //       execSync(`node createView.js ${datasetId} ${viewId}`);
//     //       const output = execSync(`node getView.js ${datasetId} ${viewId}`);
//     //       assert.match(output, /View at/);
//     //       assert.match(output, /View query:/);
//     //     });
//     // // TODO(coleleah): update
//     //     it('should update a view', async () => {
//     //       const output = execSync(`node updateViewQuery.js ${datasetId} ${viewId}`);
//     //       assert.include(output, `View ${viewId} updated.`);
//     //     });
//     });

// });

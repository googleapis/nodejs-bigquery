[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `python -m synthtool`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# [Google BigQuery: Node.js Client](https://github.com/googleapis/nodejs-bigquery)

[![release level](https://img.shields.io/badge/release%20level-stable-brightgreen.svg?style=flat)](https://cloud.google.com/terms/launch-stages)
[![npm version](https://img.shields.io/npm/v/@google-cloud/bigquery.svg)](https://www.npmjs.org/package/@google-cloud/bigquery)




Google BigQuery Client Library for Node.js


A comprehensive list of changes in each version may be found in
[the CHANGELOG](https://github.com/googleapis/nodejs-bigquery/blob/main/CHANGELOG.md).

* [Google BigQuery Node.js Client API Reference][client-docs]
* [Google BigQuery Documentation][product-docs]
* [github.com/googleapis/nodejs-bigquery](https://github.com/googleapis/nodejs-bigquery)

Read more about the client libraries for Cloud APIs, including the older
Google APIs Client Libraries, in [Client Libraries Explained][explained].

[explained]: https://cloud.google.com/apis/docs/client-libraries-explained

**Table of contents:**


* [Quickstart](#quickstart)
  * [Before you begin](#before-you-begin)
  * [Installing the client library](#installing-the-client-library)
  * [Using the client library](#using-the-client-library)
* [Samples](#samples)
* [Versioning](#versioning)
* [Contributing](#contributing)
* [License](#license)

## Quickstart

### Before you begin

1.  [Select or create a Cloud Platform project][projects].
1.  [Enable the Google BigQuery API][enable_api].
1.  [Set up authentication][auth] so you can access the
    API from your local workstation.

### Installing the client library

```bash
npm install @google-cloud/bigquery
```


### Using the client library

```javascript
// Imports the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');

async function createDataset() {
  // Creates a client
  const bigqueryClient = new BigQuery();

  // Create the dataset
  const [dataset] = await bigqueryClient.createDataset(datasetName);
  console.log(`Dataset ${dataset.id} created.`);
}
createDataset();

```



## Samples

Samples are in the [`samples/`](https://github.com/googleapis/nodejs-bigquery/tree/main/samples) directory. Each sample's `README.md` has instructions for running its sample.

| Sample                      | Source Code                       | Try it |
| --------------------------- | --------------------------------- | ------ |
| Add Column Load Append | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/addColumnLoadAppend.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/addColumnLoadAppend.js,samples/README.md) |
| Add Column Query Append | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/addColumnQueryAppend.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/addColumnQueryAppend.js,samples/README.md) |
| Add Empty Column | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/addEmptyColumn.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/addEmptyColumn.js,samples/README.md) |
| Auth View Tutorial | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/authViewTutorial.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/authViewTutorial.js,samples/README.md) |
| Browse Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/browseTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/browseTable.js,samples/README.md) |
| Cancel Job | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/cancelJob.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/cancelJob.js,samples/README.md) |
| Client JSON Credentials | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/clientJSONCredentials.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/clientJSONCredentials.js,samples/README.md) |
| Copy Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/copyTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/copyTable.js,samples/README.md) |
| Copy Table Multiple Source | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/copyTableMultipleSource.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/copyTableMultipleSource.js,samples/README.md) |
| Create Dataset | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/createDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createDataset.js,samples/README.md) |
| Create Job | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/createJob.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createJob.js,samples/README.md) |
| Create Model | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/createModel.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createModel.js,samples/README.md) |
| Create Routine | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/createRoutine.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createRoutine.js,samples/README.md) |
| Create Routine DDL | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/createRoutineDDL.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createRoutineDDL.js,samples/README.md) |
| Create Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/createTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createTable.js,samples/README.md) |
| Create Table Clustered | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/createTableClustered.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createTableClustered.js,samples/README.md) |
| Create Table Column ACL | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/createTableColumnACL.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createTableColumnACL.js,samples/README.md) |
| Create Table Partitioned | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/createTablePartitioned.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createTablePartitioned.js,samples/README.md) |
| Create Table Range Partitioned | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/createTableRangePartitioned.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createTableRangePartitioned.js,samples/README.md) |
| Create View | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/createView.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createView.js,samples/README.md) |
| Ddl Create View | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/ddlCreateView.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/ddlCreateView.js,samples/README.md) |
| Delete Dataset | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/deleteDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteDataset.js,samples/README.md) |
| Delete Label Dataset | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/deleteLabelDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteLabelDataset.js,samples/README.md) |
| Delete Label Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/deleteLabelTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteLabelTable.js,samples/README.md) |
| Delete Model | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/deleteModel.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteModel.js,samples/README.md) |
| Delete Routine | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/deleteRoutine.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteRoutine.js,samples/README.md) |
| Delete Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/deleteTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteTable.js,samples/README.md) |
| Extract Table Compressed | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/extractTableCompressed.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/extractTableCompressed.js,samples/README.md) |
| Extract Table JSON | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/extractTableJSON.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/extractTableJSON.js,samples/README.md) |
| Extract Table To GCS | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/extractTableToGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/extractTableToGCS.js,samples/README.md) |
| Get Dataset | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/getDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getDataset.js,samples/README.md) |
| Get Dataset Labels | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/getDatasetLabels.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getDatasetLabels.js,samples/README.md) |
| Get Job | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/getJob.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getJob.js,samples/README.md) |
| BigQuery Get Model | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/getModel.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getModel.js,samples/README.md) |
| Get Routine | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/getRoutine.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getRoutine.js,samples/README.md) |
| BigQuery Get Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/getTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getTable.js,samples/README.md) |
| Get Table Labels | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/getTableLabels.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getTableLabels.js,samples/README.md) |
| Get View | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/getView.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getView.js,samples/README.md) |
| Insert Rows As Stream | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/insertRowsAsStream.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/insertRowsAsStream.js,samples/README.md) |
| Inserting Data Types | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/insertingDataTypes.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/insertingDataTypes.js,samples/README.md) |
| BigQuery Label Dataset | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/labelDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/labelDataset.js,samples/README.md) |
| Label Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/labelTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/labelTable.js,samples/README.md) |
| List Datasets | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/listDatasets.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listDatasets.js,samples/README.md) |
| List Datasets By Label | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/listDatasetsByLabel.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listDatasetsByLabel.js,samples/README.md) |
| List Jobs | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/listJobs.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listJobs.js,samples/README.md) |
| BigQuery List Models | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/listModels.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listModels.js,samples/README.md) |
| BigQuery List Models Streaming | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/listModelsStreaming.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listModelsStreaming.js,samples/README.md) |
| List Routines | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/listRoutines.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listRoutines.js,samples/README.md) |
| List Tables | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/listTables.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listTables.js,samples/README.md) |
| Load CSV From GCS | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadCSVFromGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCS.js,samples/README.md) |
| Load CSV From GCS Autodetect | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadCSVFromGCSAutodetect.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCSAutodetect.js,samples/README.md) |
| Load CSV From GCS Truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadCSVFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCSTruncate.js,samples/README.md) |
| Load JSON From GCS | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadJSONFromGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCS.js,samples/README.md) |
| Load JSON From GCS Autodetect | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadJSONFromGCSAutodetect.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCSAutodetect.js,samples/README.md) |
| Load JSON From GCS Truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadJSONFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCSTruncate.js,samples/README.md) |
| Load Local File | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadLocalFile.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadLocalFile.js,samples/README.md) |
| Load Orc From GCS Truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadOrcFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadOrcFromGCSTruncate.js,samples/README.md) |
| Load Parquet From GCS Truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadParquetFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadParquetFromGCSTruncate.js,samples/README.md) |
| Load Table Clustered | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadTableClustered.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTableClustered.js,samples/README.md) |
| Load Table GCS Avro | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadTableGCSAvro.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTableGCSAvro.js,samples/README.md) |
| Load Table GCS Avro Truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadTableGCSAvroTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTableGCSAvroTruncate.js,samples/README.md) |
| Load Table GCSORC | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadTableGCSORC.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTableGCSORC.js,samples/README.md) |
| Load Table GCS Parquet | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadTableGCSParquet.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTableGCSParquet.js,samples/README.md) |
| Load Table Partitioned | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadTablePartitioned.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTablePartitioned.js,samples/README.md) |
| Load Table URI Firestore | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/loadTableURIFirestore.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTableURIFirestore.js,samples/README.md) |
| Nested Repeated Schema | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/nestedRepeatedSchema.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/nestedRepeatedSchema.js,samples/README.md) |
| Query | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/query.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/query.js,samples/README.md) |
| Query Batch | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryBatch.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryBatch.js,samples/README.md) |
| Query Clustered Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryClusteredTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryClusteredTable.js,samples/README.md) |
| Query Destination Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryDestinationTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryDestinationTable.js,samples/README.md) |
| Query Disable Cache | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryDisableCache.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryDisableCache.js,samples/README.md) |
| Query Dry Run | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryDryRun.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryDryRun.js,samples/README.md) |
| Query External GCS Perm | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryExternalGCSPerm.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryExternalGCSPerm.js,samples/README.md) |
| Query External GCS Temp | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryExternalGCSTemp.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryExternalGCSTemp.js,samples/README.md) |
| Query Job Optional | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryJobOptional.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryJobOptional.js,samples/README.md) |
| Query Legacy | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryLegacy.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryLegacy.js,samples/README.md) |
| Query Legacy Large Results | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryLegacyLargeResults.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryLegacyLargeResults.js,samples/README.md) |
| Query Pagination | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryPagination.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryPagination.js,samples/README.md) |
| Query Params Arrays | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryParamsArrays.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsArrays.js,samples/README.md) |
| Query Params Named | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryParamsNamed.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsNamed.js,samples/README.md) |
| Query Params Named Types | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryParamsNamedTypes.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsNamedTypes.js,samples/README.md) |
| Query Params Positional | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryParamsPositional.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsPositional.js,samples/README.md) |
| Query Params Positional Types | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryParamsPositionalTypes.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsPositionalTypes.js,samples/README.md) |
| Query Params Structs | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryParamsStructs.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsStructs.js,samples/README.md) |
| Query Params Timestamps | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryParamsTimestamps.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsTimestamps.js,samples/README.md) |
| Query Stack Overflow | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/queryStackOverflow.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryStackOverflow.js,samples/README.md) |
| Quickstart | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/quickstart.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/quickstart.js,samples/README.md) |
| Relax Column | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/relaxColumn.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/relaxColumn.js,samples/README.md) |
| Relax Column Load Append | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/relaxColumnLoadAppend.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/relaxColumnLoadAppend.js,samples/README.md) |
| Relax Column Query Append | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/relaxColumnQueryAppend.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/relaxColumnQueryAppend.js,samples/README.md) |
| Remove Table Clustering | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/removeTableClustering.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/removeTableClustering.js,samples/README.md) |
| Set Client Endpoint | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/setClientEndpoint.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/setClientEndpoint.js,samples/README.md) |
| Set User Agent | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/setUserAgent.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/setUserAgent.js,samples/README.md) |
| Table Exists | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/tableExists.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/tableExists.js,samples/README.md) |
| Undelete Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/undeleteTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/undeleteTable.js,samples/README.md) |
| Update Dataset Access | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/updateDatasetAccess.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateDatasetAccess.js,samples/README.md) |
| Update Dataset Description | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/updateDatasetDescription.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateDatasetDescription.js,samples/README.md) |
| Update Dataset Expiration | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/updateDatasetExpiration.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateDatasetExpiration.js,samples/README.md) |
| BigQuery Update Model | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/updateModel.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateModel.js,samples/README.md) |
| Update Routine | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/updateRoutine.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateRoutine.js,samples/README.md) |
| Update Table Column ACL | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/updateTableColumnACL.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateTableColumnACL.js,samples/README.md) |
| Update Table Description | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/updateTableDescription.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateTableDescription.js,samples/README.md) |
| Update Table Expiration | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/updateTableExpiration.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateTableExpiration.js,samples/README.md) |
| Update View Query | [source code](https://github.com/googleapis/nodejs-bigquery/blob/main/samples/updateViewQuery.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateViewQuery.js,samples/README.md) |



The [Google BigQuery Node.js Client API Reference][client-docs] documentation
also contains samples.

## Supported Node.js Versions

Our client libraries follow the [Node.js release schedule](https://github.com/nodejs/release#release-schedule).
Libraries are compatible with all current _active_ and _maintenance_ versions of
Node.js.
If you are using an end-of-life version of Node.js, we recommend that you update
as soon as possible to an actively supported LTS version.

Google's client libraries support legacy versions of Node.js runtimes on a
best-efforts basis with the following warnings:

* Legacy versions are not tested in continuous integration.
* Some security patches and features cannot be backported.
* Dependencies cannot be kept up-to-date.

Client libraries targeting some end-of-life versions of Node.js are available, and
can be installed through npm [dist-tags](https://docs.npmjs.com/cli/dist-tag).
The dist-tags follow the naming convention `legacy-(version)`.
For example, `npm install @google-cloud/bigquery@legacy-8` installs client libraries
for versions compatible with Node.js 8.

## Versioning

This library follows [Semantic Versioning](http://semver.org/).



This library is considered to be **stable**. The code surface will not change in backwards-incompatible ways
unless absolutely necessary (e.g. because of critical security issues) or with
an extensive deprecation period. Issues and requests against **stable** libraries
are addressed with the highest priority.






More Information: [Google Cloud Platform Launch Stages][launch_stages]

[launch_stages]: https://cloud.google.com/terms/launch-stages

## Contributing

Contributions welcome! See the [Contributing Guide](https://github.com/googleapis/nodejs-bigquery/blob/main/CONTRIBUTING.md).

Please note that this `README.md`, the `samples/README.md`,
and a variety of configuration files in this repository (including `.nycrc` and `tsconfig.json`)
are generated from a central template. To edit one of these files, make an edit
to its templates in
[directory](https://github.com/googleapis/synthtool).

## License

Apache Version 2.0

See [LICENSE](https://github.com/googleapis/nodejs-bigquery/blob/main/LICENSE)

[client-docs]: https://cloud.google.com/nodejs/docs/reference/bigquery/latest
[product-docs]: https://cloud.google.com/bigquery
[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=bigquery.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/external/set-up-adc-local

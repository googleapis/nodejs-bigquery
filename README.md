[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `python -m synthtool`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# [Google Cloud Bigquery: Node.js Client](https://github.com/googleapis/nodejs-bigquery)

[![release level](https://img.shields.io/badge/release%20level-general%20availability%20%28GA%29-brightgreen.svg?style=flat)](https://cloud.google.com/terms/launch-stages)
[![npm version](https://img.shields.io/npm/v/@google-cloud/bigquery.svg)](https://www.npmjs.org/package/@google-cloud/bigquery)
[![codecov](https://img.shields.io/codecov/c/github/googleapis/nodejs-bigquery/master.svg?style=flat)](https://codecov.io/gh/googleapis/nodejs-bigquery)




Google BigQuery Client Library for Node.js


* [Google Cloud Bigquery Node.js Client API Reference][client-docs]
* [Google Cloud Bigquery Documentation][product-docs]
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
1.  [Enable the Google Cloud Bigquery API][enable_api].
1.  [Set up authentication with a service account][auth] so you can access the
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

Samples are in the [`samples/`](https://github.com/googleapis/nodejs-bigquery/tree/master/samples) directory. The samples' `README.md`
has instructions for running the samples.

| Sample                      | Source Code                       | Try it |
| --------------------------- | --------------------------------- | ------ |
| Add Column Load Append | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/addColumnLoadAppend.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/addColumnLoadAppend.js,samples/README.md) |
| Add Column Query Append | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/addColumnQueryAppend.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/addColumnQueryAppend.js,samples/README.md) |
| Add Empty Column | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/addEmptyColumn.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/addEmptyColumn.js,samples/README.md) |
| Browse Rows | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/browseRows.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/browseRows.js,samples/README.md) |
| Cancel Job | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/cancelJob.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/cancelJob.js,samples/README.md) |
| Client JSON Credentials | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/clientJSONCredentials.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/clientJSONCredentials.js,samples/README.md) |
| Copy Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/copyTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/copyTable.js,samples/README.md) |
| Copy Table Multiple Source | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/copyTableMultipleSource.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/copyTableMultipleSource.js,samples/README.md) |
| Create Dataset | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/createDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createDataset.js,samples/README.md) |
| Create Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/createTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createTable.js,samples/README.md) |
| Create Table Partitioned | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/createTablePartitioned.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createTablePartitioned.js,samples/README.md) |
| Delete Dataset | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/deleteDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteDataset.js,samples/README.md) |
| Delete Label Dataset | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/deleteLabelDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteLabelDataset.js,samples/README.md) |
| Delete Label Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/deleteLabelTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteLabelTable.js,samples/README.md) |
| Delete Model | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/deleteModel.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteModel.js,samples/README.md) |
| Delete Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/deleteTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteTable.js,samples/README.md) |
| Extract Table Compressed | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/extractTableCompressed.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/extractTableCompressed.js,samples/README.md) |
| Extract Table JSON | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/extractTableJSON.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/extractTableJSON.js,samples/README.md) |
| Extract Table To GCS | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/extractTableToGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/extractTableToGCS.js,samples/README.md) |
| Get Dataset | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/getDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getDataset.js,samples/README.md) |
| Get Dataset Labels | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/getDatasetLabels.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getDatasetLabels.js,samples/README.md) |
| Get Job | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/getJob.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getJob.js,samples/README.md) |
| BigQuery Get Model | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/getModel.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getModel.js,samples/README.md) |
| BigQuery Get Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/getTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getTable.js,samples/README.md) |
| Get Table Labels | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/getTableLabels.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getTableLabels.js,samples/README.md) |
| Insert Rows As Stream | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/insertRowsAsStream.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/insertRowsAsStream.js,samples/README.md) |
| BigQuery Label Dataset | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/labelDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/labelDataset.js,samples/README.md) |
| Label Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/labelTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/labelTable.js,samples/README.md) |
| List Datasets | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listDatasets.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listDatasets.js,samples/README.md) |
| List Datasets By Label | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listDatasetsByLabel.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listDatasetsByLabel.js,samples/README.md) |
| List Jobs | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listJobs.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listJobs.js,samples/README.md) |
| BigQuery List Models | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listModels.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listModels.js,samples/README.md) |
| BigQuery List Models Streaming | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listModelsStreaming.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listModelsStreaming.js,samples/README.md) |
| List Tables | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listTables.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listTables.js,samples/README.md) |
| Load CSV From GCS | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadCSVFromGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCS.js,samples/README.md) |
| Load CSV From GCS Autodetect | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadCSVFromGCSAutodetect.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCSAutodetect.js,samples/README.md) |
| Load CSV From GCS Truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadCSVFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCSTruncate.js,samples/README.md) |
| Load JSON From GCS | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadJSONFromGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCS.js,samples/README.md) |
| Load JSON From GCS Autodetect | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadJSONFromGCSAutodetect.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCSAutodetect.js,samples/README.md) |
| Load JSON From GCS Truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadJSONFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCSTruncate.js,samples/README.md) |
| Load Local File | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadLocalFile.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadLocalFile.js,samples/README.md) |
| Load Orc From GCS Truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadOrcFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadOrcFromGCSTruncate.js,samples/README.md) |
| Load Parquet From GCS Truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadParquetFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadParquetFromGCSTruncate.js,samples/README.md) |
| Load Table GCSORC | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadTableGCSORC.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTableGCSORC.js,samples/README.md) |
| Load Table GCS Parquet | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadTableGCSParquet.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTableGCSParquet.js,samples/README.md) |
| Load Table Partitioned | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadTablePartitioned.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTablePartitioned.js,samples/README.md) |
| Nested Repeated Schema | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/nestedRepeatedSchema.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/nestedRepeatedSchema.js,samples/README.md) |
| Query | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/query.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/query.js,samples/README.md) |
| Query Destination Table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryDestinationTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryDestinationTable.js,samples/README.md) |
| Query Disable Cache | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryDisableCache.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryDisableCache.js,samples/README.md) |
| Query Dry Run | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryDryRun.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryDryRun.js,samples/README.md) |
| Query Legacy | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryLegacy.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryLegacy.js,samples/README.md) |
| Query Legacy Large Results | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryLegacyLargeResults.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryLegacyLargeResults.js,samples/README.md) |
| Query Params Arrays | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsArrays.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsArrays.js,samples/README.md) |
| Query Params Named | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsNamed.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsNamed.js,samples/README.md) |
| Query Params Positional | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsPositional.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsPositional.js,samples/README.md) |
| Query Params Structs | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsStructs.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsStructs.js,samples/README.md) |
| Query Params Timestamps | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsTimestamps.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsTimestamps.js,samples/README.md) |
| Query Stack Overflow | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryStackOverflow.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryStackOverflow.js,samples/README.md) |
| Quickstart | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/quickstart.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/quickstart.js,samples/README.md) |
| Relax Column | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/relaxColumn.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/relaxColumn.js,samples/README.md) |
| Relax Column Load Append | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/relaxColumnLoadAppend.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/relaxColumnLoadAppend.js,samples/README.md) |
| Update Dataset Access | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/updateDatasetAccess.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateDatasetAccess.js,samples/README.md) |
| Update Dataset Description | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/updateDatasetDescription.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateDatasetDescription.js,samples/README.md) |
| Update Dataset Expiration | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/updateDatasetExpiration.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateDatasetExpiration.js,samples/README.md) |
| BigQuery Update Model | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/updateModel.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateModel.js,samples/README.md) |
| Update Table Description | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/updateTableDescription.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateTableDescription.js,samples/README.md) |
| Update Table Expiration | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/updateTableExpiration.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateTableExpiration.js,samples/README.md) |



The [Google Cloud Bigquery Node.js Client API Reference][client-docs] documentation
also contains samples.

## Versioning

This library follows [Semantic Versioning](http://semver.org/).


This library is considered to be **General Availability (GA)**. This means it
is stable; the code surface will not change in backwards-incompatible ways
unless absolutely necessary (e.g. because of critical security issues) or with
an extensive deprecation period. Issues and requests against **GA** libraries
are addressed with the highest priority.





More Information: [Google Cloud Platform Launch Stages][launch_stages]

[launch_stages]: https://cloud.google.com/terms/launch-stages

## Contributing

Contributions welcome! See the [Contributing Guide](https://github.com/googleapis/nodejs-bigquery/blob/master/CONTRIBUTING.md).

## License

Apache Version 2.0

See [LICENSE](https://github.com/googleapis/nodejs-bigquery/blob/master/LICENSE)

[client-docs]: https://googleapis.dev/nodejs/bigquery/latest#reference
[product-docs]: https://cloud.google.com/bigquery
[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=bigquery.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/getting-started

<a name="reference"></a>

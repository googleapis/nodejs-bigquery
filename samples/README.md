[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `python -m synthtool`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# [Google Cloud Bigquery: Node.js Samples](https://github.com/googleapis/nodejs-bigquery)

[![Open in Cloud Shell][shell_img]][shell_link]



## Table of Contents

* [Before you begin](#before-you-begin)
* [Samples](#samples)
  * [Browse Rows](#browse-rows)
  * [Copy Table](#copy-table)
  * [Create Dataset](#create-dataset)
  * [Create Table](#create-table)
  * [Delete Dataset](#delete-dataset)
  * [BigQuery Delete Model](#bigquery-delete-model)
  * [Delete Table](#delete-table)
  * [Extract Table To GCS](#extract-table-to-gcs)
  * [BigQuery Get Model](#bigquery-get-model)
  * [Insert Rows As Stream](#insert-rows-as-stream)
  * [List Datasets](#list-datasets)
  * [BigQuery List Models](#bigquery-list-models)
  * [BigQuery List Models Streaming](#bigquery-list-models-streaming)
  * [List Tables](#list-tables)
  * [Load CSV From GCS](#load-csv-from-gcs)
  * [Load CSV From GCS Autodetect](#load-csv-from-gcs-autodetect)
  * [Load CSV From GCS Truncate](#load-csv-from-gcs-truncate)
  * [Load JSON From GCS](#load-json-from-gcs)
  * [Load JSON From GCS Autodetect](#load-json-from-gcs-autodetect)
  * [Load JSON From GCS Truncate](#load-json-from-gcs-truncate)
  * [Load Local File](#load-local-file)
  * [Load Orc From GCS Truncate](#load-orc-from-gcs-truncate)
  * [Load Parquet From GCS Truncate](#load-parquet-from-gcs-truncate)
  * [Load Table GCSORC](#load-table-gcsorc)
  * [Load Table GCS Parquet](#load-table-gcs-parquet)
  * [Query](#query)
  * [Query Disable Cache](#query-disable-cache)
  * [Query Params Arrays](#query-params-arrays)
  * [Query Params Named](#query-params-named)
  * [Query Params Positional](#query-params-positional)
  * [Query Params Structs](#query-params-structs)
  * [Query Params Timestamps](#query-params-timestamps)
  * [Query Stack Overflow](#query-stack-overflow)
  * [Quickstart](#quickstart)
  * [BigQuery Update Model](#bigquery-update-model)

## Before you begin

Before running the samples, make sure you've followed the steps outlined in
[Using the client library](https://github.com/googleapis/nodejs-bigquery#using-the-client-library).

## Samples



### Browse Rows

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/browseRows.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/browseRows.js,samples/README.md)

__Usage:__


`node browseRows.js`


-----




### Copy Table

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/copyTable.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/copyTable.js,samples/README.md)

__Usage:__


`node copyTable.js`


-----




### Create Dataset

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/createDataset.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createDataset.js,samples/README.md)

__Usage:__


`node createDataset.js`


-----




### Create Table

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/createTable.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createTable.js,samples/README.md)

__Usage:__


`node createTable.js`


-----




### Delete Dataset

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/deleteDataset.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteDataset.js,samples/README.md)

__Usage:__


`node deleteDataset.js`


-----




### BigQuery Delete Model

Deletes a model.

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/deleteModel.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteModel.js,samples/README.md)

__Usage:__


`node deleteModel.js <DATASET_ID> <MODEL_ID>`


-----




### Delete Table

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/deleteTable.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteTable.js,samples/README.md)

__Usage:__


`node deleteTable.js`


-----




### Extract Table To GCS

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/extractTableToGCS.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/extractTableToGCS.js,samples/README.md)

__Usage:__


`node extractTableToGCS.js`


-----




### BigQuery Get Model

Retrieves an existing model from a dataset.

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/getModel.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/getModel.js,samples/README.md)

__Usage:__


`node getModel.js <DATASET_ID> <MODEL_ID>`


-----




### Insert Rows As Stream

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/insertRowsAsStream.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/insertRowsAsStream.js,samples/README.md)

__Usage:__


`node insertRowsAsStream.js`


-----




### List Datasets

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listDatasets.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listDatasets.js,samples/README.md)

__Usage:__


`node listDatasets.js`


-----




### BigQuery List Models

Lists all existing models in the dataset.

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listModels.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listModels.js,samples/README.md)

__Usage:__


`node listModels.js <DATASET_ID>`


-----




### BigQuery List Models Streaming

Lists all existing models in the dataset using streaming method.

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listModelsStreaming.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listModelsStreaming.js,samples/README.md)

__Usage:__


`node listModelsStreaming.js <DATASET_ID>`


-----




### List Tables

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listTables.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listTables.js,samples/README.md)

__Usage:__


`node listTables.js`


-----




### Load CSV From GCS

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadCSVFromGCS.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCS.js,samples/README.md)

__Usage:__


`node loadCSVFromGCS.js`


-----




### Load CSV From GCS Autodetect

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadCSVFromGCSAutodetect.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCSAutodetect.js,samples/README.md)

__Usage:__


`node loadCSVFromGCSAutodetect.js`


-----




### Load CSV From GCS Truncate

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadCSVFromGCSTruncate.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCSTruncate.js,samples/README.md)

__Usage:__


`node loadCSVFromGCSTruncate.js`


-----




### Load JSON From GCS

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadJSONFromGCS.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCS.js,samples/README.md)

__Usage:__


`node loadJSONFromGCS.js`


-----




### Load JSON From GCS Autodetect

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadJSONFromGCSAutodetect.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCSAutodetect.js,samples/README.md)

__Usage:__


`node loadJSONFromGCSAutodetect.js`


-----




### Load JSON From GCS Truncate

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadJSONFromGCSTruncate.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCSTruncate.js,samples/README.md)

__Usage:__


`node loadJSONFromGCSTruncate.js`


-----




### Load Local File

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadLocalFile.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadLocalFile.js,samples/README.md)

__Usage:__


`node loadLocalFile.js`


-----




### Load Orc From GCS Truncate

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadOrcFromGCSTruncate.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadOrcFromGCSTruncate.js,samples/README.md)

__Usage:__


`node loadOrcFromGCSTruncate.js`


-----




### Load Parquet From GCS Truncate

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadParquetFromGCSTruncate.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadParquetFromGCSTruncate.js,samples/README.md)

__Usage:__


`node loadParquetFromGCSTruncate.js`


-----




### Load Table GCSORC

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadTableGCSORC.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTableGCSORC.js,samples/README.md)

__Usage:__


`node loadTableGCSORC.js`


-----




### Load Table GCS Parquet

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadTableGCSParquet.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadTableGCSParquet.js,samples/README.md)

__Usage:__


`node loadTableGCSParquet.js`


-----




### Query

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/query.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/query.js,samples/README.md)

__Usage:__


`node query.js`


-----




### Query Disable Cache

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryDisableCache.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryDisableCache.js,samples/README.md)

__Usage:__


`node queryDisableCache.js`


-----




### Query Params Arrays

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsArrays.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsArrays.js,samples/README.md)

__Usage:__


`node queryParamsArrays.js`


-----




### Query Params Named

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsNamed.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsNamed.js,samples/README.md)

__Usage:__


`node queryParamsNamed.js`


-----




### Query Params Positional

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsPositional.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsPositional.js,samples/README.md)

__Usage:__


`node queryParamsPositional.js`


-----




### Query Params Structs

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsStructs.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsStructs.js,samples/README.md)

__Usage:__


`node queryParamsStructs.js`


-----




### Query Params Timestamps

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsTimestamps.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsTimestamps.js,samples/README.md)

__Usage:__


`node queryParamsTimestamps.js`


-----




### Query Stack Overflow

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryStackOverflow.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryStackOverflow.js,samples/README.md)

__Usage:__


`node queryStackOverflow.js`


-----




### Quickstart

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/quickstart.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/quickstart.js,samples/README.md)

__Usage:__


`node quickstart.js`


-----




### BigQuery Update Model

Updates a model's metadata.

View the [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/updateModel.js).

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/updateModel.js,samples/README.md)

__Usage:__


`node updateModel.js <DATASET_ID> <MODEL_ID>`






[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[shell_link]: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/README.md
[product-docs]: https://cloud.google.com/bigquery
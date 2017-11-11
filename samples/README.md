<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google BigQuery: Node.js Samples

[![Open in Cloud Shell][shell_img]][shell_link]

[BigQuery](https://cloud.google.com/bigquery/docs) is Google&#x27;s fully managed, petabyte scale, low cost analytics data warehouse. BigQuery is NoOps—there is no infrastructure to manage and you don&#x27;t need a database administrator—so you can focus on analyzing data to find meaningful insights, use familiar SQL, and take advantage of our pay-as-you-go model.

## Table of Contents

* [Before you begin](#before-you-begin)
* [Samples](#samples)
  * [Datasets](#datasets)
  * [Tables](#tables)
  * [Queries](#queries)

## Before you begin

Before running the samples, make sure you've followed the steps in the
[Before you begin section](../README.md#before-you-begin) of the client
library's README.

## Samples

### Datasets

View the [source code][datasets_0_code].

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/datasets.js,samples/README.md)

__Usage:__ `node datasets.js --help`

```
datasets.js <command>

Commands:
  datasets.js create <datasetId>  Creates a new dataset.
  datasets.js delete <datasetId>  Deletes a dataset.
  datasets.js list                Lists datasets.

Options:
  --version        Show version number                                                                         [boolean]
  --projectId, -p  The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                   environment variables.                                                                       [string]
  --help           Show help                                                                                   [boolean]

Examples:
  node datasets.js create my_dataset                      Creates a new dataset named "my_dataset".
  node datasets.js delete my_dataset                      Deletes a dataset named "my_dataset".
  node datasets.js list                                   Lists all datasets in the project specified by the
                                                          GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environments variables.
  node datasets.js list --projectId=bigquery-public-data  Lists all datasets in the "bigquery-public-data" project.

For more information, see https://cloud.google.com/bigquery/docs
```

[datasets_0_docs]: https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery/dataset
[datasets_0_code]: datasets.js

### Tables

View the [source code][tables_1_code].

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/tables.js,samples/README.md)

__Usage:__ `node tables.js --help`

```
tables.js <command>

Commands:
  tables.js create <datasetId> <tableId> <schema>               Creates a new table.
  tables.js list <datasetId>                                    Lists all tables in a dataset.
  tables.js delete <datasetId> <tableId>                        Deletes a table.
  tables.js copy <srcDatasetId> <srcTableId> <destDatasetId>    Makes a copy of a table.
  <destTableId>
  tables.js browse <datasetId> <tableId>                        Lists rows in a table.
  tables.js import <datasetId> <tableId> <fileName>             Imports data from a local file into a table.
  tables.js import-gcs <datasetId> <tableId> <bucketName>       Imports data from a Google Cloud Storage file into a
  <fileName>                                                    table.
  tables.js export <datasetId> <tableId> <bucketName>           Export a table from BigQuery to Google Cloud Storage.
  <fileName>
  tables.js insert <datasetId> <tableId> <json_or_file>         Insert a JSON array (as a string or newline-delimited
                                                                file) into a BigQuery table.

Options:
  --version        Show version number                                                                         [boolean]
  --projectId, -p  The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                   environment variables.                                                                       [string]
  --help           Show help                                                                                   [boolean]

Examples:
  node tables.js create my_dataset my_table "Name:string,       Creates a new table named "my_table" in "my_dataset".
  Age:integer, Weight:float, IsMagic:boolean"
  node tables.js list my_dataset                                Lists tables in "my_dataset".
  node tables.js browse my_dataset my_table                     Displays rows from "my_table" in "my_dataset".
  node tables.js delete my_dataset my_table                     Deletes "my_table" from "my_dataset".
  node tables.js import my_dataset my_table ./data.csv          Imports a local file into a table.
  node tables.js import-gcs my_dataset my_table my-bucket       Imports a GCS file into a table.
  data.csv
  node tables.js export my_dataset my_table my-bucket my-file   Exports my_dataset:my_table to gcs://my-bucket/my-file
                                                                as raw CSV.
  node tables.js export my_dataset my_table my-bucket my-file   Exports my_dataset:my_table to gcs://my-bucket/my-file
  -f JSON --gzip                                                as gzipped JSON.
  node tables.js insert my_dataset my_table json_string         Inserts the JSON array represented by json_string into
                                                                my_dataset:my_table.
  node tables.js insert my_dataset my_table json_file           Inserts the JSON objects contained in json_file (one per
                                                                line) into my_dataset:my_table.
  node tables.js copy src_dataset src_table dest_dataset        Copies src_dataset:src_table to dest_dataset:dest_table.
  dest_table

For more information, see https://cloud.google.com/bigquery/docs
```

[tables_1_docs]: https://googlecloudplatform.github.io/google-cloud-node/#/docs/google-cloud/latest/bigquery/table
[tables_1_code]: tables.js

### Queries

View the [source code][queries_2_code].

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queries.js,samples/README.md)

__Usage:__ `node queries.js --help`

```
queries.js <command>

Commands:
  queries.js sync <sqlQuery>   Run the specified synchronous query.
  queries.js async <sqlQuery>  Start the specified asynchronous query.
  queries.js shakespeare       Queries a public Shakespeare dataset.

Options:
  --version        Show version number                                                                         [boolean]
  --projectId, -p  The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT
                   environment variables.                                                                       [string]
  --help           Show help                                                                                   [boolean]

Examples:
  node queries.js sync "SELECT * FROM                           Synchronously queries the natality dataset.
  publicdata.samples.natality LIMIT 5;"
  node queries.js async "SELECT * FROM                          Queries the natality dataset as a job.
  publicdata.samples.natality LIMIT 5;"
  node queries.js shakespeare                                   Queries a public Shakespeare dataset.

For more information, see https://cloud.google.com/bigquery/docs
```

[queries_2_docs]: https://googlecloudplatform.github.io/google-cloud-node/#/docs/bigquery/latest/bigquery
[queries_2_code]: queries.js

[shell_img]: http://gstatic.com/cloudssh/images/open-btn.png
[shell_link]: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/README.md

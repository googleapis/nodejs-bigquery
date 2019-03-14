[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `npm run generate-scaffolding`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google BigQuery: Node.js Samples

[![Open in Cloud Shell][shell_img]][shell_link]

[BigQuery](https://cloud.google.com/bigquery/docs) is Google&#x27;s fully managed, petabyte scale, low cost analytics data warehouse. BigQuery is NoOps—there is no infrastructure to manage and you don&#x27;t need a database administrator—so you can focus on analyzing data to find meaningful insights, use familiar SQL, and take advantage of our pay-as-you-go model.

## Table of Contents

* [Before you begin](#before-you-begin)
* [Samples](#samples)
  * [Dataset create](#dataset-create)
  * [Dataset delete](#dataset-delete)
  * [Dataset list](#dataset-list)
  * [Tables](#tables)
  * [Queries](#queries)

## Before you begin

Before running the samples, make sure you've followed the steps in the
[Before you begin section](../README.md#before-you-begin) of the client
library's README.

## Samples

### Dataset create

View the [source code][dataset-create_0_code].

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createDataset.js,samples/README.md)[dataset-create_0_docs]: https://cloud.google.com/nodejs/docs/reference/bigquery/latest/
[dataset-create_0_code]: createDataset.js

### Dataset delete

View the [source code][dataset-delete_1_code].

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteDataset.js,samples/README.md)[dataset-delete_1_docs]: https://cloud.google.com/nodejs/docs/reference/bigquery/latest/
[dataset-delete_1_code]: deleteDataset.js

### Dataset list

View the [source code][dataset-list_2_code].

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listDatasets.js,samples/README.md)[dataset-list_2_docs]: https://cloud.google.com/nodejs/docs/reference/bigquery/latest/
[dataset-list_2_code]: listDatasets.js

### Tables

View the [source code][tables_3_code].

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/tables.js,samples/README.md)

__Usage:__ `node tables.js --help`

```
tables.js <command>

Commands:
  tables.js create <projectId> <datasetId> <tableId> <schema>   Creates a new table.
  tables.js list <projectId> <datasetId>                        Lists all tables in a dataset.
  tables.js delete <projectId> <datasetId> <tableId>            Deletes a table.
  tables.js copy <projectId> <srcDatasetId> <srcTableId>        Makes a copy of a table.
  <destDatasetId> <destTableId>
  tables.js browse <projectId> <datasetId> <tableId>            Lists rows in a table.
  tables.js load-local-csv <projectId> <datasetId> <tableId>    Loads data from a local file into a table.
  <fileName>
  tables.js load-gcs-orc <projectId> <datasetId> <tableId>      Loads sample ORC data from a Google Cloud Storage file
                                                                into a table.
  tables.js load-gcs-parquet <projectId> <datasetId> <tableId>  Loads sample Parquet data from a Google Cloud Storage
                                                                file into a table.
  tables.js load-gcs-csv <projectId> <datasetId> <tableId>      Loads sample CSV data from a Google Cloud Storage file
                                                                into a table.
  tables.js load-gcs-json <projectId> <datasetId> <tableId>     Loads sample JSON data from a Google Cloud Storage file
                                                                into a table.
  tables.js load-gcs-csv-autodetect <projectId> <datasetId>     Loads sample CSV data from a Google Cloud Storage file
  <tableId>                                                     into a table.
  tables.js load-gcs-json-autodetect <projectId> <datasetId>    Loads sample JSON data from a Google Cloud Storage file
  <tableId>                                                     into a table.
  tables.js load-gcs-csv-truncate <projectId> <datasetId>       Loads sample CSV data from GCS, replacing an existing
  <tableId>                                                     table.
  tables.js load-gcs-json-truncate <projectId> <datasetId>      Loads sample JSON data from GCS, replacing an existing
  <tableId>                                                     table.
  tables.js load-gcs-parquet-truncate <projectId> <datasetId>   Loads sample Parquet data from GCS, replacing an
  <tableId>                                                     existing table.
  tables.js load-gcs-orc-truncate <projectId> <datasetId>       Loads sample Orc data from GCS, replacing an existing
  <tableId>                                                     table.
  tables.js extract <projectId> <datasetId> <tableId>           Extract a table from BigQuery to Google Cloud Storage.
  <bucketName> <fileName>
  tables.js insert <projectId> <datasetId> <tableId>            Insert a JSON array (as a string or newline-delimited
  <json_or_file>                                                file) into a BigQuery table.

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]

Examples:
  node tables.js create my-project-id my_dataset my_table       Creates a new table named "my_table" in "my_dataset".
  "Name:string, Age:integer, Weight:float, IsMagic:boolean"
  node tables.js list my-project-id my_dataset                  Lists tables in "my_dataset".
  node tables.js browse my-project-id my_dataset my_table       Displays rows from "my_table" in "my_dataset".
  node tables.js delete my-project-id my_dataset my_table       Deletes "my_table" from "my_dataset".
  node tables.js load my-project-id my_dataset my_table         Imports a local file into a table.
  ./data.csv
  node tables.js load-gcs my-project-id my_dataset my_table     Imports a GCS file into a table.
  my-bucket data.csv
  node tables.js extract my-project-id my_dataset my_table      Exports my_dataset:my_table to gcs://my-bucket/my-file
  my-bucket my-file                                             as raw CSV.
  node tables.js extract my-project-id my_dataset my_table      Exports my_dataset:my_table to gcs://my-bucket/my-file
  my-bucket my-file -f JSON --gzip                              as gzipped JSON.
  node tables.js insert my-project-id my_dataset my_table       Inserts the JSON array represented by json_string into
  json_string                                                   my_dataset:my_table.
  node tables.js insert my-project-id my_dataset my_table       Inserts the JSON objects contained in json_file (one per
  json_file                                                     line) into my_dataset:my_table.
  node tables.js copy my-project-id src_dataset src_table       Copies src_dataset:src_table to dest_dataset:dest_table.
  dest_dataset dest_table

For more information, see https://cloud.google.com/bigquery/docs
```

[tables_3_docs]: https://cloud.google.com/nodejs/docs/reference/bigquery/latest/
[tables_3_code]: tables.js

### Queries

View the [source code][queries_4_code].

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queries.js,samples/README.md)

__Usage:__ `node queries.js --help`

```
queries.js <command>

Commands:
  queries.js stackoverflow  Queries a public Stack Overflow dataset.
  queries.js query          Queries the US Names dataset.
  queries.js disable-cache  Queries the Shakespeare dataset with the cache disabled.

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]

Examples:
  node queries.js stackoverflow  Queries a public Stackoverflow dataset.
  node queries.js query          Queries the US Names dataset.
  node queries.js disable-cache  Queries the Shakespeare dataset with the cache disabled.

For more information, see https://cloud.google.com/bigquery/docs
```

[queries_4_docs]: https://cloud.google.com/nodejs/docs/reference/bigquery/latest/
[queries_4_code]: queries.js

[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[shell_link]: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/README.md

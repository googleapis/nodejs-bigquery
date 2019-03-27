[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `python -m synthtool`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# [:  Client](https://github.com/)

None
[![npm version](https://img.shields.io/npm/v/@google-cloud/bigquery.svg)](https://www.npmjs.org/package/@google-cloud/bigquery)
[![codecov](https://img.shields.io/codecov/c/github//master.svg?style=flat)](https://codecov.io/gh/)


Google BigQuery Client Library for Node.js


* [Using the client library](#using-the-client-library)
* [Samples](#samples)
* [Versioning](#versioning)
* [Contributing](#contributing)
* [License](#license)

## Using the client library

1.  [Select or create a Cloud Platform project][projects].
1.  [Enable the  API][enable_api].
1.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation.

1. Install the client library:

        npm install @google-cloud/bigquery


1. Try an example:

```
  // Imports the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  // Creates a client
  const bigquery = new BigQuery();

  // Create the dataset
  const [dataset] = await bigquery.createDataset(datasetName);
  console.log(`Dataset ${dataset.id} created.`);

```



## Samples

Samples are in the [`samples/`](https://github.com//tree/master/samples) directory. The samples' `README.md`
has instructions for running the samples.

| Sample                      | Source Code                       | Try it |
| --------------------------- | --------------------------------- | ------ |
| Browse Rows | [source code](https://github.com//blob/master/samples/browseRows.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/browseRows.js,samples/README.md) |
| Copy Table | [source code](https://github.com//blob/master/samples/copyTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/copyTable.js,samples/README.md) |
| Create Dataset | [source code](https://github.com//blob/master/samples/createDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/createDataset.js,samples/README.md) |
| Create Table | [source code](https://github.com//blob/master/samples/createTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/createTable.js,samples/README.md) |
| Delete Dataset | [source code](https://github.com//blob/master/samples/deleteDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/deleteDataset.js,samples/README.md) |
| Delete Table | [source code](https://github.com//blob/master/samples/deleteTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/deleteTable.js,samples/README.md) |
| Extract Table To G C S | [source code](https://github.com//blob/master/samples/extractTableToGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/extractTableToGCS.js,samples/README.md) |
| Insert Rows As Stream | [source code](https://github.com//blob/master/samples/insertRowsAsStream.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/insertRowsAsStream.js,samples/README.md) |
| List Datasets | [source code](https://github.com//blob/master/samples/listDatasets.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/listDatasets.js,samples/README.md) |
| List Tables | [source code](https://github.com//blob/master/samples/listTables.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/listTables.js,samples/README.md) |
| Load C S V From G C S | [source code](https://github.com//blob/master/samples/loadCSVFromGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/loadCSVFromGCS.js,samples/README.md) |
| Load C S V From G C S Autodetect | [source code](https://github.com//blob/master/samples/loadCSVFromGCSAutodetect.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/loadCSVFromGCSAutodetect.js,samples/README.md) |
| Load C S V From G C S Truncate | [source code](https://github.com//blob/master/samples/loadCSVFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/loadCSVFromGCSTruncate.js,samples/README.md) |
| Load J S O N From G C S | [source code](https://github.com//blob/master/samples/loadJSONFromGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/loadJSONFromGCS.js,samples/README.md) |
| Load J S O N From G C S Autodetect | [source code](https://github.com//blob/master/samples/loadJSONFromGCSAutodetect.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/loadJSONFromGCSAutodetect.js,samples/README.md) |
| Load J S O N From G C S Truncate | [source code](https://github.com//blob/master/samples/loadJSONFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/loadJSONFromGCSTruncate.js,samples/README.md) |
| Load Local File | [source code](https://github.com//blob/master/samples/loadLocalFile.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/loadLocalFile.js,samples/README.md) |
| Load Orc From G C S Truncate | [source code](https://github.com//blob/master/samples/loadOrcFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/loadOrcFromGCSTruncate.js,samples/README.md) |
| Load Parquet From G C S Truncate | [source code](https://github.com//blob/master/samples/loadParquetFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/loadParquetFromGCSTruncate.js,samples/README.md) |
| Load Table G C S O R C | [source code](https://github.com//blob/master/samples/loadTableGCSORC.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/loadTableGCSORC.js,samples/README.md) |
| Load Table G C S Parquet | [source code](https://github.com//blob/master/samples/loadTableGCSParquet.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/loadTableGCSParquet.js,samples/README.md) |
| Query | [source code](https://github.com//blob/master/samples/query.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/query.js,samples/README.md) |
| Query Disable Cache | [source code](https://github.com//blob/master/samples/queryDisableCache.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/queryDisableCache.js,samples/README.md) |
| Query Params Named | [source code](https://github.com//blob/master/samples/queryParamsNamed.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/queryParamsNamed.js,samples/README.md) |
| Query Params Positional | [source code](https://github.com//blob/master/samples/queryParamsPositional.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/queryParamsPositional.js,samples/README.md) |
| Query Stack Overflow | [source code](https://github.com//blob/master/samples/queryStackOverflow.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/queryStackOverflow.js,samples/README.md) |



The [  Client API Reference][client-docs] documentation
also contains samples.

## Versioning

This library follows [Semantic Versioning](http://semver.org/).






More Information: [Google Cloud Platform Launch Stages][launch_stages]

[launch_stages]: https://cloud.google.com/terms/launch-stages

## Contributing

Contributions welcome! See the [Contributing Guide](https://github.com//blob/master/CONTRIBUTING.md).

## License

Apache Version 2.0

See [LICENSE](https://github.com//blob/master/LICENSE)

## What's Next

* [ Documentation][product-docs]
* [  Client API Reference][client-docs]
* [github.com/](https://github.com/)

Read more about the client libraries for Cloud APIs, including the older
Google APIs Client Libraries, in [Client Libraries Explained][explained].

[explained]: https://cloud.google.com/apis/docs/client-libraries-explained

[client-docs]: 
[product-docs]: 
[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=
[auth]: https://cloud.google.com/docs/authentication/getting-started
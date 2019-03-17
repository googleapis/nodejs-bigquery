[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `npm run generate-scaffolding`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# [Google BigQuery: Node.js Client](https://github.com/googleapis/nodejs-bigquery)

[![release level](https://img.shields.io/badge/release%20level-general%20availability%20%28GA%29-brightgreen.svg?style&#x3D;flat)](https://cloud.google.com/terms/launch-stages)
[![npm version](https://img.shields.io/npm/v/@google-cloud/bigquery.svg)](https://www.npmjs.org/package/@google-cloud/bigquery)
[![codecov](https://img.shields.io/codecov/c/github/googleapis/nodejs-bigquery/master.svg?style=flat)](https://codecov.io/gh/googleapis/nodejs-bigquery)

[BigQuery](https://cloud.google.com/bigquery/docs) is Google&#x27;s fully managed, petabyte scale, low cost analytics data warehouse. BigQuery is NoOps—there is no infrastructure to manage and you don&#x27;t need a database administrator—so you can focus on analyzing data to find meaningful insights, use familiar SQL, and take advantage of our pay-as-you-go model.


* [Using the client library](#using-the-client-library)
* [Samples](#samples)
* [Versioning](#versioning)
* [Contributing](#contributing)
* [License](#license)

## Using the client library

1.  [Select or create a Cloud Platform project][projects].

1.  [Enable billing for your project][billing].

1.  [Enable the Google BigQuery API][enable_api].

1.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation.

1. Install the client library:

        npm install --save @google-cloud/bigquery

1. Try an example:

```javascript
  // Imports the Google Cloud client library
  const {BigQuery} = require('@google-cloud/bigquery');

  // Creates a client
  const bigquery = new BigQuery();

  // Create the dataset
  const [dataset] = await bigquery.createDataset(datasetName);
  console.log(`Dataset ${dataset.id} created.`);
```

## Samples

Samples are in the [`samples/`](https://github.com/googleapis/nodejs-bigquery/tree/master/samples) directory. The samples' `README.md`
has instructions for running the samples.

| Sample                      | Source Code                       | Try it |
| --------------------------- | --------------------------------- | ------ |
| Dataset create | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/createDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createDataset.js,samples/README.md) |
| Dataset delete | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/deleteDataset.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteDataset.js,samples/README.md) |
| Dataset list | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listDatasets.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listDatasets.js,samples/README.md) |
| Browse rows | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/browseRows.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/browseRows.js,samples/README.md) |
| Copy table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/copyTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/copyTable.js,samples/README.md) |
| Create table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/createTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/createTable.js,samples/README.md) |
| Delete table | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/deleteTable.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/deleteTable.js,samples/README.md) |
| Extract table to GCS | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/extractTableToGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/extractTableToGCS.js,samples/README.md) |
| Insert rows as stream | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/insertRowsAsStream.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/insertRowsAsStream.js,samples/README.md) |
| List tables | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/listTables.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/listTables.js,samples/README.md) |
| Load CSV from GCS | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadCSVFromGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCS.js,samples/README.md) |
| Load CSV from GCS autodetect | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadCSVFromGCSAutodetect.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCSAutodetect.js,samples/README.md) |
| Load CSV from GCS truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadCSVFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadCSVFromGCSTruncate.js,samples/README.md) |
| Load JSON from GCS | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadJSONFromGCS.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCS.js,samples/README.md) |
| Load JSON from GCS autodetect | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadJSONFromGCSAutodetect.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCSAutodetect.js,samples/README.md) |
| Load JSON from GCS truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadJSONFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadJSONFromGCSTruncate.js,samples/README.md) |
| Load local file | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadLocalFile.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadLocalFile.js,samples/README.md) |
| Load ORC from GCS truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadOrcFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadOrcFromGCSTruncate.js,samples/README.md) |
| Load Parquet from GCS truncate | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/loadParquetFromGCSTruncate.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/loadParquetFromGCSTruncate.js,samples/README.md) |
| Query | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/query.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queries.js,samples/README.md) |
| Query named params | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsNamed.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsNamed.js,samples/README.md) |
| Query positional params | [source code](https://github.com/googleapis/nodejs-bigquery/blob/master/samples/queryParamsPositional.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-bigquery&page=editor&open_in_editor=samples/queryParamsPositional.js,samples/README.md) |

The [BigQuery Node.js Client API Reference][client-docs] documentation
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

## What's Next

* [BigQuery Documentation][product-docs]
* [BigQuery Node.js Client API Reference][client-docs]
* [github.com/googleapis/nodejs-bigquery](https://github.com/googleapis/nodejs-bigquery)

Read more about the client libraries for Cloud APIs, including the older
Google APIs Client Libraries, in [Client Libraries Explained][explained].

[explained]: https://cloud.google.com/apis/docs/client-libraries-explained

[client-docs]: https://cloud.google.com/nodejs/docs/reference/bigquery/latest/
[product-docs]: https://cloud.google.com/bigquery/docs
[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=bigquery-json.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/getting-started

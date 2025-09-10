# Migrating to BigQuery 9.x

This version of BigQuery is currently in preview. Improvements are planned for subsequent releases.

<!-- TODO(coleleah) -->
Blurb about holistic changes related to code generation, ensuring faster updates, and availability of gRPC

## Accessing preview functionality

This code is published to `npm` with the version naming convention `9.0.0-alpha.x`(aligned with [node-semver](https://github.com/npm/node-semver?tab=readme-ov-file#prerelease-tags) conventions), where the `x` will be incremented with each subsequent preview release. This convention ensures that the preview version is excluded from typical range matching semantics in your `package.json` file. In order to utilize this preview version, you will need to explicitly specify the prerelease identifier in your `package.json`. The following example snippet of a `package.json` file would include all alpha versions of `@google-cloud/bigquery` version `9.0.0`, i.e. `9.0.0-alpha.0`, `9.0.0-alpha.1`, etc., but would NOT include version `9.0.1-alpha.0`. Please refer to the [advanced range syntax guide](https://github.com/npm/node-semver?tab=readme-ov-file#advanced-range-syntax) to determine what is right for you.


```json
  "dependencies": {
    "@google-cloud/bigquery": "^9.0.0-alpha.0"
  },
```
<!-- TODO(coleleah) -->
## Instantiating preview SDK clients

<!-- TODO(coleleah) - note about various subclients -->
### Instantiating a client with default settings

#### Before

```javascript
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
```

#### After

```javascript
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQueryClient();
```

<!-- TODO(coleleah) wait until talking to Alvaro -->
### Instantiating a client with custom options

<!-- TODO(coleleah) wait until talking to Alvaro -->
### Instantiating subclients

## Importing types 

For users working in Typescript, the organization and formatting of type definitions has changed.

### Before
These types are defined in the [types.d.ts](https://github.com/googleapis/nodejs-bigquery/blob/main/src/types.d.ts) and are derived from the [discovery document](https://cloud.google.com/bigquery/docs/reference/rest#discovery-document).

```typescript
import type * as BigQueryType from '@google-cloud/bigquery';
```

### After

The import stays the same, but these types are defined in the [protos.d.ts](/protos/protos.d.ts) file and are derived from the protobuf definitions found in the [`protos` directory](/protos). Additionally, the request and response types can be derived from the method signatures, most of which are found in [`bigquery.ts`](/src/bigquery.ts).

```typescript
import type * as BigQueryType from '@google-cloud/bigquery';
```
<!-- TODO(coleleah) -->
## Known issues


<!-- TODO(coleleah) -->
## Migration using Gemini

<!-- TODO(coleleah) -->
## Code Samples

Note: The code snippets in this guide are written in Javascript, not Typescript, and are meant to be a quick way of comparing the differences between the 8.x.x and 9.x.x packages; they may not compile as is. Complete samples can be found in the `samples` directory.


<!-- TODO(coleleah) -->
### Datasets
<details open>
<summary>Code snippets and explanations for Datasets CRUDL methods</summary>

#### Create
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* The dataset creation method was renamed from `createDataset` to `insertDataset`
* `createDataset` expected a dataset ID and an options object, whereas `insertDataset` takes in a [`request` object](https://github.com/googleapis/nodejs-bigquery/blob/5e17911a35e76677705c6227dd896fb1ffc39b0e/protos/protos.d.ts#L1503-L1513) minimally containing the `projectId` and a dataset reference object, which contains the datasetId


##### Before

```javascript
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const datasetId = "my-dataset"
const options = {
     location: 'US',
 };

 // Create a new dataset
 const [dataset] = await bigquery.createDataset(datasetId, options);
```

##### After
[Full sample](/samples/datasets/createDataset.js)

```javascript
const {BigQueryClient} = require('@google-cloud/bigquery');
const bigqueryClient = new BigQueryClient();

async function createDataset() {
  const dataset = {
    datasetReference: {
      datasetId: 'my-dataset',
    },
    location: 'US',
  };

  const request = {
    projectId: 'my-project'
    dataset: dataset,
  };

  try {
    const [response] = await bigqueryClient.insertDataset(request);
    console.log(`Dataset ${response.id} created successfully.`);
  } catch (err) {
    console.error('ERROR creating dataset:', err);
    if (err.errors) {
      err.errors.forEach(e => console.error(e.message));
    }
  }
}

await createDataset();
```


#### Delete
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Previously we used a combination of two methods - one to access the `dataset` object, and one to call delete on it - now we use one method, `deleteDataset` on the client
* `deleteDataset` takes in a [`request` object](https://github.com/googleapis/nodejs-bigquery/blob/5e17911a35e76677705c6227dd896fb1ffc39b0e/protos/protos.d.ts#L1744-L1754) minimally containing the `projectId` and a `datasetId`. It also optionally takes the `deleteContents` parameter, which will delete all tables in the dataset if set to true

##### Before

```javascript
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const datasetId = "my-dataset"

// Delete a dataset
const dataset = bigquery.dataset(datasetId);

await dataset.delete({force: true});
console.log(`Dataset ${dataset.id} deleted.`);
```

##### After
[Full sample](/samples/datasets/deleteDataset.js)

```javascript
const {BigQueryClient} = require('@google-cloud/bigquery');
const bigqueryClient = new BigQueryClient();

async function deleteDataset() {
  const request = {
    projectId: 'my-project',
    datasetId: 'my-dataset',
    deleteContents: true, // Set to true to delete all tables in the dataset
  };

  try {
    await bigqueryClient.deleteDataset(request);
    console.log(`Dataset ${datasetId} deleted.`);
  } catch (err) {
    console.error('ERROR deleting dataset:', err);
    if (err.errors) {
      err.errors.forEach(e => console.error(e.message));
    }
  }
}

await deleteDataset();
```

#### Get
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Previously we used a combination of two methods - one to access the `dataset` object, and one to call `get` on it - now we use one method, `getDataset`, which is a method of the client
* The previous `dataset` method only took in a `datasetId`, but `getDataset` takes in a [`request` object](https://github.com/googleapis/nodejs-bigquery/blob/5e17911a35e76677705c6227dd896fb1ffc39b0e/protos/protos.d.ts#L1377-L1390) minimally containing the `projectId` and a `datasetId`. There are additional optional parameters for the DatasetView and accessPolicyVersion

##### Before

```javascript
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const datasetId = "my-dataset"

 // Create a new dataset
 const [dataset] = await bigquery.dataset(datasetId).get();
```

##### After
[Full sample](/samples/datasets/getDataset.js)

```javascript
const {BigQueryClient} = require('@google-cloud/bigquery');
const bigqueryClient = new BigQueryClient();

async function getDataset() {
  const request = {
    projectId: 'my-project',
    datasetId: 'my-dataset',
  };

  try {
    const [response] = await bigqueryClient.getDataset(request);
    console.log(`Dataset ${response.id} retrieved successfully.`);
    console.log('Details:', response);
  } catch (err) {
    console.error('ERROR getting dataset:', err);
    if (err.errors) {
      err.errors.forEach(e => console.error(e.message));
    }
  }
}

await getDataset();
```

#### List
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* `getDatasets` no longer exists
* In the BigQueryClient, there are [three options for every list method](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#auto-pagination). For datasets, there is `listDatasets` (least efficient, but supports manual paging), `listDatasetsAsync` (returns an iterable, recommended over the non-async method) and `listDatasetsStream` (returns results as a stream)
* Any of these list methods take in a [request object](https://github.com/googleapis/nodejs-bigquery/blob/5e17911a35e76677705c6227dd896fb1ffc39b0e/protos/protos.d.ts#L1853-L1868) that must minimally takes in the `projectId`

##### Before

```javascript
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const projectId = "my-project"

 // List datasets
 const [datasets] = await bigquery.getDatasets({projectId});
 console.log('Datasets:');
 datasets.forEach(dataset => console.log(dataset.id));

```

##### After
[Full sample](/samples/datasets/listDatasets.js)

```javascript
const {BigQueryClient} = require('@google-cloud/bigquery');

const bigqueryClient = new BigQueryClient();

async function listDatasets() {
  // Construct the request object.
  const request = {
    projectId: 'my-project',
  };

  try {
    // Make the API request.
    const iterable = bigqueryClient.listDatasetsAsync(request);
    console.log('Datasets:');
    for await (const dataset of iterable) {
      console.log('-' + dataset.id);
    }
  } catch (err) {
    console.error('ERROR listing datasets:', err);
    if (err.errors) {
      err.errors.forEach(e => console.error(e.message));
    }
  }
}

await listDatasets();

```

#### Update
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* The dataset description is now set with the `updateDataset` function rather than with `setMetadata`
* `updateDataset` takes in a [`request` object](https://github.com/googleapis/nodejs-bigquery/blob/5e17911a35e76677705c6227dd896fb1ffc39b0e/protos/protos.d.ts#L1612-L1628) - this contains a [dataset object](https://github.com/googleapis/nodejs-bigquery/blob/5e17911a35e76677705c6227dd896fb1ffc39b0e/protos/protos.d.ts#L789-L880), which contains a description - an object with a single value: the string to use for the description

##### Before

```javascript

  const {BigQuery} = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();
  const datasetId = 'my-dataset' // must already exist
  // Updates a dataset's description.

  // Retreive current dataset metadata
  const dataset = bigquery.dataset(datasetId);
  const [metadata] = await dataset.getMetadata();

    // Set new dataset description
  const description = 'Description set with legacy library';
  metadata.description = description;

  const [apiResponse] = await dataset.setMetadata(metadata);
  const newDescription = apiResponse.description;

  console.log(`${datasetId} description: ${newDescription}`);
```

##### After
[Full sample](/samples/datasets/updateDataset.js)
```javascript
const {BigQueryClient} = require('@google-cloud/bigquery');
const bigqueryClient = new BigQueryClient();

async function updateDatasetDescription() {
  const description = "wow! new description!"
  const datasetToUpdate = {
    projectId: 'my-project',
    datasetId: 'my-dataset',
    datasetReference: {
      datasetId: 'my-dataset',
    },
    description: {value: description},
  };
  const request = {
    projectId: projectId,
    datasetId: 'my-dataset',
    dataset: datasetToUpdate,
  };

  try {
    const [response] = await bigqueryClient.updateDataset(request);
    console.log(`Dataset ${response.id} description: ${response.description.value}`);
  } catch (err) {
    console.error('ERROR updating dataset:', err);
    if (err.errors) {
      err.errors.forEach(e => console.error(e.message));
    }
  }
}

await updateDatasetDescription();
```
</details>

<!-- TODO(coleleah) -->
### Tables
<details open>
<summary>Code snippets and explanations for Tables CRUDL methods</summary>

#### Create
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Instead of calling `createTable` on a `dataset` object, the `insertTable` method is called using the client
* Instead of the method taking in a `tableId` and `options` it takes in a [`request` object](https://github.com/googleapis/nodejs-bigquery/blob/4f95cabbd2dbb5c749a158b57ba95b1905429c57/protos/protos.d.ts#L29250-L29260), which contains a the `datasetId` as well as the [`table` object](https://github.com/googleapis/nodejs-bigquery/blob/4f95cabbd2dbb5c749a158b57ba95b1905429c57/protos/protos.d.ts#L28721-L28875) as one of the parameters

##### Before

```javascript
const datasetId = 'my_dataset'; // Existing dataset
const tableId = 'my_new_table'; // Table to be created
const schema = [
  {name: 'Name', type: 'STRING', mode: 'REQUIRED'},
  {name: 'Age', type: 'INTEGER'},
  {name: 'Weight', type: 'FLOAT'},
  {name: 'IsMagic', type: 'BOOLEAN'},
];
// Import the Google Cloud client library and create a client
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function createTable() {
  const options = {
    schema: schema,
    location: 'US',
  };

  // Create a new table in the dataset
  const [table] = await bigquery
    .dataset(datasetId)
    .createTable(tableId, options);

  console.log(`Table ${table.id} created.`);
}
createTable();
```

##### After
[Full sample](/samples/tables/createTable.js)

```javascript
// Import the Google Cloud client library and create a client
const {BigQueryClient} = require('@google-cloud/bigquery');
const projectId = 'my-project';
const datasetId = 'my_dataset'; // Existing dataset
const tableId = 'my_new_table'; // Table to be created
const schema = [
  {name: 'Name', type: 'STRING', mode: 'REQUIRED'},
  {name: 'Age', type: 'INTEGER'},
  {name: 'Weight', type: 'FLOAT'},
  {name: 'IsMagic', type: 'BOOLEAN'},
],;  const bigquery = new BigQueryClient();

async function createTable() {
  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  const request = {
    projectId,
    datasetId,
    table: {
      tableReference: {
        projectId,
        datasetId,
        tableId,
      },
      schema: {fields: schema},
      location: 'US',
    },
  };

  // Create a new table in the dataset
  const [table] = await bigquery.insertTable(request);

  console.log(`Table ${table.tableReference.tableId} created.`);
}
createTable();
```

#### Delete
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Previously we called `.delete()` on a dataset/table object - now, we call `deleteTable()` using the client
* Instead of passing a `datasetId` and `tableId` to the `dataset` and `table` objects respectively, we pass a single [`request` object](https://github.com/googleapis/nodejs-bigquery/blob/4f95cabbd2dbb5c749a158b57ba95b1905429c57/protos/protos.d.ts#L29480-L29490) that takes in a `projectId`, `datasetId` and `tableId`

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function deleteTable() {
  // Deletes "my_table" from "my_dataset".

  const datasetId = "my_dataset";
  const tableId = "my_table";

  // Delete the table
  await bigquery.dataset(datasetId).table(tableId).delete();

  console.log(`Table ${tableId} deleted.`);
}
deleteTable();
```

##### After
[Full sample](/samples/tables/deleteTable.js)

```javascript
// Import the Google Cloud client library
const {BigQueryClient} = require('@google-cloud/bigquery');
const bigquery = new BigQueryClient();

async function deleteTable() {
  // Deletes "my_table" from "my_dataset".
  const projectId = "my_project";
  const datasetId = "my_dataset";
  const tableId = "my_table";

  const request = {
    projectId: projectId,
    datasetId: datasetId,
    tableId: tableId,
  };

  // Delete the table
  await bigquery.deleteTable(request);

  console.log(`Table ${tableId} deleted.`);
}
deleteTable();
```

#### Get
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Previously, we called `.table().get` on a `dataset` object. Now, we call the `getTable()` method using the client
* Instead of passing a `tableId` to the `.table()` function, we pass a [`request` object](https://github.com/googleapis/nodejs-bigquery/blob/4f95cabbd2dbb5c749a158b57ba95b1905429c57/protos/protos.d.ts#L29118-L29134) that contains the `projectId`, `datasetId` and `tableId`

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function getTable() {
  // Retrieves table named "my_table" in "my_dataset".
  const datasetId = "my_dataset";
  const tableId = "my_table";

  // Retrieve table reference
  const dataset = bigquery.dataset(datasetId);
  const [table] = await dataset.table(tableId).get();

  console.log('Table:');
  console.log(table.metadata.tableReference);
}
getTable();
```

##### After
[Full sample](/samples/tables/getTable.js)

```javascript
const {BigQueryClient} = require('@google-cloud/bigquery');
const bigquery = new BigQueryClient();

async function getTable() {
  // Retrieves table named "my_table" in "my_dataset".

  const projectId = "my_project";
  const datasetId = "my_dataset";
  const tableId = "my_table";

  const request = {
    projectId: projectId,
    datasetId: datasetId,
    tableId: tableId
  };

  const [table] = await bigquery.getTable(request);

  console.log('Table:');
  console.log(table.id);
}
getTable();
```

#### List
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Previously we called the `.getTables()` method on a `dataset` object, now we call the one of the `listTables*` methods on the client
* In the BigQueryClient, there are [three options for every list method](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#auto-pagination). For tables, there is `listTables` (least efficient, but supports manual paging), `listTablesAsync` (returns an iterable, recommended over the non-async method) and `listTablesStream` (returns results as a stream)
* Any of these list methods take in a [request object](https://github.com/googleapis/nodejs-bigquery/blob/4f95cabbd2dbb5c749a158b57ba95b1905429c57/protos/protos.d.ts#L29589-L29602) that must minimally takes in the `projectId` and the `datasetId`

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function listTables() {
  // Lists tables in 'my_dataset'.


  const datasetId = 'my_dataset';

  // List all tables in the dataset
  const [tables] = await bigquery.dataset(datasetId).getTables();

  console.log('Tables:');
  tables.forEach(table => console.log(table.id));
}

listTables();
```

##### After
[Full sample](/samples/tables/listTables.js)

```javascript
const {BigQueryClient} = require('@google-cloud/bigquery');

const bigquery = new BigQueryClient();

async function listTables() {
  // Lists tables in 'my_dataset'.
  const projectId = await bigquery.tableClient.getProjectId();
  const datasetId = 'my_dataset';

  const request = {
    projectId,
    datasetId,
  };

  // List all tables in the dataset
  // limit results to 10
  const maxResults = 10;
  const iterable = bigquery.listTablesAsync(request);
  console.log('Tables:');
  let i = 0;
  for await (const table of iterable) {
    if (i >= maxResults) {
      break;
    }
    console.log(table.id);
    i++;
  }
}
listTables();
```

#### Update
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* The dataset description is now set with the `updateTable` function rather than with `setMetadata`
* `updateTable` takes in a [`request` object](https://github.com/googleapis/nodejs-bigquery/blob/4f95cabbd2dbb5c749a158b57ba95b1905429c57/protos/protos.d.ts#L29359-L29375) - this contains a [`table` object](https://github.com/googleapis/nodejs-bigquery/blob/4f95cabbd2dbb5c749a158b57ba95b1905429c57/protos/protos.d.ts#L28721-L28875), which contains a description - an object with a single `value`: the string to use for the description

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function updateTableDescription() {
  // Updates a table's description.
  const datasetId = 'my_dataset';
  const tableId = 'my_table';

  // Retreive current table metadata
  const table = bigquery.dataset(datasetId).table(tableId);
  const [metadata] = await table.getMetadata();

  // Set new table description
  const description = 'New table description.';
  metadata.description = description;
  const [apiResponse] = await table.setMetadata(metadata);
  const newDescription = apiResponse.description;

  console.log(`${tableId} description: ${newDescription}`);
}
updateTableDescription();
```

##### After
[Full sample](/samples/tables/updateTable.js)

```javascript
// Import the Google Cloud client library
const {BigQueryClient} = require('@google-cloud/bigquery');
const bigquery = new BigQueryClient();

async function updateTableDescription() {
  // Updates a table's description.
  const projectId = "my_project";
  const tableId = "my_table";
  const datasetId = "my_dataset";

  // Set new table description
  const description = {value: 'New table description.'};

  const request = {
    projectId: projectId,
    datasetId: datasetId,
    tableId: tableId,
    table: {
      tableReference: {tableId: tableId},
      description: description,
    },
  };

  const [response] = await bigquery.updateTable(request);

  console.log(`${tableId} description: ${response.description.value}`);
}

updateTableDescription();

```
</details>

<!-- TODO(coleleah) -->
### Routines
<details open>
<summary>Code snippets and explanations for Routines CRUDL methods</summary>

<!-- TODO(coleleah) -->
#### Create
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### Delete
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### Get
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### List
**Key differences**
TODO(coleleah) update text
* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
In the BigQueryClient, there are [three options for every list method](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#auto-pagination). For datasets, there is `listDatasets` (least efficient, but supports manual paging), `listDatasetsAsync` (returns an iterable, recommended over the non-async method) and `listDatasetsStream` (returns results as a stream)
* Any of these list methods take in a [request object](https://github.com/googleapis/nodejs-bigquery/blob/5e17911a35e76677705c6227dd896fb1ffc39b0e/protos/protos.d.ts#L1853-L1868) that must minimally takes in the `projectId`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### Update
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
</details>

<!-- TODO(coleleah) -->
### Models
<details open>
<summary>Code snippets and explanations for Models CRUDL methods</summary>

<!-- TODO(coleleah) -->
#### Create
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### Delete
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### Get
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### List
**Key differences**
TODO(coleleah) update text
* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
In the BigQueryClient, there are [three options for every list method](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#auto-pagination). For datasets, there is `listDatasets` (least efficient, but supports manual paging), `listDatasetsAsync` (returns an iterable, recommended over the non-async method) and `listDatasetsStream` (returns results as a stream)
* Any of these list methods take in a [request object](https://github.com/googleapis/nodejs-bigquery/blob/5e17911a35e76677705c6227dd896fb1ffc39b0e/protos/protos.d.ts#L1853-L1868) that must minimally takes in the `projectId`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### Update
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
</details>

<!-- TODO(coleleah) -->
### Jobs
<details open>
<summary>Code snippets and explanations for Jobs CRUDL methods</summary>

<!-- TODO(coleleah) -->
#### Create
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### Delete
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### Get
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### List
**Key differences**
TODO(coleleah) update text
* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
In the BigQueryClient, there are [three options for every list method](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#auto-pagination). For datasets, there is `listDatasets` (least efficient, but supports manual paging), `listDatasetsAsync` (returns an iterable, recommended over the non-async method) and `listDatasetsStream` (returns results as a stream)
* Any of these list methods take in a [request object](https://github.com/googleapis/nodejs-bigquery/blob/5e17911a35e76677705c6227dd896fb1ffc39b0e/protos/protos.d.ts#L1853-L1868) that must minimally takes in the `projectId`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
<!-- TODO(coleleah) -->
#### Update
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
TODO link to full sample

```javascript
```
</details>
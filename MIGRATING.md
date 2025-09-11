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

#### Create dataset

##### Key differences

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

#### Delete dataset

##### Key differences

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

#### Get dataset

##### Key differences

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

#### List datasets

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* `getDatasets` no longer exists
* In the BigQueryClient, there are [three options for every list method](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#auto-pagination). For datasets, there is `listDatasets` (least efficient, but supports manual paging), `listDatasetsAsync` (returns an iterable, recommended over the non-async method) and `listDatasetsStream` (returns results as a stream)
* Any of these list methods take in a [request object](https://github.com/googleapis/nodejs-bigquery/blob/5e17911a35e76677705c6227dd896fb1ffc39b0e/protos/protos.d.ts#L1853-L1868) that must minimally take in the `projectId`

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

#### Update dataset

##### Key differences

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

#### Create table

##### Key differences

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

#### Delete table

##### Key differences

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

#### Get table

##### Key differences

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

#### List tables

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Previously we called the `.getTables()` method on a `dataset` object, now we call the one of the `listTables*` methods on the client
* In the BigQueryClient, there are [three options for every list method](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#auto-pagination). For tables, there is `listTables` (least efficient, but supports manual paging), `listTablesAsync` (returns an iterable, recommended over the non-async method) and `listTablesStream` (returns results as a stream)
* Any of these list methods take in a [request object](https://github.com/googleapis/nodejs-bigquery/blob/4f95cabbd2dbb5c749a158b57ba95b1905429c57/protos/protos.d.ts#L29589-L29602) that must minimally take in the `projectId` and the `datasetId`

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

#### Update table

##### Key differences

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

#### Create routine

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Instead of calling `.routine` on a `dataset` object, we utilize the `insertRoutine` method
* Instead of only passing a `routineId` parameter to the `routine` method, we pass an [`insertRoutineRequest`](https://github.com/googleapis/nodejs-bigquery/blob/11b16d84aef3ff09bb99d37ab103b0a04969b4b7/protos/protos.d.ts#L25897-L25907) that contains the `projectId`, `datasetId`, and a `routine` object

##### Before

```javascript
// Import the Google Cloud client library and create a client
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function createRoutine() {
  // Creates a new routine named "my_routine" in "my_dataset".

  const datasetId = 'my_dataset';
  const routineId = 'my_routine';

  const dataset = bigquery.dataset(datasetId);

  // Create routine reference
  let routine = dataset.routine(routineId);

  const config = {
    arguments: [
      {
        name: 'x',
        dataType: {
          typeKind: 'INT64',
        },
      },
    ],
    definitionBody: 'x * 3',
    routineType: 'SCALAR_FUNCTION',
    returnType: {
      typeKind: 'INT64',
    },
  };

  // Make API call
  [routine] = await routine.create(config);

  console.log(`Routine ${routineId} created.`);
}
createRoutine();
```

##### After

[Full sample](/samples/routines/createRoutine.js)

```javascript
// Import the Google Cloud client library.
const {BigQueryClient} = require('@google-cloud/bigquery');

// Create a client
const bigqueryClient = new BigQueryClient();

async function createRoutine() {
  // Creates a new routine named "my_routine" in "my_dataset".
  const projectId = 'my-project';
  const datasetId = 'my_dataset';
  const routineId = 'my_routine';

  const routine = {
    routineReference: {
      projectId,
      datasetId,
      routineId,
    },
    arguments: [
      {
        name: 'x',
        dataType: {typeKind: 'INT64'},
      },
    ],
    definitionBody: 'x * 3',
    routineType: 'SCALAR_FUNCTION',
    returnType: {typeKind: 'INT64'},
  };

  // Make API call
  const [response] = await bigqueryClient.insertRoutine({
    projectId,
    datasetId,
    routine,
  });

  console.log(`Routine ${response.routineReference.routineId} created.`);
}
createRoutine();
```

#### Delete routine

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Previously we used the `routine` method to access the `routine` object and the `dataset` method to access the `dataset` object, and then one to call `delete` on it - now we use one method, `deleteRoutine` on the client
* `deleteRoutine` takes in a [`request` object](https://github.com/googleapis/nodejs-bigquery/blob/11b16d84aef3ff09bb99d37ab103b0a04969b4b7/protos/protos.d.ts#L26242-L26252) containing the `projectId`, `datasetId` and `routineId`

##### Before

```javascript
// Import the Google Cloud client library and create a client
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function deleteRoutine() {
  // Deletes a routine named "my_routine" in "my_dataset".


  const datasetId = 'my_dataset';
  const routineId = 'my_routine';

  const dataset = bigquery.dataset(datasetId);

  // Create routine reference
  let routine = dataset.routine(routineId);

  // Make API call
  [routine] = await routine.delete();

  console.log(`Routine ${routineId} deleted.`);
}
```

##### After

[Full sample](/samples/routines/deleteRoutine.js)

```javascript
// Import the Google Cloud client library.
const {BigQueryClient} = require('@google-cloud/bigquery');


const bigqueryClient = new BigQueryClient();


async function deleteRoutine() {
  // Deletes a routine named "my_routine" in "my_dataset".


  const projectId = 'my-project';
  const datasetId = 'my_dataset';
  const routineId = 'my_routine';

  const deleteRequest = {
      projectId: projectId,
      datasetId: datasetId,
      routineId: routineId
  }
  // Make API call
  await bigqueryClient.deleteRoutine(deleteRequest);

  console.log(`Routine ${routineId} deleted.`);
}
```

#### Get routine

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Instead of calling `.get` on a `routine` object chained to a `dataset` object, we call `getRoutine` using the `BigQueryClient`
* Instead of passing the `datasetId` to the `dataset` object and the `routineId` to the `routine` object, we construct a [`request`](https://github.com/googleapis/nodejs-bigquery/blob/11b16d84aef3ff09bb99d37ab103b0a04969b4b7/protos/protos.d.ts#L25788-L25798) that takes in the `projectId`, `datasetId`, and `routineId` that gets passed to the `getRoutine` call

##### Before

```javascript
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function getRoutine() {
  // Gets an existing routine named "my_routine" in "my_dataset".

  const datasetId = 'my_dataset';
  const routineId = 'my_routine';

  const dataset = bigquery.dataset(datasetId);

  // Create routine reference and make API call
  const [routine] = await dataset.routine(routineId).get();

  console.log(
    `Routine ${routine.metadata.routineReference.routineId} retrieved.`,
  );
}

```

##### After

[Full sample](/samples/routines/getRoutine.js)

```javascript
// Import the Google Cloud client library.
const {BigQueryClient} = require('@google-cloud/bigquery');

const bigqueryClient = new BigQueryClient();

async function getRoutine() {
  // Gets an existing routine named "my_routine" in "my_dataset".

  const projectId = 'my-project';
  const datasetId = 'my_dataset';
  const routineId = 'my_routine';


  const getRequest = {
      projectId: projectId,
      datasetId: datasetId,
      routineId: routineId
  }
  // Create routine reference and make API call
  const [routine] = await bigqueryClient.getRoutine(getRequest);

  console.log(`Routine ${routine.routineReference.routineId} retrieved.`);
}
```

#### List routines

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Instead of calling `getRoutines` on the `dataset` object, we call one of the `listRoutines*` methods using the `BigQueryClient`
* In the BigQueryClient, there are [three options for every list method](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#auto-pagination). For datasets, there is `listRoutines` (least efficient, but supports manual paging), `listRoutinesAsync` (returns an iterable, recommended over the non-async method) and `listRoutinesStream` (returns results as a stream)
* Any of these list methods take in a [request object](https://github.com/googleapis/nodejs-bigquery/blob/11b16d84aef3ff09bb99d37ab103b0a04969b4b7/protos/protos.d.ts#L26351-L26367) that must minimally take in the `projectId` and `datasetId`

##### Before

```javascript
// Import the Google Cloud client library and create a client
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function listRoutines() {
  // Lists routines in "my_dataset".

  const datasetId = 'my_dataset';

  // List all routines in the dataset
  const [routines] = await bigquery.dataset(datasetId).getRoutines();

  console.log('Routines:');
  routines.forEach(routine => console.log(routine.id));
}
```

##### After

[Full sample](/samples/routines/listRoutines.js)

```javascript
// Import the Google Cloud client library.
const {BigQueryClient} = require('@google-cloud/bigquery');

const bigqueryClient = new BigQueryClient();

async function listRoutines() {
  // Lists routines in "my_dataset".

  const projectId = 'my-project';
  const datasetId = 'my_dataset';

  const projectId = await bigqueryClient.routineClient.getProjectId();
  const listRequest = {
    projectId: projectId,
    datasetId: datasetId,
  };
  // List all routines in the dataset
  // limit results to 10
  const maxResults = 10;
  const iterable = bigqueryClient.listRoutinesAsync(listRequest);
  console.log('Routines:');
  let i = 0;
  for await (const routine of iterable) {
    if (i >= maxResults) {
      break;
    }
    console.log(routine.routineReference.routineId);
    i++;
  }
}
listRoutines();
```

#### Update routine

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Instead of calling the `setMetadata` function on a `routine` object, we utilize the `updateRoutine` function of the `BigQueryClient`
* Instead of passing an object with the updated description, we pass a [`request`](https://github.com/googleapis/nodejs-bigquery/blob/11b16d84aef3ff09bb99d37ab103b0a04969b4b7/protos/protos.d.ts#L26006-L26019) that contains a [`routine` object](https://github.com/googleapis/nodejs-bigquery/blob/11b16d84aef3ff09bb99d37ab103b0a04969b4b7/protos/protos.d.ts#L24906-L24967) with the field(s) we want to update - this case, the description

##### Before

```javascript
// Import the Google Cloud client library and create a client
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function updateRoutine() {
  // Updates a routine named "my_routine" in "my_dataset".


  const datasetId = 'my_dataset';
  const routineId = 'my_routine';

  const updates = {
    description: 'New description',
  };

  const dataset = bigquery.dataset(datasetId);

  // Create routine reference
  let routine = dataset.routine(routineId);

  // Make API call
  [routine] = await routine.setMetadata(updates);

  console.log(`Routine description: ${routine.description}`);
}
```

##### After

[Full sample](/samples/routines/updateRoutine.js)

```javascript
// Import the Google Cloud client library.
const {BigQueryClient} = require('@google-cloud/bigquery');

const bigqueryClient = new BigQueryClient();

async function updateRoutine() {
  // Updates a routine named "my_routine" in "my_dataset".

  const projectId = 'my-project';
  const datasetId = 'my_dataset';
  const routineId = 'my_routine';

  const projectId = await bigqueryClient.routineClient.getProjectId();

  const getRequest = {
      projectId: projectId,
      datasetId: datasetId,
      routineId: routineId
  }
  const [routine] = await bigqueryClient.getRoutine(getRequest)
  routine.description = "This is a new description"

  const updateRequest = {
      projectId: projectId,
      datasetId: datasetId,
      routineId: routineId,
      routine: routine
  }
  // Make API call
  const [response] =
    await bigqueryClient.updateRoutine(updateRequest);

  console.log(`Routine description: ${response.description}`);
}
```

</details>

<!-- TODO(coleleah) -->
### Models

<details open>
<summary>Code snippets and explanations for Models CRUDL methods</summary>
TODO(coleleah) - note about this likely changing?

#### Create model

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Calling `insertJob` with an [`insertJobRequest`](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L6180-L6187) instead of `createQueryJob`
  * In this request, we need to manually specify the `useLegacySql` value as `false` in order for the underlying BigQuery engine to properly parse the creation query
* Accessing the underlying `jobClient` that is part of the `BigQueryClient` to call `getQueryResults`
* `getQueryResults` takes in a [`getQueryResultsRequest`](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L6830-L6855)
* We manually poll `getQueryResults` periodically to await the results of the model creation job

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function createModel() {
  // Creates a model named "my_model" in "my_dataset".

  const datasetId = "my_dataset";
  const modelId = "my_model";

  const query = `CREATE OR REPLACE MODEL \`${datasetId}.${modelId}\`
        OPTIONS(model_type='logistic_reg') AS
        SELECT
          IF(totals.transactions IS NULL, 0, 1) AS label,
          IFNULL(device.operatingSystem, "") AS os,
          device.isMobile AS is_mobile,
          IFNULL(geoNetwork.country, "") AS country,
          IFNULL(totals.pageviews, 0) AS pageviews
        FROM
          \`bigquery-public-data.google_analytics_sample.ga_sessions_*\`
        WHERE
          _TABLE_SUFFIX BETWEEN '20160801' AND '20170631'
        LIMIT  100000;`;

  const queryOptions = {
    query: query,
  };

  // Run query to create a model
  const [job] = await bigquery.createQueryJob(queryOptions);

  // Wait for the query to finish
  await job.getQueryResults();

  console.log(`Model ${modelId} created.`);
}
createModel();

```

##### After

[Full sample](/samples/models/createModel.js)

```javascript
const {BigQueryClient} = require('@google-cloud/bigquery');
const bigquery = new BigQueryClient();

async function createModel() {
  // Creates a model named "my_model" in "my_dataset".

  /**
   * TODO(developer): Uncomment the following lines before running the sample
   */
  // const datasetId = "my_dataset";
  // const modelId = "my_model";

  const query = `CREATE OR REPLACE MODEL \`${projectId}.${datasetId}.${modelId}\`
        OPTIONS(model_type='logistic_reg') AS
        SELECT
          IF(totals.transactions IS NULL, 0, 1) AS label,
          IFNULL(device.operatingSystem, "") AS os,
          device.isMobile AS is_mobile,
          IFNULL(geoNetwork.country, "") AS country,
          IFNULL(totals.pageviews, 0) AS pageviews
        FROM
          \`bigquery-public-data.google_analytics_sample.ga_sessions_*\`
        WHERE
          _TABLE_SUFFIX BETWEEN '20160801' AND '20170631'
        LIMIT  100000;`;


  const request = {
    projectId: projectId,
    job: {
      configuration: {
        query: {
          query: query,
          useLegacySql: {value: false}
        },
      },
    },
  };

  // Run query to create a model
  const [jobResponse] = await bigquery.insertJob(request);
  console.log('jobResponse', jobResponse)
  const jobReference = jobResponse.jobReference;

  const getQueryResultsRequest = {
    projectId: projectId,
    jobId: jobReference.jobId,
    location: jobReference.location.value,
    timeoutMs: {value:120000}

  }
  // Wait for the job to finish
  let [resp] = await bigquery.jobClient.getQueryResults(getQueryResultsRequest)
  // poll the job status every 3 seconds until complete
  while(resp.status==="RUNNING"){
    setTimeout([resp] = await bigquery.jobClient.getQueryResults(getQueryResultsRequest), 3000)
  }
  if (resp.errors.length!==0){
    throw new Error(`Something failed in model creation`)
  }
  console.log(`Model ${modelId} created.`);
}
createModel();

```

#### Delete model

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Previously we used the `model` method on the `dataset` object and then called `delete` on that result. Now we call `deleteModel` using the `BigQueryClient` and pass it a [`deleteModelRequest`](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L23096-L23106)

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function deleteModel() {
  // Deletes a model named "my_model" from "my_dataset".


  const datasetId = "my_dataset";
  const modelId = "my_model";

  const dataset = bigquery.dataset(datasetId);
  const model = dataset.model(modelId);
  await model.delete();

  console.log(`Model ${modelId} deleted.`);
}
deleteModel();
```

##### After

[Full sample](/samples/models/deleteModel.js)

```javascript
// Import the Google Cloud client library
const {BigQueryClient} = require('@google-cloud/bigquery');

async function deleteModel() {
  // Deletes a model named "my_model" from "my_dataset".

  const projectId = "my_project"
  const datasetId = "my_dataset";
  const modelId = "my_model";

  const bigqueryClient = new BigQueryClient();

  const request = {
    projectId: projectId,
    datasetId: datasetId,
    modelId: modelId,
  };

  await bigqueryClient.deleteModel(request);

  console.log(`Model ${modelId} deleted.`);
}
deleteModel();
```

#### Get model

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Instead of calling `.get` on a `model` object chained to a `dataset` object, we call `getModel` using the `BigQueryClient`
* Instead of passing the `datasetId` to the `dataset` object and the `modelId` to the `model` object, we pass a [`GetModelRequest`](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L22872-L22882) to the `getModel` call on the `BigQueryClient`

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function getModel() {
  // Retrieves model named "my_existing_model" in "my_dataset".

  
  const datasetId = "my_dataset";
  const modelId = "my_existing_model";

  const dataset = bigquery.dataset(datasetId);
  const [model] = await dataset.model(modelId).get();

  console.log('Model:');
  console.log(model.metadata.modelReference);
}
getModel()

```

##### After

[Full sample](/samples/models/getModel.js)

```javascript
// Import the Google Cloud client library
const {BigQueryClient} = require('@google-cloud/bigquery');

async function getModel() {
  // Retrieves model named "my_existing_model" in "my_dataset".

  const datasetId = "my_dataset";
  const modelId = "my_existing_model";

  const bigqueryClient = new BigQueryClient();

  const request = {
    projectId: projectId,
    datasetId: datasetId,
    modelId: modelId,
  };

  const [model] = await bigqueryClient.getModel(request);

  console.log('Model:');
  console.log(model);
}
getModel();
```

#### List models

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Instead of calling `getModels` on a `dataset` object, we call the one of the `listModels*` functions using the `BigQueryClient`
* In the BigQueryClient, there are [three options for every list method](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#auto-pagination). For models, there is `listModels` (least efficient, but supports manual paging), `listModelsAsync` (returns an iterable, recommended over the non-async method) and `listModelsStream` (returns results as a stream)
* Any of these list methods take in a [request object](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L23205-L23218) that must minimally take in the `projectId` and `datasetId`

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function listModels() {
  // Lists all existing models in the dataset.


  const datasetId = "my_dataset";

  const dataset = bigquery.dataset(datasetId);

  dataset.getModels().then(data => {
    const models = data[0];
    console.log('Models:');
    models.forEach(model => console.log(model.metadata));
  });
}
listModels()
```

##### After

[Full sample](/samples/models/listModels.js)

```javascript
// Import the Google Cloud client library
const {BigQueryClient} = require('@google-cloud/bigquery');

async function listModels() {
  // Lists all existing models in the dataset.
  const projectId = "my_project";
  const datasetId = "my_dataset";

  const bigqueryClient = new BigQueryClient();

  const request = {
    projectId: projectId,
    datasetId: datasetId,
  };

  // limit results to 10
  const maxResults = 10;
  const iterable = bigqueryClient.listModelsAsync(request);
  console.log('Models:');
  let i = 0;
  for await (const model of iterable) {
    if (i >= maxResults) {
      break;
    }
    console.log(model);
    i++;
  }
}
listModels();
```

#### List models streaming

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Instead of calling `getModelsStream` on a `dataset` object, we call the `listModelsStream` function using the `BigQueryClient`
* Instead of passing a `datasetId` to the `dataset` object, we construct a [`request`](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L23205-L23218) that contains the `projectId` and `datasetId` and pass that to the `listModelsStream` function

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function listModels() {
  // Lists all existing models in the dataset using streaming method.


  const datasetId = "my_dataset";

  const dataset = bigquery.dataset(datasetId);

  dataset
    .getModelsStream()
    .on('error', console.error)
    .on('data', model => {
      console.log(model.metadata);
    })
    .on('end', () => {
      console.log('All models have been retrieved.');
    });
}
```

##### After

[Full sample](/samples/models/listModelsStreaming.js)

```javascript
// Import the Google Cloud client library
const {BigQueryClient} = require('@google-cloud/bigquery');

async function listModels() {
  // Lists all existing models in the dataset using streaming method.

 const projectId = "my_project";
 const datasetId = "my_dataset";

  const bigqueryClient = new BigQueryClient();

  const request = {
    projectId: projectId,
    datasetId: datasetId,
  };

  const stream = bigqueryClient.listModelsStream(request);
  console.log('Models:')

  stream.on('error', err => {
    console.error(err);
  });

  stream
    .on('data', model => {
      console.log(model);
    })
    .on('end', () => {
      console.log('All models have been retrieved.');
    });
}

```

#### Update model

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* The dataset description is now set with the `patchModel` function rather than with `setMetadata`
* `updateDataset` takes in a [`request` object](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L22981-L22994) - this contains a [`model` object](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L16315-L16376) that at minimum must contain a [`modelReference` object](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L16315-L16376)

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function updateModel() {
  // Updates a model's metadata.

  const datasetId = "my_dataset";
  const modelId = "my__model";

  const metadata = {
    description: 'A really great model.',
  };

  const dataset = bigquery.dataset(datasetId);
  const [apiResponse] = await dataset.model(modelId).setMetadata(metadata);
  const newDescription = apiResponse.description;

  console.log(`${modelId} description: ${newDescription}`);
}
```

##### After

[Full sample](/samples/models/updateModel.js)

```javascript
// Import the Google Cloud client library
const {BigQueryClient} = require('@google-cloud/bigquery');

async function updateModel() {
  // Updates a model's metadata.

  const projectId = "my_project"
  const datasetId = "my_dataset";
  const modelId = "my__model";

  const description = 'A really great model.';

  // known limitation: patchModel must be called in REST fallback mode, not with gRPC
  const bigqueryClient = new BigQueryClient({fallback: true});

  const request = {
    projectId: projectId,
    datasetId: datasetId,
    modelId: modelId,
    model: {
      modelReference:{
        projectId: projectId,
        datasetId: datasetId,
        modelId: modelId
      },
      description: description,
    },
  };

  const [model] = await bigqueryClient.patchModel(request);

  console.log(`${modelId} description: ${model.description}`);
}
```

</details>

<!-- TODO(coleleah) -->
### Jobs

<details open>
<summary>Code snippets and explanations for Jobs CRUDL methods</summary>

#### Create job

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Calling `insertJob` with an [`insertJobRequest`](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L6180-L6187) instead of `createQueryJob`
  * In this request, we need to manually specify the `useLegacySql` value as `false` in order for the underlying BigQuery engine to properly parse the creation query
* Accessing the underlying `jobClient` that is part of the `BigQueryClient` to call `getQueryResults`
* `getQueryResults` takes in a [`getQueryResultsRequest`](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L6830-L6855)
* We manually poll `getQueryResults` periodically to await the results of the model creation job

##### Before

```javascript
// Import the Google Cloud client library and create a client
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function createJob() {
  // Run a BigQuery query job.

  // For all options, see https://cloud.google.com/bigquery/docs/reference/rest/v2/Job
  const options = {
    // Specify a job configuration to set optional job resource properties.
    configuration: {
      query: {
        query: `SELECT country_name
              FROM \`bigquery-public-data.utility_us.country_code_iso\`
              LIMIT 10`,
        useLegacySql: false,
      },
      labels: {'example-label': 'example-value'},
    },
  };

  // Make API request.
  const response = await bigquery.createJob(options);
  const job = response[0];

  // Wait for the query to finish
  const [rows] = await job.getQueryResults(job);

  // Print the results
  console.log('Rows:');
  rows.forEach(row => console.log(row));
}
```

##### After

[Full sample](/samples/jobs/createJob.js)

```javascript
const {BigQueryClient} = require('@google-cloud/bigquery');
const {setInterval} = require('node:timers/promises');

const bigquery = new BigQueryClient();

async function createJob() {
  // Run a BigQuery query job.
  const projectId = "my_project"

  const query = `SELECT country_name
          FROM
            bigquery-public-data.utility_us.country_code_iso
          LIMIT 10`;

  const request = {
    projectId: projectId,
    job: {
      configuration: {
        query: {
          query: query,
          useLegacySql: {value: false},
        },
        labels: {'example-label': 'example-value'},
      },
    },
  };

  // Make API request.
  const [job] = await bigquery.insertJob(request);
  const jobReference = job.jobReference;
  const jobId = jobReference.jobId;
  const getQueryResultsRequest = {
    projectId: projectId,
    jobId: jobId,
    location: jobReference.location.value,
  };
    // poll the job status every 3 seconds until complete
    // eslint-disable-next-line
    for await (const t of setInterval(3000)) { // no-unused-vars - this is the syntax for promise based setInterval
      const [resp] = await bigquery.jobClient.getQueryResults(
        getQueryResultsRequest,
      );
      if (resp.errors.length !== 0) {
        throw new Error('Something failed in job creation');
      }
      if (resp.jobComplete.value) {
        const rows = resp.rows
        console.log("Rows:")
        rows.forEach(row => console.log(JSON.stringify(row)))
        break;
      }
    }
}
```

#### Get job

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Instead of calling `.get` on a `job` object, we call `getJob` using the `BigQueryClient`
* Instead of passing the `jobId` to the `job` object, we pass a [`GetJobRequest`](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L6071-L6081) to the `getJob` call on the `BigQueryClient`

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function getJob() {
  // Get job properties.

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const jobId = "existing-job-id";

  // Create a job reference
  const job = bigquery.job(jobId);

  // Retrieve job
  const [jobResult] = await job.get();

  console.log(jobResult.metadata.jobReference);
}

```

##### After

[Full sample](/samples/jobs/getJob.js)

```javascript
// Import the Google Cloud client library
const {BigQueryClient} = require('@google-cloud/bigquery');
const bigquery = new BigQueryClient();

async function getJob() {
  // Get job properties.

  const projectId = "my_project";
  const jobId = "existing-job-id";

  const request = {
    projectId,
    jobId,
    location: 'US'  
  };
  const [job] = await bigquery.getJob(request);

  console.log(`Job ${job.id} status: ${job.status.state}`);
}
getJob();
```

#### Cancel job

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Instead of calling `.cancel` on a `job` object, we call `cancelJob` using the `BigQueryClient`
* Instead of passing the `jobId` to the `job` object, we pass a [`CancelJobRequest`](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L5859-L5869) to the `cancelJob` call on the `BigQueryClient`. It must minimally contain the `projectId` and `jobId`

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function cancelJob() {
  // Attempts to cancel a job.

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const jobId = "existing-job-id";

  // Create a job reference
  const job = bigquery.job(jobId);

  // Attempt to cancel job
  const [apiResult] = await job.cancel();

  console.log(apiResult.job.status);
}
```

##### After

[Full sample](/samples/jobs/cancelJob.js)

```javascript
 // Import the Google Cloud client library
const {BigQueryClient} = require('@google-cloud/bigquery');
const bigqueryClient = new BigQueryClient();

async function cancelJob() {
  // Attempts to cancel a job.
  const projectId = "my-project";
  const jobId = "existing-job-id";

  const request = {
    projectId,
    jobId,
  };

  // Attempt to cancel job
  const [response] = await bigqueryClient.cancelJob(request);

  console.log(response.job.status);
}
```

#### List jobs

##### Key differences

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
* Instead of calling `getJobs`, we call the `listJobsAsync` function using the `BigQueryClient`
* In the BigQueryClient, there are [three options for every list method](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#auto-pagination). For jobs, there is `listJobs` (least efficient, but supports manual paging), `listJobsAsync` (returns an iterable, recommended over the non-async method) and `listJobsStream` (returns results as a stream)
* Instead of passing in an options `object`, any of these list methods take in a [request object](https://github.com/googleapis/nodejs-bigquery/blob/bebe6fb1a817542d2359a8abcff0d5756a1941ac/protos/protos.d.ts#L6392-L6420) that must minimally take in the `projectId`

##### Before

```javascript
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function listJobs() {
  // Lists all jobs in current GCP project.

  // List the 10 most recent jobs in reverse chronological order.
  //  Omit the max_results parameter to list jobs from the past 6 months.
  const options = {maxResults: 10};
  const [jobs] = await bigquery.getJobs(options);

  console.log('Jobs:');
  jobs.forEach(job => console.log(job.id));
}
```

##### After

[Full sample](/samples/jobs/listJobs.js)

```javascript
// Import the Google Cloud client library
const {BigQueryClient} = require('@google-cloud/bigquery');
const bigquery = new BigQueryClient();

async function listJobs() {
  // Lists all jobs in current GCP project.
  const projectId = "my-project";
  const request = {projectId: projectId};
  // limit results to 10
  const maxResults = 10;
  const iterable = bigquery.listJobsAsync(request);
  console.log('Jobs:');
  let i = 0;
  for await (const job of iterable) {
    if (i >= maxResults) {
      break;
    }
    console.log(job.id);
    i++;
  }
}
```

</details>

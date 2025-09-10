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
* `createDataset` expected a dataset ID and an options object, whereas `insertDataset` takes in a [`request` object](https://github.com/googleapis/nodejs-bigquery/blob/5e17911a35e76677705c6227dd896fb1ffc39b0e/protos/protos.d.ts#L1503-L1513) minimally containing the `projectId` and a dataset reference object, which contains the datasetId. 


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


<!-- TODO(coleleah) -->
#### Delete
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
Previously we used a combination of two methods - one to access the dataset object, and one to call delete on it - now we use one method, deleteDataset on the client
deleteDataset takes in a request object containing the projectId and a datasetId. It also optionally takes the deleteContents parameter, which will delete all tables in the dataset if set to true.
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

<!-- TODO(coleleah) -->
#### Get
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
```javascript
```
<!-- TODO(coleleah) -->
#### List
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`

##### Before

```javascript
```

##### After
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
```javascript
```
</details>

<!-- TODO(coleleah) -->
### Tables
<details open>
<summary>Code snippets and explanations for Tables CRUDL methods</summary>

<!-- TODO(coleleah) -->
#### Create
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
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
```javascript
```
<!-- TODO(coleleah) -->
#### List
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
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
```javascript
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
```javascript
```
<!-- TODO(coleleah) -->
#### List
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
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
```javascript
```
<!-- TODO(coleleah) -->
#### List
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
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
```javascript
```
<!-- TODO(coleleah) -->
#### List
**Key differences**

* Client is [instantiated](#instantiating-preview-sdk-clients) with the `BigQueryClient()` method, not `BigQuery()`
##### Before

```javascript
```

##### After
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
```javascript
```
</details>
# discovery-tsd

> Generate TypeScript types from Google's [Discovery API](https://developers.google.com/discovery/v1/reference/)

## Install

```sh
$ npm install discovery-tsd
```

## CLI

```sh
$ dtsd bigquery v2 > bigquery.d.ts
```

## API

### createTypes(api, version, [options])

```js
const createTypes = require('discovery-tsd');
const fs = require('fs');
const {promisify} = require('util');

const writeFile = promisify(fs.writeFile);

async function getTypes() {
  const types = await createTypes('bigquery', 'v2');
  await writeFile('./bigquery.d.ts', types);
}
```

### fetch(api, version)

Fetches the [Discovery Document resource](https://developers.google.com/discovery/v1/reference/apis#resource).

Refer to the [`getRest` Documentation](https://developers.google.com/discovery/v1/reference/apis/getRest) for more details.

```js
const {fetch} = require('discovery-tsd');

async function getJSON() {
  const json = await fetch('bigquery', 'v2');
}
```

### render(json, [options])

Creates types for the supplied Discovery Document JSON.

```js
const {fetch, render} = require('discovery-tsd');

async function createTypes() {
  const json = await fetch('bigquery', 'v2');
  return render(json);
}
```

## License

ISC

#!/usr/bin/env node

const meow = require('meow');
const createTypes = require('./');

const {input, flags} = meow(
  `
  Usage
    $ dtsd <api> <version>

  Examples
    $ dtsd bigquery v2 > bigquery.d.ts
`,
  {
    flags: {}
  }
);

/* eslint-disable no-console */
createTypes(...input, flags)
  .then(types => console.log(types))
  .catch(err => console.error(err));

'use strict';

import fs from 'fs';
import path from 'path';
// const pify = require('util').promisify;
import util from 'util';
import test from 'ava';

import {fetch, render, createTypes} from '../src/index.js';

const readFile = util.promisify(fs.readFile);

// just doing a very simple test here since the render tests should provide
// more complete tests for the types output
test('createTypes', async t => {
  t.plan(1);

  const types = await createTypes('bigquery', 'v2');
  t.regex(types, /namespace bigquery \{/);
});

test('fetch', async t => {
  t.plan(1);

  const json = await fetch('bigquery', 'v2');
  t.is(json.name, 'bigquery');
});

test('render - simple', async t => {
  t.plan(1);

  const json = require('./fixtures/simple/schema.json');
  const types = path.join(__dirname, './fixtures/simple/types.d.ts');
  const expected = await readFile(types, 'utf8');

  t.is(render(json), expected);
});

test('render - complex', async t => {
  t.plan(1);

  const json = require('./fixtures/complex/schema.json');
  const types = path.join(__dirname, './fixtures/complex/types.d.ts');
  const expected = await readFile(types, 'utf8');

  t.is(render(json), expected);
});

test('render - methods', async t => {
  t.plan(1);

  const json = require('./fixtures/methods/schema.json');
  const types = path.join(__dirname, './fixtures/methods/types.d.ts');
  const expected = await readFile(types, 'utf8');

  t.is(render(json), expected);
});

test('render - nested methods', async t => {
  t.plan(1);

  const json = require('./fixtures/nested/schema.json');
  const types = path.join(__dirname, './fixtures/nested/types.d.ts');
  const expected = await readFile(types, 'utf8');

  t.is(render(json), expected);
});

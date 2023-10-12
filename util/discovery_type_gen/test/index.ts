/*const fs = require('fs');
const path = require('path');
const util = require('util');
const testAva = require('ava');*/
import fs from 'fs';
import path from 'path';
// const pify = require('util').promisify;
import util from 'util';
import {describe, it} from 'mocha';
import * as assert from 'assert';

import {fetch, render} from '../src/index.ts';
/*const fetchTest = require('../src/index.ts');
const renderTest = require('../src/index.ts')
const createTypesTest = require('../src/index.ts');*/
const readFile = util.promisify(fs.readFile);

// just doing a very simple test here since the render tests should provide
// more complete tests for the types output
/*describe('createTypes', async () => {
  const types = await createTypes('bigquery', 'v2');
  assert.strictEqual(types, )
})*/
/*test('createTypes', async t => {
  t.plan(1);

  const types = await createTypes('bigquery', 'v2');
  t.regex(types, /namespace bigquery \{/);
});*/

describe('fetch', async () => {
  const json = await(fetch('bigquery', 'v2'))
  assert.strictEqual(json.name, 'bigquery');
})

/*test('fetch', async t => {
  t.plan(1);

  const json = await fetch('bigquery', 'v2');
  t.is(json.name, 'bigquery');
});*/

describe('render', async () => {
  it('render - simple', async () => {
    const json = require('./fixtures/simple/schema.json');
    const types = path.join(__dirname, './fixtures/simple/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.strictEqual(render(json), expected)
  })

  it('render - complex', async () => {
    const json = require('./fixtures/complex/schema.json');
    const types = path.join(__dirname, './fixtures/complex/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.strictEqual(render(json), expected)
  })

  it('render - methods', async () => {
    const json = require('./fixtures/methods/schema.json');
    const types = path.join(__dirname, './fixtures/methods/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.strictEqual(render(json), expected)
  })

  it('render - nested methods', async () => {
    const json = require('./fixtures/nested/schema.json');
    const types = path.join(__dirname, './fixtures/nested/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.strictEqual(render(json), expected)
  })
})

/*test('render - simple', async t => {
  t.plan(1);

  const json = require('./fixtures/simple/schema.json');
  const types = path.join(__dirname, './fixtures/simple/types.d.ts');
  const expected = readFile(types, 'utf8');

  t.is(render(json), expected);
});*/

/*test('render - complex', async t => {
  t.plan(1);

  const json = require('./fixtures/complex/schema.json');
  const types = path.join(__dirname, './fixtures/complex/types.d.ts');
  const expected = readFile(types, 'utf8');

  t.is(render(json), expected);
});*/

/*test('render - methods', async t => {
  t.plan(1);

  const json = require('./fixtures/methods/schema.json');
  const types = path.join(__dirname, './fixtures/methods/types.d.ts');
  const expected = readFile(types, 'utf8');

  t.is(render(json), expected);
});*/

/*test('render - nested methods', async t => {
  t.plan(1);

  const json = require('./fixtures/nested/schema.json');
  const types = path.join(__dirname, './fixtures/nested/types.d.ts');
  const expected = readFile(types, 'utf8');

  t.is(render(json), expected);
});*/

import fs from 'fs';
import path from 'path';
import util from 'util';
import {describe, it} from 'mocha';
import * as assert from 'assert';
// import requirejs from 'requirejs';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {fetch, render} from '../src/index.js';
import * as simple from './fixtures/simple/schema.json' assert {type: "json"};
import * as complex from './fixtures/complex/schema.json' assert {type: "json"};
import * as methods from './fixtures/methods/schema.json' assert {type: "json"};
import * as nested from './fixtures/nested/schema.json' assert {type: "json"}



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

describe('render', async () => {
  it('render - simple', async () => {
    const types = path.join(__dirname, './fixtures/simple/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.strictEqual(render(simple), expected)
  })

  it('render - complex', async () => {
    const types = path.join(__dirname, './fixtures/complex/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.strictEqual(render(complex), expected)
  })

  it('render - methods', async () => {
    const types = path.join(__dirname, './fixtures/methods/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.strictEqual(render(methods), expected)
  })

  it('render - nested methods', async () => {
    const types = path.join(__dirname, './fixtures/nested/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.strictEqual(render(nested), expected)
  })
})

// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import fs from 'fs';
import path from 'path';
import util from 'util';
import {describe, it} from 'mocha';
import * as assert from 'assert';

import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {fetchDiscoDoc, render, createTypes} from '../src/index.js';
import * as simple from './fixtures/simple/schema.json' assert {type: 'json'};
import * as complex from './fixtures/complex/schema.json' assert {type: 'json'};
import * as methods from './fixtures/methods/schema.json' assert {type: 'json'};
import * as nested from './fixtures/nested/schema.json' assert {type: 'json'};

const readFile = util.promisify(fs.readFile);

describe('createTypes', async () => {
  it('should create types from JSON', async () => {
    const types = await createTypes('bigquery', 'v2');
    assert.match(types, /namespace bigquery \{/);
  });
});

describe('fetch', async () => {
  it('should fetch an API discovery doc', async () => {
    const json = await fetchDiscoDoc('bigquery', 'v2');
    assert.deepEqual(json.name, 'bigquery');
  });
});

describe('render', async () => {
  it('should render a simple json schema', async () => {
    const types = path.join(__dirname, './fixtures/simple/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.deepEqual(render(simple), expected);
  });

  it('should render a complex json schema', async () => {
    const types = path.join(__dirname, './fixtures/complex/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.deepEqual(render(complex), expected);
  });

  it('it should render methods from a json schema', async () => {
    const types = path.join(__dirname, './fixtures/methods/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.deepEqual(render(methods), expected);
  });

  it('it should render nested methods from a json schema', async () => {
    const types = path.join(__dirname, './fixtures/nested/types.d.ts');
    const expected = readFile(types, 'utf8');

    assert.deepEqual(render(nested), expected);
  });
});

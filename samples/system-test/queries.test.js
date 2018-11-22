/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require(`path`);
const assert = require(`assert`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cwd = path.join(__dirname, `..`);
const cmd = `node queries.js`;

describe(`Queries`, () => {
  before(tools.checkCredentials);

  it(`should query stackoverflow`, async () => {
    const output = await tools.runAsync(`${cmd} stackoverflow`, cwd);
    assert.ok(output.includes(`Query Results:`));
    assert.ok(output.includes(`views`));
  });

  it(`should run a query`, async () => {
    const output = await tools.runAsync(`${cmd} query`, cwd);
    assert.ok(output.includes(`Rows:`));
    assert.ok(output.includes(`name`));
  });

  it(`should run a query with the cache disabled`, async () => {
    const output = await tools.runAsync(`${cmd} disable-cache`, cwd);
    assert.ok(output.includes(`Rows:`));
    assert.ok(output.includes(`corpus`));
  });
});

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

const {assert} = require('chai');
const execa = require('execa');

// const cmd = `node queries.js`;
const exec = async cmd => {
  const res = await execa.shell(cmd);
  assert.isEmpty(res.stderr);
  return res.stdout;
};

describe(`Queries`, () => {
  it(`should query stackoverflow`, async () => {
    const output = await exec(`node queryStackOverflow.js`);
    assert.match(output, /Query Results:/);
    assert.match(output, /views/);
  });

  it(`should run a query`, async () => {
    const output = await exec(`node query.js`);
    assert.match(output, /Rows:/);
    assert.match(output, /name/);
  });

  it(`should run a query with the cache disabled`, async () => {
    const output = await exec(`node queryDisableCache.js`);
    assert.match(output, /Rows:/);
    assert.match(output, /corpus/);
  });

  it(`should run a query with named params`, async () => {
    const output = await exec(`node queryParamsNamed.js`);
    assert.match(output, /Rows:/);
    assert.match(output, /word_count/);
  });

  it(`should run a query with positional params`, async () => {
    const output = await exec(`node queryParamsNamed.js`);
    assert.match(output, /Rows:/);
    assert.match(output, /word_count/);
  });
});

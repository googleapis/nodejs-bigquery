/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// 'use strict';

const sinon = require('sinon');
const proxyquire = require('proxyquire');
const mocha = require('mocha');
const describe = mocha.describe;
const before = mocha.before;
const it = mocha.it;

describe('authUserFlow()', function() {
  let authUserFlow, authenticateStub;

  before(async () => {
    authenticateStub = sinon.stub().returns({});

    authUserFlow = proxyquire('../authUserFlow.js', {
      './sampleClient': {authenticate: authenticateStub},
    });
  });

  it('should call sample client authentication and query', async () => {
    const output = await authUserFlow.run();
    sinon.assert.match(output[0].name, 'William');
    sinon.assert.called(authenticateStub);
  });
});

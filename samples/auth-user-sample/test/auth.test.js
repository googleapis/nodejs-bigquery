// /**
//  * Copyright 2019 Google LLC
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *   https://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// 'use strict';

// let authUserFlow = require('../authUserFlow.js');
const mocha = require('mocha');
const describe = mocha.describe;
const it = mocha.it;
const sinon = require('sinon');
require('chai').use(require('sinon-chai'));
const {BigQuery} = require('@google-cloud/bigquery');
const uuid = require('uuid');
const proxyquire = require('proxyquire');

const generateUuid = () => `gcloud-tests-${uuid.v4()}`.replace(/-/gi, '_');
const datasetId = generateUuid();
const tableId = generateUuid();
let projectId;

const bigquery = new BigQuery();

describe('authUserFlow()', function() {
  let readlineMock, generateUrlStub, questionStub, tokenStub, authUserFlow;

  before(async () => {
    await bigquery.createDataset(datasetId);
    const [tableData] = await bigquery.dataset(datasetId).createTable(tableId);
    projectId = tableData.metadata.tableReference.projectId;

    questionStub = sinon.stub();

    readlineMock = {
      question: questionStub,
    };

    generateUrlStub = sinon.stub().returns('https://example.com');
    tokenStub = sinon.stub().returns({tokens: 'tokens'});

    mockClient = sinon.stub().returns({
      generateAuthUrl: generateUrlStub,
      getToken: tokenStub,
    });

    authUserFlow = proxyquire('../authUserFlow.js', {
      'google-auth-library': {
        OAuth2Client: sinon.stub().callsFake(() => {
          return {
            generateAuthUrl: generateUrlStub,
            getToken: tokenStub,
          };
        }),
      },
    });
  });
  after(async () => {
    await bigquery
      .dataset(datasetId)
      .delete({force: true})
      .catch(console.warn);
  });

  it('should exchange code for tokens', async function() {
    const output = await authUserFlow.main.exchangeCode('abc123');
    sinon.assert.match(output, 'tokens');
    sinon.assert.calledWith(tokenStub, 'abc123');
  });

  it('should return project id and credentials', async function() {
    const output = await authUserFlow.main.authFlow('my_project');
    sinon.assert.match(output.projectId, 'my_project');
  });

  it('should get redirect url', async function() {
    const startStub = sinon
      .stub(authUserFlow.main, 'startRl')
      .returns(readlineMock);
    await authUserFlow.main.getRedirectUrl();
    sinon.assert.called(startStub);
    sinon.assert.called(questionStub);
    sinon.assert.called(generateUrlStub);
  });

  it('should run a query', async function() {
    const authFlowStub = sinon.stub(authUserFlow.main, 'authFlow').returns({});
    const output = await authUserFlow.main.query(projectId);
    sinon.assert.match(output[0].name, 'William');
    sinon.assert.called(authFlowStub);
  });
});

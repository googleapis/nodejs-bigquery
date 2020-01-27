// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as assert from 'assert';
import {describe, it} from 'mocha';
import * as proxyquire from 'proxyquire';
import * as m from '../src/model';
import {Dataset} from '../src/dataset';

class FakeServiceObject {
  _calledWith: IArguments;
  constructor() {
    this._calledWith = arguments;
  }
}

describe('BigQuery/Model', () => {
  const MODEL_ID = 'my_model';
  const DATASET = {id: 'my_dataset'} as Dataset;

  // tslint:disable-next-line variable-name
  let Model: typeof m.Model;
  let model: m.Model;

  before(() => {
    Model = proxyquire('../src/model.js', {
      '@google-cloud/common': {
        ServiceObject: FakeServiceObject,
      },
    }).Model;
  });

  beforeEach(() => {
    model = new Model(DATASET, MODEL_ID);
  });

  describe('instantiation', () => {
    it('should inherit from ServiceObject', () => {
      assert(model instanceof FakeServiceObject);

      const [config] = ((model as {}) as FakeServiceObject)._calledWith;

      assert.strictEqual(config.parent, DATASET);
      assert.strictEqual(config.baseUrl, '/models');
      assert.strictEqual(config.id, MODEL_ID);
      assert.deepStrictEqual(config.methods, {
        delete: true,
        exists: true,
        get: true,
        getMetadata: true,
        setMetadata: true,
      });
    });
  });
});

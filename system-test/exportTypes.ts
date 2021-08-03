// Copyright 2021 Google LLC
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

import * as assert from 'assert';
import {describe, it} from 'mocha';
import * as cp from 'child_process';
import * as fs from 'fs';

const execSync = (cmd: string) => cp.execSync(cmd, {encoding: 'utf-8'});
const fixtures = './system-test/fixtures/kitchen/src';

describe('exportTypes', () => {
  it('exportTypes.js works', () => {
    execSync(
      `node ./scripts/exportTypes.js ${fixtures} ${fixtures}/exportTypes-index.ts`
    );
    const expected = fs
      .readFileSync(`${fixtures}/exportTypes-expected.ts`)
      .toString()
      .replace(/\s/g, '');
    const actual = fs
      .readFileSync(`${fixtures}/exportTypes-index.ts`)
      .toString()
      .replace(/\s/g, '');
    assert.strictEqual(actual, expected);
  });
});

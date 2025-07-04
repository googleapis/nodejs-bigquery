// Copyright 2025 Google LLC
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
import {query} from '../../src';

import {queryParameterTestCases} from '../fixtures/query';

describe('Read Query Values', () => {
  const client = new query.QueryClient();

  describe('types', () => {
    for (const tc of queryParameterTestCases()) {
      it(tc.name, async () => {
        const req = client.queryFromSQL(tc.query);
        req.queryRequest!.queryParameters = tc.parameters;

        const q = await client.startQuery(req);
        await q.wait();

        const it = q.read();
        const rows = [];
        for await (const row of it) {
          rows.push(row);
        }
        assert.deepStrictEqual(rows[0].toJSON(), tc.wantRowJSON);
        assert.deepStrictEqual(rows[0].toValues(), tc.wantRowValues);
      });
    }
  });

  it('should read nested objects', async () => {
    const req = client.queryFromSQL(
      "SELECT 40 as age, [STRUCT(STRUCT('1' as a, '2' as b) as object)] as nested",
    );
    const q = await client.startQuery(req);
    await q.wait();

    const it = q.read();
    const rows = [];
    for await (const row of it) {
      rows.push(row);
    }
    assert.deepStrictEqual(rows[0].toJSON(), {
      age: 40,
      nested: [
        {
          object: {
            a: '1',
            b: '2',
          },
        },
      ],
    });
  });
});

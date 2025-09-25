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

import {Query} from './query';
import {Row} from './row';

/**
 * The RowIterator provides a way to iterate over the rows of a query result.
 * It can be used with `for await...of` loops.
 */
export class RowIterator {
  private query: Query;

  /**
   * @param {Query} query - The Query instance to iterate over.
   * @internal
   */
  constructor(query: Query) {
    this.query = query;
  }

  /**
   * Asynchronously iterates over the rows in the query result.
   *
   * @yields {Row} A row from the query result.
   */
  async *[Symbol.asyncIterator](): AsyncGenerator<Row> {
    // TODO(#1541): implement iterator
  }
}

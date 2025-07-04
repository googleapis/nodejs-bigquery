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

import {Schema} from './schema';
import {Value} from './value';

/**
 * Represents a row in a query result.
 */
export class Row {
  private schema: Schema;
  private value: {[key: string]: Value};

  constructor(schema: Schema) {
    this.schema = schema;
    this.value = {};
  }

  set(columnName: string, value: Value) {
    this.value[columnName] = value;
  }

  /**
   * toJSON returns the row as a JSON object.
   */
  toJSON(): {[key: string]: Value} {
    const values: {[key: string]: Value} = {};
    for (const field of this.schema.pb.fields!) {
      let fval = this.value[field.name!];
      if (fval instanceof Row) {
        fval = fval.toJSON();
      }
      if (Array.isArray(fval)) {
        fval = fval.map(v => (v instanceof Row ? v.toJSON() : v));
      }
      values[field.name!] = fval;
    }
    return values;
  }

  /**
   * toValues encodes the row into an array of Value.
   */
  toValues(): Value[] {
    const values: Value[] = [];
    for (const field of this.schema.pb.fields!) {
      let v = this.value[field.name!];
      if (v instanceof Row) {
        v = v.toValues();
      }
      if (Array.isArray(v)) {
        v = v.map(r => (r instanceof Row ? r.toValues() : r));
      }
      values.push(v);
    }
    return values;
  }
}

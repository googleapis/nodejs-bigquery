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

import {protos} from '../';
import {Schema} from './schema';
import {Value} from './value';

/**
 * Represents a row in a query result.
 */
export class Row {
  private schema: Schema;
  private value: protos.google.protobuf.Struct;

  constructor(schema: Schema) {
    this.schema = schema;
    this.value = protos.google.protobuf.Struct.create({
      fields: this.schema.pb.fields?.reduce(
        (fields, f) => {
          fields[f.name!] = {};
          return fields;
        },
        {} as {[key: string]: protos.google.protobuf.IValue},
      ),
    });
  }

  set(columnName: string, value: Value) {
    if (this.value.fields) {
      this.value.fields[columnName] = value;
    }
  }

  /**
   * toJSON returns the row as a JSON object.
   */
  toJSON(): {[key: string]: any} {
    const value: {[key: string]: any} = {};
    for (const field of this.schema.pb.fields!) {
      const fieldValue = this.value.fields[field.name!];
      value[field.name!] = this.fieldValueToJSON(field, fieldValue);
    }
    return value;
  }

  private fieldValueToJSON(
    field: protos.google.cloud.bigquery.v2.ITableFieldSchema,
    value: protos.google.protobuf.IValue,
  ): any {
    if (value.structValue) {
      const subrow = new Row(Schema.fromField(field));
      subrow.value = protos.google.protobuf.Struct.create(value.structValue);
      return subrow.toJSON();
    } else if (value.listValue) {
      const arr: any[] = [];
      for (const row of value.listValue.values ?? []) {
        const subvalue = this.fieldValueToJSON(field, row);
        arr.push(subvalue);
      }
      return arr;
    } else if (value.nullValue) {
      return null;
    } else if (value.numberValue) {
      return value.numberValue;
    } else if (value.boolValue) {
      return value.boolValue;
    }
    return value.stringValue;
  }

  /**
   * toStruct returns the row as a protobuf Struct object.
   */
  toStruct(): protos.google.protobuf.IStruct {
    return this.value;
  }

  /**
   * toValues encodes the row into an array of Value.
   */
  toValues(): any[] {
    const values: any[] = [];
    for (const field of this.schema.pb.fields!) {
      const fieldValue = this.value.fields[field.name!];
      const value = this.fieldValueToValues(field, fieldValue);
      values.push(value);
    }
    return values;
  }

  private fieldValueToValues(
    field: protos.google.cloud.bigquery.v2.ITableFieldSchema,
    value: protos.google.protobuf.IValue,
  ): any {
    if (value.structValue) {
      const subrow = new Row(Schema.fromField(field));
      subrow.value = protos.google.protobuf.Struct.create(value.structValue);
      return subrow.toValues();
    } else if (value.listValue) {
      const arr: any[] = [];
      for (const row of value.listValue.values ?? []) {
        const subvalue = this.fieldValueToValues(field, row);
        arr.push(subvalue);
      }
      return arr;
    } else if (value.nullValue) {
      return null;
    } else if (value.numberValue) {
      return value.numberValue;
    } else if (value.boolValue) {
      return value.boolValue;
    }
    return value.stringValue;
  }
}

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
import {Row} from './row';
import {Schema} from './schema';

export type Value = protos.google.protobuf.IValue;

export function convertRows(
  rows: protos.google.protobuf.IStruct[],
  schema: Schema,
): Row[] {
  return rows.map(row => convertRow(row, schema));
}

function convertRow(row: protos.google.protobuf.IStruct, schema: Schema): Row {
  const fields = getFieldList(row);
  if (schema.length !== fields.length) {
    throw new Error('Schema length does not match row length');
  }
  const newRow = new Row(schema);
  for (let i = 0; i < fields.length; i++) {
    const cell = fields[i];
    const cellValue = getFieldValue(cell);
    const fs = schema.pb.fields![i];
    const value = convertValue(
      cellValue,
      fs.type! as any,
      Schema.fromField(fs),
    );
    newRow.set(fs.name!, value);
  }
  return newRow;
}

function convertValue(
  val: protos.google.protobuf.IValue,
  typ: string,
  schema: Schema,
): Value {
  if (val.nullValue !== undefined && val.nullValue !== null) {
    return {
      nullValue: 'NULL_VALUE',
    };
  }
  if (val.listValue) {
    return convertRepeatedRecord(val.listValue, typ, schema);
  }
  if (val.structValue) {
    return convertNestedRecord(val.structValue, schema);
  }
  if (val.stringValue) {
    return convertBasicType(val.stringValue, typ);
  }
  throw new Error(`Got value ${val}; expected a value of type ${typ}`);
}

function convertRepeatedRecord(
  vals: protos.google.protobuf.IListValue,
  typ: string,
  schema: Schema,
): Value {
  return {
    listValue: {
      values: vals.values!.map(cell => {
        const val = getFieldValue(cell);
        return convertValue(val, typ, schema);
      }),
    },
  };
}

function convertNestedRecord(
  val: protos.google.protobuf.IStruct,
  schema: Schema,
): Value {
  const row = convertRow(val, schema);
  return {
    structValue: row.toStruct(),
  };
}

function convertBasicType(val: string, typ: string): Value {
  switch (typ) {
    case 'STRING':
    case 'GEOGRAPHY':
    case 'JSON':
    case 'TIMESTAMP':
    case 'DATE':
    case 'TIME':
    case 'DATETIME':
    case 'NUMERIC':
    case 'BIGNUMERIC':
    case 'INTERVAL':
      return {stringValue: val};
    case 'BYTES':
      return {stringValue: val};
    case 'INTEGER':
      return {numberValue: parseInt(val, 10)};
    case 'FLOAT':
      return {numberValue: parseFloat(val)};
    case 'BOOLEAN':
      return {boolValue: val.toLowerCase() === 'true'};
    default:
      throw new Error(`Unsupported type: ${typ}`);
  }
}

function getFieldList(row: protos.google.protobuf.IStruct): any[] {
  const fieldValue = row.fields?.f;
  if (!fieldValue) {
    throw new Error('Missing fields in row');
  }
  const fields = fieldValue.listValue;
  if (!fields) {
    throw new Error('Missing fields in row');
  }
  return fields.values!;
}

function getFieldValue(val: protos.google.protobuf.IValue): any {
  const s = val.structValue;
  if (!s) {
    throw new Error('Missing value in a field row');
  }
  const fieldValue = s.fields?.v;
  if (!fieldValue) {
    throw new Error('Missing value in a field row');
  }
  return fieldValue;
}

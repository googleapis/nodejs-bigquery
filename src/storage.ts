// Copyright 2024 Google LLC
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

import {ResourceStream} from '@google-cloud/paginator';
import {Transform} from 'stream';
import {BigQuery, QueryRowsResponse, RowMetadata} from '.';
import bigquery from './types';

// Minimal interface for a BigQuery Storage Read API client 
// that can read data from tables.
export interface StorageReadClient {
  createTableReader(req: {
    table: bigquery.ITableReference;
  }): Promise<TableReader>;
}

// Interface for fetching data from a BigQuery table using 
// the BigQuery Storage Read API.
export interface TableReader {
  getRows(): Promise<QueryRowsResponse>;
  getRowsAsStream(): Promise<ResourceStream<RowMetadata>>;
}

export class MergeSchemaTransform extends Transform {
  constructor(schema: bigquery.ITableSchema) {
    super({
      objectMode: true,
      transform(row, _, callback) {
        const rows = BigQuery.mergeSchemaWithRows_(schema, [row], {
          wrapIntegers: false,
          parseJSON: false,
        });
        if (rows.length == 0) {
          callback(new Error('failed to convert row'), null);
          return;
        }
        callback(null, rows[0]);
      },
    });
  }
}

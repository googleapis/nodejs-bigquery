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

/**
 * fromSQL creates a query configuration from a SQL string.
 * @param {string} sql The SQL query.
 * @returns {protos.google.cloud.bigquery.v2.IPostQueryRequest}
 */
export function fromSQL(
  projectId: string,
  sql: string,
): protos.google.cloud.bigquery.v2.IPostQueryRequest {
  return {
    queryRequest: {
      query: sql,
      useLegacySql: {value: false},
      formatOptions: {
        useInt64Timestamp: true,
      },
    },
    projectId,
  };
}

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

import {QueryClient} from './client';
import {RowIterator} from './iterator';
import {QueryJob} from './job';
import {protos} from '../';

export interface ReadState {
  pageToken?: string;
}

export type ReadOption = (state: ReadState) => void;

export function withPageToken(token: string): ReadOption {
  return (state: ReadState) => {
    state.pageToken = token;
  };
}

/**
 * QueryReader is used to read the results of a query.
 */
export class QueryReader {
  private client: QueryClient;

  constructor(client: QueryClient) {
    this.client = client;
  }

  /**
   * Read reads the results of a query job.
   * @param {protos.google.cloud.bigquery.v2.IJobReference} jobRef The job reference.
   * @param {protos.google.cloud.bigquery.v2.ITableSchema} schema The schema of the results.
   * @param {ReadOption[]} opts The options for reading the results.
   * @returns {Promise<RowIterator>}
   */
  async read(
    jobRef: protos.google.cloud.bigquery.v2.IJobReference,
    schema: protos.google.cloud.bigquery.v2.ITableSchema,
    ...opts: ReadOption[]
  ): Promise<RowIterator> {
    const query = new QueryJob(this.client, {
      jobReference: jobRef,
      schema,
    });

    const initState: ReadState = {};
    for (const opt of opts) {
      opt(initState);
    }

    const itOpts: {pageToken?: string} = {};
    if (initState.pageToken) {
      itOpts.pageToken = initState.pageToken;
    }
    const it = new RowIterator(query, itOpts);
    await it.fetchRows();
    return it;
  }
}

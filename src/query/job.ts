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
import {protos} from '../';
import {RowIterator} from './iterator';
import {Row} from './row';
import {Schema} from './schema';
import {convertRows} from './value';
import {CallOptions as GaxCallOptions} from 'google-gax';

export interface CallOptions extends GaxCallOptions {
  signal?: AbortSignal;
}

/**
 * Query represents a query job.
 */
export class QueryJob {
  private client: QueryClient;
  private jobComplete: boolean;
  private projectId: string;
  private jobId: string;
  private location: string;

  private cachedRows: Row[];
  private cachedSchema: protos.google.cloud.bigquery.v2.ITableSchema;
  private cachedPageToken: string;
  private cachedTotalRows: number;

  constructor(
    client: QueryClient,
    response: protos.google.cloud.bigquery.v2.IQueryResponse,
  ) {
    this.client = client;

    this.cachedRows = [];
    this.cachedSchema = {};
    this.cachedPageToken = '';
    this.cachedTotalRows = 0;
    this.jobComplete = false;

    this.consumeQueryResponse({
      jobComplete: response.jobComplete,
      schema: response.schema,
      pageToken: response.pageToken,
      totalRows: response.totalRows,
      rows: response.rows,
    });

    this.jobId = '';
    this.location = response.location ?? '';
    this.projectId = '';
    if (response.jobReference) {
      this.projectId = response.jobReference.projectId!;
      this.jobId = response.jobReference.jobId!;
      this.location = response.jobReference.location?.value || '';
    }
    if (response.queryId) {
      this.jobId = response.queryId;
    }
  }

  jobReference(): protos.google.cloud.bigquery.v2.IJobReference {
    return {
      jobId: this.jobId,
      projectId: this.projectId,
      location: {value: this.location},
    };
  }

  get schema(): protos.google.cloud.bigquery.v2.ITableSchema {
    return this.cachedSchema;
  }

  get complete(): boolean {
    return this.jobComplete
  }

  /**
   * Waits for the query to complete.
   *
   * @param {CallOptions} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   */
  async wait(options?: CallOptions): Promise<void> {
    const signal = options?.signal;
    while (!this.complete) {
      if (signal?.aborted) {
        throw new Error('The operation was aborted.');
      }
      await this.checkStatus(options);
      if (!this.complete) {
        await this.waitFor(signal);
      }
    }
  }

  /**
   * Cancel a running query.
   *
   * @param {CallOptions} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   */
  async cancel(options?: CallOptions): Promise<protos.google.cloud.bigquery.v2.IJobCancelResponse> {
     const {jobClient} = this.client.getBigQueryClient();
     const [response] = await jobClient.cancelJob({
      projectId: this.projectId,
      jobId: this.jobId,
      location: this.location,      
     }, options);
     return response;
  }

  private async waitFor(signal?: AbortSignal): Promise<void> {
    const delay = 1000; // TODO: backoff settings
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, delay);
      signal?.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('The operation was aborted.'));
      });
    });
  }

  /**
   * Returns a RowIterator for the query results.
   *
   * @returns {RowIterator}
   */
  async read(): Promise<RowIterator> {
    const it = new RowIterator(this, {
      pageToken: this.cachedPageToken,
      rows: this.cachedRows,
    });
    if (this.cachedRows.length === 0) {
      await it.fetchRows();
    }
    return it;
  }

  /**
   * @internal
   */
  async _getRows(
    pageToken?: string,
  ): Promise<
    [Row[], protos.google.cloud.bigquery.v2.ITableSchema | null, string | null]
  > {
    const {jobClient} = this.client.getBigQueryClient();
    const [response] = await jobClient.getQueryResults({
      projectId: this.projectId,
      jobId: this.jobId,
      location: this.location,
      pageToken,
      formatOptions: {
        useInt64Timestamp: true,
      },
    });

    const rows = convertRows(response.rows || [], new Schema(response.schema!));
    return [rows, response.schema || null, response.pageToken || null];
  }

  private consumeQueryResponse(
    response: protos.google.cloud.bigquery.v2.IGetQueryResultsResponse,
  ) {
    this.jobComplete = response.jobComplete?.value ?? false;
    this.cachedSchema = response.schema!;
    this.cachedPageToken = response.pageToken!;
    this.cachedTotalRows = Number(response.totalRows);
    this.cachedRows = convertRows(
      response.rows || [],
      new Schema(this.cachedSchema),
    );
  }

  private async checkStatus(options?: CallOptions): Promise<void> {
    const {jobClient} = this.client.getBigQueryClient();
    const [response] = await jobClient.getQueryResults(
      {
        projectId: this.projectId,
        jobId: this.jobId,
        location: this.location,
        maxResults: {value: 0},
        formatOptions: {
          useInt64Timestamp: true,
        },
      },
      options,
    );
    this.consumeQueryResponse(response);
  }
}

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
import {CallOptions} from './options';
import {setInterval} from 'timers/promises';
import {EventEmitter} from 'stream';

/**
 * Query represents a query job.
 */
export class Query {
  private client: QueryClient;
  private jobComplete: boolean;

  private _queryId: string;
  private projectId: string;
  private jobId: string;
  private location: string;

  private emitter: EventEmitter;

  constructor(client: QueryClient) {
    this.client = client;
    this.jobComplete = false;
    this.emitter = new EventEmitter();

    this.jobId = '';
    this.location = '';
    this.projectId = '';
    this._queryId = '';
  }

  /**
   * Internal method to instantiate Query handler from jobs.query response
   * @internal
   */
  static fromResponse_(
    client: QueryClient,
    response: protos.google.cloud.bigquery.v2.IQueryResponse,
    options?: CallOptions,
  ): Query {
    const q = new Query(client);
    q.location = response.location ?? '';
    if (response.queryId) {
      q._queryId = response.queryId;
    }
    q.consumeQueryResponse({...response});
    void q.waitQueryBackground(options);

    return q;
  }

  /**
   * Internal method to instantiate Query handler from job reference
   * @internal
   */
  static fromJobRef_(
    client: QueryClient,
    jobReference: protos.google.cloud.bigquery.v2.IJobReference,
    options?: CallOptions,
  ): Query {
    return this.fromResponse_(client, {jobReference}, options);
  }

  get jobReference(): protos.google.cloud.bigquery.v2.IJobReference {
    return {
      jobId: this.jobId,
      projectId: this.projectId,
      location: {value: this.location},
    };
  }

  get schema(): protos.google.cloud.bigquery.v2.ITableSchema | null {
    return null;
  }

  get complete(): boolean {
    return this.jobComplete;
  }

  get queryId(): string {
    return this._queryId;
  }

  private async waitQueryBackground(options?: CallOptions) {
    if (this.complete) {
      return;
    }
    const signal = options?.signal;
    let waitTime = 1;
    for await (const _ of setInterval(waitTime, undefined, {signal})) {
      await this.checkStatus(options);
      if (this.complete) {
        this.emitter.emit('done');
        break;
      }
      waitTime = 1000;
    }
  }

  /**
   * Waits for the query to complete.
   *
   * @param {CallOptions} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   */
  async wait(options?: CallOptions): Promise<void> {
    if (this.complete) {
      return;
    }
    const signal = options?.signal;
    return new Promise((resolve, reject) => {
      const callback = () => {
        resolve();
        this.emitter.removeListener('done', callback);
      };
      this.emitter.addListener('done', callback);
      signal?.addEventListener('abort', () => {
        reject(new Error('The operation was aborted.'));
        this.emitter.removeListener('done', callback);
      });
    });
  }

  /**
   * Returns a RowIterator for the query results.
   *
   * @returns {RowIterator}
   */
  async read(): Promise<RowIterator> {
    const it = new RowIterator(this);
    return it;
  }

  private consumeQueryResponse(
    response: protos.google.cloud.bigquery.v2.IGetQueryResultsResponse,
  ) {
    if (response.jobReference) {
      this.projectId = response.jobReference.projectId!;
      this.jobId = response.jobReference.jobId!;
      this.location = response.jobReference.location?.value || '';
    }
    this.jobComplete = response.jobComplete?.value ?? false;
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

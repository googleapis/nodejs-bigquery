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

import {QueryHelper} from './helper';
import {protos} from '../';
import {RowIterator} from './iterator';
import {CallOptions} from './options';
import {setInterval} from 'timers/promises';
import {EventEmitter} from 'stream';

/**
 * Query represents a query job.
 */
export class Query {
  private helper: QueryHelper;
  private jobComplete: boolean;

  private _queryId: string | null;
  private projectId?: string;
  private jobId: string | null;
  private location?: string | null;

  private emitter: EventEmitter;

  private constructor(helper: QueryHelper, projectId?: string) {
    this.helper = helper;
    this.jobComplete = false;
    this.emitter = new EventEmitter();

    this.projectId = projectId;
    this._queryId = null;
    this.jobId = null;
  }

  static fromQueryRequest_(
    helper: QueryHelper,
    request: protos.google.cloud.bigquery.v2.IPostQueryRequest,
    options?: CallOptions,
  ): Promise<Query> {
    const q = new Query(helper, request.projectId ?? undefined);
    void q.runQuery(request, options);

    return Promise.resolve(q);
  }

  static fromJobRequest_(
    helper: QueryHelper,
    job: protos.google.cloud.bigquery.v2.IJob,
    projectId?: string,
    options?: CallOptions,
  ): Promise<Query> {
    const q = new Query(helper, projectId);
    void q.insertQuery(job, options);

    return Promise.resolve(q);
  }

  /**
   * Internal method to instantiate Query handler from job reference
   * @internal
   */
  static fromJobRef_(
    helper: QueryHelper,
    jobReference: protos.google.cloud.bigquery.v2.IJobReference,
    options?: CallOptions,
  ): Promise<Query> {
    const q = new Query(helper, jobReference.projectId || undefined);

    q.consumeQueryResponse({jobReference});
    void q.waitQueryBackground(options);
    return Promise.resolve(q);
  }

  get jobReference(): protos.google.cloud.bigquery.v2.IJobReference | null {
    if (!this.jobId) {
      return null;
    }
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

  get queryId(): string | null {
    return this._queryId;
  }

  private async runQuery(
    request: protos.google.cloud.bigquery.v2.IPostQueryRequest,
    options?: CallOptions,
  ) {
    const {jobClient} = this.helper.getBigQueryClient();
    try {
      const [response] = await jobClient.query(request, options);
      this.location = response.location;
      if (response.queryId) {
        this._queryId = response.queryId;
      }
      this.consumeQueryResponse(response);
      void this.waitQueryBackground(options);
    } catch (err) {
      this.markDone(err as Error);
    }
  }

  private async insertQuery(
    job: protos.google.cloud.bigquery.v2.IJob,
    options?: CallOptions,
  ) {
    const {jobClient} = this.helper.getBigQueryClient();
    try {
      const [response] = await jobClient.insertJob(
        {
          job: job,
          projectId: this.projectId,
        },
        options,
      );
      this.emitter.emit('query:created', response);
      this.consumeQueryResponse(response);
      void this.waitQueryBackground(options);
    } catch (err) {
      this.markDone(err as Error);
    }
  }

  private async waitQueryBackground(options?: CallOptions) {
    if (this.complete) {
      this.markDone();
      return;
    }
    const signal = options?.signal;
    let waitTime = 1;
    for await (const _ of setInterval(waitTime, undefined, {signal})) {
      await this.checkStatus(options);
      if (this.complete) {
        this.markDone();
        break;
      }
      waitTime = 1000;
    }
  }

  private markDone(err?: Error) {
    this.emitter.emit('done', err);
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
      const callback = (err: Error) => {
        this.emitter.removeListener('done', callback);
        if (err) {
          reject(err);
          return;
        }
        resolve();
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
    const {jobClient} = this.helper.getBigQueryClient();
    const req: protos.google.cloud.bigquery.v2.IGetQueryResultsRequest = {
      projectId: this.projectId,
      jobId: this.jobId,
      location: this.location,
      maxResults: {value: 0},
      formatOptions: {
        useInt64Timestamp: true,
      },
    };
    const [response] = await jobClient.getQueryResults(req, options);
    this.consumeQueryResponse(response);
  }
}

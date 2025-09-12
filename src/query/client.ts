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

import {
  BigQueryClient,
  BigQueryClientOptions,
} from '../bigquery';
import {QueryJob, CallOptions} from './job';
import {protos} from '../';
import {fromSQL as builderFromSQL} from './builder';

/**
 * QueryClient is a client for running queries in BigQuery.
 */
export class QueryClient {
  private client: BigQueryClient;
  projectId: string;
  private billingProjectId: string;

  /**
   * @param {BigQueryClientOptions} options - The configuration object.
   */
  constructor(
    options?: BigQueryClientOptions,
  ) {
    this.client = new BigQueryClient(options);
    this.projectId = '';
    this.billingProjectId = '';
    void this.initialize();
  }

  async getProjectId(): Promise<string> {
    if (this.projectId) {
      return this.projectId;
    }
    const {jobClient} = this.getBigQueryClient();
    const projectId = await jobClient.getProjectId();
    this.projectId = projectId;
    return projectId;
  }
  /**
   * Initialize the client.
   * Performs asynchronous operations (such as authentication) and prepares the client.
   * This function will be called automatically when any class method is called for the
   * first time, but if you need to initialize it before calling an actual method,
   * feel free to call initialize() directly.
   *
   * You can await on this method if you want to make sure the client is initialized.
   *
   * @returns {Promise} A promise that resolves when auth is complete.
   */
  initialize = async (): Promise<void> => {
    if (this.projectId) {
      return;
    }
    const {jobClient} = this.getBigQueryClient();
    await jobClient.initialize();
    const projectId = await this.getProjectId();
    this.projectId = projectId;
    if (this.billingProjectId !== '') {
      this.billingProjectId = projectId;
    }
  };

  setBillingProjectId(projectId: string) {
    this.billingProjectId = projectId;
  }

  /**
   * fromSQL creates a query configuration from a SQL string.
   * @param {string} sql The SQL query.
   * @returns {protos.google.cloud.bigquery.v2.IPostQueryRequest}
   */
  fromSQL(sql: string): protos.google.cloud.bigquery.v2.IPostQueryRequest {
    const req = builderFromSQL(this.projectId, sql);
    return req;
  }

  /**
   * Runs a query and returns a QueryJob handle.
   *
   * @param {protos.google.cloud.bigquery.v2.IPostQueryRequest} request
   *   The request object that will be sent.
   * @param {CallOptions} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise<QueryJob>}
   */
  async startQuery(
    request: protos.google.cloud.bigquery.v2.IPostQueryRequest,
    options?: CallOptions,
  ): Promise<QueryJob> {
    const [response] = await this.client.jobClient.query(request, options);
    return new QueryJob(this, response);
  }

  /**
   * Runs a query and returns a QueryJob handle.
   *
   * @param {protos.google.cloud.bigquery.v2.IQueryRequest} request
   *   The request object that will be sent.
   * @param {CallOptions} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise<QueryJob>}
   */
  async startQueryRequest(
    request: protos.google.cloud.bigquery.v2.IQueryRequest,
    options?: CallOptions,
  ): Promise<QueryJob> {
    return this.startQuery(
      {
        queryRequest: request,
        projectId: this.projectId,
      },
      options,
    );
  }

  /**
   * Starts a new asynchronous job.
   *
   * @param {protos.google.cloud.bigquery.v2.IJob} job
   *   A job resource to insert
   * @param {CallOptions} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise<QueryJob>}
   */
  async startQueryJob(
    job: protos.google.cloud.bigquery.v2.IJob,
    options?: CallOptions,
  ): Promise<QueryJob> {
    const [response] = await this.client.jobClient.insertJob(
      {
        projectId: this.projectId,
        job,
      },
      options,
    );
    return new QueryJob(this, {jobReference: response.jobReference});
  }

  /**
   * Create a managed QueryJob from a job reference.
   *
   * @param {protos.google.cloud.bigquery.v2.IJob} job
   *   A job resource to insert
   * @param {CallOptions} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise<QueryJob>}
   */
  async attachJob(
    jobRef: protos.google.cloud.bigquery.v2.IJobReference,
  ): Promise<QueryJob> {
    return new QueryJob(this, {
      jobReference: jobRef,
    });
  }

  getBigQueryClient(): BigQueryClient {
    return this.client;
  }
}

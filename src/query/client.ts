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

import {BigQueryClient, BigQueryClientOptions} from '../bigquery';
import {Query} from './query';
import {CallOptions} from './options';
import {protos} from '../';

/**
 * QueryClient is a client for running queries in BigQuery.
 */
export class QueryClient {
  private client: BigQueryClient;
  private projectId: string;

  /**
   * @param {BigQueryClientOptions} options - The configuration object.
   */
  constructor(options?: BigQueryClientOptions) {
    this.client = new BigQueryClient(options);
    this.projectId = '';
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
  };

  /**
   * Runs a query and returns a QueryJob handle.
   *
   * @param {protos.google.cloud.bigquery.v2.IPostQueryRequest} request
   *   The request object that will be sent.
   * @param {CallOptions} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise<Query>}
   */
  async startQuery(
    request: protos.google.cloud.bigquery.v2.IPostQueryRequest,
    options?: CallOptions,
  ): Promise<Query> {
    const [response] = await this.client.jobClient.query(request, options);
    return Query.fromResponse_(this, response, options);
  }

  /**
   * Starts a new asynchronous job.
   *
   * @param {protos.google.cloud.bigquery.v2.IJob} job
   *   A job resource to insert
   * @param {CallOptions} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise<Query>}
   */
  async startQueryJob(
    job: protos.google.cloud.bigquery.v2.IJob,
    options?: CallOptions,
  ): Promise<Query> {
    const [response] = await this.client.jobClient.insertJob(
      {
        projectId: this.projectId,
        job,
      },
      options,
    );
    const {jobReference} = response;
    if (!jobReference) {
      throw new Error('Failed to insert job. Missing job reference.');
    }
    return Query.fromJobRef_(this, jobReference, options);
  }

  /**
   * Create a managed Query from a job reference.
   *
   * @param {protos.google.cloud.bigquery.v2.IJobReference} jobReference
   *   A job resource to insert
   * @param {CallOptions} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise<QueryJob>}
   */
  async attachJob(
    jobReference: protos.google.cloud.bigquery.v2.IJobReference,
    options?: CallOptions,
  ): Promise<Query> {
    return Query.fromJobRef_(this, jobReference, options);
  }

  getBigQueryClient(): BigQueryClient {
    return this.client;
  }
}

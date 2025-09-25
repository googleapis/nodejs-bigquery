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
import {protos} from '..';
import {randomUUID} from 'crypto';

/**
 * QueryHelper is a helper for running queries in BigQuery.
 */
export class QueryHelper {
  private client: BigQueryClient;
  private projectId?: string;

  /**
   * @param {BigQueryClientOptions} options - The configuration object.
   */
  constructor(opts: {client: BigQueryClient; projectId?: string}) {
    this.client = opts.client;
    this.projectId = opts.projectId;
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
    if (!request.projectId) {
      request.projectId = this.projectId;
    }
    if (!request.queryRequest) {
      throw new Error('queryRequest is required');
    }
    if (!request.queryRequest.requestId) {
      request.queryRequest.requestId = randomUUID();
    }
    return Query.fromQueryRequest_(this, request, options);
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
    const config = job.configuration;
    if (!config) {
      throw new Error('job is missing configuration');
    }
    const queryConfig = config.query;
    if (!queryConfig) {
      throw new Error('job is not a query');
    }
    job.jobReference ||= {};
    if (!job.jobReference.jobId) {
      job.jobReference.jobId = randomUUID();
    }

    return Query.fromJobRequest_(this, job, this.projectId, options);
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
    if (!jobReference.jobId) {
      throw new Error('attachJob requires a non-empty JobReference.JobId');
    }
    if (!jobReference.projectId) {
      jobReference.projectId = this.projectId;
    }

    return Query.fromJobRef_(this, jobReference, options);
  }

  getBigQueryClient(): BigQueryClient {
    return this.client;
  }
}

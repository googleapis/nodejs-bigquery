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
  SubClientOptions,
} from '../bigquery';
import {QueryJob} from './job';
import {CallOptions} from 'google-gax';
import {protos} from '../';
import {queryFromSQL as builderQueryFromSQL} from './builder';
import {QueryReader} from './reader';

/**
 * QueryClient is a client for running queries in BigQuery.
 */
export class QueryClient {
  private client: BigQueryClient;
  private projectID: string;
  private billingProjectID: string;

  /**
   * @param {BigQueryClientOptions} options - The configuration object.
   */
  constructor(
    options?: BigQueryClientOptions,
    subClientOptions?: SubClientOptions,
  ) {
    this.client = new BigQueryClient(options, subClientOptions);
    this.projectID = '';
    this.billingProjectID = '';
    void this.client.jobClient.getProjectId().then(projectId => {
      this.projectID = projectId;
      if (this.billingProjectID !== '') {
        this.billingProjectID = projectId;
      }
    });
  }

  setBillingProjectID(projectID: string) {
    this.billingProjectID = projectID;
  }

  /**
   * QueryFromSQL creates a query configuration from a SQL string.
   * @param {string} sql The SQL query.
   * @returns {protos.google.cloud.bigquery.v2.IPostQueryRequest}
   */
  queryFromSQL(sql: string): protos.google.cloud.bigquery.v2.IPostQueryRequest {
    const req = builderQueryFromSQL(this.projectID, sql);
    return req;
  }

  /**
   * NewQueryReader creates a new QueryReader.
   * @returns {QueryReader}
   */
  newQueryReader(): QueryReader {
    return new QueryReader(this);
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
        projectId: this.projectID,
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
        projectId: this.projectID,
        job,
      },
      options,
    );
    return new QueryJob(this, {jobReference: response.jobReference});
  }

  /**
   * Gets the results of a query job.
   *
   * @param {protos.google.cloud.bigquery.v2.IGetQueryResultsRequest} request
   *   The request object that will be sent.
   * @param {CallOptions} [options]
   *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
   * @returns {Promise<protos.google.cloud.bigquery.v2.IGetQueryResultsResponse>}
   */
  async _getQueryResults(
    request: protos.google.cloud.bigquery.v2.IGetQueryResultsRequest,
    options?: CallOptions,
  ): Promise<[protos.google.cloud.bigquery.v2.IGetQueryResultsResponse]> {
    const [response] = await this.client.jobClient.getQueryResults(
      request,
      options,
    );
    return [response];
  }
}

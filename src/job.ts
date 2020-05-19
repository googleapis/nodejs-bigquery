/*!
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*!
 * @module bigquery/job
 */

import {
  Metadata,
  MetadataCallback,
  Operation,
  util,
} from '@google-cloud/common';
import {paginator, ResourceStream} from '@google-cloud/paginator';
import {promisifyAll} from '@google-cloud/promisify';
import * as extend from 'extend';

import {
  BigQuery,
  JobRequest,
  PagedRequest,
  QueryRowsCallback,
  QueryRowsResponse,
  RequestCallback,
} from './bigquery';
import {RowMetadata} from './table';
import bigquery from './types';

export type JobMetadata = bigquery.IJob;
export type JobOptions = JobRequest<JobMetadata>;

export type CancelCallback = RequestCallback<bigquery.IJobCancelResponse>;
export type CancelResponse = [bigquery.IJobCancelResponse];

export type QueryResultsOptions = {job?: Job} & PagedRequest<
  bigquery.jobs.IGetQueryResultsParams
>;

/**
 * @callback QueryResultsCallback
 * @param {?Error} err An error returned while making this request.
 * @param {array} rows The results of the job.
 */
/**
 * @callback ManualQueryResultsCallback
 * @param {?Error} err An error returned while making this request.
 * @param {array} rows The results of the job.
 * @param {?object} nextQuery A pre-made configuration object for your next
 *     request. This will be `null` if no additional results are available.
 *     If the query is not yet complete, you may get empty `rows` and
 *     non-`null` `nextQuery` that you should use for your next request.
 * @param {object} apiResponse The full API response.
 */

/**
 * Job objects are returned from various places in the BigQuery API:
 *
 * - {@link BigQuery#getJobs}
 * - {@link BigQuery#job}
 * - {@link BigQuery#query}
 * - {@link BigQuery#createJob}
 * - {@link Table#copy}
 * - {@link Table#createWriteStream}
 * - {@link Table#extract}
 * - {@link Table#load}
 *
 * They can be used to check the status of a running job or fetching the results
 * of a previously-executed one.
 *
 * @class
 * @param {BigQuery} bigQuery {@link BigQuery} instance.
 * @param {string} id The ID of the job.
 * @param {object} [options] Configuration object.
 * @param {string} [options.location] The geographic location of the job.
 *      Required except for US and EU.
 *
 * @example
 * const {BigQuery} = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 *
 * const job = bigquery.job('job-id');
 *
 * //-
 * // All jobs are event emitters. The status of each job is polled
 * // continuously, starting only after you register a "complete" listener.
 * //-
 * job.on('complete', (metadata) => {
 *   // The job is complete.
 * });
 *
 * //-
 * // Be sure to register an error handler as well to catch any issues which
 * // impeded the job.
 * //-
 * job.on('error', (err) => {
 *   // An error occurred during the job.
 * });
 *
 * //-
 * // To force the Job object to stop polling for updates, simply remove any
 * // "complete" listeners you've registered.
 * //
 * // The easiest way to do this is with `removeAllListeners()`.
 * //-
 * job.removeAllListeners();
 */
class Job extends Operation {
  bigQuery: BigQuery;
  location?: string;
  getQueryResultsStream: (
    options?: QueryResultsOptions
  ) => ResourceStream<RowMetadata>;
  constructor(bigQuery: BigQuery, id: string, options?: JobOptions) {
    let location;
    if (options && options.location) {
      location = options.location;
    }

    const methods = {
      /**
       * Check if the job exists.
       *
       * @method Job#exists
       * @param {function} [callback] The callback function.
       * @param {?error} callback.err An error returned while making this
       *     request.
       * @param {boolean} callback.exists Whether the job exists or not.
       * @returns {Promise}
       *
       * @example
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       *
       * const job = bigquery.job('job-id');
       *
       * job.exists((err, exists) => {});
       *
       * //-
       * // If the callback is omitted, we'll return a Promise.
       * //-
       * job.exists().then((data) => {
       *   const exists = data[0];
       * });
       */
      exists: true,

      /**
       * Get a job if it exists.
       *
       * @method Job#get
       * @param {function} [callback] The callback function.
       * @param {?error} callback.err An error returned while making this
       *     request.
       * @param {Job} callback.job The job.
       * @returns {Promise}
       *
       * @example
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       *
       * const job = bigquery.job('job-id');
       *
       * job.get((err, job, apiResponse) => {
       *   if (!err) {
       *     // `job.metadata` has been populated.
       *   }
       * });
       *
       * //-
       * // If the callback is omitted, we'll return a Promise.
       * //-
       * job.get().then((data) => {
       *   const job = data[0];
       *   const apiResponse = data[1];
       * });
       */
      get: true,

      /**
       * Get the metadata of the job. This will mostly be useful for checking
       * the status of a previously-run job.
       *
       * @see [Jobs: get API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/get}
       *
       * @method Job#getMetadata
       * @param {function} [callback] The callback function.
       * @param {?error} callback.err An error returned while making this
       *     request.
       * @param {object} callback.metadata The metadata of the job.
       * @param {object} callback.apiResponse The full API response.
       * @returns {Promise}
       *
       * @example
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       *
       * const job = bigquery.job('id');
       * job.getMetadata((err, metadata, apiResponse) => {});
       *
       * //-
       * // If the callback is omitted, we'll return a Promise.
       * //-
       * job.getMetadata().then((data) => {
       *   const metadata = data[0];
       *   const apiResponse = data[1];
       * });
       */
      getMetadata: {
        reqOpts: {
          qs: {location},
        },
      },
    };

    super({
      parent: bigQuery,
      baseUrl: '/jobs',
      id,
      methods,
    });

    this.bigQuery = bigQuery;

    if (options && options.location) {
      this.location = options.location;
    }

    /**
     * Get the results of a job as a readable object stream.
     *
     * @param {object} options Configuration object. See
     *     {@link Job#getQueryResults} for a complete list of options.
     * @return {stream}
     *
     * @example
     * const through2 = require('through2');
     * const fs = require('fs');
     * const {BigQuery} = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     *
     * const job = bigquery.job('job-id');
     *
     * job.getQueryResultsStream()
     *   .pipe(through2.obj(function (row, enc, next) {
     *     this.push(JSON.stringify(row) + '\n');
     *     next();
     *   }))
     *   .pipe(fs.createWriteStream('./test/testdata/testfile.json'));
     */
    this.getQueryResultsStream = paginator.streamify<RowMetadata>(
      'getQueryResultsAsStream_'
    );
  }

  cancel(): Promise<CancelResponse>;
  cancel(callback: CancelCallback): void;
  /**
   * Cancel a job. Use {@link Job#getMetadata} to see if the cancel
   * completes successfully. See an example implementation below.
   *
   * @see [Jobs: get API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/cancel}
   *
   * @param {function} [callback] The callback function.
   * @param {?error} callback.err An error returned while making this request.
   * @param {object} callback.apiResponse The full API response.
   * @returns {Promise}
   *
   * @example
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   *
   * const job = bigquery.job('job-id');
   *
   * job.cancel((err, apiResponse) =>{
   *   // Check to see if the job completes successfully.
   *   job.on('error', (err) => {});
   *   job.on('complete', (metadata) => {});
   * });
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * job.cancel().then((data) => {
   *   const apiResponse = data[0];
   * });
   */
  cancel(callback?: CancelCallback): void | Promise<CancelResponse> {
    let qs;

    if (this.location) {
      qs = {location: this.location};
    }

    this.request(
      {
        method: 'POST',
        uri: '/cancel',
        qs,
      },
      callback!
    );
  }

  getQueryResults(options?: QueryResultsOptions): Promise<QueryRowsResponse>;
  getQueryResults(
    options: QueryResultsOptions,
    callback: QueryRowsCallback
  ): void;
  getQueryResults(callback: QueryRowsCallback): void;
  /**
   * Get the results of a job.
   *
   * @see [Jobs: getQueryResults API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/getQueryResults}
   *
   * @param {object} [options] Configuration object.
   * @param {boolean} [options.autoPaginate=true] Have pagination handled
   *     automatically.
   * @param {number} [options.maxApiCalls] Maximum number of API calls to make.
   * @param {number} [options.maxResults] Maximum number of results to read.
   * @param {string} [options.pageToken] Page token, returned by a previous call,
   *     to request the next page of results. Note: This is automatically added
   * to the `nextQuery` argument of your callback.
   * @param {number} [options.startIndex] Zero-based index of the starting row.
   * @param {number} [options.timeoutMs] How long to wait for the query to
   *     complete, in milliseconds, before returning. Default is to return
   *     immediately. If the timeout passes before the job completes, the
   * request will fail with a `TIMEOUT` error.
   * @param {QueryResultsCallback|ManualQueryResultsCallback} [callback] The
   *     callback function. If `autoPaginate` is set to false a
   *     {@link ManualQueryResultsCallback} should be used.
   * @returns {Promise}
   *
   * @example
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   *
   * const job = bigquery.job('job-id');
   *
   * //-
   * // Get all of the results of a query.
   * //-
   * job.getQueryResults((err, rows) => {
   *   if (!err) {
   *     // rows is an array of results.
   *   }
   * });
   *
   * //-
   * // Customize the results you want to fetch.
   * //-
   * job.getQueryResults({
   *   maxResults: 100
   * }, (err, rows) => {});
   *
   * //-
   * // To control how many API requests are made and page through the results
   * // manually, set `autoPaginate` to `false`.
   * //-
   * function manualPaginationCallback(err, rows, nextQuery, apiResponse) {
   *   if (nextQuery) {
   *     // More results exist.
   *     job.getQueryResults(nextQuery, manualPaginationCallback);
   *   }
   * }
   *
   * job.getQueryResults({
   *   autoPaginate: false
   * }, manualPaginationCallback);
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * job.getQueryResults().then((data) => {
   *   const rows = data[0];
   * });
   */
  getQueryResults(
    optionsOrCallback?: QueryResultsOptions | QueryRowsCallback,
    cb?: QueryRowsCallback
  ): void | Promise<QueryRowsResponse> {
    const options =
      typeof optionsOrCallback === 'object' ? optionsOrCallback : {};
    const callback =
      typeof optionsOrCallback === 'function' ? optionsOrCallback : cb;

    const qs = extend(
      {
        location: this.location,
      },
      options
    );

    delete qs.job;

    this.bigQuery.request(
      {
        uri: '/queries/' + this.id,
        qs,
      },
      (err, resp) => {
        if (err) {
          callback!(err, null, null, resp);
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let rows: any = [];

        if (resp.schema && resp.rows) {
          rows = BigQuery.mergeSchemaWithRows_(resp.schema, resp.rows);
        }

        let nextQuery: {} | null = null;
        if (resp.jobComplete === false) {
          // Query is still running.
          nextQuery = Object.assign({}, options);
        } else if (resp.pageToken) {
          // More results exist.
          nextQuery = Object.assign({}, options, {
            pageToken: resp.pageToken,
          });
        }

        callback!(null, rows, nextQuery, resp);
      }
    );
  }

  /**
   * This method will be called by `getQueryResultsStream()`. It is required to
   * properly set the `autoPaginate` option value.
   *
   * @private
   */
  getQueryResultsAsStream_(
    options: QueryResultsOptions,
    callback: QueryRowsCallback
  ): void {
    options = extend({autoPaginate: false}, options);
    this.getQueryResults(options, callback);
  }

  /**
   * Poll for a status update. Execute the callback:
   *
   *   - callback(err): Job failed
   *   - callback(): Job incomplete
   *   - callback(null, metadata): Job complete
   *
   * @private
   *
   * @param {function} callback
   */
  poll_(callback: MetadataCallback): void {
    this.getMetadata((err: Error, metadata: Metadata) => {
      if (!err && metadata.status && metadata.status.errorResult) {
        err = new util.ApiError(metadata.status);
      }

      if (err) {
        callback(err);
        return;
      }

      if (metadata.status.state !== 'DONE') {
        callback(null);
        return;
      }

      callback(null, metadata);
    });
  }
}

/*! Developer Documentation
 *
 * These methods can be auto-paginated.
 */
paginator.extend(Job, ['getQueryResults']);

/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
promisifyAll(Job);

/**
 * Reference to the {@link Job} class.
 * @name module:@google-cloud/bigquery.Job
 * @see Job
 */
export {Job};

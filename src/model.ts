/*!
 * Copyright 2020 Google Inc. All Rights Reserved.
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

import * as common from '@google-cloud/common';
import {promisifyAll} from '@google-cloud/promisify';
import arrify = require('arrify');
import * as extend from 'extend';
import {
  BigQuery,
  Job,
  Dataset,
  ResourceCallback,
  RequestCallback,
  JobRequest,
} from '.';
import {JobMetadata} from './job';
import bigquery from './types';

// This is supposed to be a @google-cloud/storage `File` type. The storage npm
// module includes these types, but is currently installed as a devDependency.
// Unless it's included as a production dependency, the types would not be
// included.  The storage module is fairly large, and only really needed for
// types.  We need to figure out how to include these types properly.
export interface File {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bucket: any;
  kmsKeyName?: string;
  userProject?: string;
  name: string;
  generation?: number;
}

export type JobMetadataCallback = RequestCallback<JobMetadata>;
export type JobMetadataResponse = [JobMetadata];

export type JobResponse = [Job, bigquery.IJob];
export type JobCallback = ResourceCallback<Job, bigquery.IJob>;

export type CreateExtractJobOptions = JobRequest<
  bigquery.IJobConfigurationExtract
> & {
  format?: 'ML_TF_SAVED_MODEL' | 'ML_XGBOOST_BOOSTER';
};

/**
 * The model export formats accepted by BigQuery.
 *
 * @type {array}
 * @private
 */
const FORMATS = ['ML_TF_SAVED_MODEL', 'ML_XGBOOST_BOOSTER'];

/**
 * Model objects are returned by methods such as {@link Dataset#model} and
 * {@link Dataset#getModels}.
 *
 * @class
 * @param {Dataset} dataset {@link Dataset} instance.
 * @param {string} id The ID of the model.
 *
 * @example
 * const {BigQuery} = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 *
 * const model = dataset.model('my-model');
 */
class Model extends common.ServiceObject {
  dataset: Dataset;
  bigQuery: BigQuery;

  constructor(dataset: Dataset, id: string) {
    const methods = {
      /**
       * Delete the model.
       *
       * @see [Models: delete API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/rest/v2/models/delete}
       *
       * @method Model#delete
       * @param {function} [callback] The callback function.
       * @param {?error} callback.err An error returned while making this
       *     request.
       * @param {object} callback.apiResponse The full API response.
       * @returns {Promise}
       *
       * @example
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       * const dataset = bigquery.dataset('my-dataset');
       * const model = dataset.model('my-model');
       *
       * model.delete((err, apiResponse) => {});
       *
       * @example <caption>If the callback is omitted we'll return a Promise.</caption>
       * const [apiResponse] = await model.delete();
       */
      delete: true,

      /**
       * Check if the model exists.
       *
       * @method Model#exists
       * @param {function} [callback] The callback function.
       * @param {?error} callback.err An error returned while making this
       *     request.
       * @param {boolean} callback.exists Whether the model exists or not.
       * @returns {Promise}
       *
       * @example
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       * const dataset = bigquery.dataset('my-dataset');
       * const model = dataset.model('my-model');
       *
       * model.exists((err, exists) => {});
       *
       * @example <caption>If the callback is omitted we'll return a Promise.</caption>
       * const [exists] = await model.exists();
       */
      exists: true,

      /**
       * Get a model if it exists.
       *
       * @see [Models: get API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/rest/v2/models/get}
       *
       * @method Model#get:
       * @param {function} [callback] The callback function.
       * @param {?error} callback.err An error returned while making this
       *     request.
       * @param {Model} callback.model The {@link Model}.
       * @param {object} callback.apiResponse The full API response.
       * @returns {Promise}
       *
       * @example
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       * const dataset = bigquery.dataset('my-dataset');
       * const model = dataset.model('my-model');
       *
       * model.get(err => {
       *   if (!err) {
       *     // `model.metadata` has been populated.
       *   }
       * });
       *
       * @example <caption>If the callback is omitted we'll return a Promise.</caption>
       * await model.get();
       */
      get: true,

      /**
       * Return the metadata associated with the model.
       *
       * @see [Models: get API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/rest/v2/models/get}
       *
       * @method Model#getMetadata
       * @param {function} [callback] The callback function.
       * @param {?error} callback.err An error returned while making this
       *     request.
       * @param {object} callback.metadata The metadata of the model.
       * @param {object} callback.apiResponse The full API response.
       * @returns {Promise}
       *
       * @example
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       * const dataset = bigquery.dataset('my-dataset');
       * const model = dataset.model('my-model');
       *
       * model.getMetadata((err, metadata, apiResponse) => {});
       *
       * @example <caption>If the callback is omitted we'll return a Promise.</caption>
       * const [metadata, apiResponse] = await model.getMetadata();
       */
      getMetadata: true,

      /**
       * @see [Models: patch API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/rest/v2/models/patch}
       *
       * @method Model#setMetadata
       * @param {object} metadata The metadata key/value object to set.
       * @param {function} [callback] The callback function.
       * @param {?error} callback.err An error returned while making this
       *     request.
       * @param {object} callback.metadata The updated metadata of the model.
       * @param {object} callback.apiResponse The full API response.
       * @returns {Promise}
       *
       * @example
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       * const dataset = bigquery.dataset('my-dataset');
       * const model = dataset.model('my-model');
       *
       * const metadata = {
       *   friendlyName: 'TheBestModelEver'
       * };
       *
       * model.setMetadata(metadata, (err, metadata, apiResponse) => {});
       *
       * @example <caption>If the callback is omitted we'll return a Promise.</caption>
       * const [metadata, apiResponse] = await model.setMetadata(metadata);
       */
      setMetadata: true,
    };

    super({
      parent: dataset,
      baseUrl: '/models',
      id,
      methods,
    });

    this.dataset = dataset;
    this.bigQuery = dataset.bigQuery;
  }

  createExtractJob(
    destination: string | File,
    options?: CreateExtractJobOptions
  ): Promise<JobResponse>;
  createExtractJob(
    destination: string | File,
    options: CreateExtractJobOptions,
    callback: JobCallback
  ): void;
  createExtractJob(destination: string | File, callback: JobCallback): void;
  /**
   * Export model to Cloud Storage.
   *
   * @see [Jobs: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert}
   *
   * @param {string|File} destination Where the model should be exported
   *    to. A string or {@link
   *    https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}
   *    object.
   * @param {object} [options] The configuration object.
   * @param {string} [options.format] The format to export the data in.
   *    Allowed options are "ML_TF_SAVED_MODEL" or "ML_XGBOOST_BOOSTER". 
   *    Default: "ML_TF_SAVED_MODEL".
   * @param {string} [options.jobId] Custom job id.
   * @param {string} [options.jobPrefix] Prefix to apply to the job id.
   * @param {function} [callback] The callback function.
   * @param {?error} callback.err An error returned while making this request.
   * @param {Job} callback.job The job used to export the model.
   * @param {object} callback.apiResponse The full API response.
   *
   * @throws {Error} If a destination isn't a string or File object.
   *
   * @example
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const model = dataset.model('my-model');
   *
   * const extractedModel = 'gs://my-bucket/extracted-model';
   *
   * function callback(err, job, apiResponse) {
   *   // `job` is a Job object that can be used to check the status of the
   *   // request.
   * }
   *
   * //-
   * // To use the default options, just pass a string or a {@link
   * https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}
   * object.
   * //
   * // Note: The default format is 'ML_TF_SAVED_MODEL'.
   * //-
   * model.createExtractJob(extractedModel, callback);
   *
   * //-
   * // If you need more customization, pass an `options` object.
   * //-
   * const options = {
   *   format: 'ML_TF_SAVED_MODEL',
   *   jobId: '123abc'
   * };
   *
   * model.createExtractJob(extractedModel, options, callback);
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * model.createExtractJob(extractedModel, options).then((data) => {
   *   const job = data[0];
   *   const apiResponse = data[1];
   * });
   */
  createExtractJob(
    destination: string | File,
    optionsOrCallback?: CreateExtractJobOptions | JobCallback,
    cb?: JobCallback
  ): void | Promise<JobResponse> {
    let options =
      typeof optionsOrCallback === 'object' ? optionsOrCallback : {};
    const callback =
      typeof optionsOrCallback === 'function' ? optionsOrCallback : cb;

    options = extend(true, options, {
      destinationUris: (arrify(destination) as Array<File | string>).map(
        dest => {
          if (common.util.isCustomType(dest, 'storage/file')) {
            return (
              'gs://' + (dest as File).bucket.name + '/' + (dest as File).name
            );
          }

          if (typeof dest === 'string') {
            return dest;
          }
          throw new Error('Destination must be a string or a File object.');
        }
      ),
    });

    if (options.format) {
      options.format = options.format.toUpperCase() as typeof options.format;

      if (FORMATS.includes(options.format as string)) {
        options.destinationFormat = options.format!;
        delete options.format;
      } else {
        throw new Error('Destination format not recognized: ' + options.format);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {
      configuration: {
        extract: extend(true, options, {
          sourceModel: {
            datasetId: this.dataset.id,
            projectId: this.bigQuery.projectId,
            modelId: this.id,
          },
        }),
      },
    };

    if (options.jobPrefix) {
      body.jobPrefix = options.jobPrefix;
      delete options.jobPrefix;
    }

    if (options.jobId) {
      body.jobId = options.jobId;
      delete options.jobId;
    }

    this.bigQuery.createJob(body, callback!);
  }

  extract(
    destination: string | File,
    options?: CreateExtractJobOptions
  ): Promise<JobMetadataResponse>;
  extract(
    destination: string | File,
    options: CreateExtractJobOptions,
    callback?: JobMetadataCallback
  ): void;
  extract(destination: string | File, callback?: JobMetadataCallback): void;
  /**
   * Export model to Cloud Storage.
   *
   * @param {string|File} destination Where the model should be exported
   *    to. A string or {@link
   *    https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}
   *    object.
   * @param {object} [options] The configuration object.
   * @param {string} [options.format] The format to export
   *    the data in. Allowed options are "ML_TF_SAVED_MODEL" or
   *    "ML_XGBOOST_BOOSTER". Default: "ML_TF_SAVED_MODEL".
   * @param {string} [options.jobId] Custom id for the underlying job.
   * @param {string} [options.jobPrefix] Prefix to apply to the underlying job id.
   * @param {function} [callback] The callback function.
   * @param {?error} callback.err An error returned while making this request
   * @param {object} callback.apiResponse The full API response.
   * @returns {Promise}
   *
   * @throws {Error} If destination isn't a string or File object.
   *
   * @example
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const model = dataset.model('my-model');
   *
   * const extractedModel = 'gs://my-bucket/extracted-model';
   *
   *
   * //-
   * function callback(err, job, apiResponse) {
   *   // `job` is a Job object that can be used to check the status of the
   *   // request.
   * }
   *
   * //-
   * // To use the default options, just pass a string or a {@link
   * https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}
   * object.
   * //
   * // Note: The default format is 'ML_TF_SAVED_MODEL'.
   * //-
   * model.createExtractJob(extractedModel, callback);
   *
   * //-
   * // If you need more customization, pass an `options` object.
   * //-
   * const options = {
   *   format: 'ML_TF_SAVED_MODEL',
   *   jobId: '123abc'
   * };
   *
   * model.createExtractJob(extractedModel, options, callback);
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * model.createExtractJob(extractedModel, options).then((data) => {
   *   const job = data[0];
   *   const apiResponse = data[1];
   * });
   */
  extract(
    destination: string | File,
    optionsOrCallback?: CreateExtractJobOptions | JobMetadataCallback,
    cb?: JobMetadataCallback
  ): void | Promise<JobMetadataResponse> {
    const options =
      typeof optionsOrCallback === 'object' ? optionsOrCallback : {};
    const callback =
      typeof optionsOrCallback === 'function' ? optionsOrCallback : cb;

    this.createExtractJob(destination, options, (err, job, resp) => {
      if (err) {
        callback!(err, resp);
        return;
      }

      job!.on('error', callback!).on('complete', metadata => {
        callback!(null, metadata);
      });
    });
  }
}

/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
promisifyAll(Model);

/**
 * Reference to the {@link Model} class.
 * @name module:@google-cloud/bigquery.Model
 * @see Model
 */
export {Model};

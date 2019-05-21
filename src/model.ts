/*!
 * Copyright 2019 Google Inc. All Rights Reserved.
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
import {Dataset} from './dataset';

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
  constructor(dataset: Dataset, id: string) {
    const methods = {
      /**
       * Delete a model.
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
       * @example <caption>If the callback is omitted we'll return a Promise
       * </caption>
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
       * @example <caption>If the callback is omitted we'll return a Promise
       * </caption>
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
       * model.get((err, model2, apiResponse) => {
       *   // `model.metadata` has been populated.
       * });
       *
       * @example <caption>If the callback is omitted we'll return a Promise
       * </caption>
       * const [model2, apiResponse] = await model.get();
       */
      get: true,

      /**
       * Return the metadata associated with the Model.
       *
       * @see [Models: get API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/rest/v2/models/get}
       *
       * @method Model#getMetadata
       * @param {function} [callback] The callback function.
       * @param {?error} callback.err An error returned while making this
       *     request.
       * @param {object} callback.metadata The metadata of the Model.
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
       * @example <caption>If the callback is omitted we'll return a Promise
       * </caption>
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
       * @param {object} callback.metadata The updated metadata of the Model.
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
       *   friendlyName: 'thebestmodelever'
       * };
       *
       * model.setMetadata(metadata, (err, metadata, apiResponse) => {});
       *
       * @example <caption>If the callback is omitted we'll return a Promise
       * </caption>
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
  }
}

/**
 * Reference to the {@link Model} class.
 * @name module:@google-cloud/bigquery.Model
 * @see Model
 */
export {Model};

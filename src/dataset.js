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

'use strict';

var common = require('@google-cloud/common');
var extend = require('extend');
var is = require('is');
var util = require('util');

var Table = require('./table.js');

/**
 * Interact with your BigQuery dataset. Create a Dataset instance with
 * {@link BigQuery#createDataset} or {@link BigQuery#dataset}.
 *
 * @class
 * @param {BigQuery} bigQuery {@link BigQuery} instance.
 * @param {string} id The ID of the Dataset.
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('institutions');
 */
function Dataset(bigQuery, id) {
  var methods = {
    /**
     * Create a dataset.
     *
     * @method Dataset#create
     * @param {function} [callback] The callback function.
     * @param {?error} callback.err An error returned while making this
     *     request.
     * @param {Dataset} callback.dataset The created dataset.
     * @param {object} callback.apiResponse The full API response.
     * @returns {Promise}
     *
     * @example
     * const BigQuery = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('institutions');
     * dataset.create(function(err, dataset, apiResponse) {
     *   if (!err) {
     *     // The dataset was created successfully.
     *   }
     * });
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * dataset.create().then(function(data) {
     *   const dataset = data[0];
     *   const apiResponse = data[1];
     * });
     */
    create: true,

    /**
     * Check if the dataset exists.
     *
     * @method Dataset#exists
     * @param {function} [callback] The callback function.
     * @param {?error} callback.err An error returned while making this
     *     request.
     * @param {boolean} callback.exists Whether the dataset exists or not.
     * @returns {Promise}
     *
     * @example
     * const BigQuery = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('institutions');
     * dataset.exists(function(err, exists) {});
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * dataset.exists().then(function(data) {
     *   const exists = data[0];
     * });
     */
    exists: true,

    /**
     * Get a dataset if it exists.
     *
     * You may optionally use this to "get or create" an object by providing an
     * object with `autoCreate` set to `true`. Any extra configuration that is
     * normally required for the `create` method must be contained within this
     * object as well.
     *
     * @method Dataset#get
     * @param {options} [options] Configuration object.
     * @param {boolean} [options.autoCreate=false] Automatically create the
     *     object if it does not exist.
     * @param {function} [callback] The callback function.
     * @param {?error} callback.err An error returned while making this
     *     request.
     * @param {Dataset} callback.dataset The dataset.
     * @returns {Promise}
     *
     * @example
     * const BigQuery = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('institutions');
     * dataset.get(function(err, dataset, apiResponse) {
     *   if (!err) {
     *     // `dataset.metadata` has been populated.
     *   }
     * });
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * dataset.get().then(function(data) {
     *   const dataset = data[0];
     *   const apiResponse = data[1];
     * });
     */
    get: true,

    /**
     * Get the metadata for the Dataset.
     *
     * @see [Datasets: get API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/datasets/get}
     *
     * @method Dataset#getMetadata
     * @param {function} [callback] The callback function.
     * @param {?error} callback.err An error returned while making this
     *     request.
     * @param {object} callback.metadata The dataset's metadata.
     * @param {object} callback.apiResponse The full API response.
     * @returns {Promise}
     *
     * @example
     * const BigQuery = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('institutions');
     * dataset.getMetadata(function(err, metadata, apiResponse) {});
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * dataset.getMetadata().then(function(data) {
     *   const metadata = data[0];
     *   const apiResponse = data[1];
     * });
     */
    getMetadata: true,

    /**
     * Sets the metadata of the Dataset object.
     *
     * @see [Datasets: patch API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/datasets/patch}
     *
     * @method Dataset#setMetadata
     * @param {object} metadata Metadata to save on the Dataset.
     * @param {function} [callback] The callback function.
     * @param {?error} callback.err An error returned while making this
     *     request.
     * @param {object} callback.apiResponse The full API response.
     * @returns {Promise}
     *
     * @example
     * const BigQuery = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('institutions');
     *
     * const metadata = {
     *   description: 'Info for every institution in the 2013 IPEDS universe'
     * };
     *
     * dataset.setMetadata(metadata, function(err, apiResponse) {});
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * dataset.setMetadata(metadata).then(function(data) {
     *   const apiResponse = data[0];
     * });
     */
    setMetadata: true,
  };

  common.ServiceObject.call(this, {
    parent: bigQuery,
    baseUrl: '/datasets',
    id: id,
    createMethod: bigQuery.createDataset.bind(bigQuery),
    methods: methods,
  });

  this.bigQuery = bigQuery;

  // Catch all for read-modify-write cycle
  // https://cloud.google.com/bigquery/docs/api-performance#read-patch-write
  this.interceptors.push({
    request: function(reqOpts) {
      if (reqOpts.method === 'PATCH' && reqOpts.json.etag) {
        reqOpts.headers = reqOpts.headers || {};
        reqOpts.headers['If-Match'] = reqOpts.json.etag;
      }

      return reqOpts;
    },
  });
}

util.inherits(Dataset, common.ServiceObject);

/**
 * Run a query as a job. No results are immediately returned. Instead, your
 * callback will be executed with a {@link Job} object that you must
 * ping for the results. See the Job documentation for explanations of how to
 * check on the status of the job.
 *
 * See {@link BigQuery#createQueryJob} for full documentation of this method.
 *
 * @param {object} options See {@link BigQuery#createQueryJob} for full documentation of this method.
 * @param {function} [callback] See {@link BigQuery#createQueryJob} for full documentation of this method.
 * @returns {Promise} See {@link BigQuery#createQueryJob} for full documentation of this method.
 */
Dataset.prototype.createQueryJob = function(options, callback) {
  if (is.string(options)) {
    options = {
      query: options,
    };
  }

  options = extend(true, {}, options, {
    defaultDataset: {
      datasetId: this.id,
    },
  });

  return this.bigQuery.createQueryJob(options, callback);
};

/**
 * Run a query scoped to your dataset as a readable object stream.
 *
 * See {@link BigQuery#createQueryStream} for full documentation of this
 * method.
 *
 * @param {object} options See {@link BigQuery#createQueryStream} for full
 *     documentation of this method.
 * @returns {stream}
 */
Dataset.prototype.createQueryStream = function(options) {
  if (is.string(options)) {
    options = {
      query: options,
    };
  }

  options = extend(true, {}, options, {
    defaultDataset: {
      datasetId: this.id,
    },
  });

  return this.bigQuery.createQueryStream(options);
};

/**
 * Create a table given a tableId or configuration object.
 *
 * @see [Tables: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tables/insert}
 *
 * @param {string} id Table id.
 * @param {object} [options] See a
 *     [Table resource](https://cloud.google.com/bigquery/docs/reference/v2/tables#resource).
 * @param {string|object} [options.schema] A comma-separated list of name:type
 *     pairs. Valid types are "string", "integer", "float", "boolean", and
 *     "timestamp". If the type is omitted, it is assumed to be "string".
 *     Example: "name:string, age:integer". Schemas can also be specified as a
 *     JSON array of fields, which allows for nested and repeated fields. See
 *     a [Table resource](http://goo.gl/sl8Dmg) for more detailed information.
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request
 * @param {Table} callback.table The newly created table.
 * @param {object} callback.apiResponse The full API response.
 * @returns {Promise}
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('institutions');
 *
 * const tableId = 'institution_data';
 *
 * const options = {
 *   // From the data.gov CSV dataset (http://goo.gl/kSE7z6):
 *   schema: 'UNITID,INSTNM,ADDR,CITY,STABBR,ZIP,FIPS,OBEREG,CHFNM,...'
 * };
 *
 * dataset.createTable(tableId, options, function(err, table, apiResponse) {});
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * dataset.createTable(tableId, options).then(function(data) {
 *   const table = data[0];
 *   const apiResponse = data[1];
 * });
 */
Dataset.prototype.createTable = function(id, options, callback) {
  var self = this;

  if (is.fn(options)) {
    callback = options;
    options = {};
  }

  var body = Table.formatMetadata_(options);

  body.tableReference = {
    datasetId: this.id,
    projectId: this.bigQuery.projectId,
    tableId: id,
  };

  this.request(
    {
      method: 'POST',
      uri: '/tables',
      json: body,
    },
    function(err, resp) {
      if (err) {
        callback(err, null, resp);
        return;
      }

      var table = self.table(resp.tableReference.tableId);
      table.metadata = resp;

      callback(null, table, resp);
    }
  );
};

/**
 * Delete the dataset.
 *
 * @see [Datasets: delete API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/datasets/delete}
 *
 * @param {object} [options] The configuration object.
 * @param {boolean} [options.force=false] Force delete dataset and all tables.
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request
 * @param {object} callback.apiResponse The full API response.
 * @returns {Promise}
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('institutions');
 *
 * //-
 * // Delete the dataset, only if it does not have any tables.
 * //-
 * dataset.delete(function(err, apiResponse) {});
 *
 * //-
 * // Delete the dataset and any tables it contains.
 * //-
 * dataset.delete({ force: true }, function(err, apiResponse) {});
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * dataset.delete().then(function(data) {
 *   var apiResponse = data[0];
 * });
 */
Dataset.prototype.delete = function(options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }

  var query = {
    deleteContents: !!options.force,
  };

  this.request(
    {
      method: 'DELETE',
      uri: '',
      qs: query,
    },
    callback
  );
};

/**
 * Get a list of tables.
 *
 * @see [Tables: list API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tables/list}
 *
 * @param {object} [options] Configuration object.
 * @param {boolean} [options.autoPaginate=true] Have pagination handled automatically.
 * @param {number} [options.maxApiCalls] Maximum number of API calls to make.
 * @param {number} [options.maxResults] Maximum number of results to return.
 * @param {string} [options.pageToken] Token returned from a previous call, to
 *     request the next page of results.
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request
 * @param {Table[]} callback.tables The list of tables from
 *     your Dataset.
 * @returns {Promise}
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('institutions');
 *
 * dataset.getTables(function(err, tables) {
 *   // tables is an array of `Table` objects.
 * });
 *
 * //-
 * // To control how many API requests are made and page through the results
 * // manually, set `autoPaginate` to `false`.
 * //-
 * function manualPaginationCallback(err, tables, nextQuery, apiResponse) {
 *   if (nextQuery) {
 *     // More results exist.
 *     dataset.getTables(nextQuery, manualPaginationCallback);
 *   }
 * }
 *
 * dataset.getTables({
 *   autoPaginate: false
 * }, manualPaginationCallback);
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * dataset.getTables().then(function(data) {
 *   var tables = data[0];
 * });
 */
Dataset.prototype.getTables = function(options, callback) {
  var that = this;

  if (is.fn(options)) {
    callback = options;
    options = {};
  }

  options = options || {};

  this.request(
    {
      uri: '/tables',
      qs: options,
    },
    function(err, resp) {
      if (err) {
        callback(err, null, null, resp);
        return;
      }

      var nextQuery = null;
      if (resp.nextPageToken) {
        nextQuery = extend({}, options, {
          pageToken: resp.nextPageToken,
        });
      }

      var tables = (resp.tables || []).map(function(tableObject) {
        var table = that.table(tableObject.tableReference.tableId);
        table.metadata = tableObject;
        return table;
      });

      callback(null, tables, nextQuery, resp);
    }
  );
};

/**
 * List all or some of the {module:bigquery/table} objects in your project as a
 * readable object stream.
 *
 * @param {object} [options] Configuration object. See
 *     {@link Dataset#getTables} for a complete list of options.
 * @return {stream}
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('institutions');
 *
 * dataset.getTablesStream()
 *   .on('error', console.error)
 *   .on('data', function(table) {})
 *   .on('end', function() {
 *     // All tables have been retrieved
 *   });
 *
 * //-
 * // If you anticipate many results, you can end a stream early to prevent
 * // unnecessary processing and API requests.
 * //-
 * dataset.getTablesStream()
 *   .on('data', function(table) {
 *     this.end();
 *   });
 */
Dataset.prototype.getTablesStream = common.paginator.streamify('getTables');

/**
 * Run a query scoped to your dataset.
 *
 * See {@link BigQuery#query} for full documentation of this method.
 *
 * @param {object} options See {@link BigQuery#query} for full documentation of this method.
 * @param {function} [callback] See {@link BigQuery#query} for full documentation of this method.
 * @returns {Promise} See {@link BigQuery#query} for full documentation of this method.
 */
Dataset.prototype.query = function(options, callback) {
  if (is.string(options)) {
    options = {
      query: options,
    };
  }

  options = extend(true, {}, options, {
    defaultDataset: {
      datasetId: this.id,
    },
  });

  return this.bigQuery.query(options, callback);
};

/**
 * Create a Table object.
 *
 * @param {string} id The ID of the table.
 * @return {Table}
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('institutions');
 *
 * const institutions = dataset.table('institution_data');
 */
Dataset.prototype.table = function(id) {
  return new Table(this, id);
};

/*! Developer Documentation
 *
 * These methods can be auto-paginated.
 */
common.paginator.extend(Dataset, ['getTables']);

/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
common.util.promisifyAll(Dataset, {
  exclude: ['table'],
});

/**
 * Reference to the {@link Dataset} class.
 * @name module:@google-cloud/bigquery.Dataset
 * @see Dataset
 */
module.exports = Dataset;

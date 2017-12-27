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

var arrify = require('arrify');
var common = require('@google-cloud/common');
var duplexify = require('duplexify');
var extend = require('extend');
var format = require('string-format-obj');
var fs = require('fs');
var is = require('is');
var path = require('path');
var streamEvents = require('stream-events');
var util = require('util');
var uuid = require('uuid');

/**
 * The file formats accepted by BigQuery.
 *
 * @type {object}
 * @private
 */
var FORMATS = {
  avro: 'AVRO',
  csv: 'CSV',
  json: 'NEWLINE_DELIMITED_JSON',
};

/**
 * Table objects are returned by methods such as
 * {@link BigQuery/dataset#table}, {@link BigQuery/dataset#createTable}, and
 * {@link BigQuery/dataset#getTables}.
 *
 * @class
 * @param {Dataset} dataset {@link Dataset} instance.
 * @param {string} id The ID of the table.
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 *
 * const table = dataset.table('my-table');
 */
function Table(dataset, id) {
  var methods = {
    /**
     * Create a table.
     *
     * @method Table#create
     * @param {object} [options] See {@link Dataset#createTable}.
     * @param {function} [callback]
     * @param {?error} callback.err An error returned while making this
     *     request.
     * @param {Table} callback.table The new {@link Table}.
     * @param {object} callback.apiResponse The full API response.
     * @returns {Promise}
     *
     * @example
     * const BigQuery = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('my-dataset');
     *
     * const table = dataset.table('my-table');
     *
     * table.create(function(err, table, apiResponse) {
     *   if (!err) {
     *     // The table was created successfully.
     *   }
     * });
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * table.create().then(function(data) {
     *   const table = data[0];
     *   const apiResponse = data[1];
     * });
     */
    create: true,

    /**
     * Delete a table and all its data.
     *
     * @see [Tables: delete API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tables/delete}
     *
     * @method Table#delete
     * @param {function} [callback]
     * @param {?error} callback.err An error returned while making this
     *     request.
     * @param {object} callback.apiResponse The full API response.
     * @returns {Promise}
     *
     * @example
     * const BigQuery = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('my-dataset');
     *
     * const table = dataset.table('my-table');
     *
     * table.delete(function(err, apiResponse) {});
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * table.delete().then(function(data) {
     *   const apiResponse = data[0];
     * });
     */
    delete: true,

    /**
     * Check if the table exists.
     *
     * @method Table#exists
     * @param {function} [callback]
     * @param {?error} callback.err An error returned while making this
     *     request.
     * @param {boolean} callback.exists Whether the table exists or not.
     * @returns {Promise}
     *
     * @example
     * const BigQuery = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('my-dataset');
     *
     * const table = dataset.table('my-table');
     *
     * table.exists(function(err, exists) {});
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * table.exists().then(function(data) {
     *   const exists = data[0];
     * });
     */
    exists: true,

    /**
     * Get a table if it exists.
     *
     * You may optionally use this to "get or create" an object by providing an
     * object with `autoCreate` set to `true`. Any extra configuration that is
     * normally required for the `create` method must be contained within this
     * object as well.
     *
     * @method Table#get
     * @param {options} [options] Configuration object.
     * @param {boolean} [options.autoCreate=false] Automatically create the
     *     object if it does not exist.
     * @param {function} [callback]
     * @param {?error} callback.err An error returned while making this
     *     request.
     * @param {Table} callback.table The {@link Table}.
     * @param {object} callback.apiResponse The full API response.
     * @returns {Promise}
     *
     * @example
     * const BigQuery = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('my-dataset');
     *
     * const table = dataset.table('my-table');
     *
     * table.get(function(err, table, apiResponse) {
     *   // `table.metadata` has been populated.
     * });
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * table.get().then(function(data) {
     *   const table = data[0];
     *   const apiResponse = data[1];
     * });
     */
    get: true,

    /**
     * Return the metadata associated with the Table.
     *
     * @see [Tables: get API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tables/get}
     *
     * @method Table#getMetadata
     * @param {function} [callback] The callback function.
     * @param {?error} callback.err An error returned while making this
     *     request.
     * @param {object} callback.metadata The metadata of the Table.
     * @param {object} callback.apiResponse The full API response.
     * @returns {Promise}
     *
     * @example
     * const BigQuery = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('my-dataset');
     *
     * const table = dataset.table('my-table');
     *
     * table.getMetadata(function(err, metadata, apiResponse) {});
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * table.getMetadata().then(function(data) {
     *   const metadata = data[0];
     *   const apiResponse = data[1];
     * });
     */
    getMetadata: true,

    /**
     * Set the metadata for this Table. This can be useful for updating table
     * labels.
     *
     * @see [Tables: patch API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tables/patch}
     *
     * @method Table#setMetadata
     * @param {object} metadata Metadata to save on the Table.
     * @param {function} [callback] The callback function.
     * @param {?error} callback.err An error returned while making this
     *     request.
     * @param {object} callback.apiResponse The full API response.
     * @returns {Promise}
     *
     * @example
     * const BigQuery = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('my-dataset');
     *
     * const table = dataset.table('my-table');
     *
     * const metadata = {
     *   labels: {
     *     foo: 'bar'
     *   }
     * };
     *
     * table.setMetadata(metadata, function(err, apiResponse) {});
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * table.setMetadata(metadata).then(function(data) {
     *   const apiResponse = data[0];
     * });
     */
    setMetadata: true,
  };

  common.ServiceObject.call(this, {
    parent: dataset,
    baseUrl: '/tables',
    id: id,
    createMethod: dataset.createTable.bind(dataset),
    methods: methods,
  });

  this.bigQuery = dataset.bigQuery;
  this.dataset = dataset;

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

util.inherits(Table, common.ServiceObject);

/**
 * Convert a comma-separated name:type string to a table schema object.
 *
 * @static
 * @private
 *
 * @param {string} str Comma-separated schema string.
 * @returns {object} Table schema in the format the API expects.
 */
Table.createSchemaFromString_ = function(str) {
  return str.split(/\s*,\s*/).reduce(
    function(acc, pair) {
      acc.fields.push({
        name: pair.split(':')[0],
        type: (pair.split(':')[1] || 'STRING').toUpperCase(),
      });

      return acc;
    },
    {
      fields: [],
    }
  );
};

/**
 * Convert a row entry from native types to their encoded types that the API
 * expects.
 *
 * @static
 * @private
 *
 * @param {*} value The value to be converted.
 * @returns {*} The converted value.
 */
Table.encodeValue_ = function(value) {
  if (is.undefined(value) || is.null(value)) {
    return null;
  }

  if (value instanceof Buffer) {
    return value.toString('base64');
  }

  var customTypeConstructorNames = [
    'BigQueryDate',
    'BigQueryDatetime',
    'BigQueryTime',
    'BigQueryTimestamp',
  ];
  var constructorName = value.constructor.name;
  var isCustomType = customTypeConstructorNames.indexOf(constructorName) > -1;

  if (isCustomType) {
    return value.value;
  }

  if (is.date(value)) {
    return value.toJSON();
  }

  if (is.array(value)) {
    return value.map(Table.encodeValue_);
  }

  if (is.object(value)) {
    return Object.keys(value).reduce(function(acc, key) {
      acc[key] = Table.encodeValue_(value[key]);
      return acc;
    }, {});
  }

  return value;
};

/**
 * @private
 */
Table.formatMetadata_ = function(options) {
  var body = extend(true, {}, options);

  if (options.name) {
    body.friendlyName = options.name;
    delete body.name;
  }

  if (is.string(options.schema)) {
    body.schema = Table.createSchemaFromString_(options.schema);
  }

  if (is.array(options.schema)) {
    body.schema = {
      fields: options.schema,
    };
  }

  if (body.schema && body.schema.fields) {
    body.schema.fields = body.schema.fields.map(function(field) {
      if (field.fields) {
        field.type = 'RECORD';
      }

      return field;
    });
  }

  if (is.string(body.partitioning)) {
    body.timePartitioning = {
      type: body.partitioning.toUpperCase(),
    };
  }

  if (is.string(body.view)) {
    body.view = {
      query: body.view,
      useLegacySql: false,
    };
  }

  return body;
};

/**
 * Copy data from one table to another, optionally creating that table.
 *
 * @param {Table} destination The destination table.
 * @param {object} [metadata] Metadata to set with the copy operation. The
 *     metadata object should be in the format of the
 *     [`configuration.copy`](http://goo.gl/dKWIyS) property of a Jobs resource.
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request
 * @param {object} callback.apiResponse The full API response.
 * @returns {Promise}
 *
 * @throws {Error} If a destination other than a Table object is provided.
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 *
 * const table = dataset.table('my-table');
 * const yourTable = dataset.table('your-table');
 *
 * table.copy(yourTable, function(err, apiResponse) {});
 *
 * //-
 * // See the <a href="http://goo.gl/dKWIyS">`configuration.copy`</a> object for
 * // all available options.
 * //-
 * const metadata = {
 *   createDisposition: 'CREATE_NEVER',
 *   writeDisposition: 'WRITE_TRUNCATE'
 * };
 *
 * table.copy(yourTable, metadata, function(err, apiResponse) {});
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * table.copy(yourTable, metadata).then(function(data) {
 *   const apiResponse = data[0];
 * });
 */
Table.prototype.copy = function(destination, metadata, callback) {
  if (is.fn(metadata)) {
    callback = metadata;
    metadata = {};
  }

  this.createCopyJob(destination, metadata, function(err, job, resp) {
    if (err) {
      callback(err, resp);
      return;
    }

    job.on('error', callback).on('complete', function(metadata) {
      callback(null, metadata);
    });
  });
};

/**
 * Copy data from multiple tables into this table.
 *
 * @param {Table|Table[]} sourceTables The
 *     source table(s) to copy data from.
 * @param {object=} metadata Metadata to set with the copy operation. The
 *     metadata object should be in the format of the
 *     [`configuration.copy`](http://goo.gl/dKWIyS) property of a Jobs resource.
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request
 * @param {object} callback.apiResponse The full API response.
 * @returns {Promise}
 *
 * @throws {Error} If a source other than a Table object is provided.
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * const sourceTables = [
 *   dataset.table('your-table'),
 *   dataset.table('your-second-table')
 * ];
 *
 * table.copyFrom(sourceTables, function(err, apiResponse) {});
 *
 * //-
 * // See the <a href="http://goo.gl/dKWIyS">`configuration.copy`</a> object for
 * // all available options.
 * //-
 * const metadata = {
 *   createDisposition: 'CREATE_NEVER',
 *   writeDisposition: 'WRITE_TRUNCATE'
 * };
 *
 * table.copyFrom(sourceTables, metadata, function(err, apiResponse) {});
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * table.copyFrom(sourceTables, metadata).then(function(data) {
 *   const apiResponse = data[0];
 * });
 */
Table.prototype.copyFrom = function(sourceTables, metadata, callback) {
  if (is.fn(metadata)) {
    callback = metadata;
    metadata = {};
  }

  this.createCopyFromJob(sourceTables, metadata, function(err, job, resp) {
    if (err) {
      callback(err, resp);
      return;
    }

    job.on('error', callback).on('complete', function(metadata) {
      callback(null, metadata);
    });
  });
};

/**
 * Copy data from one table to another, optionally creating that table.
 *
 * @see [Jobs: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert}
 *
 * @param {Table} destination The destination table.
 * @param {object} [metadata] Metadata to set with the copy operation. The
 *     metadata object should be in the format of the
 *     [`configuration.copy`](http://goo.gl/dKWIyS) property of a Jobs resource.
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request
 * @param {Job} callback.job The job used to copy your table.
 * @param {object} callback.apiResponse The full API response.
 * @returns {Promise}
 *
 * @throws {Error} If a destination other than a Table object is provided.
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * const yourTable = dataset.table('your-table');
 * table.createCopyJob(yourTable, function(err, job, apiResponse) {
 *   // `job` is a Job object that can be used to check the status of the
 *   // request.
 * });
 *
 * //-
 * // See the <a href="http://goo.gl/dKWIyS">`configuration.copy`</a> object for
 * // all available options.
 * //-
 * const metadata = {
 *   createDisposition: 'CREATE_NEVER',
 *   writeDisposition: 'WRITE_TRUNCATE'
 * };
 *
 * table.createCopyJob(yourTable, metadata, function(err, job, apiResponse) {});
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * table.createCopyJob(yourTable, metadata).then(function(data) {
 *   const job = data[0];
 *   const apiResponse = data[1];
 * });
 */
Table.prototype.createCopyJob = function(destination, metadata, callback) {
  if (!(destination instanceof Table)) {
    throw new Error('Destination must be a Table object.');
  }

  if (is.fn(metadata)) {
    callback = metadata;
    metadata = {};
  }

  var body = {
    configuration: {
      copy: extend(true, metadata, {
        destinationTable: {
          datasetId: destination.dataset.id,
          projectId: destination.bigQuery.projectId,
          tableId: destination.id,
        },
        sourceTable: {
          datasetId: this.dataset.id,
          projectId: this.bigQuery.projectId,
          tableId: this.id,
        },
      }),
    },
  };

  if (metadata.jobPrefix) {
    body.jobPrefix = metadata.jobPrefix;
    delete metadata.jobPrefix;
  }

  this.bigQuery.createJob(body, callback);
};

/**
 * Copy data from multiple tables into this table.
 *
 * @see [Jobs: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert}
 *
 * @param {Table|Table[]} sourceTables The
 *     source table(s) to copy data from.
 * @param {object} [metadata] Metadata to set with the copy operation. The
 *     metadata object should be in the format of the
 *     [`configuration.copy`](http://goo.gl/dKWIyS) property of a Jobs resource.
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request
 * @param {Job} callback.job The job used to copy your table.
 * @param {object} callback.apiResponse The full API response.
 * @returns {Promise}
 *
 * @throws {Error} If a source other than a Table object is provided.
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * const sourceTables = [
 *   dataset.table('your-table'),
 *   dataset.table('your-second-table')
 * ];
 *
 * const callback = function(err, job, apiResponse) {
 *   // `job` is a Job object that can be used to check the status of the
 *   // request.
 * };
 *
 * table.createCopyFromJob(sourceTables, callback);
 *
 * //-
 * // See the <a href="http://goo.gl/dKWIyS">`configuration.copy`</a> object for
 * // all available options.
 * //-
 * const metadata = {
 *   createDisposition: 'CREATE_NEVER',
 *   writeDisposition: 'WRITE_TRUNCATE'
 * };
 *
 * table.createCopyFromJob(sourceTables, metadata, callback);
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * table.createCopyFromJob(sourceTables, metadata).then(function(data) {
 *   const job = data[0];
 *   const apiResponse = data[1];
 * });
 */
Table.prototype.createCopyFromJob = function(sourceTables, metadata, callback) {
  sourceTables = arrify(sourceTables);

  sourceTables.forEach(function(sourceTable) {
    if (!(sourceTable instanceof Table)) {
      throw new Error('Source must be a Table object.');
    }
  });

  if (is.fn(metadata)) {
    callback = metadata;
    metadata = {};
  }

  var body = {
    configuration: {
      copy: extend(true, metadata, {
        destinationTable: {
          datasetId: this.dataset.id,
          projectId: this.bigQuery.projectId,
          tableId: this.id,
        },

        sourceTables: sourceTables.map(function(sourceTable) {
          return {
            datasetId: sourceTable.dataset.id,
            projectId: sourceTable.bigQuery.projectId,
            tableId: sourceTable.id,
          };
        }),
      }),
    },
  };

  if (metadata.jobPrefix) {
    body.jobPrefix = metadata.jobPrefix;
    delete metadata.jobPrefix;
  }

  this.bigQuery.createJob(body, callback);
};

/**
 * Export table to Cloud Storage.
 *
 * @see [Jobs: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert}
 *
 * @param {string|File} destination Where the file should be exported
 *     to. A string or a {@link https://cloud.google.com/nodejs/docs/reference/storage/latest/File File} object.
 * @param {object=} options - The configuration object.
 * @param {string} options.format - The format to export the data in. Allowed
 *     options are "CSV", "JSON", or "AVRO". Default: "CSV".
 * @param {boolean} options.gzip - Specify if you would like the file compressed
 *     with GZIP. Default: false.
 * @param {function} callback - The callback function.
 * @param {?error} callback.err - An error returned while making this request
 * @param {Job} callback.job - The job used to export the table.
 * @param {object} callback.apiResponse - The full API response.
 *
 * @throws {Error} If destination isn't a File object.
 * @throws {Error} If destination format isn't recongized.
 *
 * @example
 * const Storage = require('@google-cloud/storage');
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * const storage = new Storage({
 *   projectId: 'grape-spaceship-123'
 * });
 * const extractedFile = storage.bucket('institutions').file('2014.csv');
 *
 * function callback(err, job, apiResponse) {
 *   // `job` is a Job object that can be used to check the status of the
 *   // request.
 * }
 *
 * //-
 * // To use the default options, just pass a {@link https://cloud.google.com/nodejs/docs/reference/storage/latest/File File} object.
 * //
 * // Note: The exported format type will be inferred by the file's extension.
 * // If you wish to override this, or provide an array of destination files,
 * // you must provide an `options` object.
 * //-
 * table.createExtractJob(extractedFile, callback);
 *
 * //-
 * // If you need more customization, pass an `options` object.
 * //-
 * const options = {
 *   format: 'json',
 *   gzip: true
 * };
 *
 * table.createExtractJob(extractedFile, options, callback);
 *
 * //-
 * // You can also specify multiple destination files.
 * //-
 * table.createExtractJob([
 *   storage.bucket('institutions').file('2014.json'),
 *   storage.bucket('institutions-copy').file('2014.json')
 * ], options, callback);
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * table.createExtractJob(extractedFile, options).then(function(data) {
 *   const job = data[0];
 *   const apiResponse = data[1];
 * });
 */
Table.prototype.createExtractJob = function(destination, options, callback) {
  if (is.fn(options)) {
    callback = options;
    options = {};
  }

  options = extend(true, options, {
    destinationUris: arrify(destination).map(function(dest) {
      if (!common.util.isCustomType(dest, 'storage/file')) {
        throw new Error('Destination must be a File object.');
      }

      // If no explicit format was provided, attempt to find a match from the
      // file's extension. If no match, don't set, and default upstream to CSV.
      var format = path
        .extname(dest.name)
        .substr(1)
        .toLowerCase();
      if (!options.destinationFormat && !options.format && FORMATS[format]) {
        options.destinationFormat = FORMATS[format];
      }

      return 'gs://' + dest.bucket.name + '/' + dest.name;
    }),
  });

  if (options.format) {
    options.format = options.format.toLowerCase();

    if (FORMATS[options.format]) {
      options.destinationFormat = FORMATS[options.format];
      delete options.format;
    } else {
      throw new Error('Destination format not recognized: ' + options.format);
    }
  }

  if (options.gzip) {
    options.compression = 'GZIP';
    delete options.gzip;
  }

  var body = {
    configuration: {
      extract: extend(true, options, {
        sourceTable: {
          datasetId: this.dataset.id,
          projectId: this.bigQuery.projectId,
          tableId: this.id,
        },
      }),
    },
  };

  if (options.jobPrefix) {
    body.jobPrefix = options.jobPrefix;
    delete options.jobPrefix;
  }

  this.bigQuery.createJob(body, callback);
};

/**
 * Load data from a local file or Storage {@link https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}.
 *
 * By loading data this way, you create a load job that will run your data load
 * asynchronously. If you would like instantaneous access to your data, insert
 * it using {@liink Table#insert}.
 *
 * Note: The file type will be inferred by the given file's extension. If you
 * wish to override this, you must provide `metadata.format`.
 *
 * @see [Jobs: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert}
 *
 * @param {string|File} source The source file to import. A string or a
 *     {@link https://cloud.google.com/nodejs/docs/reference/storage/latest/File File} object.
 * @param {object} [metadata] Metadata to set with the load operation. The
 *     metadata object should be in the format of the
 *     [`configuration.load`](http://goo.gl/BVcXk4) property of a Jobs resource.
 * @param {string} [metadata.format] The format the data being imported is in.
 *     Allowed options are "CSV", "JSON", or "AVRO".
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request
 * @param {Job} callback.job The job used to import your data.
 * @param {object} callback.apiResponse The full API response.
 * @returns {Promise}
 *
 * @throws {Error} If the source isn't a string file name or a File instance.
 *
 * @example
 * const Storage = require('@google-cloud/storage');
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * //-
 * // Load data from a local file.
 * //-
 * const callback = function(err, job, apiResponse) {
 *   // `job` is a Job object that can be used to check the status of the
 *   // request.
 * };
 *
 * table.createLoadJob('./institutions.csv', callback);
 *
 * //-
 * // You may also pass in metadata in the format of a Jobs resource. See
 * // (http://goo.gl/BVcXk4) for a full list of supported values.
 * //-
 * const metadata = {
 *   encoding: 'ISO-8859-1',
 *   sourceFormat: 'NEWLINE_DELIMITED_JSON'
 * };
 *
 * table.createLoadJob('./my-data.csv', metadata, callback);
 *
 * //-
 * // Load data from a file in your Cloud Storage bucket.
 * //-
 * const storage = new Storage({
 *   projectId: 'grape-spaceship-123'
 * });
 * const data = storage.bucket('institutions').file('data.csv');
 * table.createLoadJob(data, callback);
 *
 * //-
 * // Load data from multiple files in your Cloud Storage bucket(s).
 * //-
 * table.createLoadJob([
 *   storage.bucket('institutions').file('2011.csv'),
 *   storage.bucket('institutions').file('2012.csv')
 * ], callback);
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * table.createLoadJob(data).then(function(data) {
 *   const job = data[0];
 *   const apiResponse = data[1];
 * });
 */
Table.prototype.createLoadJob = function(source, metadata, callback) {
  if (is.fn(metadata)) {
    callback = metadata;
    metadata = {};
  }

  callback = callback || common.util.noop;
  metadata = metadata || {};

  if (metadata.format) {
    metadata.sourceFormat = FORMATS[metadata.format.toLowerCase()];
    delete metadata.format;
  }

  if (is.string(source)) {
    // A path to a file was given. If a sourceFormat wasn't specified, try to
    // find a match from the file's extension.
    var detectedFormat =
      FORMATS[
        path
          .extname(source)
          .substr(1)
          .toLowerCase()
      ];
    if (!metadata.sourceFormat && detectedFormat) {
      metadata.sourceFormat = detectedFormat;
    }

    // Read the file into a new write stream.
    return fs
      .createReadStream(source)
      .pipe(this.createWriteStream(metadata))
      .on('error', callback)
      .on('complete', function(job) {
        callback(null, job, job.metadata);
      });
  }

  var body = {
    configuration: {
      load: {
        destinationTable: {
          projectId: this.bigQuery.projectId,
          datasetId: this.dataset.id,
          tableId: this.id,
        },
      },
    },
  };

  if (metadata.jobPrefix) {
    body.jobPrefix = metadata.jobPrefix;
    delete metadata.jobPrefix;
  }

  extend(true, body.configuration.load, metadata, {
    sourceUris: arrify(source).map(function(src) {
      if (!common.util.isCustomType(src, 'storage/file')) {
        throw new Error('Source must be a File object.');
      }

      // If no explicit format was provided, attempt to find a match from
      // the file's extension. If no match, don't set, and default upstream
      // to CSV.
      var format =
        FORMATS[
          path
            .extname(src.name)
            .substr(1)
            .toLowerCase()
        ];
      if (!metadata.sourceFormat && format) {
        body.configuration.load.sourceFormat = format;
      }

      return 'gs://' + src.bucket.name + '/' + src.name;
    }),
  });

  this.bigQuery.createJob(body, callback);
};

/**
 * Run a query as a job. No results are immediately returned. Instead, your
 * callback will be executed with a {@link Job} object that you must
 * ping for the results. See the Job documentation for explanations of how to
 * check on the status of the job.
 *
 * See {@link BigQuery#createQueryJob} for full documentation of this method.
 */
Table.prototype.createQueryJob = function(options, callback) {
  return this.dataset.createQueryJob(options, callback);
};

/**
 * Run a query scoped to your dataset as a readable object stream.
 *
 * See {@link BigQuery#createQueryStream} for full documentation of this
 * method.
 *
 * @param {object} query See {@link BigQuery#createQueryStream} for full
 *     documentation of this method.
 * @returns {stream} See {@link BigQuery#createQueryStream} for full
 *     documentation of this method.
 */
Table.prototype.createQueryStream = function(query) {
  return this.dataset.createQueryStream(query);
};

/**
 * Create a readable stream of the rows of data in your table. This method is
 * simply a wrapper around {@link Table#getRows}.
 *
 * @see [Tabledata: list API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tabledata/list}
 *
 * @returns {ReadableStream}
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * table.createReadStream(options)
 *   .on('error', console.error)
 *   .on('data', function(row) {})
 *   .on('end', function() {
 *     // All rows have been retrieved.
 *   });
 *
 * //-
 * // If you anticipate many results, you can end a stream early to prevent
 * // unnecessary processing and API requests.
 * //-
 * table.createReadStream()
 *   .on('data', function(row) {
 *     this.end();
 *   });
 */
Table.prototype.createReadStream = common.paginator.streamify('getRows');

/**
 * Load data into your table from a readable stream of JSON, CSV, or
 * AVRO data.
 *
 * @see [Jobs: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert}
 *
 * @param {string|object} [metadata] Metadata to set with the load operation.
 *     The metadata object should be in the format of the
 *     [`configuration.load`](http://goo.gl/BVcXk4) property of a Jobs resource.
 *     If a string is given, it will be used as the filetype.
 * @returns {WritableStream}
 *
 * @throws {Error} If source format isn't recognized.
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * //-
 * // Load data from a CSV file.
 * //-
 * const request = require('request');
 *
 * const csvUrl = 'http://goo.gl/kSE7z6';
 *
 * const metadata = {
 *   allowJaggedRows: true,
 *   skipLeadingRows: 1
 * };
 *
 * request.get(csvUrl)
 *   .pipe(table.createWriteStream(metadata))
 *   .on('complete', function(job) {
 *     // `job` is a Job object that can be used to check the status of the
 *     // request.
 *   });
 *
 * //-
 * // Load data from a JSON file.
 * //-
 * const fs = require('fs');
 *
 * fs.createReadStream('./test/testdata/testfile.json')
 *   .pipe(table.createWriteStream('json'))
 *   .on('complete', function(job) {});
 */
Table.prototype.createWriteStream = function(metadata) {
  var self = this;

  metadata = metadata || {};

  var fileTypes = Object.keys(FORMATS).map(function(key) {
    return FORMATS[key];
  });

  if (is.string(metadata)) {
    metadata = {
      sourceFormat: FORMATS[metadata.toLowerCase()],
    };
  }

  if (is.string(metadata.schema)) {
    metadata.schema = Table.createSchemaFromString_(metadata.schema);
  }

  extend(true, metadata, {
    destinationTable: {
      projectId: self.bigQuery.projectId,
      datasetId: self.dataset.id,
      tableId: self.id,
    },
  });

  var jobId = uuid.v4();

  if (metadata.jobPrefix) {
    jobId = metadata.jobPrefix + jobId;
    delete metadata.jobPrefix;
  }

  if (
    metadata.hasOwnProperty('sourceFormat') &&
    fileTypes.indexOf(metadata.sourceFormat) < 0
  ) {
    throw new Error('Source format not recognized: ' + metadata.sourceFormat);
  }

  var dup = streamEvents(duplexify());

  dup.once('writing', function() {
    common.util.makeWritableStream(
      dup,
      {
        makeAuthenticatedRequest: self.bigQuery.makeAuthenticatedRequest,
        metadata: {
          configuration: {
            load: metadata,
          },
          jobReference: {
            jobId: jobId,
            projectId: self.bigQuery.projectId,
          },
        },
        request: {
          uri: format('{base}/{projectId}/jobs', {
            base: 'https://www.googleapis.com/upload/bigquery/v2/projects',
            projectId: self.bigQuery.projectId,
          }),
        },
      },
      function(data) {
        var job = self.bigQuery.job(data.jobReference.jobId);
        job.metadata = data;

        dup.emit('complete', job);
      }
    );
  });

  return dup;
};

/**
 * Export table to Cloud Storage.
 *
 * @param {string|File} destination Where the file should be exported
 *     to. A string or a {@link https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}.
 * @param {object} [options] The configuration object.
 * @param {string} [options.format] The format to export the data in. Allowed
 *     options are "CSV", "JSON", or "AVRO". Default: "CSV".
 * @param {boolean} [options.gzip] Specify if you would like the file compressed
 *     with GZIP. Default: false.
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request
 * @param {object} callback.apiResponse The full API response.
 * @returns {Promise}
 *
 * @throws {Error} If destination isn't a File object.
 * @throws {Error} If destination format isn't recongized.
 *
 * @example
 * const Storage = require('@google-cloud/storage');
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * const storage = new Storage({
 *   projectId: 'grape-spaceship-123'
 * });
 * var extractedFile = storage.bucket('institutions').file('2014.csv');
 *
 * //-
 * // To use the default options, just pass a {@link https://cloud.google.com/nodejs/docs/reference/storage/latest/File File} object.
 * //
 * // Note: The exported format type will be inferred by the file's extension.
 * // If you wish to override this, or provide an array of destination files,
 * // you must provide an `options` object.
 * //-
 * table.extract(extractedFile, function(err, apiResponse) {});
 *
 * //-
 * // If you need more customization, pass an `options` object.
 * //-
 * var options = {
 *   format: 'json',
 *   gzip: true
 * };
 *
 * table.extract(extractedFile, options, function(err, apiResponse) {});
 *
 * //-
 * // You can also specify multiple destination files.
 * //-
 * table.extract([
 *   storage.bucket('institutions').file('2014.json'),
 *   storage.bucket('institutions-copy').file('2014.json')
 * ], options, function(err, apiResponse) {});
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * table.extract(extractedFile, options).then(function(data) {
 *   var apiResponse = data[0];
 * });
 */
Table.prototype.extract = function(destination, options, callback) {
  if (is.fn(options)) {
    callback = options;
    options = {};
  }

  this.createExtractJob(destination, options, function(err, job, resp) {
    if (err) {
      callback(err, resp);
      return;
    }

    job.on('error', callback).on('complete', function(metadata) {
      callback(null, metadata);
    });
  });
};

/**
 * Retrieves table data from a specified set of rows. The rows are returned to
 * your callback as an array of objects matching your table's schema.
 *
 * @see [Tabledata: list API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tabledata/list}
 *
 * @param {object} [options] The configuration object.
 * @param {boolean} [options.autoPaginate=true] Have pagination handled
 *     automatically.
 * @param {number} [options.maxApiCalls] Maximum number of API calls to make.
 * @param {number} [options.maxResults] Maximum number of results to return.
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request
 * @param {array} callback.rows The table data from specified set of rows.
 * @returns {Promise}
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * table.getRows(function(err, rows) {
 *   if (!err) {
 *     // rows is an array of results.
 *   }
 * });
 *
 * //-
 * // To control how many API requests are made and page through the results
 * // manually, set `autoPaginate` to `false`.
 * //-
 * function manualPaginationCallback(err, rows, nextQuery, apiResponse) {
 *   if (nextQuery) {
 *     // More results exist.
 *     table.getRows(nextQuery, manualPaginationCallback);
 *   }
 * }
 *
 * table.getRows({
 *   autoPaginate: false
 * }, manualPaginationCallback);
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * table.getRows().then(function(data) {
 *   const rows = data[0];
});
 */
Table.prototype.getRows = function(options, callback) {
  var self = this;

  if (is.fn(options)) {
    callback = options;
    options = {};
  }

  this.request(
    {
      uri: '/data',
      qs: options,
    },
    function(err, resp) {
      if (err) {
        onComplete(err, null, null, resp);
        return;
      }

      var nextQuery = null;

      if (resp.pageToken) {
        nextQuery = extend({}, options, {
          pageToken: resp.pageToken,
        });
      }

      if (resp.rows && resp.rows.length > 0 && !self.metadata.schema) {
        // We don't know the schema for this table yet. Do a quick stat.
        self.getMetadata(function(err, metadata, apiResponse) {
          if (err) {
            onComplete(err, null, null, apiResponse);
            return;
          }

          onComplete(null, resp.rows, nextQuery, resp);
        });

        return;
      }

      onComplete(null, resp.rows, nextQuery, resp);
    }
  );

  function onComplete(err, rows, nextQuery, resp) {
    if (err) {
      callback(err, null, null, resp);
      return;
    }

    rows = self.bigQuery.mergeSchemaWithRows_(self.metadata.schema, rows || []);
    callback(null, rows, nextQuery, resp);
  }
};

/**
 * Stream data into BigQuery one record at a time without running a load job.
 *
 * There are more strict quota limits using this method so it is highly
 * recommended that you load data into BigQuery using
 * {@link Table#import} instead.
 *
 * @see [Tabledata: insertAll API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tabledata/insertAll}
 * @see [Troubleshooting Errors]{@link https://developers.google.com/bigquery/troubleshooting-errors}
 *
 * @param {object|object[]} rows The rows to insert into the table.
 * @param {object} [options] Configuration object.
 * @param {boolean} [options.autoCreate] Automatically create the table if it
 *     doesn't already exist. In order for this to succeed the `schema` option
 *     must also be set. Note that this can take longer than 2 minutes to
 *     complete.
 * @param {boolean} [options.ignoreUnknownValues=false] Accept rows that contain
 *     values that do not match the schema. The unknown values are ignored.
 * @param {boolean} [options.raw] If `true`, the `rows` argument is expected to
 *     be formatted as according to the
 *     [specification](https://cloud.google.com/bigquery/docs/reference/v2/tabledata/insertAll).
 * @param {string|object} [options.schema] A comma-separated list of name:type
 *     pairs. Valid types are "string", "integer", "float", "boolean", and
 *     "timestamp". If the type is omitted, it is assumed to be "string".
 *     Example: "name:string, age:integer". Schemas can also be specified as a
 *     JSON array of fields, which allows for nested and repeated fields. See
 *     a [Table resource](http://goo.gl/sl8Dmg) for more detailed information.
 * @param {boolean} [options.skipInvalidRows=false] Insert all valid rows of a
 *     request, even if invalid rows exist.
 * @param {string} [options.templateSuffix] Treat the destination table as a
 *     base template, and insert the rows into an instance table named
 *     "{destination}{templateSuffix}". BigQuery will manage creation of
 *     the instance table, using the schema of the base template table. See
 *     [Automatic table creation using template tables](https://cloud.google.com/bigquery/streaming-data-into-bigquery#template-tables)
 *     for considerations when working with templates tables.
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request.
 * @param {object[]} callback.err.errors If present, these represent partial
 *     failures. It's possible for part of your request to be completed
 *     successfully, while the other part was not.
 * @param {object} callback.apiResponse The full API response.
 * @returns {Promise}
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * //-
 * // Insert a single row.
 * //-
 * table.insert({
 *   INSTNM: 'Motion Picture Institute of Michigan',
 *   CITY: 'Troy',
 *   STABBR: 'MI'
 * }, insertHandler);
 *
 * //-
 * // Insert multiple rows at a time.
 * //-
 * var rows = [
 *   {
 *     INSTNM: 'Motion Picture Institute of Michigan',
 *     CITY: 'Troy',
 *     STABBR: 'MI'
 *   },
 *   // ...
 * ];
 *
 * table.insert(rows, insertHandler);
 *
 * //-
 * // Insert a row as according to the <a href="https://cloud.google.com/bigquery/docs/reference/v2/tabledata/insertAll">
 * // specification</a>.
 * //-
 * var row = {
 *   insertId: '1',
 *   json: {
 *     INSTNM: 'Motion Picture Institute of Michigan',
 *     CITY: 'Troy',
 *     STABBR: 'MI'
 *   }
 * };
 *
 * var options = {
 *   raw: true
 * };
 *
 * table.insert(row, options, insertHandler);
 *
 * //-
 * // Handling the response. See <a href="https://developers.google.com/bigquery/troubleshooting-errors">
 * // Troubleshooting Errors</a> for best practices on how to handle errors.
 * //-
 * function insertHandler(err, apiResponse) {
 *   if (err) {
 *     // An API error or partial failure occurred.
 *
 *     if (err.name === 'PartialFailureError') {
 *       // Some rows failed to insert, while others may have succeeded.
 *
 *       // err.errors (object[]):
 *       // err.errors[].row (original row object passed to `insert`)
 *       // err.errors[].errors[].reason
 *       // err.errors[].errors[].message
 *     }
 *   }
 * }
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * table.insert(rows)
 *   .then(function(data) {
 *     var apiResponse = data[0];
 *   })
 *   .catch(function(err) {
 *     // An API error or partial failure occurred.
 *
 *     if (err.name === 'PartialFailureError') {
 *       // Some rows failed to insert, while others may have succeeded.
 *
 *       // err.errors (object[]):
 *       // err.errors[].row (original row object passed to `insert`)
 *       // err.errors[].errors[].reason
 *       // err.errors[].errors[].message
 *     }
 *   });
 */
Table.prototype.insert = function(rows, options, callback) {
  var self = this;

  if (is.fn(options)) {
    callback = options;
    options = {};
  }

  rows = arrify(rows);

  if (!rows.length) {
    throw new Error('You must provide at least 1 row to be inserted.');
  }

  var json = extend(true, {}, options, {
    rows: rows,
  });

  if (!options.raw) {
    json.rows = arrify(rows).map(function(row) {
      return {
        insertId: uuid.v4(),
        json: Table.encodeValue_(row),
      };
    });
  }

  delete json.raw;

  var autoCreate = !!options.autoCreate;
  var schema;

  delete json.autoCreate;

  if (autoCreate) {
    if (!options.schema) {
      throw new Error('Schema must be provided in order to auto-create Table.');
    }

    schema = options.schema;
    delete json.schema;
  }

  this.request(
    {
      method: 'POST',
      uri: '/insertAll',
      json: json,
    },
    function(err, resp) {
      if (err) {
        if (err.code === 404 && autoCreate) {
          setTimeout(createTableAndRetry, Math.random() * 60000);
        } else {
          callback(err, resp);
        }
        return;
      }

      var partialFailures = (resp.insertErrors || []).map(function(
        insertError
      ) {
        return {
          errors: insertError.errors.map(function(error) {
            return {
              message: error.message,
              reason: error.reason,
            };
          }),
          row: rows[insertError.index],
        };
      });

      if (partialFailures.length > 0) {
        err = new common.util.PartialFailureError({
          errors: partialFailures,
          response: resp,
        });
      }

      callback(err, resp);
    }
  );

  function createTableAndRetry() {
    self.create(
      {
        schema: schema,
      },
      function(err, table, resp) {
        if (err && err.code !== 409) {
          callback(err, resp);
          return;
        }

        setTimeout(function() {
          self.insert(rows, options, callback);
        }, 60000);
      }
    );
  }
};

/**
 * Load data from a local file or Storage {@link https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}.
 *
 * By loading data this way, you create a load job that will run your data load
 * asynchronously. If you would like instantaneous access to your data, insert
 * it using {@link Table#insert}.
 *
 * Note: The file type will be inferred by the given file's extension. If you
 * wish to override this, you must provide `metadata.format`.
 *
 * @param {string|File} source The source file to import. A string or a
 *     {@link https://cloud.google.com/nodejs/docs/reference/storage/latest/File File} object.
 * @param {object} [metadata] Metadata to set with the load operation. The
 *     metadata object should be in the format of the
 *     [`configuration.load`](http://goo.gl/BVcXk4) property of a Jobs resource.
 * @param {string} [metadata.format] The format the data being imported is in.
 *     Allowed options are "CSV", "JSON", or "AVRO".
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request
 * @param {object} callback.apiResponse The full API response.
 * @returns {Promise}
 *
 * @throws {Error} If the source isn't a string file name or a File instance.
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * //-
 * // Load data from a local file.
 * //-
 * table.load('./institutions.csv', function(err, apiResponse) {});
 *
 * //-
 * // You may also pass in metadata in the format of a Jobs resource. See
 * // (http://goo.gl/BVcXk4) for a full list of supported values.
 * //-
 * var metadata = {
 *   encoding: 'ISO-8859-1',
 *   sourceFormat: 'NEWLINE_DELIMITED_JSON'
 * };
 *
 * table.load('./my-data.csv', metadata, function(err, apiResponse) {});
 *
 * //-
 * // Load data from a file in your Cloud Storage bucket.
 * //-
 * var gcs = require('@google-cloud/storage')({
 *   projectId: 'grape-spaceship-123'
 * });
 * var data = gcs.bucket('institutions').file('data.csv');
 * table.load(data, function(err, apiResponse) {});
 *
 * //-
 * // Load data from multiple files in your Cloud Storage bucket(s).
 * //-
 * table.load([
 *   gcs.bucket('institutions').file('2011.csv'),
 *   gcs.bucket('institutions').file('2012.csv')
 * ], function(err, apiResponse) {});
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * table.load(data).then(function(data) {
 *   var apiResponse = data[0];
 * });
 */
Table.prototype.load = function(source, metadata, callback) {
  if (is.fn(metadata)) {
    callback = metadata;
    metadata = {};
  }

  this.createLoadJob(source, metadata, function(err, job, resp) {
    if (err) {
      callback(err, resp);
      return;
    }

    job.on('error', callback).on('complete', function(metadata) {
      callback(null, metadata);
    });
  });
};

/**
 * Run a query scoped to your dataset.
 *
 * See {@link BigQuery#query} for full documentation of this method.
 * @param {object} query See {@link BigQuery#query} for full documentation of this method.
 * @param {function} [callback] See {@link BigQuery#query} for full documentation of this method.
 * @returns {Promise}
 */
Table.prototype.query = function(query, callback) {
  this.dataset.query(query, callback);
};

/**
 * Set the metadata on the table.
 *
 * @see [Tables: update API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tables/update}
 *
 * @param {object} metadata The metadata key/value object to set.
 * @param {string} metadata.description A user-friendly description of the
 *     table.
 * @param {string} metadata.name A descriptive name for the table.
 * @param {string|object} metadata.schema A comma-separated list of name:type
 *     pairs. Valid types are "string", "integer", "float", "boolean", "bytes",
 *     "record", and "timestamp". If the type is omitted, it is assumed to be
 *     "string". Example: "name:string, age:integer". Schemas can also be
 *     specified as a JSON array of fields, which allows for nested and repeated
 *     fields. See a [Table resource](http://goo.gl/sl8Dmg) for more detailed
 *     information.
 * @param {function} [callback] The callback function.
 * @param {?error} callback.err An error returned while making this request.
 * @param {object} callback.apiResponse The full API response.
 * @returns {Promise}
 *
 * @example
 * const BigQuery = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 * const table = bigquery.table('my-table');
 *
 * const metadata = {
 *   name: 'My recipes',
 *   description: 'A table for storing my recipes.',
 *   schema: 'name:string, servings:integer, cookingTime:float, quick:boolean'
 * };
 *
 * table.setMetadata(metadata, function(err, metadata, apiResponse) {});
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * table.setMetadata(metadata).then(function(data) {
 *   const metadata = data[0];
 *   const apiResponse = data[1];
 * });
 */
Table.prototype.setMetadata = function(metadata, callback) {
  var body = Table.formatMetadata_(metadata);

  common.ServiceObject.prototype.setMetadata.call(this, body, callback);
};

/*! Developer Documentation
 *
 * These methods can be auto-paginated.
 */
common.paginator.extend(Table, ['getRows']);

/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
common.util.promisifyAll(Table);

/**
 * Reference to the {@link Table} class.
 * @name module:@google-cloud/bigquery.Table
 * @see Table
 */
module.exports = Table;

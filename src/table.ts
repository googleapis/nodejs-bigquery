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

import * as common from '@google-cloud/common';
import {paginator, ResourceStream} from '@google-cloud/paginator';
import {promisifyAll} from '@google-cloud/promisify';
import arrify = require('arrify');
import Big from 'big.js';
import * as extend from 'extend';
import pEvent from 'p-event';
import * as fs from 'fs';
import * as is from 'is';
import * as path from 'path';
import * as streamEvents from 'stream-events';
import * as uuid from 'uuid';
import {
  BigQuery,
  Job,
  Dataset,
  Query,
  SimpleQueryRowsResponse,
  SimpleQueryRowsCallback,
  ResourceCallback,
  RequestCallback,
  PagedResponse,
  PagedCallback,
  JobRequest,
  PagedRequest,
} from '.';
import {GoogleErrorBody} from '@google-cloud/common/build/src/util';
import {Duplex, Writable} from 'stream';
import {JobMetadata} from './job';
import bigquery from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const duplexify = require('duplexify');

// This is supposed to be a @google-cloud/storage `File` type. The storage npm
// module includes these types, but is current installed as a devDependency.
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RowMetadata = any;

export type InsertRowsOptions = bigquery.ITableDataInsertAllRequest & {
  createInsertId?: boolean;
  partialRetries?: number;
  raw?: boolean;
  schema?: string | {};
};

export type InsertRowsResponse = [
  bigquery.ITableDataInsertAllResponse | bigquery.ITable
];
export type InsertRowsCallback = RequestCallback<
  bigquery.ITableDataInsertAllResponse | bigquery.ITable
>;

export type RowsResponse = PagedResponse<
  RowMetadata,
  GetRowsOptions,
  bigquery.ITableDataList | bigquery.ITable
>;
export type RowsCallback = PagedCallback<
  RowMetadata,
  GetRowsOptions,
  bigquery.ITableDataList | bigquery.ITable
>;

export interface InsertRow {
  insertId?: string;
  json?: bigquery.IJsonObject;
}

export type TableRow = bigquery.ITableRow;
export type TableRowField = bigquery.ITableCell;
export type TableRowValue = string | TableRow;

export type GetRowsOptions = PagedRequest<bigquery.tabledata.IListParams>;

export type JobLoadMetadata = JobRequest<bigquery.IJobConfigurationLoad> & {
  format?: string;
};

export type CreateExtractJobOptions = JobRequest<
  bigquery.IJobConfigurationExtract
> & {
  format?: 'CSV' | 'JSON' | 'AVRO' | 'PARQUET' | 'ORC';
  gzip?: boolean;
};

export type JobResponse = [Job, bigquery.IJob];
export type JobCallback = ResourceCallback<Job, bigquery.IJob>;

export type CreateCopyJobMetadata = CopyTableMetadata;
export type SetTableMetadataOptions = TableMetadata;
export type CopyTableMetadata = JobRequest<bigquery.IJobConfigurationTableCopy>;

export type TableMetadata = bigquery.ITable & {
  name?: string;
  schema?: string | TableField[] | TableSchema;
  partitioning?: string;
  view?: string | ViewDefinition;
};

export type ViewDefinition = bigquery.IViewDefinition;
export type FormattedMetadata = bigquery.ITable;
export type TableSchema = bigquery.ITableSchema;
export type TableField = bigquery.ITableFieldSchema;

export interface PartialInsertFailure {
  message: string;
  reason: string;
  row: RowMetadata;
}

/**
 * The file formats accepted by BigQuery.
 *
 * @type {object}
 * @private
 */
const FORMATS = {
  avro: 'AVRO',
  csv: 'CSV',
  json: 'NEWLINE_DELIMITED_JSON',
  orc: 'ORC',
  parquet: 'PARQUET',
} as {[index: string]: string};

export interface TableOptions {
  location?: string;
}

/**
 * Table objects are returned by methods such as
 * {@link Dataset#table}, {@link Dataset#createTable}, and
 * {@link Dataset#getTables}.
 *
 * @class
 * @param {Dataset} dataset {@link Dataset} instance.
 * @param {string} id The ID of the table.
 * @param {object} [options] Table options.
 * @param {string} [options.location] The geographic location of the table, by
 *      default this value is inherited from the dataset. This can be used to
 *      configure the location of all jobs created through a table instance. It
 *      cannot be used to set the actual location of the table. This value will
 *      be superseded by any API responses containing location data for the
 *      table.
 *
 * @example
 * const {BigQuery} = require('@google-cloud/bigquery');
 * const bigquery = new BigQuery();
 * const dataset = bigquery.dataset('my-dataset');
 *
 * const table = dataset.table('my-table');
 */
class Table extends common.ServiceObject {
  dataset: Dataset;
  bigQuery: BigQuery;
  location?: string;
  createReadStream: (options?: GetRowsOptions) => ResourceStream<RowMetadata>;
  constructor(dataset: Dataset, id: string, options?: TableOptions) {
    const methods = {
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
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       * const dataset = bigquery.dataset('my-dataset');
       *
       * const table = dataset.table('my-table');
       *
       * table.create((err, table, apiResponse) => {
       *   if (!err) {
       *     // The table was created successfully.
       *   }
       * });
       *
       * //-
       * // If the callback is omitted, we'll return a Promise.
       * //-
       * table.create().then((data) => {
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
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       * const dataset = bigquery.dataset('my-dataset');
       *
       * const table = dataset.table('my-table');
       *
       * table.delete((err, apiResponse) => {});
       *
       * //-
       * // If the callback is omitted, we'll return a Promise.
       * //-
       * table.delete().then((data) => {
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
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       * const dataset = bigquery.dataset('my-dataset');
       *
       * const table = dataset.table('my-table');
       *
       * table.exists((err, exists) => {});
       *
       * //-
       * // If the callback is omitted, we'll return a Promise.
       * //-
       * table.exists().then((data) => {
       *   const exists = data[0];
       * });
       */
      exists: true,

      /**
       * Get a table if it exists.
       *
       * You may optionally use this to "get or create" an object by providing
       * an object with `autoCreate` set to `true`. Any extra configuration that
       * is normally required for the `create` method must be contained within
       * this object as well.
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
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       * const dataset = bigquery.dataset('my-dataset');
       *
       * const table = dataset.table('my-table');
       *
       * table.get((err, table, apiResponse) => {
       *   // `table.metadata` has been populated.
       * });
       *
       * //-
       * // If the callback is omitted, we'll return a Promise.
       * //-
       * table.get().then((data) => {
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
       * const {BigQuery} = require('@google-cloud/bigquery');
       * const bigquery = new BigQuery();
       * const dataset = bigquery.dataset('my-dataset');
       *
       * const table = dataset.table('my-table');
       *
       * table.getMetadata((err, metadata, apiResponse) => {});
       *
       * //-
       * // If the callback is omitted, we'll return a Promise.
       * //-
       * table.getMetadata().then((data) => {
       *   const metadata = data[0];
       *   const apiResponse = data[1];
       * });
       */
      getMetadata: true,
    };

    super({
      parent: dataset,
      baseUrl: '/tables',
      id,
      createMethod: dataset.createTable.bind(dataset),
      methods,
    });

    if (options && options.location) {
      this.location = options.location;
    }

    this.bigQuery = dataset.bigQuery;
    this.dataset = dataset;

    // Catch all for read-modify-write cycle
    // https://cloud.google.com/bigquery/docs/api-performance#read-patch-write
    this.interceptors.push({
      request: (reqOpts: common.DecorateRequestOptions) => {
        if (reqOpts.method === 'PATCH' && reqOpts.json.etag) {
          reqOpts.headers = reqOpts.headers || {};
          reqOpts.headers['If-Match'] = reqOpts.json.etag;
        }
        return reqOpts;
      },
    });

    /**
     * Create a readable stream of the rows of data in your table. This method
     * is simply a wrapper around {@link Table#getRows}.
     *
     * @see [Tabledata: list API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tabledata/list}
     *
     * @returns {ReadableStream}
     *
     * @example
     * const {BigQuery} = require('@google-cloud/bigquery');
     * const bigquery = new BigQuery();
     * const dataset = bigquery.dataset('my-dataset');
     * const table = dataset.table('my-table');
     *
     * table.createReadStream(options)
     *   .on('error', console.error)
     *   .on('data', row => {})
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
    this.createReadStream = paginator.streamify<RowMetadata>('getRows');
  }

  /**
   * Convert a comma-separated name:type string to a table schema object.
   *
   * @static
   * @private
   *
   * @param {string} str Comma-separated schema string.
   * @returns {object} Table schema in the format the API expects.
   */
  static createSchemaFromString_(str: string): TableSchema {
    return str.split(/\s*,\s*/).reduce(
      (acc: {fields: Array<{name: string; type: string}>}, pair) => {
        acc.fields.push({
          name: pair.split(':')[0].trim(),
          type: (pair.split(':')[1] || 'STRING').toUpperCase().trim(),
        });
        return acc;
      },
      {
        fields: [],
      }
    );
  }

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
  static encodeValue_(value?: {} | null): {} | null {
    if (typeof value === 'undefined' || value === null) {
      return null;
    }

    if (value instanceof Buffer) {
      return value.toString('base64');
    }

    if (value instanceof Big) {
      return value.toFixed();
    }

    const customTypeConstructorNames = [
      'BigQueryDate',
      'BigQueryDatetime',
      'BigQueryTime',
      'BigQueryTimestamp',
      'Geography',
    ];
    const constructorName = value.constructor.name;
    const isCustomType =
      customTypeConstructorNames.indexOf(constructorName) > -1;

    if (isCustomType) {
      return (value as {value: {}}).value;
    }

    if (is.date(value)) {
      return (value as Date).toJSON();
    }

    if (is.array(value)) {
      return (value as []).map(Table.encodeValue_);
    }

    if (typeof value === 'object') {
      return Object.keys(value).reduce(
        (acc: {[index: string]: {} | null}, key) => {
          acc[key] = Table.encodeValue_(
            (value as {[index: string]: {} | null})[key]
          );
          return acc;
        },
        {}
      );
    }
    return value;
  }

  /**
   * @private
   */
  static formatMetadata_(options: TableMetadata): FormattedMetadata {
    const body = (extend(true, {}, options) as {}) as FormattedMetadata;

    if (options.name) {
      body.friendlyName = options.name;
      delete (body as TableMetadata).name;
    }

    if (is.string(options.schema)) {
      body.schema = Table.createSchemaFromString_(options.schema as string);
    }

    if (is.array(options.schema)) {
      body.schema = {
        fields: options.schema as [],
      };
    }

    if (body.schema && body.schema.fields) {
      body.schema.fields = body.schema.fields.map(field => {
        if (field.fields) {
          field.type = 'RECORD';
        }
        return field;
      });
    }

    if (is.string(options.partitioning)) {
      body.timePartitioning = {
        type: options.partitioning!.toUpperCase(),
      };
      delete (body as TableMetadata).partitioning;
    }

    if (is.string(options.view)) {
      body.view = {
        query: options.view! as string,
        useLegacySql: false,
      };
    }

    return body;
  }

  copy(
    destination: Table,
    metadata?: CopyTableMetadata
  ): Promise<JobMetadataResponse>;
  copy(
    destination: Table,
    metadata: CopyTableMetadata,
    callback: JobMetadataCallback
  ): void;
  copy(destination: Table, callback: JobMetadataCallback): void;
  /**
   * Copy data from one table to another, optionally creating that table.
   *
   * @param {Table} destination The destination table.
   * @param {object} [metadata] Metadata to set with the copy operation. The
   *     metadata object should be in the format of the
   *     [`configuration.copy`](http://goo.gl/dKWIyS) property of a Jobs
   * resource.
   * @param {string} [metadata.jobId] Custom id for the underlying job.
   * @param {string} [metadata.jobPrefix] Prefix to apply to the underlying job
   *     id.
   * @param {function} [callback] The callback function.
   * @param {?error} callback.err An error returned while making this request
   * @param {object} callback.apiResponse The full API response.
   * @returns {Promise}
   *
   * @throws {Error} If a destination other than a Table object is provided.
   *
   * @example
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   *
   * const table = dataset.table('my-table');
   * const yourTable = dataset.table('your-table');
   *
   * table.copy(yourTable, (err, apiResponse) => {});
   *
   * //-
   * // See the <a href="http://goo.gl/dKWIyS">`configuration.copy`</a> object
   * for
   * // all available options.
   * //-
   * const metadata = {
   *   createDisposition: 'CREATE_NEVER',
   *   writeDisposition: 'WRITE_TRUNCATE'
   * };
   *
   * table.copy(yourTable, metadata, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * table.copy(yourTable, metadata).then((data) => {
   *   const apiResponse = data[0];
   * });
   */
  copy(
    destination: Table,
    metadataOrCallback?: CopyTableMetadata | JobMetadataCallback,
    cb?: JobMetadataCallback
  ): void | Promise<JobMetadataResponse> {
    const metadata =
      typeof metadataOrCallback === 'object' ? metadataOrCallback : {};
    const callback =
      typeof metadataOrCallback === 'function' ? metadataOrCallback : cb;
    this.createCopyJob(
      destination,
      metadata as CreateCopyJobMetadata,
      (err, job, resp) => {
        if (err) {
          callback!(err, resp);
          return;
        }

        job!.on('error', callback!).on('complete', (metadata: JobMetadata) => {
          callback!(null, metadata);
        });
      }
    );
  }

  copyFrom(
    sourceTables: Table | Table[],
    metadata?: CopyTableMetadata
  ): Promise<JobMetadataResponse>;
  copyFrom(
    sourceTables: Table | Table[],
    metadata: CopyTableMetadata,
    callback: JobMetadataCallback
  ): void;
  copyFrom(sourceTables: Table | Table[], callback: JobMetadataCallback): void;
  /**
   * Copy data from multiple tables into this table.
   *
   * @param {Table|Table[]} sourceTables The
   *     source table(s) to copy data from.
   * @param {object=} metadata Metadata to set with the copy operation. The
   *     metadata object should be in the format of the
   *     [`configuration.copy`](http://goo.gl/dKWIyS) property of a Jobs
   * resource.
   * @param {string} [metadata.jobId] Custom id for the underlying job.
   * @param {string} [metadata.jobPrefix] Prefix to apply to the underlying job
   *     id.
   * @param {function} [callback] The callback function.
   * @param {?error} callback.err An error returned while making this request
   * @param {object} callback.apiResponse The full API response.
   * @returns {Promise}
   *
   * @throws {Error} If a source other than a Table object is provided.
   *
   * @example
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const table = dataset.table('my-table');
   *
   * const sourceTables = [
   *   dataset.table('your-table'),
   *   dataset.table('your-second-table')
   * ];
   *
   * table.copyFrom(sourceTables, (err, apiResponse) => {});
   *
   * //-
   * // See the <a href="http://goo.gl/dKWIyS">`configuration.copy`</a> object
   * for
   * // all available options.
   * //-
   * const metadata = {
   *   createDisposition: 'CREATE_NEVER',
   *   writeDisposition: 'WRITE_TRUNCATE'
   * };
   *
   * table.copyFrom(sourceTables, metadata, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * table.copyFrom(sourceTables, metadata).then((data) => {
   *   const apiResponse = data[0];
   * });
   */
  copyFrom(
    sourceTables: Table | Table[],
    metadataOrCallback?: CopyTableMetadata | JobMetadataCallback,
    cb?: JobMetadataCallback
  ): void | Promise<JobMetadataResponse> {
    const metadata =
      typeof metadataOrCallback === 'object' ? metadataOrCallback : {};
    const callback =
      typeof metadataOrCallback === 'function' ? metadataOrCallback : cb;
    this.createCopyFromJob(sourceTables, metadata, (err, job, resp) => {
      if (err) {
        callback!(err, resp);
        return;
      }
      job!.on('error', callback!).on('complete', metadata => {
        callback!(null, metadata);
      });
    });
  }

  createCopyJob(
    destination: Table,
    metadata?: CreateCopyJobMetadata
  ): Promise<JobResponse>;
  createCopyJob(
    destination: Table,
    metadata: CreateCopyJobMetadata,
    callback: JobCallback
  ): void;
  createCopyJob(destination: Table, callback: JobCallback): void;
  /**
   * Copy data from one table to another, optionally creating that table.
   *
   * @see [Jobs: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert}
   *
   * @param {Table} destination The destination table.
   * @param {object} [metadata] Metadata to set with the copy operation. The
   *     metadata object should be in the format of the
   *     [`configuration.copy`](http://goo.gl/dKWIyS) property of a Jobs
   * resource.
   * @param {string} [metadata.jobId] Custom job id.
   * @param {string} [metadata.jobPrefix] Prefix to apply to the job id.
   * @param {function} [callback] The callback function.
   * @param {?error} callback.err An error returned while making this request
   * @param {Job} callback.job The job used to copy your table.
   * @param {object} callback.apiResponse The full API response.
   * @returns {Promise}
   *
   * @throws {Error} If a destination other than a Table object is provided.
   *
   * @example
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const table = dataset.table('my-table');
   *
   * const yourTable = dataset.table('your-table');
   * table.createCopyJob(yourTable, (err, job, apiResponse) => {
   *   // `job` is a Job object that can be used to check the status of the
   *   // request.
   * });
   *
   * //-
   * // See the <a href="http://goo.gl/dKWIyS">`configuration.copy`</a> object
   * for
   * // all available options.
   * //-
   * const metadata = {
   *   createDisposition: 'CREATE_NEVER',
   *   writeDisposition: 'WRITE_TRUNCATE'
   * };
   *
   * table.createCopyJob(yourTable, metadata, (err, job, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * table.createCopyJob(yourTable, metadata).then((data) => {
   *   const job = data[0];
   *   const apiResponse = data[1];
   * });
   */
  createCopyJob(
    destination: Table,
    metadataOrCallback?: CreateCopyJobMetadata | JobCallback,
    cb?: JobCallback
  ): void | Promise<JobResponse> {
    if (!(destination instanceof Table)) {
      throw new Error('Destination must be a Table object.');
    }
    const metadata =
      typeof metadataOrCallback === 'object'
        ? metadataOrCallback
        : ({} as CreateCopyJobMetadata);
    const callback =
      typeof metadataOrCallback === 'function' ? metadataOrCallback : cb;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {
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

    if (this.location) {
      body.location = this.location;
    }

    if (metadata.jobId) {
      body.jobId = metadata.jobId;
      delete metadata.jobId;
    }

    this.bigQuery.createJob(body, callback!);
  }

  createCopyFromJob(
    source: Table | Table[],
    metadata?: CopyTableMetadata
  ): Promise<JobResponse>;
  createCopyFromJob(
    source: Table | Table[],
    metadata: CopyTableMetadata,
    callback: JobCallback
  ): void;
  createCopyFromJob(source: Table | Table[], callback: JobCallback): void;
  /**
   * Copy data from multiple tables into this table.
   *
   * @see [Jobs: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert}
   *
   * @param {Table|Table[]} sourceTables The
   *     source table(s) to copy data from.
   * @param {object} [metadata] Metadata to set with the copy operation. The
   *     metadata object should be in the format of the
   *     [`configuration.copy`](http://goo.gl/dKWIyS) property of a Jobs
   * resource.
   * @param {string} [metadata.jobId] Custom job id.
   * @param {string} [metadata.jobPrefix] Prefix to apply to the job id.
   * @param {function} [callback] The callback function.
   * @param {?error} callback.err An error returned while making this request
   * @param {Job} callback.job The job used to copy your table.
   * @param {object} callback.apiResponse The full API response.
   * @returns {Promise}
   *
   * @throws {Error} If a source other than a Table object is provided.
   *
   * @example
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const table = dataset.table('my-table');
   *
   * const sourceTables = [
   *   dataset.table('your-table'),
   *   dataset.table('your-second-table')
   * ];
   *
   * const callback = (err, job, apiResponse) => {
   *   // `job` is a Job object that can be used to check the status of the
   *   // request.
   * };
   *
   * table.createCopyFromJob(sourceTables, callback);
   *
   * //-
   * // See the <a href="http://goo.gl/dKWIyS">`configuration.copy`</a> object
   * for
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
   * table.createCopyFromJob(sourceTables, metadata).then((data) => {
   *   const job = data[0];
   *   const apiResponse = data[1];
   * });
   */
  createCopyFromJob(
    source: Table | Table[],
    metadataOrCallback?: CopyTableMetadata | JobCallback,
    cb?: JobCallback
  ): void | Promise<JobResponse> {
    const sourceTables = arrify(source) as Table[];
    sourceTables.forEach(sourceTable => {
      if (!(sourceTable instanceof Table)) {
        throw new Error('Source must be a Table object.');
      }
    });

    const metadata =
      typeof metadataOrCallback === 'object' ? metadataOrCallback : {};
    const callback =
      typeof metadataOrCallback === 'function' ? metadataOrCallback : cb;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {
      configuration: {
        copy: extend(true, metadata, {
          destinationTable: {
            datasetId: this.dataset.id,
            projectId: this.bigQuery.projectId,
            tableId: this.id,
          },

          sourceTables: sourceTables.map(sourceTable => {
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

    if (this.location) {
      body.location = this.location;
    }

    if (metadata.jobId) {
      body.jobId = metadata.jobId;
      delete metadata.jobId;
    }

    this.bigQuery.createJob(body, callback!);
  }

  createExtractJob(
    destination: File,
    options?: CreateExtractJobOptions
  ): Promise<JobResponse>;
  createExtractJob(
    destination: File,
    options: CreateExtractJobOptions,
    callback: JobCallback
  ): void;
  createExtractJob(destination: File, callback: JobCallback): void;
  /**
   * Export table to Cloud Storage.
   *
   * @see [Jobs: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert}
   *
   * @param {string|File} destination Where the file should be exported
   *     to. A string or a {@link
   * https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}
   * object.
   * @param {object=} options - The configuration object.
   * @param {string} options.format - The format to export the data in. Allowed
   *     options are "CSV", "JSON", "AVRO", or "PARQUET". Default: "CSV".
   * @param {boolean} options.gzip - Specify if you would like the file compressed
   *     with GZIP. Default: false.
   * @param {string} [options.jobId] Custom job id.
   * @param {string} [options.jobPrefix] Prefix to apply to the job id.
   * @param {function} callback - The callback function.
   * @param {?error} callback.err - An error returned while making this request
   * @param {Job} callback.job - The job used to export the table.
   * @param {object} callback.apiResponse - The full API response.
   *
   * @throws {Error} If destination isn't a File object.
   * @throws {Error} If destination format isn't recongized.
   *
   * @example
   * const {Storage} = require('@google-cloud/storage');
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const table = dataset.table('my-table');
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
   * // To use the default options, just pass a {@link
   * https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}
   * object.
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
   * table.createExtractJob(extractedFile, options).then((data) => {
   *   const job = data[0];
   *   const apiResponse = data[1];
   * });
   */
  createExtractJob(
    destination: File,
    optionsOrCallback?: CreateExtractJobOptions | JobCallback,
    cb?: JobCallback
  ): void | Promise<JobResponse> {
    let options =
      typeof optionsOrCallback === 'object' ? optionsOrCallback : {};
    const callback =
      typeof optionsOrCallback === 'function' ? optionsOrCallback : cb;

    options = extend(true, options, {
      destinationUris: arrify(destination).map(dest => {
        if (!common.util.isCustomType(dest, 'storage/file')) {
          throw new Error('Destination must be a File object.');
        }

        // If no explicit format was provided, attempt to find a match from the
        // file's extension. If no match, don't set, and default upstream to
        // CSV.
        const format = path
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
      options.format = options.format.toLowerCase() as typeof options.format;

      if (FORMATS[options.format!]) {
        options.destinationFormat = FORMATS[options.format!];
        delete options.format;
      } else {
        throw new Error('Destination format not recognized: ' + options.format);
      }
    }

    if (options.gzip) {
      options.compression = 'GZIP';
      delete options.gzip;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {
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

    if (this.location) {
      body.location = this.location;
    }

    if (options.jobId) {
      body.jobId = options.jobId;
      delete options.jobId;
    }

    this.bigQuery.createJob(body, callback!);
  }

  createLoadJob(
    source: string | File,
    metadata?: JobLoadMetadata
  ): Promise<JobResponse>;
  createLoadJob(
    source: string | File,
    metadata: JobLoadMetadata,
    callback: JobCallback
  ): void;
  createLoadJob(source: string | File, callback: JobCallback): void;
  /**
   * Load data from a local file or Storage {@link
   * https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}.
   *
   * By loading data this way, you create a load job that will run your data
   * load asynchronously. If you would like instantaneous access to your data,
   * insert it using {@liink Table#insert}.
   *
   * Note: The file type will be inferred by the given file's extension. If you
   * wish to override this, you must provide `metadata.format`.
   *
   * @see [Jobs: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert}
   *
   * @param {string|File|File[]} source The source file to load. A string (path)
   * to a local file, or one or more {@link
   * https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}
   * objects.
   * @param {object} [metadata] Metadata to set with the load operation. The
   *     metadata object should be in the format of the
   *     [`configuration.load`](https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad)
   * property of a Jobs resource.
   * @param {string} [metadata.format] The format the data being loaded is in.
   *     Allowed options are "AVRO", "CSV", "JSON", "ORC", or "PARQUET".
   * @param {string} [metadata.jobId] Custom job id.
   * @param {string} [metadata.jobPrefix] Prefix to apply to the job id.
   * @param {function} [callback] The callback function.
   * @param {?error} callback.err An error returned while making this request
   * @param {Job} callback.job The job used to load your data.
   * @param {object} callback.apiResponse The full API response.
   * @returns {Promise}
   *
   * @throws {Error} If the source isn't a string file name or a File instance.
   *
   * @example
   * const {Storage} = require('@google-cloud/storage');
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const table = dataset.table('my-table');
   *
   * //-
   * // Load data from a local file.
   * //-
   * const callback = (err, job, apiResponse) => {
   *   // `job` is a Job object that can be used to check the status of the
   *   // request.
   * };
   *
   * table.createLoadJob('./institutions.csv', callback);
   *
   * //-
   * // You may also pass in metadata in the format of a Jobs resource. See
   * // (https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad)
   * // for a full list of supported values.
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
   * table.createLoadJob(data).then((data) => {
   *   const job = data[0];
   *   const apiResponse = data[1];
   * });
   */
  createLoadJob(
    source: string | File | File[],
    metadataOrCallback?: JobLoadMetadata | JobCallback,
    cb?: JobCallback
  ): void | Promise<JobResponse> {
    const metadata =
      typeof metadataOrCallback === 'object' ? metadataOrCallback : {};
    const callback =
      typeof metadataOrCallback === 'function' ? metadataOrCallback : cb;

    this._createLoadJob(source, metadata).then(
      ([resp]) => callback!(null, resp, resp.metadata),
      err => callback!(err)
    );
  }

  /**
   * @param {string | File | File[]} source
   * @param {JobLoadMetadata} metadata
   * @returns {Promise<JobResponse>}
   * @private
   */
  async _createLoadJob(
    source: string | File | File[],
    metadata: JobLoadMetadata
  ): Promise<JobResponse> {
    if (metadata.format) {
      metadata.sourceFormat = FORMATS[metadata.format.toLowerCase()];
      delete metadata.format;
    }

    if (this.location) {
      metadata.location = this.location;
    }

    if (typeof source === 'string') {
      // A path to a file was given. If a sourceFormat wasn't specified, try to
      // find a match from the file's extension.
      const detectedFormat =
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
      const jobWritable = fs
        .createReadStream(source)
        .pipe(this.createWriteStream_(metadata));
      const jobResponse = (await pEvent(jobWritable, 'job')) as Job;
      return [jobResponse, jobResponse.metadata];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = {
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

    if (metadata.location) {
      body.location = metadata.location;
      delete metadata.location;
    }

    if (metadata.jobId) {
      body.jobId = metadata.jobId;
      delete metadata.jobId;
    }

    extend(true, body.configuration.load, metadata, {
      sourceUris: arrify(source).map(src => {
        if (!common.util.isCustomType(src, 'storage/file')) {
          throw new Error('Source must be a File object.');
        }

        // If no explicit format was provided, attempt to find a match from
        // the file's extension. If no match, don't set, and default upstream
        // to CSV.
        const format =
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

    return this.bigQuery.createJob(body);
  }

  createQueryJob(options: Query): Promise<JobResponse>;
  createQueryJob(options: Query, callback: JobCallback): void;
  /**
   * Run a query as a job. No results are immediately returned. Instead, your
   * callback will be executed with a {@link Job} object that you must
   * ping for the results. See the Job documentation for explanations of how to
   * check on the status of the job.
   *
   * See {@link BigQuery#createQueryJob} for full documentation of this method.
   */
  createQueryJob(
    options: Query,
    callback?: JobCallback
  ): void | Promise<JobResponse> {
    return this.dataset.createQueryJob(options, callback!);
  }

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
  createQueryStream(query: Query): Duplex {
    return this.dataset.createQueryStream(query);
  }

  /**
   * Creates a write stream. Unlike the public version, this will not
   * automatically poll the underlying job.
   *
   * @private
   *
   * @param {string|object} [metadata] Metadata to set with the load operation.
   *     The metadata object should be in the format of the
   *     [`configuration.load`](https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad)
   * property of a Jobs resource. If a string is given, it will be used
   * as the filetype.
   * @param {string} [metadata.jobId] Custom job id.
   * @param {string} [metadata.jobPrefix] Prefix to apply to the job id.
   * @returns {WritableStream}
   */
  createWriteStream_(metadata: JobLoadMetadata | string): Writable {
    metadata = metadata || {};
    if (typeof metadata === 'string') {
      metadata = {
        sourceFormat: FORMATS[metadata.toLowerCase()],
      };
    }

    if (typeof metadata.schema === 'string') {
      metadata.schema = Table.createSchemaFromString_(metadata.schema);
    }

    extend(true, metadata, {
      destinationTable: {
        projectId: this.bigQuery.projectId,
        datasetId: this.dataset.id,
        tableId: this.id,
      },
    });

    let jobId = metadata.jobId || uuid.v4();

    if (metadata.jobId) {
      delete metadata.jobId;
    }

    if (metadata.jobPrefix) {
      jobId = metadata.jobPrefix + jobId;
      delete metadata.jobPrefix;
    }

    const dup = streamEvents(duplexify());

    dup.once('writing', () => {
      common.util.makeWritableStream(
        dup,
        {
          makeAuthenticatedRequest: this.bigQuery.makeAuthenticatedRequest,
          metadata: {
            configuration: {
              load: metadata,
            },
            jobReference: {
              jobId,
              projectId: this.bigQuery.projectId,
              location: this.location,
            },
          } as {},
          request: {
            uri: `https://${this.bigQuery.apiEndpoint}/upload/bigquery/v2/projects/${this.bigQuery.projectId}/jobs`,
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data: any) => {
          const job = this.bigQuery.job(data.jobReference.jobId, {
            location: data.jobReference.location,
          });
          job.metadata = data;
          dup.emit('job', job);
        }
      );
    });
    return dup;
  }

  /**
   * Load data into your table from a readable stream of AVRO, CSV, JSON, ORC,
   * or PARQUET data.
   *
   * @see [Jobs: insert API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/jobs/insert}
   *
   * @param {string|object} [metadata] Metadata to set with the load operation.
   *     The metadata object should be in the format of the
   *     [`configuration.load`](https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad)
   * property of a Jobs resource. If a string is given,
   * it will be used as the filetype.
   * @param {string} [metadata.jobId] Custom job id.
   * @param {string} [metadata.jobPrefix] Prefix to apply to the job id.
   * @returns {WritableStream}
   *
   * @throws {Error} If source format isn't recognized.
   *
   * @example
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const table = dataset.table('my-table');
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
   *   .on('job', (job) => {
   *     // `job` is a Job object that can be used to check the status of the
   *     // request.
   *   })
   *   .on('complete', (job) => {
   *     // The job has completed successfully.
   *   });
   *
   * //-
   * // Load data from a JSON file.
   * //-
   * const fs = require('fs');
   *
   * fs.createReadStream('./test/testdata/testfile.json')
   *   .pipe(table.createWriteStream('json'))
   *   .on('job', (job) => {
   *     // `job` is a Job object that can be used to check the status of the
   *     // request.
   *   })
   *   .on('complete', (job) => {
   *     // The job has completed successfully.
   *   });
   */
  createWriteStream(metadata: JobLoadMetadata | string) {
    const stream = this.createWriteStream_(metadata);
    stream.on('prefinish', () => {
      stream.cork();
    });
    stream.on('job', (job: Job) => {
      job
        .on('error', err => {
          stream.destroy(err);
        })
        .on('complete', () => {
          stream.emit('complete', job);
          stream.uncork();
        });
    });
    return stream;
  }

  extract(
    destination: File,
    options?: CreateExtractJobOptions
  ): Promise<JobMetadataResponse>;
  extract(
    destination: File,
    options: CreateExtractJobOptions,
    callback?: JobMetadataCallback
  ): void;
  extract(destination: File, callback?: JobMetadataCallback): void;
  /**
   * Export table to Cloud Storage.
   *
   * @param {string|File} destination Where the file should be exported
   *     to. A string or a {@link
   * https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}.
   * @param {object} [options] The configuration object.
   * @param {string} [options.format="CSV"] The format to export the data in.
   *     Allowed options are "AVRO", "CSV", "JSON", "ORC" or "PARQUET".
   * @param {boolean} [options.gzip] Specify if you would like the file compressed
   *     with GZIP. Default: false.
   * @param {string} [options.jobId] Custom id for the underlying job.
   * @param {string} [options.jobPrefix] Prefix to apply to the underlying job id.
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
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const table = dataset.table('my-table');
   *
   * const storage = new Storage({
   *   projectId: 'grape-spaceship-123'
   * });
   * const extractedFile = storage.bucket('institutions').file('2014.csv');
   *
   * //-
   * // To use the default options, just pass a {@link
   * https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}
   * object.
   * //
   * // Note: The exported format type will be inferred by the file's extension.
   * // If you wish to override this, or provide an array of destination files,
   * // you must provide an `options` object.
   * //-
   * table.extract(extractedFile, (err, apiResponse) => {});
   *
   * //-
   * // If you need more customization, pass an `options` object.
   * //-
   * const options = {
   *   format: 'json',
   *   gzip: true
   * };
   *
   * table.extract(extractedFile, options, (err, apiResponse) => {});
   *
   * //-
   * // You can also specify multiple destination files.
   * //-
   * table.extract([
   *   storage.bucket('institutions').file('2014.json'),
   *   storage.bucket('institutions-copy').file('2014.json')
   * ], options, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * table.extract(extractedFile, options).then((data) => {
   *   const apiResponse = data[0];
   * });
   */
  extract(
    destination: File,
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

  getRows(options?: GetRowsOptions): Promise<RowsResponse>;
  getRows(options: GetRowsOptions, callback: RowsCallback): void;
  getRows(callback: RowsCallback): void;
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
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const table = dataset.table('my-table');
   *
   * table.getRows((err, rows) => {
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
   * table.getRows().then((data) => {
   *   const rows = data[0];
   *   });
   */
  getRows(
    optionsOrCallback?: GetRowsOptions | RowsCallback,
    cb?: RowsCallback
  ): void | Promise<RowsResponse> {
    const options =
      typeof optionsOrCallback === 'object' ? optionsOrCallback : {};
    const callback =
      typeof optionsOrCallback === 'function' ? optionsOrCallback : cb;
    const onComplete = (
      err: Error | null,
      rows: TableRow[] | null,
      nextQuery: GetRowsOptions | null,
      resp: bigquery.ITableList
    ) => {
      if (err) {
        callback!(err, null, null, resp);
        return;
      }
      rows = BigQuery.mergeSchemaWithRows_(this.metadata.schema, rows || []);
      callback!(null, rows, nextQuery, resp);
    };

    this.request(
      {
        uri: '/data',
        qs: options,
      },
      (err, resp) => {
        if (err) {
          onComplete(err, null, null, resp);
          return;
        }
        let nextQuery: GetRowsOptions | null = null;
        if (resp.pageToken) {
          nextQuery = Object.assign({}, options, {
            pageToken: resp.pageToken,
          });
        }

        if (resp.rows && resp.rows.length > 0 && !this.metadata.schema) {
          // We don't know the schema for this table yet. Do a quick stat.
          this.getMetadata(
            (
              err: Error,
              metadata: common.Metadata,
              apiResponse: bigquery.ITable
            ) => {
              if (err) {
                onComplete(err, null, null, apiResponse!);
                return;
              }
              onComplete(null, resp.rows, nextQuery, resp);
            }
          );
          return;
        }

        onComplete(null, resp.rows, nextQuery, resp);
      }
    );
  }

  insert(
    rows: RowMetadata | RowMetadata[],
    options?: InsertRowsOptions
  ): Promise<InsertRowsResponse>;
  insert(
    rows: RowMetadata | RowMetadata[],
    options: InsertRowsOptions,
    callback: InsertRowsCallback
  ): void;
  insert(rows: RowMetadata | RowMetadata[], callback: InsertRowsCallback): void;
  /**
   * Stream data into BigQuery one record at a time without running a load job.
   *
   * If you need to create an entire table from a file, consider using
   * {@link Table#load} instead.
   *
   * Note, if a table was recently created, inserts may fail until the table
   * is consistent within BigQuery. If a `schema` is supplied, this method will
   * automatically retry those failed inserts, and it will even create the
   * table with the provided schema if it does not exist.
   *
   * @see [Tabledata: insertAll API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tabledata/insertAll}
   * @see [Streaming Insert Limits]{@link https://cloud.google.com/bigquery/quotas#streaming_inserts}
   * @see [Troubleshooting Errors]{@link https://developers.google.com/bigquery/troubleshooting-errors}
   *
   * @param {object|object[]} rows The rows to insert into the table.
   * @param {object} [options] Configuration object.
   * @param {boolean} [options.createInsertId=true] Automatically insert a
   *     default row id when one is not provided.
   * @param {boolean} [options.ignoreUnknownValues=false] Accept rows that contain
   *     values that do not match the schema. The unknown values are ignored.
   * @param {number} [options.partialRetries=3] Number of times to retry
   *     inserting rows for cases of partial failures.
   * @param {boolean} [options.raw] If `true`, the `rows` argument is expected to
   *     be formatted as according to the
   *     [specification](https://cloud.google.com/bigquery/docs/reference/v2/tabledata/insertAll).
   * @param {string|object} [options.schema] If provided will automatically
   *     create a table if it doesn't already exist. Note that this can take
   *     longer than 2 minutes to complete. A comma-separated list of
   *     name:type pairs.
   *     Valid types are "string", "integer", "float", "boolean", and
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
   *     [Automatic table creation using template
   * tables](https://cloud.google.com/bigquery/streaming-data-into-bigquery#template-tables)
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
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const table = dataset.table('my-table');
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
   * const rows = [
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
   * // Insert a row as according to the <a href="https://cloud.google.com/bigquery/docs/reference/v2/tabledata/insertAll">specification</a>.
   * //-
   * const row = {
   *   insertId: '1',
   *   json: {
   *     INSTNM: 'Motion Picture Institute of Michigan',
   *     CITY: 'Troy',
   *     STABBR: 'MI'
   *   }
   * };
   *
   * const options = {
   *   raw: true
   * };
   *
   * table.insert(row, options, insertHandler);
   *
   * //-
   * // Handling the response. See <a href="https://developers.google.com/bigquery/troubleshooting-errors">Troubleshooting Errors</a> for best practices on how to handle errors.
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
   *   .then((data) => {
   *     const apiResponse = data[0];
   *   })
   *   .catch((err) => {
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
  insert(
    rows: RowMetadata | RowMetadata[],
    optionsOrCallback?: InsertRowsOptions | InsertRowsCallback,
    cb?: InsertRowsCallback
  ): void | Promise<InsertRowsResponse> {
    const options =
      typeof optionsOrCallback === 'object'
        ? optionsOrCallback
        : ({} as InsertRowsOptions);
    const callback =
      typeof optionsOrCallback === 'function'
        ? optionsOrCallback
        : (cb as InsertRowsCallback);

    this._insertAndCreateTable(rows, options).then(
      resp => callback(null, resp),
      err => callback(err, null)
    );
  }

  /**
   * Insert rows with retries, but will create the table if not exists.
   *
   * @param {RowMetadata | RowMetadata[]} rows
   * @param {InsertRowsOptions} options
   * @returns {Promise<bigquery.ITableDataInsertAllResponse | bigquery.ITable>}
   * @private
   */
  private async _insertAndCreateTable(
    rows: RowMetadata | RowMetadata[],
    options: InsertRowsOptions
  ): Promise<bigquery.ITableDataInsertAllResponse | bigquery.ITable> {
    const {schema} = options;
    const delay = 60000;

    try {
      return await this._insertWithRetry(rows, options);
    } catch (err) {
      if ((err as common.ApiError).code !== 404 || !schema) {
        throw err;
      }
    }

    try {
      await this.create({schema});
    } catch (err) {
      if ((err as common.ApiError).code !== 409) {
        throw err;
      }
    }

    // table creation after failed access is subject to failure caching and
    // eventual consistency, see:
    // https://github.com/googleapis/google-cloud-python/issues/4553#issuecomment-350110292
    await new Promise(resolve => setTimeout(resolve, delay));
    return this._insertAndCreateTable(rows, options);
  }

  /**
   * This method will attempt to insert rows while retrying any partial failures
   * that occur along the way. Because partial insert failures are returned
   * differently, we can't depend on our usual retry strategy.
   *
   * @private
   *
   * @param {RowMetadata|RowMetadata[]} rows The rows to insert.
   * @param {InsertRowsOptions} options Insert options.
   * @returns {Promise<bigquery.ITableDataInsertAllResponse>}
   */
  private async _insertWithRetry(
    rows: RowMetadata | RowMetadata[],
    options: InsertRowsOptions
  ): Promise<bigquery.ITableDataInsertAllResponse> {
    const {partialRetries = 3} = options;
    let error: Error;

    const maxAttempts = Math.max(partialRetries, 0) + 1;

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      try {
        return await this._insert(rows, options);
      } catch (e) {
        error = e;
        rows = ((e.errors || []) as PartialInsertFailure[])
          .filter(err => !!err.row)
          .map(err => err.row);

        if (!rows.length) {
          break;
        }
      }
    }

    throw error!;
  }

  /**
   * This method does the bulk of the work for processing options and making the
   * network request.
   *
   * @private
   *
   * @param {RowMetadata|RowMetadata[]} rows The rows to insert.
   * @param {InsertRowsOptions} options Insert options.
   * @returns {Promise<bigquery.ITableDataInsertAllResponse>}
   */
  private async _insert(
    rows: RowMetadata | RowMetadata[],
    options: InsertRowsOptions
  ): Promise<bigquery.ITableDataInsertAllResponse> {
    rows = arrify(rows) as RowMetadata[];

    if (!rows.length) {
      throw new Error('You must provide at least 1 row to be inserted.');
    }

    const json = extend(true, {}, options, {rows});

    if (!options.raw) {
      json.rows = rows.map((row: RowMetadata) => {
        const encoded: InsertRow = {
          json: Table.encodeValue_(row)!,
        };

        if (options.createInsertId !== false) {
          encoded.insertId = uuid.v4();
        }

        return encoded;
      });
    }

    delete json.createInsertId;
    delete json.partialRetries;
    delete json.raw;
    delete json.schema;

    const [resp] = await this.request({
      method: 'POST',
      uri: '/insertAll',
      json,
    });

    const partialFailures = (resp.insertErrors || []).map(
      (insertError: GoogleErrorBody) => {
        return {
          errors: insertError.errors!.map(error => {
            return {
              message: error.message,
              reason: error.reason,
            };
          }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          row: rows[(insertError as any).index],
        };
      }
    );

    if (partialFailures.length > 0) {
      throw new common.util.PartialFailureError({
        errors: partialFailures,
        response: resp,
      } as GoogleErrorBody);
    }

    return resp;
  }

  load(
    source: string | File,
    metadata?: JobLoadMetadata
  ): Promise<JobMetadataResponse>;
  load(
    source: string | File,
    metadata: JobLoadMetadata,
    callback: JobMetadataCallback
  ): void;
  load(source: string | File, callback: JobMetadataCallback): void;
  /**
   * Load data from a local file or Storage {@link
   * https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}.
   *
   * By loading data this way, you create a load job that will run your data
   * load asynchronously. If you would like instantaneous access to your data,
   * insert it using {@link Table#insert}.
   *
   * Note: The file type will be inferred by the given file's extension. If you
   * wish to override this, you must provide `metadata.format`.
   *
   * @param {string|File} source The source file to load. A filepath as a string
   *     or a {@link
   * https://cloud.google.com/nodejs/docs/reference/storage/latest/File File}
   * object.
   * @param {object} [metadata] Metadata to set with the load operation. The
   *     metadata object should be in the format of the
   *     [`configuration.load`](https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad)
   * property of a Jobs resource.
   * @param {string} [metadata.format] The format the data being loaded is in.
   *     Allowed options are "AVRO", "CSV", "JSON", "ORC", or "PARQUET".
   * @param {string} [metadata.jobId] Custom id for the underlying job.
   * @param {string} [metadata.jobPrefix] Prefix to apply to the underlying job
   *     id.
   * @param {function} [callback] The callback function.
   * @param {?error} callback.err An error returned while making this request
   * @param {object} callback.apiResponse The full API response.
   * @returns {Promise}
   *
   * @throws {Error} If the source isn't a string file name or a File instance.
   *
   * @example
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const table = dataset.table('my-table');
   *
   * //-
   * // Load data from a local file.
   * //-
   * table.load('./institutions.csv', (err, apiResponse) => {});
   *
   * //-
   * // You may also pass in metadata in the format of a Jobs resource. See
   * // (https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad)
   * // for a full list of supported values.
   * //-
   * const metadata = {
   *   encoding: 'ISO-8859-1',
   *   sourceFormat: 'NEWLINE_DELIMITED_JSON'
   * };
   *
   * table.load('./my-data.csv', metadata, (err, apiResponse) => {});
   *
   * //-
   * // Load data from a file in your Cloud Storage bucket.
   * //-
   * const gcs = require('@google-cloud/storage')({
   *   projectId: 'grape-spaceship-123'
   * });
   * const data = gcs.bucket('institutions').file('data.csv');
   * table.load(data, (err, apiResponse) => {});
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
   *   const apiResponse = data[0];
   * });
   */
  load(
    source: string | File,
    metadataOrCallback?: JobLoadMetadata | JobMetadataCallback,
    cb?: JobMetadataCallback
  ): void | Promise<JobMetadataResponse> {
    const metadata =
      typeof metadataOrCallback === 'object' ? metadataOrCallback : {};
    const callback =
      typeof metadataOrCallback === 'function' ? metadataOrCallback : cb;

    this.createLoadJob(source as File, metadata, (err, job, resp) => {
      if (err) {
        callback!(err, resp);
        return;
      }

      job!.on('error', callback!).on('complete', metadata => {
        callback!(null, metadata);
      });
    });
  }

  query(query: Query): Promise<SimpleQueryRowsResponse>;
  query(query: Query, callback: SimpleQueryRowsCallback): void;
  /**
   * Run a query scoped to your dataset.
   *
   * See {@link BigQuery#query} for full documentation of this method.
   * @param {object} query See {@link BigQuery#query} for full documentation of this method.
   * @param {function} [callback] See {@link BigQuery#query} for full documentation of this method.
   * @returns {Promise}
   */
  query(
    query: Query,
    callback?: SimpleQueryRowsCallback
  ): void | Promise<SimpleQueryRowsResponse> {
    this.dataset.query(query, callback!);
  }

  setMetadata(
    metadata: SetTableMetadataOptions
  ): Promise<common.SetMetadataResponse>;
  setMetadata(
    metadata: SetTableMetadataOptions,
    callback: common.ResponseCallback
  ): void;
  /**
   * Set the metadata on the table.
   *
   * @see [Tables: patch API Documentation]{@link https://cloud.google.com/bigquery/docs/reference/v2/tables/patch}
   *
   * @param {object} metadata The metadata key/value object to set.
   * @param {string} metadata.description A user-friendly description of the
   *     table.
   * @param {string} metadata.name A descriptive name for the table.
   * @param {string|object} metadata.schema A comma-separated list of name:type
   *     pairs. Valid types are "string", "integer", "float", "boolean",
   * "bytes", "record", and "timestamp". If the type is omitted, it is assumed
   * to be "string". Example: "name:string, age:integer". Schemas can also be
   *     specified as a JSON array of fields, which allows for nested and
   * repeated fields. See a [Table resource](http://goo.gl/sl8Dmg) for more
   * detailed information.
   * @param {function} [callback] The callback function.
   * @param {?error} callback.err An error returned while making this request.
   * @param {object} callback.apiResponse The full API response.
   * @returns {Promise}
   *
   * @example
   * const {BigQuery} = require('@google-cloud/bigquery');
   * const bigquery = new BigQuery();
   * const dataset = bigquery.dataset('my-dataset');
   * const table = dataset.table('my-table');
   *
   * const metadata = {
   *   name: 'My recipes',
   *   description: 'A table for storing my recipes.',
   *   schema: 'name:string, servings:integer, cookingTime:float, quick:boolean'
   * };
   *
   * table.setMetadata(metadata, (err, metadata, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * table.setMetadata(metadata).then((data) => {
   *   const metadata = data[0];
   *   const apiResponse = data[1];
   * });
   */
  setMetadata(
    metadata: SetTableMetadataOptions,
    callback?: common.ResponseCallback
  ): void | Promise<common.SetMetadataResponse> {
    const body = Table.formatMetadata_(metadata as TableMetadata);
    super.setMetadata(body, callback!);
  }
}

/*! Developer Documentation
 *
 * These methods can be auto-paginated.
 */
paginator.extend(Table, ['getRows']);

/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
promisifyAll(Table);

/**
 * Reference to the {@link Table} class.
 * @name module:@google-cloud/bigquery.Table
 * @see Table
 */
export {Table};

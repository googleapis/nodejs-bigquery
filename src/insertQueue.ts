/*!
 * Copyright 2021 Google Inc. All Rights Reserved.
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
import * as extend from 'extend';
import * as uuid from 'uuid';
import {RequestCallback, Table} from '.';
import {GoogleErrorBody} from '@google-cloud/common/build/src/util';
import bigquery from './types';
import {BATCH_LIMITS, RowBatch} from './rowBatch';

export const defaultOptions = {
  // The maximum number of rows we'll batch up for insert().
  maxOutstandingRows: 100,

  // The maximum size of the total batched up rows for insert().
  maxOutstandingBytes: 1 * 1024 * 1024,

  // The maximum time we'll wait to send batched rows, in milliseconds.
  maxDelayMillis: 10,
};

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

export interface InsertRow {
  insertId?: string;
  json?: bigquery.IJsonObject;
}

export type TableRow = bigquery.ITableRow;
export type TableRowField = bigquery.ITableCell;
export type TableRowValue = string | TableRow;

export interface PartialInsertFailure {
  message: string;
  reason: string;
  row: RowMetadata;
}

export interface BatchInsertOptions {
  maxBytes?: number;
  maxRows?: number;
  maxMilliseconds?: number;
}

export abstract class RowQueue {
  batchOptions: any;
  table: any;
  insertOpts: any;
  pending?: NodeJS.Timer;
  stream: any;
  constructor(table: any, dup: any, options?: any) {
    this.table = table;
    this.stream = dup;
  }

  /**
   * Adds a row to the queue.
   *
   * @abstract
   *
   * @param {object} row The row to add.
   * @param {InsertCallback} callback The insert callback.
   */
  abstract add(row: any, callback: any): void;
  /**
   * Method to initiate inserting rows.
   *
   * @abstract
   */
  abstract insert(): void;
  /**
   * Accepts a batch of rows and inserts them into table.
   *
   * @param {object[]} rows The rows to insert.
   * @param {InsertCallback[]} callbacks The corresponding callback functions.
   * @param {function} [callback] Callback to be fired when insert is done.
   */
  _insert(rows: any, callbacks: any[], callback?: any): void {
    const uri = `http://${this.table.bigQuery.apiEndpoint}/bigquery/v2/projects/${this.table.bigQuery.projectId}/datasets/${this.table.dataset.id}/tables/${this.table.id}/insertAll`;

    const reqOpts = {
      uri,
    };

    const json = extend(true, {}, {rows});
    this.table.request(
      {
        method: 'POST',
        uri: '/insertAll',
        json,
      },
      (err: any, resp: any) => {
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
          err = new common.util.PartialFailureError({
            errors: partialFailures,
            response: resp,
          } as GoogleErrorBody);
        }
        callbacks.forEach(callback => callback(err, resp));
        this.stream.emit('response', resp);
        callback(err, resp);
      }
    );
  }
}

/**
 * Standard row queue used for inserting rows.
 *
 * @private
 * @extends RowQueue
 *
 * @param {Table} table The table.
 * @param {Duplex} dup Row stream.
 * @param {InsertRowsOptions} options Insert options.
 */
export class InsertQueue extends RowQueue {
  batch: RowBatch;
  batchOptions: any;
  error: any;
  batches: any;
  inFlight: any;
  constructor(table: any, dup: any, options?: any) {
    super(table, dup, options);
    if (typeof options === 'object') {
      this.batchOptions = options;
    } else {
      this.setOptions();
    }
    this.batch = new RowBatch(this.batchOptions);
    this.inFlight = false;
  }
  /**
   * Adds a row to the queue.
   *
   * @param {BigQueryRow} row The row to insert.
   * @param {InsertRowsCallback} callback The insert callback.
   */
  add(row: any, callback: any): void {
    row = {json: Table.encodeValue_(row)};
    // if (options.createInsertId !== false) {
    row.insertId = uuid.v4();
    // }

    if (!this.batch.canFit(row)) {
      this.insert();
    }

    this.batch.add(row, callback!);

    if (this.batch.isFull()) {
      this.insert();
    } else if (!this.pending) {
      const {maxMilliseconds} = this.batchOptions;
      this.pending = setTimeout(() => {
        this.insert();
      }, maxMilliseconds!);
    }
  }
  /**
   * Cancels any pending inserts and calls _insert immediately.
   */
  insert(callback?: any): void {
    const {rows, callbacks} = this.batch;
    const definedCallback = callback || (() => {});

    this.batch = new RowBatch(this.batchOptions);

    if (this.pending) {
      clearTimeout(this.pending);
      delete this.pending;
    }

    this._insert(rows, callbacks, callback);
  }

  setOptions(options?: any): void {
    const defaults = {
      batching: {
        maxBytes: defaultOptions.maxOutstandingBytes,
        maxRows: defaultOptions.maxOutstandingRows,
        maxMilliseconds: defaultOptions.maxDelayMillis,
      },
    };

    const opts = typeof options === 'object' ? options : defaults;

    this.batchOptions = {
      maxBytes: Math.min(opts.batching.maxBytes, BATCH_LIMITS.maxBytes!),
      maxRows: Math.min(opts.batching.maxRows, BATCH_LIMITS.maxRows!),
      maxMilliseconds: opts.batching.maxMilliseconds,
    };
  }
}

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

import {InsertRowsCallback} from './insertQueue';

export interface BatchInsertOptions {
  maxBytes?: number;
  maxRows?: number;
  maxMilliseconds?: number;
}

export const BATCH_LIMITS: any = {
  maxBytes: Math.pow(1024, 2) * 9,
  maxMessages: 1000,
};

/**
 * @typedef BatchInsertOptions
 * @property {number} [maxBytes=1 * 1024 * 1024] The maximum number of bytes to
 *     buffer before sending a payload.
 * @property {number} [maxRows=100] The maximum number of rows to
 *     buffer before sending a payload.
 * @property {number} [maxMilliseconds=10] The maximum duration to wait before
 *     sending a payload.
 */
/**
 * Call used to help batch rows.
 *
 * @private
 *
 * @param {BatchInsertOptions} options The batching options.
 */
export class RowBatch {
  batchOptions!: BatchInsertOptions;
  rows: any[];
  callbacks: any[];
  created: number;
  bytes: number;
  constructor(options: BatchInsertOptions) {
    this.batchOptions = options;
    this.rows = [];
    this.callbacks = [];
    this.created = Date.now();
    this.bytes = 0;
  }
  /**
   * Adds a row to the current batch.
   *
   * @param {object} message The row to insert.
   * @param {InsertRowsCallback} callback The callback function.
   */
  add(row: any, callback: any): void {
    this.rows.push(row);
    this.callbacks.push(callback);
    this.bytes += Buffer.byteLength(JSON.stringify(row));
  }
  /**
   * Indicates if a given row can fit in the batch.
   *
   * @param {object} row The row in question.
   * @returns {boolean}
   */
  canFit(row: any): boolean {
    const {maxRows, maxBytes} = this.batchOptions;
    return (
      this.rows.length < maxRows! &&
      this.bytes + Buffer.byteLength(JSON.stringify(row)) <= maxBytes!
    );
  }
  /**
   * Checks to see if this batch is at the maximum allowed payload size.
   *
   * @returns {boolean}
   */
  isAtMax(): boolean {
    const {maxRows, maxBytes} = BATCH_LIMITS;
    return this.rows.length >= maxRows! || this.bytes >= maxBytes!;
  }
  /**
   * Indicates if the batch is at capacity.
   *
   * @returns {boolean}
   */
  isFull(): boolean {
    const {maxRows, maxBytes} = this.batchOptions;
    return this.rows.length >= maxRows! || this.bytes >= maxBytes!;
  }
}

// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {util} from '@google-cloud/common';
import * as assert from 'assert';
import {describe, it, before, beforeEach, afterEach} from 'mocha';
import {Duplex, Stream} from 'stream';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as q from '../src/rowQueue';
import * as t from '../src/table';
import * as _root from '../src';
import {GoogleErrorBody} from '@google-cloud/common/build/src/util';
import {RowBatch} from '../src/rowBatch';

class FakeRowBatch {
  batchOptions: t.RowBatchOptions;
  rows: _root.RowMetadata[];
  callbacks: any[];
  created: number;
  bytes: number;
  constructor(options: t.RowBatchOptions) {
    this.batchOptions = options!;
    this.rows = [];
    this.callbacks = [];
    this.created = Date.now();
    this.bytes = 0;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  add(row: t.RowMetadata, callback: t.InsertRowsCallback): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canFit(row: t.RowMetadata): boolean {
    return true;
  }
  isAtMax(): boolean {
    return false;
  }
  isFull(): boolean {
    return false;
  }
}

const DATASET = ({
  id: 'dataset-id',
  createTable: util.noop,
  bigQuery: {
    projectId: 'project-id',
    job: (id: string) => {
      return {id};
    },
    apiEndpoint: 'bigquery.googleapis.com',
    request: util.noop,
  },
} as {}) as _root.Dataset;

describe('Queues', () => {
  const sandbox = sinon.createSandbox();

  const Table = require('../src/table').Table;
  let dup: Stream;
  let fakeTable: t.Table;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let RowQueue: any;

  before(() => {
    const mocked = proxyquire('../src/rowQueue.js', {
      './rowBatch': {RowBatch: FakeRowBatch},
    });
    RowQueue = mocked.RowQueue;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('RowQueue', () => {
    let queue: q.RowQueue;

    beforeEach(() => {
      dup = new Duplex({objectMode: true});
      fakeTable = new Table(DATASET, 'fake_table_id');
      queue = new RowQueue(fakeTable, dup);
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe('initialization', () => {
      it('should create a row batch', () => {
        assert.ok(queue.batch instanceof FakeRowBatch);
        assert.strictEqual(queue.batch.batchOptions, queue.batchOptions);
      });

      it('should localize the stream', () => {
        assert.strictEqual(queue.stream, dup);
      });

      it('should localize the table', () => {
        assert.strictEqual(queue.table, fakeTable);
      });

      it('should set options', () => {
        const opts = {
          insertRowsOptions: {raw: true},
          batchOptions: {maxBytes: 10, maxMilliseconds: 10, maxRows: 10},
        };
        queue = new RowQueue(fakeTable, dup, opts);
        assert.deepStrictEqual(queue.batch.batchOptions, opts.batchOptions);
        assert.deepStrictEqual(queue.insertRowsOptions, opts.insertRowsOptions);
      });
    });

    describe('setOptions', () => {
      it('should use defaults if min', () => {
        queue = new RowQueue(fakeTable, dup);
        const opts = {
          maxRows: q.defaultOptions.maxOutstandingRows,
          maxBytes: q.defaultOptions.maxOutstandingBytes,
          maxMilliseconds: q.defaultOptions.maxDelayMillis,
        };
        queue.setOptions();
        assert.deepStrictEqual(queue.batchOptions, opts);
      });

      // it('should use defaults if min', () => {
      //   queue = new RowQueue(fakeTable, dup, [])
      //   // const opts = {maxRows: q.defaultOptions.maxOutstandingRows, maxBytes: q.defaultOptions.maxOutstandingBytes, maxMilliseconds: q.defaultOptions.maxDelayMillis}
      //   // queue.setOptions()
      //   assert.deepStrictEqual(queue.batchOptions, {})
      // });
    });

    describe('add', () => {
      const spy = sandbox.spy();
      const fakeRowMetadata: q.RowMetadata = {name: 'Turing'};

      it('should publish immediately if unable to fit message', done => {
        const clock = sandbox.useFakeTimers();
        const addStub = sandbox.stub(queue.batch, 'add');
        sandbox.stub(queue.batch, 'canFit').returns(false);

        sandbox
          .stub(queue, 'insert')
          .onCall(0)
          .callsFake(() => {
            assert.strictEqual(addStub.callCount, 0);
            done();
          });

        queue.add(fakeRowMetadata, spy);
        clock.restore();
      });

      it('should add the row to the batch', () => {
        const clock = sandbox.useFakeTimers();
        const stub = sandbox.stub(queue.batch, 'add');
        sandbox.stub(queue, 'insert');

        queue.add(fakeRowMetadata, spy);

        const [row, callback] = stub.lastCall.args;
        assert.deepStrictEqual(row.json, fakeRowMetadata);
        assert.strictEqual(callback, spy);
        clock.restore();
      });

      it('should insert immediately if the batch became full', () => {
        const stub = sandbox.stub(queue, 'insert');
        sandbox.stub(queue.batch, 'isFull').returns(true);

        queue.add(fakeRowMetadata, spy);

        assert.strictEqual(stub.callCount, 1);
      });

      it('should set a timeout to publish if need be', () => {
        const clock = sandbox.useFakeTimers();
        const stub = sandbox.stub(queue, 'insert');
        const maxMilliseconds = 1234;
        const maxRows = 123;
        const maxBytes = 123;

        queue.batchOptions = {maxMilliseconds, maxBytes, maxRows};
        queue.add(fakeRowMetadata, spy);

        assert.strictEqual(stub.callCount, 0);
        clock.tick(maxMilliseconds);
        assert.strictEqual(stub.callCount, 1);
        clock.restore();
      });

      it('should noop if a timeout is already set', () => {
        const clock = sandbox.useFakeTimers();
        const stub = sandbox.stub(queue, 'insert');
        const maxMilliseconds = 1234;
        const maxRows = 123;
        const maxBytes = 123;

        queue.batchOptions = {maxMilliseconds, maxBytes, maxRows};
        queue.pending = (1234 as unknown) as NodeJS.Timer;
        queue.add(fakeRowMetadata, spy);

        clock.tick(maxMilliseconds);
        assert.strictEqual(stub.callCount, 0);
        clock.restore();
      });

      it('should set insert id', () => {
        const addStub = sandbox.stub(queue.batch, 'add');
        queue.insertRowsOptions.createInsertId = true;
        queue.add(fakeRowMetadata, spy);
        assert.ok(addStub.args[0][0].insertId);
      });
    });

    describe('insert', () => {
      it('should create a new batch', () => {
        const oldBatch = queue.batch;

        queue.insert();

        assert.notStrictEqual(oldBatch, queue.batch);
        assert.ok(queue.batch instanceof FakeRowBatch);
        assert.strictEqual(queue.batch.batchOptions, queue.batchOptions);
      });

      it('should cancel any pending insert calls', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fakeHandle = (1234 as unknown) as any;
        const stub = sandbox.stub(global, 'clearTimeout').withArgs(fakeHandle);

        queue.pending = fakeHandle;
        queue.insert();

        assert.strictEqual(stub.callCount, 1);
        assert.strictEqual(queue.pending, undefined);
      });

      it('should insert the rows', () => {
        const batch = queue.batch;
        batch.rows = [{name: 'Turing'}];
        const stub = sandbox.stub(queue, '_insert');

        queue.insert();

        const [rows, callbacks] = stub.lastCall.args;
        assert.strictEqual(rows, batch.rows);
        assert.strictEqual(callbacks, batch.callbacks);
      });

      it('should not call insert if batch.rows is empty', () => {
        const stub = sandbox.stub(queue, '_insert');

        queue.insert();
        assert.ok(stub.notCalled);
      });
    });

    describe('_insert', () => {
      const rows = [{}, {}, {}];
      const callbacks = rows.map(() => sandbox.spy());

      const row0Error = {message: 'Error.', reason: 'notFound'};
      const row1Error = {message: 'Error.', reason: 'notFound'};
      const data = [
        {state: 'MI', gender: 'M', year: '2015', name: 'Berkley', count: '0'},
        {state: 'MI', gender: 'M', year: '2015', name: 'Berkley', count: '0'},
        {state: 'MI', gender: 'M', year: '2015', name: 'Berkley', count: '0'},
        {state: 'MI', gender: 'M', year: '2015', name: 'Berkley', count: '0'},
        {state: 'MI', gender: 'M', year: '2015', name: 'Berkley', count: '0'},
      ];

      const dataApiFormat = {
        rows: data.map(row => {
          return {
            json: row,
          };
        }),
      };
      const error = ({
        errors: [
          {
            row: dataApiFormat.rows[0].json,
            errors: [row0Error],
          },
          {
            row: dataApiFormat.rows[1].json,
            errors: [row1Error],
          },
        ],
      } as unknown) as Error;

      it('should make the correct request', () => {
        const stub = sandbox.stub(fakeTable, 'request');
        queue = new RowQueue(fakeTable, dup);

        queue._insert(rows, callbacks);

        const [{json, method, uri}] = stub.lastCall.args;
        assert.deepStrictEqual(json.rows[0], rows[0]);
        assert.deepStrictEqual(json.rows[1], rows[1]);
        assert.deepStrictEqual(json.rows[2], rows[2]);
        assert.strictEqual(method, 'POST');
        assert.strictEqual(uri, '/insertAll');
      });

      it('should work without callback provided', () => {
        const stub = sandbox.stub(fakeTable, 'request');
        queue = new RowQueue(fakeTable, dup);

        queue._insert(rows, callbacks);

        const [{json, method, uri}] = stub.lastCall.args;
        assert.deepStrictEqual(json.rows[0], rows[0]);
        assert.deepStrictEqual(json.rows[1], rows[1]);
        assert.deepStrictEqual(json.rows[2], rows[2]);
        assert.strictEqual(method, 'POST');
        assert.strictEqual(uri, '/insertAll');
      });

      it('should make the correct request with raw data', () => {
        const stub = sandbox.stub(fakeTable, 'request');
        queue = new RowQueue(fakeTable, dup, {insertRowsOptions: {raw: true}});

        queue._insert(rows, callbacks);

        const [{json, method, uri}] = stub.lastCall.args;
        assert.deepStrictEqual(json.rows, rows);
        assert.strictEqual(method, 'POST');
        assert.strictEqual(uri, '/insertAll');
      });

      it('should pass back any request errors', done => {
        queue = new q.RowQueue(fakeTable, dup, {});

        sandbox.stub(fakeTable, 'request').callsFake((config, callback) => {
          return callback(error, config);
        });

        queue._insert(rows, callbacks, (err: any) => {
          assert.strictEqual(err, error);

          callbacks.forEach(callback => {
            const [err] = callback.lastCall.args;
            assert.strictEqual(err, error);
          });

          done();
        });
      });

      it('should execute callback with API response', done => {
        // const requestStub = sandbox.stub(fakeTable, 'request');
        const row0Error = {errors: [{message: 'Error.', reason: 'notFound'}]};
        const row1Error = {message: 'Error.', reason: 'notFound'};
        const apiResponse = {insertErrors: [row0Error]};
        const ok = 10;
        queue.stream.on('error', () => {
          assert(true);
          // assert.strictEqual(ok,100)
          done();
        });
        // requestStub.resolves([apiResponse]);
        sandbox.stub(fakeTable, 'request').callsFake((config, callback) => {
          return callback(error, apiResponse);
        });

        queue._insert(rows, callbacks, (err: any, apiResponse_: any) => {
          assert.strictEqual(err, error);

          callbacks.forEach(callback => {
            const [err] = callback.lastCall.args;
            assert.strictEqual(err, error);
          });
          // assert.ifError(err);
          assert.strictEqual(apiResponse_, apiResponse);
          // done();
        });
      });

      // it('should return partial failures', async () => {
      //   const row0Error = {message: 'Error.', reason: 'notFound'};
      //   const row1Error = {message: 'Error.', reason: 'notFound'};
      //   const requestStub = sandbox.stub(fakeTable, 'request');
      //   requestStub.resolves([
      //     {
      //       insertErrors: [
      //         {index: 0, errors: [row0Error]},
      //         {index: 1, errors: [row1Error]},
      //       ],
      //     },
      //   ]);

      //   const reflection = await reflectAfterTimer(async () => queue._insert(rows, []));
      //   assert(reflection.isRejected);
      //   const {reason} = reflection;
      //   assert.deepStrictEqual((reason as GoogleErrorBody).errors, [
      //     {
      //       row: dataApiFormat.rows[0].json,
      //       errors: [row0Error],
      //     },
      //     {
      //       row: dataApiFormat.rows[1].json,
      //       errors: [row1Error],
      //     },
      //   ]);
      // });
    });
  });
});

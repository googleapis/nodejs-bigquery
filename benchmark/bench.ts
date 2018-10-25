/*!
 * Copyright 2017 Google Inc. All Rights Reserved.
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

import * as async from 'async';
import * as fs from 'fs';
import {BigQuery} from '../src';
const env = require('../../../system-test/env.js');

if (process.argv.length < 3) {
  throw new Error(`need query file; ` +
    `usage: '${process.argv[0]} ${process.argv[1]} <queries.json>'`);
}

const queryJson = fs.readFileSync(process.argv[2], 'utf8');
const queries = JSON.parse(queryJson);
const client = new BigQuery(env);

const doQuery = (queryTxt, callback) =>{
  const startMilli = new Date().getTime();
  let numRows = 0;
  let numCols;
  let timeFirstByteMilli;

  const query = {
    query: queryTxt,
    useLegacySql: false
  };

  client
    .createQueryStream(query)
    .on('error', callback)
    .on('data', function(row) {
      if (numRows === 0) {
        numCols = Object.keys(row).length;
        timeFirstByteMilli = new Date().getTime() - startMilli;
      } else if (numCols !== Object.keys(row).length) {
        this.end();

        const receivedCols = Object.keys(row).length;
        const error = new Error(
          `query "${queryTxt}": ` +
            `wrong number of columns, want ${numCols} got ${receivedCols}`
        );

        callback(error);
      }
      numRows++;
    })
    .on('end', () => {
      const timeTotalMilli = new Date().getTime() - startMilli;
      console.log(
        `query ${queryTxt}:`,
          `got ${numRows} rows,`,
          `${numCols} cols,`,
          `first byte ${timeFirstByteMilli / 1000} sec,`,
          `total ${timeTotalMilli / 1000} sec`
      );

      callback(null);
    });
};

async.eachSeries(queries, doQuery, err => {
  if (err) {
    console.error(err);
  }
});

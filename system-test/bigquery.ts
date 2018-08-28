/**
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

import * as assert from 'assert';
import * as async from 'async';
import * as Big from 'big.js';
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as exec from 'methmeth';

import {Dataset} from '../src/dataset';
import {Job} from '../src/job';
import {Table} from '../src/table';

const BigQuery = require('../src');
const bigquery = new BigQuery();
const storage = require('@google-cloud/storage')();

describe('BigQuery', function() {
  const GCLOUD_TESTS_PREFIX = 'nodejs_bq_test';

  const dataset = bigquery.dataset(generateName('dataset'));
  const table = dataset.table(generateName('table'));
  const bucket = storage.bucket(generateName('bucket'));

  const query = 'SELECT url FROM `publicdata.samples.github_nested` LIMIT 100';

  const SCHEMA = [
    {
      name: 'id',
      type: 'INTEGER',
    },
    {
      name: 'breed',
      type: 'STRING',
    },
    {
      name: 'name',
      type: 'STRING',
    },
    {
      name: 'dob',
      type: 'TIMESTAMP',
    },
    {
      name: 'around',
      type: 'BOOLEAN',
    },
    {
      name: 'buffer',
      type: 'BYTES',
    },
    {
      name: 'arrayOfInts',
      type: 'INTEGER',
      mode: 'REPEATED',
    },
    {
      name: 'recordOfRecords',
      type: 'RECORD',
      fields: [
        {
          name: 'records',
          type: 'RECORD',
          mode: 'REPEATED',
          fields: [
            {
              name: 'record',
              type: 'BOOLEAN',
            },
          ],
        },
      ],
    },
  ];

  before(function(done) {
    async.series(
      [
        // Remove buckets created for the tests.
        deleteBuckets,

        // Remove datasets created for the tests.
        deleteDatasets,

        // Create the test dataset with a label tagging this as a test run.
        dataset.create.bind(dataset, {
          labels: [{[GCLOUD_TESTS_PREFIX]: ''}]
        }),

        // Create the test table.
        table.create.bind(table, {
          schema: SCHEMA,
        }),

        // Create a Bucket.
        bucket.create.bind(bucket),
      ],
      done
    );
  });

  after(function(done) {
    async.parallel(
      [
        // Remove buckets created for the tests.
        deleteBuckets,

        // Remove datasets created for the tests.
        deleteDatasets,
      ],
      done
    );
  });

  it('should get a list of datasets', function(done) {
    bigquery.getDatasets(function(err, datasets) {
      assert(datasets.length > 0);
      assert(datasets[0] instanceof Dataset);
      done();
    });
  });

  it('should allow limiting API calls', function(done) {
    const maxApiCalls = 1;
    let numRequestsMade = 0;

    const BigQuery = require('../src');
    const bigquery = new BigQuery();

    bigquery.interceptors.push({
      request: function(reqOpts) {
        numRequestsMade++;
        return reqOpts;
      },
    });

    bigquery.getDatasets({maxApiCalls: maxApiCalls}, function(err) {
      assert.ifError(err);
      assert.strictEqual(numRequestsMade, 1);
      done();
    });
  });

  it('should return a promise', function() {
    return bigquery.getDatasets().then(function(data) {
      const datasets = data[0];

      assert(datasets.length > 0);
      assert(datasets[0] instanceof Dataset);
    });
  });

  it('should allow limiting API calls via promises', function() {
    const maxApiCalls = 1;
    let numRequestsMade = 0;

    const BigQuery = require('../src');
    const bigquery = new BigQuery();

    bigquery.interceptors.push({
      request: function(reqOpts) {
        numRequestsMade++;
        return reqOpts;
      },
    });

    return bigquery
      .getDatasets({
        maxApiCalls: maxApiCalls,
      })
      .then(function() {
        assert.strictEqual(numRequestsMade, maxApiCalls);
      });
  });

  it('should allow for manual pagination in promise mode', function() {
    return bigquery
      .getDatasets({
        autoPaginate: false,
      })
      .then(function(data) {
        const datasets = data[0];
        const nextQuery = data[1];
        const apiResponse = data[2];

        assert(datasets[0] instanceof Dataset);
        assert.strictEqual(nextQuery, null);
        assert(apiResponse);
      });
  });

  it('should list datasets as a stream', function(done) {
    let datasetEmitted = false;

    bigquery
      .getDatasetsStream()
      .on('error', done)
      .on('data', function(dataset) {
        datasetEmitted = dataset instanceof Dataset;
      })
      .on('end', function() {
        assert.strictEqual(datasetEmitted, true);
        done();
      });
  });

  it('should run a query job, then get results', function(done) {
    bigquery.createQueryJob(query, function(err, job) {
      assert.ifError(err);
      assert(job instanceof Job);

      job.getQueryResults(function(err, rows) {
        assert.ifError(err);
        assert.strictEqual(rows.length, 100);
        assert.strictEqual(typeof rows[0].url, 'string');
        done();
      });
    });
  });

  it('should run a query job as a promise', function() {
    let job;

    return bigquery
      .createQueryJob(query)
      .then(function(response) {
        job = response[0];
        return job.promise();
      })
      .then(function() {
        return job.getQueryResults();
      })
      .then(function(response) {
        const rows = response[0];
        assert.strictEqual(rows.length, 100);
        assert.strictEqual(typeof rows[0].url, 'string');
      });
  });

  it('should get query results as a stream', function(done) {
    bigquery.createQueryJob(query, function(err, job) {
      assert.ifError(err);

      const rowsEmitted: any[] = [];

      job
        .getQueryResultsStream()
        .on('error', done)
        .on('data', function(row) {
          rowsEmitted.push(row);
        })
        .on('end', function() {
          assert.strictEqual(rowsEmitted.length, 100);
          assert.strictEqual(typeof rowsEmitted[0].url, 'string');
          done();
        });
    });
  });

  it('should honor the job prefix option', function(done) {
    const options = {
      query: query,
      jobPrefix: 'hi-im-a-prefix',
    };

    bigquery.createQueryJob(options, function(err, job) {
      assert.ifError(err);
      assert.strictEqual(job.id.indexOf(options.jobPrefix), 0);

      job.getQueryResults(function(err, rows) {
        assert.ifError(err);
        assert.strictEqual(rows.length, 100);
        assert.strictEqual(typeof rows[0].url, 'string');
        done();
      });
    });
  });

  it('should honor the job id option', function(done) {
    const jobId = `hi-im-a-job-id-${uuid.v4()}`;
    const options = {query, jobId};

    bigquery.createQueryJob(options, function(err, job) {
      assert.ifError(err);
      assert.strictEqual(job.id, jobId);

      job.getQueryResults(done);
    });
  });

  it('should honor the dryRun option', function(done) {
    const options = {
      query: query,
      dryRun: true,
    };

    bigquery.createQueryJob(options, function(err, job) {
      assert.ifError(err);
      assert(job.metadata.statistics);
      done();
    });
  });

  it('should query as a stream', function(done) {
    let rowsEmitted = 0;

    bigquery
      .createQueryStream(query)
      .on('data', function(row) {
        rowsEmitted++;
        assert.strictEqual(typeof row.url, 'string');
      })
      .on('error', done)
      .on('end', function() {
        assert.strictEqual(rowsEmitted, 100);
        done();
      });
  });

  it('should query', function(done) {
    bigquery.query(query, function(err, rows) {
      assert.ifError(err);
      assert.strictEqual(rows.length, 100);
      done();
    });
  });

  it('should allow querying in series', function(done) {
    bigquery.query(
      query,
      {
        maxResults: 10,
      },
      function(err, rows, nextQuery) {
        assert.ifError(err);
        assert.strictEqual(rows.length, 10);
        assert.strictEqual(typeof nextQuery.pageToken, 'string');
        done();
      }
    );
  });

  it('should accept the dryRun option', function(done) {
    bigquery.query(
      {
        query,
        dryRun: true,
      },
      function(err, rows, resp) {
        assert.ifError(err);
        assert.deepStrictEqual(rows, []);
        assert(resp.statistics.query);
        done();
      }
    );
  });

  it('should get a list of jobs', function(done) {
    bigquery.getJobs(function(err, jobs) {
      assert.ifError(err);
      assert(jobs[0] instanceof Job);
      done();
    });
  });

  it('should list jobs as a stream', function(done) {
    let jobEmitted = false;

    bigquery
      .getJobsStream()
      .on('error', done)
      .on('data', function(job) {
        jobEmitted = job instanceof Job;
      })
      .on('end', function() {
        assert.strictEqual(jobEmitted, true);
        done();
      });
  });

  it('should cancel a job', function(done) {
    const query = 'SELECT url FROM `publicdata.samples.github_nested` LIMIT 10';

    bigquery.createQueryJob(query, function(err, job) {
      assert.ifError(err);

      job.cancel(function(err) {
        assert.ifError(err);

        job.on('error', done).on('complete', function() {
          done();
        });
      });
    });
  });

  describe('BigQuery/Dataset', function() {
    it('should set & get metadata', function(done) {
      dataset.setMetadata(
        {
          description: 'yay description',
        },
        function(err) {
          assert.ifError(err);

          dataset.getMetadata(function(err, metadata) {
            assert.ifError(err);
            assert.strictEqual(metadata.description, 'yay description');
            done();
          });
        }
      );
    });

    it('should use etags for locking', function(done) {
      dataset.getMetadata(function(err) {
        assert.ifError(err);

        const etag = dataset.metadata.etag;

        dataset.setMetadata(
          {
            etag: etag,
            description: 'another description',
          },
          function(err) {
            assert.ifError(err);
            // the etag should be updated
            assert.notStrictEqual(etag, dataset.metadata.etag);
            done();
          }
        );
      });
    });

    it('should error out for bad etags', function(done) {
      dataset.setMetadata(
        {
          etag: 'a-fake-etag',
          description: 'oh no!',
        },
        function(err) {
          assert.strictEqual(err.code, 412); // precondition failed
          done();
        }
      );
    });

    it('should get tables', function(done) {
      dataset.getTables(function(err, tables) {
        assert.ifError(err);
        assert(tables[0] instanceof Table);
        done();
      });
    });

    it('should get tables as a stream', function(done) {
      let tableEmitted = false;

      dataset
        .getTablesStream()
        .on('error', done)
        .on('data', function(table) {
          tableEmitted = table instanceof Table;
        })
        .on('end', function() {
          assert.strictEqual(tableEmitted, true);
          done();
        });
    });

    it('should create a Table with a nested schema', function(done) {
      const table = dataset.table(generateName('table'));

      table.create(
        {
          schema: {
            fields: [
              {
                name: 'id',
                type: 'INTEGER',
              },
              {
                name: 'details',
                fields: [
                  {
                    name: 'nested_id',
                    type: 'INTEGER',
                  },
                ],
              },
            ],
          },
        },
        function(err) {
          assert.ifError(err);

          table.getMetadata(function(err, metadata) {
            assert.ifError(err);

            assert.deepStrictEqual(metadata.schema, {
              fields: [
                {
                  name: 'id',
                  type: 'INTEGER',
                },
                {
                  name: 'details',
                  type: 'RECORD',
                  fields: [
                    {
                      name: 'nested_id',
                      type: 'INTEGER',
                    },
                  ],
                },
              ],
            });

            done();
          });
        }
      );
    });

    describe('location', function() {
      const LOCATION = 'asia-northeast1';

      const dataset = bigquery.dataset(generateName('dataset'), {
        location: LOCATION,
      });

      const table = dataset.table(generateName('table'));
      let job;

      const QUERY = `SELECT * FROM \`${table.id}\``;
      const SCHEMA = require('../../system-test/data/schema.json');
      const TEST_DATA_FILE = require.resolve('../../system-test/data/location-test-data.json');

      before(function() {
        // create a dataset in a certain location will cascade the location
        // to any jobs created through it
        return dataset
          .create()
          .then(() => {
            return table.create({schema: SCHEMA});
          })
          .then(() => {
            return table.createLoadJob(TEST_DATA_FILE);
          })
          .then(data => {
            job = data[0];
            return job.promise();
          });
      });

      it('should create a load job in the correct location', function() {
        assert.strictEqual(job.location, LOCATION);
      });

      describe('job.get', function() {
        it('should fail to reload if the location is not set', function(done) {
          const badJob = bigquery.job(job.id);

          badJob.getMetadata(function(err) {
            assert.strictEqual(err.code, 404);
            done();
          });
        });

        it('should fail to reload if the location is wrong', function(done) {
          const badJob = bigquery.job(job.id, {location: 'US'});

          badJob.getMetadata(function(err) {
            assert.strictEqual(err.code, 404);
            done();
          });
        });

        it('should reload if the location matches', function(done) {
          const goodJob = bigquery.job(job.id, {location: LOCATION});

          goodJob.getMetadata(function(err) {
            assert.ifError(err);
            assert.strictEqual(goodJob.location, LOCATION);
            done();
          });
        });
      });

      describe('job.cancel', function() {
        let job;

        before(function() {
          return dataset.createQueryJob(QUERY).then(function(data) {
            job = data[0];
          });
        });

        it('should fail if the job location is incorrect', function(done) {
          const badJob = bigquery.job(job.id, {location: 'US'});

          badJob.cancel(function(err) {
            assert.strictEqual(err.code, 404);
            done();
          });
        });

        it('should cancel a job', function(done) {
          job.cancel(done);
        });
      });

      describe('job.getQueryResults', function() {
        it('should fail if the job location is incorrect', function(done) {
          const badDataset = bigquery.dataset(dataset.id, {location: 'US'});

          badDataset.createQueryJob(
            {
              query: QUERY,
            },
            function(err, job) {
              assert.strictEqual(err.errors[0].reason, 'notFound');
              assert.strictEqual(job.location, 'US');
              done();
            }
          );
        });

        it('should get query results', function() {
          let job;

          return dataset
            .createQueryJob(QUERY)
            .then(function(data) {
              job = data[0];

              assert.strictEqual(job.location, LOCATION);
              return job.promise();
            })
            .then(function() {
              return job.getQueryResults();
            })
            .then(function(data) {
              const rows = data[0];

              assert(rows.length > 0);
            });
        });
      });

      describe('job.insert', function() {
        describe('copy', function() {
          const otherTable = dataset.table(generateName('table'));

          it('should fail if the job location is incorrect', function(done) {
            const badTable = dataset.table(table.id, {location: 'US'});

            badTable.createCopyJob(otherTable, function(err) {
              assert.strictEqual(err.code, 404);
              done();
            });
          });

          it('should copy the table', function() {
            return table.createCopyJob(otherTable).then(function(data) {
              const job = data[0];

              assert.strictEqual(job.location, LOCATION);
              return job.promise();
            });
          });
        });

        describe('extract', function() {
          const bucket = storage.bucket(generateName('bucket'));
          const extractFile = bucket.file('location-extract-data.json');

          before(function() {
            return bucket.create({location: LOCATION});
          });

          it('should fail if the job location is incorrect', function(done) {
            const badTable = dataset.table(table.id, {location: 'US'});

            badTable.createExtractJob(extractFile, function(err) {
              assert.strictEqual(err.code, 404);
              done();
            });
          });

          it('should extract the table', function() {
            return table.createExtractJob(extractFile).then(function(data) {
              const job = data[0];

              assert.strictEqual(job.location, LOCATION);
              return job.promise();
            });
          });
        });
      });
    });
  });

  describe('BigQuery/Table', function() {
    const TEST_DATA_JSON_PATH = require.resolve('../../system-test/data/kitten-test-data.json');

    it('should have created the correct schema', function() {
      assert.deepStrictEqual(table.metadata.schema.fields, SCHEMA);
    });

    it('should get the rows in a table', function(done) {
      table.getRows(function(err, rows) {
        assert.ifError(err);
        assert(Array.isArray(rows));
        done();
      });
    });

    it('should get the rows in a table via stream', function(done) {
      table
        .createReadStream()
        .on('error', done)
        .on('data', function() {})
        .on('end', done);
    });

    it('should insert rows via stream', function(done) {
      let job;

      fs.createReadStream(TEST_DATA_JSON_PATH)
        .pipe(table.createWriteStream('json'))
        .on('error', done)
        .on('complete', function(_job) {
          job = _job;
        })
        .on('finish', function() {
          assert.strictEqual(job.metadata.status.state, 'DONE');
          done();
        });
    });

    it('should insert rows with null values', function() {
      return table.insert({
        id: 1,
        name: null,
      });
    });

    it('should set & get metadata', function(done) {
      table.setMetadata(
        {
          description: 'catsandstuff',
        },
        function(err) {
          assert.ifError(err);

          table.getMetadata(function(err, metadata) {
            assert.ifError(err);
            assert.strictEqual(metadata.description, 'catsandstuff');
            done();
          });
        }
      );
    });

    describe('copying', function() {
      const TABLES: any = {
        1: {
          data: {
            tableId: 1,
          },
        },

        2: {},
      };

      const SCHEMA = 'tableId:integer';

      before(function(done) {
        TABLES[1].table = dataset.table(generateName('table'));
        TABLES[2].table = dataset.table(generateName('table'));

        async.each(
          TABLES,
          function(tableObject, next) {
            const tableInstance = tableObject.table;

            tableInstance.create(
              {
                schema: SCHEMA,
              },
              next
            );
          },
          function(err) {
            if (err) {
              done(err);
              return;
            }

            const table1Instance = TABLES[1].table;
            table1Instance.insert(TABLES[1].data, done);
          }
        );
      });

      it('should start copying data from current table', function(done) {
        const table1 = TABLES[1];
        const table1Instance = table1.table;

        const table2 = TABLES[2];
        const table2Instance = table2.table;

        table1Instance.createCopyJob(table2Instance, function(err, job) {
          assert.ifError(err);

          job.on('error', done).on('complete', function() {
            // Data may take up to 90 minutes to be copied*, so we cannot test
            // to see that anything but the request was successful.
            // *https://cloud.google.com/bigquery/streaming-data-into-bigquery
            done();
          });
        });
      });

      it('should copy data from current table', function(done) {
        const table1 = TABLES[1];
        const table1Instance = table1.table;

        const table2 = TABLES[2];
        const table2Instance = table2.table;

        table1Instance.copy(table2Instance, function(err, resp) {
          assert.ifError(err);
          assert.strictEqual(resp.status.state, 'DONE');
          done();
        });
      });

      it('should start copying data from another table', function(done) {
        const table1 = TABLES[1];
        const table1Instance = table1.table;

        const table2 = TABLES[2];
        const table2Instance = table2.table;

        table2Instance.createCopyFromJob(table1Instance, function(err, job) {
          assert.ifError(err);

          job.on('error', done).on('complete', function() {
            // Data may take up to 90 minutes to be copied*, so we cannot test
            // to see that anything but the request was successful.
            // *https://cloud.google.com/bigquery/streaming-data-into-bigquery
            done();
          });
        });
      });

      it('should copy data from another table', function(done) {
        const table1 = TABLES[1];
        const table1Instance = table1.table;

        const table2 = TABLES[2];
        const table2Instance = table2.table;

        table2Instance.copyFrom(table1Instance, function(err, resp) {
          assert.ifError(err);
          assert.strictEqual(resp.status.state, 'DONE');
          done();
        });
      });
    });

    describe('loading & extracting', function() {
      const file = bucket.file('kitten-test-data-backup.json');

      before(function(done) {
        fs.createReadStream(TEST_DATA_JSON_PATH)
          .pipe(file.createWriteStream())
          .on('error', done)
          .on('finish', done);
      });

      after(function(done) {
        file.delete(done);
      });

      it('should start to load data from a storage file', function(done) {
        table.createLoadJob(file, function(err, job) {
          assert.ifError(err);

          job.on('error', done).on('complete', function() {
            done();
          });
        });
      });

      it('should load data from a storage file', function(done) {
        table.load(file, function(err, resp) {
          assert.ifError(err);
          assert.strictEqual(resp.status.state, 'DONE');
          done();
        });
      });

      it('should load data from a file via promises', function() {
        return table.load(file).then(function(results) {
          const metadata = results[0];
          assert.strictEqual(metadata.status.state, 'DONE');
        });
      });

      it('should return partial errors', function(done) {
        const data = {
          name: 'dave',
        };

        const improperData = {
          name: true,
        };

        table.insert([data, improperData], function(err) {
          assert.strictEqual(err.name, 'PartialFailureError');

          assert.deepStrictEqual(err.errors[0], {
            errors: [
              {
                message: 'Conversion from bool to string is unsupported.',
                reason: 'invalid',
              },
            ],
            row: improperData,
          });

          assert.deepStrictEqual(err.errors[1], {
            errors: [
              {
                message: '',
                reason: 'stopped',
              },
            ],
            row: data,
          });

          done();
        });
      });

      it('should create tables upon insert', function() {
        const table = dataset.table(generateName('does-not-exist'));

        const row = {
          name: 'stephen',
        };

        const options = {
          autoCreate: true,
          schema: SCHEMA,
        };

        return table
          .insert(row, options)
          .then(function() {
            // getting rows immediately after insert
            // results in an empty array
            return new Promise(function(resolve) {
              setTimeout(resolve, 2500);
            });
          })
          .then(function() {
            return table.getRows();
          })
          .then(function(data) {
            const rows = data[0];

            assert.strictEqual(rows.length, 1);
            assert.strictEqual(rows[0].name, row.name);
          });
      });

      describe('SQL parameters', function() {
        describe('positional', function() {
          it('should work with strings', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT url',
                  'FROM `publicdata.samples.github_nested`',
                  'WHERE repository.owner = ?',
                  'LIMIT 1',
                ].join(' '),
                params: ['google'],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with ints', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT url',
                  'FROM `publicdata.samples.github_nested`',
                  'WHERE repository.forks > ?',
                  'LIMIT 1',
                ].join(' '),
                params: [1],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with floats', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT snow_depth',
                  'FROM `publicdata.samples.gsod`',
                  'WHERE snow_depth >= ?',
                  'LIMIT 1',
                ].join(' '),
                params: [12.5],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with numerics', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT x',
                  'FROM UNNEST([NUMERIC "1", NUMERIC "2", NUMERIC "3"]) x',
                  'WHERE x = ?',
                ].join(' '),
                params: [new Big('2')],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with booleans', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT url',
                  'FROM `publicdata.samples.github_nested`',
                  'WHERE public = ?',
                  'LIMIT 1',
                ].join(' '),
                params: [true],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with arrays', function(done) {
            bigquery.query(
              {
                query: 'SELECT * FROM UNNEST (?)',
                params: [[25, 26, 27, 28, 29]],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 5);
                done();
              }
            );
          });

          it('should work with structs', function(done) {
            bigquery.query(
              {
                query: 'SELECT ? obj',
                params: [
                  {
                    b: true,
                    arr: [2, 3, 4],
                    d: bigquery.date('2016-12-7'),
                    f: 3.14,
                    nested: {
                      a: 3,
                    },
                  },
                ],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with TIMESTAMP types', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT subject',
                  'FROM `bigquery-public-data.github_repos.commits`',
                  'WHERE author.date < ?',
                  'LIMIT 1',
                ].join(' '),
                params: [new Date()],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with DATE types', function(done) {
            bigquery.query(
              {
                query: 'SELECT ? date',
                params: [bigquery.date('2016-12-7')],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with DATETIME types', function(done) {
            bigquery.query(
              {
                query: 'SELECT ? datetime',
                params: [bigquery.datetime('2016-12-7 14:00:00')],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with TIME types', function(done) {
            bigquery.query(
              {
                query: 'SELECT ? time',
                params: [bigquery.time('14:00:00')],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with multiple types', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT url FROM `publicdata.samples.github_nested`',
                  'WHERE repository.owner = ?',
                  'AND repository.forks > ?',
                  'AND public = ?',
                  'LIMIT 1',
                ].join(' '),
                params: ['google', 1, true],
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });
        });

        describe('named', function() {
          it('should work with strings', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT url FROM `publicdata.samples.github_nested`',
                  'WHERE repository.owner = @owner',
                  'LIMIT 1',
                ].join(' '),
                params: {
                  owner: 'google',
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with ints', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT url',
                  'FROM `publicdata.samples.github_nested`',
                  'WHERE repository.forks > @forks',
                  'LIMIT 1',
                ].join(' '),
                params: {
                  forks: 1,
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with floats', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT snow_depth',
                  'FROM `publicdata.samples.gsod`',
                  'WHERE snow_depth >= @depth',
                  'LIMIT 1',
                ].join(' '),
                params: {
                  depth: 12.5,
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with numerics', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT x',
                  'FROM UNNEST([NUMERIC "1", NUMERIC "2", NUMERIC "3"]) x',
                  'WHERE x = @num',
                ].join(' '),
                params: {
                  num: new Big('2'),
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with booleans', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT url',
                  'FROM `publicdata.samples.github_nested`',
                  'WHERE public = @isPublic',
                  'LIMIT 1',
                ].join(' '),
                params: {
                  isPublic: true,
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with arrays', function(done) {
            bigquery.query(
              {
                query: 'SELECT * FROM UNNEST (@nums)',
                params: {
                  nums: [25, 26, 27, 28, 29],
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 5);
                done();
              }
            );
          });

          it('should work with structs', function(done) {
            bigquery.query(
              {
                query: 'SELECT @obj obj',
                params: {
                  obj: {
                    b: true,
                    arr: [2, 3, 4],
                    d: bigquery.date('2016-12-7'),
                    f: 3.14,
                    nested: {
                      a: 3,
                    },
                  },
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with TIMESTAMP types', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT subject',
                  'FROM `bigquery-public-data.github_repos.commits`',
                  'WHERE author.date < @time',
                  'LIMIT 1',
                ].join(' '),
                params: {
                  time: new Date(),
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with DATE types', function(done) {
            bigquery.query(
              {
                query: 'SELECT @date date',
                params: {
                  date: bigquery.date('2016-12-7'),
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with DATETIME types', function(done) {
            bigquery.query(
              {
                query: 'SELECT @datetime datetime',
                params: {
                  datetime: bigquery.datetime('2016-12-7 14:00:00'),
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with TIME types', function(done) {
            bigquery.query(
              {
                query: 'SELECT @time time',
                params: {
                  time: bigquery.time('14:00:00'),
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });

          it('should work with multiple types', function(done) {
            bigquery.query(
              {
                query: [
                  'SELECT url',
                  'FROM `publicdata.samples.github_nested`',
                  'WHERE repository.owner = @owner',
                  'AND repository.forks > @forks',
                  'AND public = @isPublic',
                  'LIMIT 1',
                ].join(' '),
                params: {
                  owner: 'google',
                  forks: 1,
                  isPublic: true,
                },
              },
              function(err, rows) {
                assert.ifError(err);
                assert.strictEqual(rows.length, 1);
                done();
              }
            );
          });
        });
      });

      it('should start extracting data to a storage file', function(done) {
        const file = bucket.file('kitten-test-data-backup.json');

        table.createExtractJob(file, function(err, job) {
          assert.ifError(err);

          job.on('error', done).on('complete', function() {
            done();
          });
        });
      });

      it('should extract data to a storage file', function(done) {
        const file = bucket.file('kitten-test-data-backup.json');

        table.extract(file, function(err, resp) {
          assert.ifError(err);
          assert.strictEqual(resp.status.state, 'DONE');
          done();
        });
      });
    });
  });

  describe('Custom Types', function() {
    let table;

    const DATE = bigquery.date('2017-01-01');
    const DATETIME = bigquery.datetime('2017-01-01 13:00:00');
    const TIME = bigquery.time('14:00:00');
    const TIMESTAMP = bigquery.timestamp(new Date());
    const NUMERIC = new Big('123.456');

    before(function() {
      table = dataset.table(generateName('table'));
      return table.create({
        schema: [
          'date:DATE',
          'datetime:DATETIME',
          'time:TIME',
          'timestamp:TIMESTAMP',
          'numeric:NUMERIC',
        ].join(', '),
      });
    });

    it('inserts with custom types', function() {
      return table.insert({
        date: DATE,
        datetime: DATETIME,
        time: TIME,
        timestamp: TIMESTAMP,
        numeric: NUMERIC,
      });
    });
  });

  describe('Provided Tests', function() {
    const table = dataset.table(generateName('table'));
    const schema = require('../../system-test/data/schema.json');
    const testData = require('../../system-test/data/schema-test-data.json');

    const EXPECTED_ROWS = {
      Bilbo: {
        Name: 'Bilbo',
        Age: 111,
        Weight: 67.2,
        IsMagic: false,
        Spells: [],
        TeaTime: bigquery.time('10:00:00'),
        NextVacation: bigquery.date('2017-09-22'),
        FavoriteTime: bigquery.datetime('2031-04-01T05:09:27'),
        FavoriteNumeric: new Big('123.45'),
      },

      Gandalf: {
        Name: 'Gandalf',
        Age: 1000,
        Weight: 198.6,
        IsMagic: true,
        Spells: [
          {
            Name: 'Skydragon',
            LastUsed: bigquery.timestamp('2015-10-31T23:59:56.000Z'),
            DiscoveredBy: 'Firebreather',
            Properties: [
              {
                Name: 'Flying',
                Power: 1,
              },
              {
                Name: 'Creature',
                Power: 1,
              },
              {
                Name: 'Explodey',
                Power: 11,
              },
            ],
            Icon: Buffer.from(testData[1].Spells[0].Icon, 'base64'),
          },
        ],
        TeaTime: bigquery.time('15:00:00'),
        NextVacation: bigquery.date('2666-06-06'),
        FavoriteTime: bigquery.datetime('2001-12-19T23:59:59'),
        FavoriteNumeric: new Big('-111.222'),
      },

      Sabrina: {
        Name: 'Sabrina',
        Age: 17,
        Weight: 128.3,
        IsMagic: true,
        Spells: [
          {
            Name: 'Talking cats',
            LastUsed: bigquery.timestamp('2017-02-14T12:07:23.000Z'),
            DiscoveredBy: 'Salem',
            Properties: [
              {
                Name: 'Makes you look crazy',
                Power: 1,
              },
            ],
            Icon: Buffer.from(testData[2].Spells[0].Icon, 'base64'),
          },
        ],
        TeaTime: bigquery.time('12:00:00'),
        NextVacation: bigquery.date('2017-03-14'),
        FavoriteTime: bigquery.datetime('2000-10-31T23:27:46'),
        FavoriteNumeric: new Big('-3.14'),
      },
    };

    before(function(done) {
      async.series(
        [
          function(next) {
            table.create(
              {
                schema: schema,
              },
              next
            );
          },

          function(next) {
            table.insert(testData, next);
          },

          function(next) {
            setTimeout(next, 15000);
          },
        ],
        done
      );
    });

    after(function(done) {
      table.delete(done);
    });

    it('should convert rows back correctly', function(done) {
      table.getRows(function(err, rows) {
        assert.ifError(err);

        if (rows.length === 0) {
          done(new Error('Rows not returned from the API.'));
          return;
        }

        rows.forEach(function(row) {
          const expectedRow = EXPECTED_ROWS[row.Name];
          assert.deepStrictEqual(row, expectedRow);
        });

        done();
      });
    });
  });

  function generateName(resourceType) {
    return `${GCLOUD_TESTS_PREFIX}_${resourceType}_${uuid.v1()}`.replace(
      /-/g,
      '_'
    );
  }

  function deleteBuckets(callback) {
    function deleteBucket(bucket, callback) {
      bucket.getFiles(function(err, files) {
        if (err) {
          callback(err);
          return;
        }

        async.each(files, exec('delete'), function(err) {
          if (err) {
            callback(err);
            return;
          }

          bucket.delete(callback);
        });
      });
    }

    storage.getBuckets(
      {
        prefix: GCLOUD_TESTS_PREFIX,
      },
      function(err, buckets) {
        if (err) {
          callback(err);
          return;
        }

        async.each(buckets, deleteBucket, callback);
      }
    );
  }

  function deleteDatasets(callback) {
    bigquery.getDatasets(
      {
        filter: `labels.${GCLOUD_TESTS_PREFIX}`,
      },
      function(err, datasets) {
        if (err) {
          callback(err);
          return;
        }

        async.each(datasets, exec('delete', {force: true}), callback);
      }
    );
  }
});

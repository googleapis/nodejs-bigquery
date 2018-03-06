/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function createTable(datasetId, tableId, schema, projectId) {
  // [START bigquery_create_table]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_new_dataset";
  // const tableId = "my_new_table";
  // const schema = "Name:string, Age:integer, Weight:float, IsMagic:boolean";

  // Creates a client
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  const options = {
    schema: schema,
  };

  // Create a new table in the dataset
  bigquery
    .dataset(datasetId)
    .createTable(tableId, options)
    .then(results => {
      const table = results[0];
      console.log(`Table ${table.id} created.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_create_table]
}

function deleteTable(datasetId, tableId, projectId) {
  // [START bigquery_delete_table]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_dataset";
  // const tableId = "my_table";

  // Creates a client
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  // Deletes the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .delete()
    .then(() => {
      console.log(`Table ${tableId} deleted.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_delete_table]
}

function listTables(datasetId, projectId) {
  // [START bigquery_list_tables]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_dataset";

  // Creates a client
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  // Lists all tables in the dataset
  bigquery
    .dataset(datasetId)
    .getTables()
    .then(results => {
      const tables = results[0];
      console.log('Tables:');
      tables.forEach(table => console.log(table.id));
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_list_tables]
}

function browseRows(datasetId, tableId, projectId) {
  // [START bigquery_browse_table]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_dataset";
  // const tableId = "my_table";

  // Creates a client
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  // Lists rows in the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .getRows()
    .then(results => {
      const rows = results[0];
      console.log('Rows:');
      rows.forEach(row => console.log(row));
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_browse_table]
}

function copyTable(
  srcDatasetId,
  srcTableId,
  destDatasetId,
  destTableId,
  projectId
) {
  // [START bigquery_copy_table]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const srcDatasetId = "my_src_dataset";
  // const srcTableId = "my_src_table";
  // const destDatasetId = "my_dest_dataset";
  // const destTableId = "my_dest_table";

  // Creates a client
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  let job;

  // Copies the table contents into another table
  bigquery
    .dataset(srcDatasetId)
    .table(srcTableId)
    .copy(bigquery.dataset(destDatasetId).table(destTableId))
    .then(results => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise;
    })
    .then(metadata => {
      // Check the job's status for errors
      const errors = metadata.status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    })
    .then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_copy_table]
}

function loadLocalFile(datasetId, tableId, filename, projectId) {
  // [START bigquery_load_from_file]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const filename = "/path/to/file.csv";
  // const datasetId = "my_dataset";
  // const tableId = "my_table";

  // Creates a client
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  let job;

  // Loads data from a local file into the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .load(filename)
    .then(results => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise;
    })
    .then(metadata => {
      // Check the job's status for errors
      const errors = metadata.status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    })
    .then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_load_from_file]
}

function loadFileFromGCS(datasetId, tableId, bucketName, filename, projectId) {
  // [START bigquery_load_from_gcs]
  // Imports the Google Cloud client libraries
  const BigQuery = require('@google-cloud/bigquery');
  const Storage = require('@google-cloud/storage');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_dataset";
  // const tableId = "my_table";
  // const bucketName = "my-bucket";
  // const filename = "file.csv";

  // Instantiates clients
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  const storage = new Storage({
    projectId: projectId,
  });

  let job;

  // Loads data from a Google Cloud Storage file into the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .load(storage.bucket(bucketName).file(filename))
    .then(results => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise;
    })
    .then(metadata => {
      // Check the job's status for errors
      const errors = metadata.status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    })
    .then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_load_from_gcs]
}

function loadCSVFromGCS(datasetId, tableId, projectId) {
  // [START bigquery_load_table_gcs_csv]
  // Imports the Google Cloud client libraries
  const BigQuery = require('@google-cloud/bigquery');
  const Storage = require('@google-cloud/storage');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_dataset";
  // const tableId = "my_table";

  /**
   * This sample loads the CSV file at
   * https://storage.googleapis.com/cloud-samples-data/bigquery/us-states/us-states.json
   *
   * TODO(developer): Replace the following lines with the path to your file.
   */
  const bucketName = 'cloud-samples-data';
  const filename = 'bigquery/us-states/us-states.csv';

  // Instantiates clients
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  const storage = new Storage({
    projectId: projectId,
  });

  // Configure the load job. For full list of options, see:
  // https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs#configuration.load
  const metadata = {
    sourceFormat: 'CSV',
    skipLeadingRows: 1,
    schema: {
      fields: [
        {name: 'name', type: 'STRING'},
        {name: 'post_abbr', type: 'STRING'},
      ],
    },
  };

  let job;

  // Loads data from a Google Cloud Storage file into the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .load(storage.bucket(bucketName).file(filename), metadata)
    .then(results => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise;
    })
    .then(metadata => {
      // Check the job's status for errors
      const errors = metadata.status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    })
    .then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_load_table_gcs_csv]
}

function loadCSVFromGCSAutodetect(datasetId, tableId, projectId) {
  // [START bigquery_load_table_gcs_csv_autodetect]
  // Imports the Google Cloud client libraries
  const BigQuery = require('@google-cloud/bigquery');
  const Storage = require('@google-cloud/storage');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_dataset";
  // const tableId = "my_table";

  /**
   * This sample loads the CSV file at
   * https://storage.googleapis.com/cloud-samples-data/bigquery/us-states/us-states.json
   *
   * TODO(developer): Replace the following lines with the path to your file.
   */
  const bucketName = 'cloud-samples-data';
  const filename = 'bigquery/us-states/us-states.csv';

  // Instantiates clients
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  const storage = new Storage({
    projectId: projectId,
  });

  // Configure the load job. For full list of options, see:
  // https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs#configuration.load
  const metadata = {
    sourceFormat: 'CSV',
    skipLeadingRows: 1,
    autodetect: true,
  };

  let job;

  // Loads data from a Google Cloud Storage file into the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .load(storage.bucket(bucketName).file(filename), metadata)
    .then(results => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise;
    })
    .then(metadata => {
      // Check the job's status for errors
      const errors = metadata.status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    })
    .then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_load_table_gcs_csv_autodetect]
}

function loadCSVFromGCSAppend(datasetId, tableId, projectId) {
  // [START bigquery_load_table_gcs_csv_append]
  // Imports the Google Cloud client libraries
  const BigQuery = require('@google-cloud/bigquery');
  const Storage = require('@google-cloud/storage');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_dataset";
  // const tableId = "my_table";

  /**
   * This sample loads the CSV file at
   * https://storage.googleapis.com/cloud-samples-data/bigquery/us-states/us-states.json
   *
   * TODO(developer): Replace the following lines with the path to your file.
   */
  const bucketName = 'cloud-samples-data';
  const filename = 'bigquery/us-states/us-states.csv';

  // Instantiates clients
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  const storage = new Storage({
    projectId: projectId,
  });

  // Configure the load job. For full list of options, see:
  // https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs#configuration.load
  const metadata = {
    sourceFormat: 'CSV',
    skipLeadingRows: 1,
    schema: {
      fields: [
        {name: 'name', type: 'STRING'},
        {name: 'post_abbr', type: 'STRING'},
      ],
    },
    // Set the write disposition to append to an existing table.
    writeDisposition: 'WRITE_APPEND',
  };

  let job;

  // Loads data from a Google Cloud Storage file into the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .load(storage.bucket(bucketName).file(filename), metadata)
    .then(results => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise;
    })
    .then(metadata => {
      // Check the job's status for errors
      const errors = metadata.status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    })
    .then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_load_table_gcs_csv_append]
}

function loadCSVFromGCSTruncate(datasetId, tableId, projectId) {
  // [START bigquery_load_table_gcs_csv_truncate]
  // Imports the Google Cloud client libraries
  const BigQuery = require('@google-cloud/bigquery');
  const Storage = require('@google-cloud/storage');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_dataset";
  // const tableId = "my_table";

  /**
   * This sample loads the CSV file at
   * https://storage.googleapis.com/cloud-samples-data/bigquery/us-states/us-states.json
   *
   * TODO(developer): Replace the following lines with the path to your file.
   */
  const bucketName = 'cloud-samples-data';
  const filename = 'bigquery/us-states/us-states.csv';

  // Instantiates clients
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  const storage = new Storage({
    projectId: projectId,
  });

  // Configure the load job. For full list of options, see:
  // https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs#configuration.load
  const metadata = {
    sourceFormat: 'CSV',
    skipLeadingRows: 1,
    schema: {
      fields: [
        {name: 'name', type: 'STRING'},
        {name: 'post_abbr', type: 'STRING'},
      ],
    },
    // Set the write disposition to append to an existing table.
    writeDisposition: 'WRITE_TRUNCATE',
  };

  let job;

  // Loads data from a Google Cloud Storage file into the table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .load(storage.bucket(bucketName).file(filename), metadata)
    .then(results => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise;
    })
    .then(metadata => {
      // Check the job's status for errors
      const errors = metadata.status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    })
    .then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_load_table_gcs_csv_truncate]
}

function extractTableToGCS(
  datasetId,
  tableId,
  bucketName,
  filename,
  projectId
) {
  // [START bigquery_extract_gcs]
  // Imports the Google Cloud client libraries
  const BigQuery = require('@google-cloud/bigquery');
  const Storage = require('@google-cloud/storage');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_dataset";
  // const tableId = "my_table";
  // const bucketName = "my-bucket";
  // const filename = "file.csv";

  // Instantiates clients
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  const storage = new Storage({
    projectId: projectId,
  });

  let job;

  // Exports data from the table into a Google Cloud Storage file
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .extract(storage.bucket(bucketName).file(filename))
    .then(results => {
      job = results[0];
      console.log(`Job ${job.id} started.`);

      // Wait for the job to finish
      return job.promise;
    })
    .then(metadata => {
      // Check the job's status for errors
      const errors = metadata.status.errors;
      if (errors && errors.length > 0) {
        throw errors;
      }
    })
    .then(() => {
      console.log(`Job ${job.id} completed.`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END bigquery_extract_gcs]
}

function insertRowsAsStream(datasetId, tableId, rows, projectId) {
  // [START bigquery_insert_stream]
  // Imports the Google Cloud client library
  const BigQuery = require('@google-cloud/bigquery');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = "your-project-id";
  // const datasetId = "my_dataset";
  // const tableId = "my_table";
  // const rows = [{name: "Tom", age: 30}, {name: "Jane", age: 32}];

  // Creates a client
  const bigquery = new BigQuery({
    projectId: projectId,
  });

  // Inserts data into a table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .insert(rows)
    .then(() => {
      console.log(`Inserted ${rows.length} rows`);
    })
    .catch(err => {
      if (err && err.name === 'PartialFailureError') {
        if (err.errors && err.errors.length > 0) {
          console.log('Insert errors:');
          err.errors.forEach(err => console.error(err));
        }
      } else {
        console.error('ERROR:', err);
      }
    });
  // [END bigquery_insert_stream]
}

const fs = require(`fs`);

require(`yargs`)
  .demand(1)
  .command(
    `create <projectId> <datasetId> <tableId> <schema>`,
    `Creates a new table.`,
    {},
    opts => {
      createTable(opts.datasetId, opts.tableId, opts.schema, opts.projectId);
    }
  )
  .command(
    `list <projectId> <datasetId>`,
    `Lists all tables in a dataset.`,
    {},
    opts => {
      listTables(opts.datasetId, opts.projectId);
    }
  )
  .command(
    `delete <projectId> <datasetId> <tableId>`,
    `Deletes a table.`,
    {},
    opts => {
      deleteTable(opts.datasetId, opts.tableId, opts.projectId);
    }
  )
  .command(
    `copy <projectId> <srcDatasetId> <srcTableId> <destDatasetId> <destTableId>`,
    `Makes a copy of a table.`,
    {},
    opts => {
      copyTable(
        opts.srcDatasetId,
        opts.srcTableId,
        opts.destDatasetId,
        opts.destTableId,
        opts.projectId
      );
    }
  )
  .command(
    `browse <projectId> <datasetId> <tableId>`,
    `Lists rows in a table.`,
    {},
    opts => {
      browseRows(opts.datasetId, opts.tableId, opts.projectId);
    }
  )
  .command(
    `load <projectId> <datasetId> <tableId> <fileName>`,
    `Loads data from a local file into a table.`,
    {},
    opts => {
      loadLocalFile(
        opts.datasetId,
        opts.tableId,
        opts.fileName,
        opts.projectId
      );
    }
  )
  .command(
    `load-gcs <projectId> <datasetId> <tableId> <bucketName> <fileName>`,
    `Loads data from a Google Cloud Storage file into a table.`,
    {},
    opts => {
      loadFileFromGCS(
        opts.datasetId,
        opts.tableId,
        opts.bucketName,
        opts.fileName,
        opts.projectId
      );
    }
  )
  .command(
    `load-gcs-csv <projectId> <datasetId> <tableId>`,
    `Loads sample CSV data from a Google Cloud Storage file into a table.`,
    {},
    opts => {
      loadCSVFromGCS(opts.datasetId, opts.tableId, opts.projectId);
    }
  )
  .command(
    `load-gcs-csv-autodetect <projectId> <datasetId> <tableId>`,
    `Loads sample CSV data from a Google Cloud Storage file into a table.`,
    {},
    opts => {
      loadCSVFromGCSAutodetect(opts.datasetId, opts.tableId, opts.projectId);
    }
  )
  .command(
    `load-gcs-csv-append <projectId> <datasetId> <tableId>`,
    `Loads sample CSV data from GCS, adding to an existing table.`,
    {},
    opts => {
      loadCSVFromGCSAppend(opts.datasetId, opts.tableId, opts.projectId);
    }
  )
  .command(
    `load-gcs-csv-truncate <projectId> <datasetId> <tableId>`,
    `Loads sample CSV data from GCS, replacing an existing table.`,
    {},
    opts => {
      loadCSVFromGCSTruncate(opts.datasetId, opts.tableId, opts.projectId);
    }
  )
  .command(
    `extract <projectId> <datasetId> <tableId> <bucketName> <fileName>`,
    `Extract a table from BigQuery to Google Cloud Storage.`,
    {},
    opts => {
      extractTableToGCS(
        opts.datasetId,
        opts.tableId,
        opts.bucketName,
        opts.fileName,
        opts.projectId
      );
    }
  )
  .command(
    `insert <projectId> <datasetId> <tableId> <json_or_file>`,
    `Insert a JSON array (as a string or newline-delimited file) into a BigQuery table.`,
    {},
    opts => {
      let content;
      try {
        content = fs.readFileSync(opts.json_or_file);
      } catch (err) {
        content = opts.json_or_file;
      }

      let rows = null;
      try {
        rows = JSON.parse(content);
      } catch (err) {
        throw new Error(
          `"json_or_file" (or the file it points to) is not a valid JSON array.`
        );
      }

      if (!Array.isArray(rows)) {
        throw new Error(
          `"json_or_file" (or the file it points to) is not a valid JSON array.`
        );
      }

      insertRowsAsStream(
        opts.datasetId,
        opts.tableId,
        rows,
        opts.projectId || process.env.GCLOUD_PROJECT
      );
    }
  )
  .example(
    `node $0 create my-project-id my_dataset my_table "Name:string, Age:integer, Weight:float, IsMagic:boolean"`,
    `Creates a new table named "my_table" in "my_dataset".`
  )
  .example(
    `node $0 list my-project-id my_dataset`,
    `Lists tables in "my_dataset".`
  )
  .example(
    `node $0 browse my-project-id my_dataset my_table`,
    `Displays rows from "my_table" in "my_dataset".`
  )
  .example(
    `node $0 delete my-project-id my_dataset my_table`,
    `Deletes "my_table" from "my_dataset".`
  )
  .example(
    `node $0 load my-project-id my_dataset my_table ./data.csv`,
    `Imports a local file into a table.`
  )
  .example(
    `node $0 load-gcs my-project-id my_dataset my_table my-bucket data.csv`,
    `Imports a GCS file into a table.`
  )
  .example(
    `node $0 extract my-project-id my_dataset my_table my-bucket my-file`,
    `Exports my_dataset:my_table to gcs://my-bucket/my-file as raw CSV.`
  )
  .example(
    `node $0 extract my-project-id my_dataset my_table my-bucket my-file -f JSON --gzip`,
    `Exports my_dataset:my_table to gcs://my-bucket/my-file as gzipped JSON.`
  )
  .example(
    `node $0 insert my-project-id my_dataset my_table json_string`,
    `Inserts the JSON array represented by json_string into my_dataset:my_table.`
  )
  .example(
    `node $0 insert my-project-id my_dataset my_table json_file`,
    `Inserts the JSON objects contained in json_file (one per line) into my_dataset:my_table.`
  )
  .example(
    `node $0 copy my-project-id src_dataset src_table dest_dataset dest_table`,
    `Copies src_dataset:src_table to dest_dataset:dest_table.`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/bigquery/docs`)
  .help()
  .strict().argv;

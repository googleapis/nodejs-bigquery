const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const fs = require('fs');


const { Readable } = require('stream')

// rs.on('data', console.log)

const datasetId = 'testing_insert';
const tableId = 'age_table';

const table = bigquery.dataset(datasetId).table(tableId);

const fileStream = table.createWriteStream();
// fs.createReadStream(
//   './samples/json.json'
// )
//   .pipe(fileStream)
//   .on('error', err => {})
//   .on('finish', () => {
//     console.log('Finished!');
//   });

// const request = require('request');

// const csvUrl = 'http://goo.gl/kSE7z6';

const options = {
  insertOptions: {
    ignoreUnknownValues: true,
    createInsertId: false,
  },
  batchingOptions: {
    maxMessages: 300,
  },
};

const array = []
for (let i = 1; i < 1025; i++) {
  array.push({age: i})
}

const rs = Readable.from(array);

// fs.createReadStream('./samples/json.json')
  rs.pipe(table.createInsertStream(options))
  .on('response', response => {
    console.log(response);
  })
  .on('error', err => {
    console.log(err);
  });

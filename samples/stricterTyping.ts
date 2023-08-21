import {BigQuery as bq} from '../src/bigquery';
import {customAlphabet} from 'nanoid';

const main = () => {
    const bigquery = new bq();
    const stricterTyping = async () => {
        const nanoid = await customAlphabet('abcdef0123456789', 5);
        const datasetId = nanoid();
        const tableId = nanoid();
        console.log(datasetId);
        const datasetOptions = {
            location: 'US'
        }
        const tableOptions = {};
        await bigquery.createDataset(datasetId, datasetOptions);
        bigquery.dataset(datasetId).get(); 
        // original is "any"
        // change is "Dataset"
        await bigquery.dataset(datasetId).createTable(tableId, tableOptions);
        bigquery.dataset(datasetId).table(tableId).get();
        // original is "any"
        // change is "Table"
        
    }
    stricterTyping();
}
main();


import express from 'express';
import cors from 'cors';
import Routes from './routes';
import DataManager from './model/dataManager';

const app = express()
  .use(cors())
  .use(express.json());
const routes = new Routes(app);
routes.init();

let port = 5000;
if (process.argv.length > 2 && process.argv[2] === '--test-mode') {
  port = 5555;
  await DataManager.deleteAllData();
}
app.listen(port, () => {
  console.log(`Express server app started. Listening on port ${port}.`);
});

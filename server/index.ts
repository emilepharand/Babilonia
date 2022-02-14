import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import Routes from './routes';
import DataManager from './model/dataManager';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (!(process.argv.length > 2 && process.argv[2] === '--test-mode')) {
    console.error(err.stack);
  }
  res.status(400);
  res.end();
};

const app = express()
  .use(cors())
  .use(express.json());
app.use(errorHandler);
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

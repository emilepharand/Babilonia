import express from 'express';
import cors from 'cors';
import Routes from './routes';
import DataManager from './model/datamanager';

const app = express().use(cors());
const routes = new Routes(app);
routes.init();

app.listen(5000, () => {
  DataManager.createData();
  console.log(DataManager.ideas);
  console.log('Express server app started. Listening on port 5000.');
});

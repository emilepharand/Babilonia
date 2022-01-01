import express from 'express';
import cors from 'cors';
import Routes from './routes';

const app = express().use(cors()).use(express.json());
const routes = new Routes(app);
routes.init();

app.listen(5000, () => {
  console.log('Express server app started. Listening on port 5000.');
});

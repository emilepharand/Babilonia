import express from 'express';
import cors from 'cors';
import ExpressRotuer from './express.router';

const app = express();

app.use(cors());
const expressRoutes = new ExpressRotuer(app);
expressRoutes.init();

app.listen(5000, () => {
  console.log('Express server app listening on port 5000!');
});

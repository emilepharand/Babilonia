import express, {ErrorRequestHandler} from 'express';
import cors from 'cors';
import Routes from './routes';
import isTestMode from './context';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (!isTestMode) {
		console.error(err.stack);
	}
	res.status(400);
	res.end();
	next();
};

const app = express().use(cors()).use(express.json());
app.use(errorHandler);
const routes = new Routes(app);
routes.init();

const port = isTestMode ? 5555 : 5000;
app.listen(port, () => {
	console.log(`Express server app started. Listening on port ${port}.`);
});

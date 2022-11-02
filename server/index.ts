import type {ErrorRequestHandler} from 'express';
import express from 'express';
import cors from 'cors';
import Routes from './routes';
import {apiPort, appPort, isDevMode, isTestMode} from './options';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (!isTestMode) {
		console.error(err.stack);
	}
	res.status(400);
	res.end();
	next();
};

const apiServer = express().use(cors()).use(express.json());
apiServer.use(errorHandler);
const routes = new Routes(apiServer);
routes.init();
apiServer.listen(apiPort, () => {
	console.log(`API server started. Listening on port ${apiPort!}.`);
});

if (!isDevMode) {
	const appServer = express().use(cors()).use(express.json());
	appServer.use(errorHandler);
	appServer.use(express.static('.'));
	if (isTestMode) {
		// Cypress reads from this
		appServer.get('/__coverage__', (req, res) => {
			res.json({
				coverage: global.__coverage__,
			});
		});
	}
	appServer.all('*', (_, res) => {
		res.sendFile(`${__dirname}/index.html`);
	});
	appServer.listen(appPort, () => {
		console.log(`App started. Listening on port ${appPort!}.`);
	});
}

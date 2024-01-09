import cors from 'cors';
import type {ErrorRequestHandler} from 'express';
import express from 'express';
import fs from 'fs';
import {apiPort, appPort, isDevMode} from './options';
import Routes from './routes';

const errorHandler: ErrorRequestHandler = (err, _, res, next) => {
	console.error(err.stack);
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
if (process.env.TEST_MODE) {
	apiServer.get('/__coverage__', (_, res) => {
		res.json({
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
			coverage: (global as any).__coverage__,
		});
	});
}

if (!isDevMode) {
	const appServer = express().use(cors()).use(express.json());
	appServer.use(errorHandler);
	appServer.use(express.static('.'));
	if (process.env.TEST_MODE) {
		appServer.get('/__coverage__', (_, res) => {
			res.json({
				// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
				coverage: (global as any).__coverage__,
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

console.log('Working directory:', process.cwd());
console.log('Files in working directory:', fs.readdirSync(process.cwd()));
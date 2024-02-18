import AsyncLock from 'async-lock';
import type {
	Express, NextFunction, Request, Response,
} from 'express';
import {Router} from 'express';
import * as Controller from './controller';

const lock = new AsyncLock();
const lockKey = 'lock';

type Method = 'get' | 'post' | 'put' | 'delete';

export default class Routes {
	public router: Router;

	private readonly app: Express;

	constructor(app: Express) {
		// eslint-disable-next-line new-cap
		this.router = Router();
		this.app = app;
	}

	public init(): void {
		this.app.use('/', this.router);
		if (process.env.TEST_MODE) {
			// Signals that the server is running in tests
			this.router.get('/', (_, res) => {
				res.status(200).end();
			});
		}
		// Languages
		this.route('get', '/languages', Controller.getLanguages);
		this.route('post', '/languages', Controller.addLanguage);
		this.route('put', '/languages', Controller.editLanguages);
		this.route('delete', '/languages', Controller.getLanguages);
		this.route('get', '/languages/:id', Controller.getLanguageById);
		this.route('delete', '/languages/:id', Controller.deleteLanguage);
		// Ideas
		this.route('get', '/ideas/:id', Controller.getIdeaById);
		this.route('get', '/ideas?:search', Controller.search);
		this.route('post', '/ideas', Controller.addIdea);
		this.route('put', '/ideas/:id', Controller.editIdea);
		this.route('delete', '/ideas/:id', Controller.deleteIdea);
		// Practice
		this.route('delete', '/everything', Controller.deleteAllData);
		this.route('get', '/practice-ideas/next', Controller.getNextPracticeIdea);
		// Stats
		this.route('get', '/stats', Controller.getStats);
		// Settings
		this.route('put', '/settings', Controller.setSettings);
		this.route('get', '/settings', Controller.getSettings);
		// Everything
		this.route('delete', '/everything', Controller.deleteAllData);
		// Database
		this.route('put', '/database/path', Controller.changeDatabase);
		this.route('get', '/database/path', Controller.getDatabasePath);
		this.route('put', '/database/migrate', Controller.migrateDatabase);
	}

	private wrapAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): (req: Request, res: Response, next: NextFunction) => void {
		return async (req, res, next) => {
			await lock.acquire(lockKey, async () => {
				await fn(req, res, next).catch(next);
			});
		};
	}

	private route(method: Method, route: string, handler: (req: Request, res: Response, next: NextFunction) => Promise<void>): void {
		this.router[method](route, this.wrapAsync(handler));
	}
}

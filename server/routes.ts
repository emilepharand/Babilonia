import {Express, Router} from 'express';
import Controller from './controller';

export default class Routes {
	public router: Router;

	private app: Express;

	constructor(app: Express) {
		// eslint-disable-next-line new-cap
		this.router = Router();
		this.app = app;
	}

	public init(): void {
		this.app.use('/', this.router);
		// Languages
		this.router.get('/languages', Controller.getLanguages);
		this.router.post('/languages', Controller.addLanguage);
		this.router.put('/languages', Controller.editLanguages);
		this.router.delete('/languages', Controller.getLanguages);
		this.router.get('/languages/:id', Controller.getLanguageById);
		this.router.delete('/languages/:id', Controller.deleteLanguage);
		// Ideas
		this.router.get('/ideas/:id', Controller.getIdeaById);
		this.router.get('/ideas?:search', Controller.search);
		this.router.post('/ideas', Controller.addIdea);
		this.router.put('/ideas/:id', Controller.editIdea);
		this.router.delete('/ideas/:id', Controller.deleteIdea);
		// Practice
		this.router.get('/practice-ideas/next', Controller.getNextPracticeIdea);
		// Everything
		this.router.delete('/everything', Controller.deleteAllData);
	}
}

import { Express, Router } from 'express';
import Controller from './controller';

export default class Routes {
  public router: Router;

  private app: Express;

  constructor(app: Express) {
    this.router = Router();
    this.app = app;
  }

  public init(): void {
    this.router.get('/api/reset', Controller.deleteAllData);
    this.router.get('/api/idea/next', Controller.getNextIdea);
    this.router.get('/api/idea/:id', Controller.getIdeaById);
    this.router.get('/api/language/:id', Controller.getLanguageById);
    this.router.post('/api/idea/add', Controller.addIdea);
    this.router.post('/api/language/add', Controller.addLanguage);
    this.router.post('/api/language/edit/:id', Controller.editLanguage);
    this.router.post('/api/idea/edit/:id', Controller.editIdea);
    this.router.delete('/api/idea/:id', Controller.deleteIdea);
    this.router.get('/api/languages', Controller.getLanguages);
    this.app.use('/', this.router);
  }
}

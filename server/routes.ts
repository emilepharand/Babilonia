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
    this.app.use('/', this.router);
    // languages
    this.router.get('/languages', Controller.getLanguages);
    this.router.post('/languages', Controller.addLanguage);
    this.router.put('/languages', Controller.editLanguages);
    this.router.delete('/languages', Controller.getLanguages);
    this.router.get('/languages/:id', Controller.getLanguageById);
    this.router.delete('/languages/:id', Controller.deleteLanguage);
    // ideas
    this.router.get('/idea/next', Controller.getNextIdea);
    this.router.get('/ideas/:id', Controller.getIdeaById);
    this.router.post('/ideas', Controller.addIdea);
    this.router.post('/idea/edit/:id', Controller.editIdea);
    this.router.delete('/idea/:id', Controller.deleteIdea);
    // everything
    this.router.delete('/everything', Controller.deleteAllData);
  }
}

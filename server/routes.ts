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
    this.router.get('/api/ideas', Controller.getNextIdea);
    this.router.post('/api/ideas/add', Controller.addIdea);
    this.router.get('/api/languages', Controller.getLanguages);
    this.app.use('/', this.router);
  }
}

import { Express, Router } from 'express';
import IdeaBrowser from './controller/ideaBrowser';
import LanguageController from './controller/languageController';

export default class Routes {
  public router: Router;

  private app: Express;

  constructor(app: Express) {
    this.router = Router();
    this.app = app;
  }

  public init(): void {
    this.router.get('/api/ideas', IdeaBrowser.getDefault);
    this.router.get('/api/languages', LanguageController.getDefault);
    this.app.use('/', this.router);
  }
}

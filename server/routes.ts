import { Express, Router } from 'express';
import IdeaBrowser from './controller/ideaBrowser';

export default class Routes {
  public router: Router;

  private app: Express;

  constructor(app: Express) {
    this.router = Router();
    this.app = app;
  }

  public init(): void {
    this.router.get('/api/ideas', IdeaBrowser.getDefault);
    this.app.use('/', this.router);
  }
}

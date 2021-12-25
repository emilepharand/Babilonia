import { Express, Router } from 'express';

import Ideas from './controller/home.controller';

export default class Routes {
  public router: Router;

  private app: Express;

  constructor(app: Express) {
    this.router = Router();
    this.app = app;
  }

  public init(): void {
    this.router.get('/api/ideas', Ideas.getDefault);
    this.app.use('/', this.router);
  }
}

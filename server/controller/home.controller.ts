import { Request, Response } from 'express';
import DataManager from '../model/datamanager';

export default class HomeController {
  public static i: number;

  public static getDefault(req: Request, res: Response): void {
    res.send(JSON.stringify(DataManager.ideas[HomeController.i]));
    if (HomeController.i === 0) {
      HomeController.i = 1;
    } else {
      HomeController.i = 0;
    }
  }
}

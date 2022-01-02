import { Request, Response } from 'express';
import DataManager from './model/dataManager';

export default class Controller {
  public static async getNextIdea(req: Request, res: Response): Promise<void> {
    res.send(JSON.stringify(await DataManager.getNextIdea()));
  }

  public static async getLanguages(req: Request, res: Response): Promise<void> {
    res.send(JSON.stringify(await DataManager.getLanguages()));
  }

  public static async addIdea(req: Request, res: Response): Promise<void> {
    const { expressions } = req.body;
    await DataManager.addIdea(expressions);
    res.send(req.body);
  }
}

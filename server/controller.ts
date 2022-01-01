import { NextFunction, Request, Response } from 'express';
import DataManager from './model/dataManager';
import Idea from './model/ideas/idea';
import Expression from './model/expressions/expression';

export default class Controller {
  public static async getNextIdea(req: Request, res: Response): Promise<void> {
    res.send(JSON.stringify(await DataManager.getNextIdea()));
  }

  public static async getLanguages(req: Request, res: Response): Promise<void> {
    res.send(JSON.stringify(await DataManager.getLanguages()));
  }

  public static async addIdea(req: Request, res: Response): Promise<void> {
    console.log(JSON.stringify(req.body));
    // {"expressions":[{"text":"MORNING","language":{"id":2}}]}
    const { expressions } = req.body;
    await DataManager.addIdea(expressions);
    res.send(req.body);
    // res.json({ msg: 'Success or failure' });
  }
}

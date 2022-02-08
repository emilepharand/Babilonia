import { Request, Response } from 'express';
import DataManager from './model/dataManager';
import { Expression } from './model/expression';
import { Language } from './model/language';

export default class Controller {
  public static async getNextIdea(req: Request, res: Response): Promise<void> {
    try {
      res.send(JSON.stringify(await DataManager.getNextIdea()));
    } catch {
      // there is no idea in the database
      res.send('{}');
    }
  }

  public static async getLanguages(req: Request, res: Response): Promise<void> {
    res.send(JSON.stringify(await DataManager.getLanguages()));
  }

  public static async addIdea(req: Request, res: Response): Promise<void> {
    const ee: Expression[] = req.body;
    await DataManager.addIdea(ee);
    res.send(req.body);
  }

  public static async getIdeaById(req: Request, res: Response): Promise<void> {
    const idea = await DataManager.getIdeaById(parseInt(req.params.id, 10));
    res.send(idea);
  }

  public static async editIdea(req: Request, res: Response): Promise<void> {
    const idea = req.body;
    await DataManager.editIdea(idea);
    res.send(await DataManager.getIdeaById(parseInt(req.params.id, 10)));
  }

  public static async deleteIdea(req: Request, res: Response): Promise<void> {
    await DataManager.deleteIdea(parseInt(req.params.id, 10));
    res.send({});
  }

  public static async addLanguage(req: Request, res: Response): Promise<void> {
    const l: Language = await DataManager.addLanguage(req.body);
    res.send(JSON.stringify(l));
  }

  public static async editLanguage(req: Request, res: Response): Promise<void> {
    await DataManager.editLanguage(req.body);
    res.send(req.body);
  }

  public static async deleteAllData(req: Request, res: Response): Promise<void> {
    await DataManager.deleteAllData();
    res.send({});
  }
}

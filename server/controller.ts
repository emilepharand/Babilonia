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

  public static async getLanguageById(req: Request, res: Response): Promise<void> {
    const language = await DataManager.getLanguageById(parseInt(req.params.id, 10));
    if (language === undefined) {
      res.status(404);
      res.end();
    }
    res.send(language);
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

  public static async deleteLanguage(req: Request, res: Response): Promise<void> {
    await DataManager.deleteLanguage(parseInt(req.params.id, 10));
    res.send({});
  }

  public static async addLanguage(req: Request, res: Response): Promise<void> {
    const keys = Object.keys(req.body);
    if (keys.length !== 1 || keys[0] !== 'name' || typeof (req.body.name) !== 'string' || req.body.name === '') {
      res.status(400);
      res.end();
      return;
    }
    const l: Language = await DataManager.addLanguage(req.body.name);
    res.status(201);
    res.send(JSON.stringify(l));
  }

  public static async editLanguages(req: Request, res: Response): Promise<void> {
    const ll: Language[] = await DataManager.editLanguages(req.body);
    res.send(JSON.stringify(ll));
  }

  public static async deleteAllData(req: Request, res: Response): Promise<void> {
    await DataManager.deleteAllData();
    res.send({});
  }

}

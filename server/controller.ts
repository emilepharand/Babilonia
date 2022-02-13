import { Request, Response } from 'express';
import DataManager from './model/dataManager';
import { Expression } from './model/expression';
import { Language, validate } from './model/language';

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
    if (Number.isNaN(+req.params.id)) {
      res.status(400);
      res.end();
      return;
    }
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
    if (Number.isNaN(+req.params.id)) {
      res.status(400);
      res.end();
      return;
    }
    const id = parseInt(req.params.id, 10);
    if (await DataManager.getLanguageById(id) === undefined) {
      res.status(404);
      res.end();
      return;
    }
    await DataManager.deleteLanguage(id);
    res.send({});
  }

  public static async addLanguage(req: Request, res: Response): Promise<void> {
    if (!Controller.checkLanguageForAdding(req.body)) {
      res.status(400);
      res.end();
      return;
    }
    if (await DataManager.languageNameExists(req.body.name)) {
      res.status(400);
      res.end();
      return;
    }
    const l: Language = await DataManager.addLanguage(req.body.name);
    res.status(201);
    res.send(JSON.stringify(l));
  }

  private static checkLanguageForAdding(body: any): boolean {
    const keys = Object.keys(body);
    return !(keys.length !== 1 || keys[0] !== 'name' || typeof (body.name) !== 'string' || body.name.trim() === '');
  }

  public static async editLanguages(req: Request, res: Response): Promise<void> {
    if (!(req.body instanceof Array)) {
      res.status(400);
      res.end();
      return;
    }
    if (req.body.length === 0) {
      // empty body is invalid
      res.status(400);
      res.end();
      return;
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const a of req.body) {
      if (!validate(a)) {
        res.status(400);
        res.end();
        return;
      }
    }
    let ll;
    try {
      ll = await DataManager.editLanguages(req.body);
    } catch {
      res.status(400);
      res.end();
      return;
    }
    res.send(JSON.stringify(ll));
  }

  public static async deleteAllData(req: Request, res: Response): Promise<void> {
    await DataManager.deleteAllData();
    res.send({});
  }
}

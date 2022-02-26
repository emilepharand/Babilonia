import { Request, Response } from 'express';
import DataManager from './model/dataManager';
import { Language, validate } from './model/languages/language';
import { IdeaForAdding } from './model/ideas/ideaForAdding';

const lm = DataManager.getLanguageManager();
const im = DataManager.getIdeaManager();
const pm = DataManager.getPracticeManager();

// This is the contact point for the front-end and the back-end
// Controller as in C in MVC
// It makes basic validation before asking managers
// It is static because it doesn't hold any state
export default class Controller {
  public static async getNextIdea(req: Request, res: Response): Promise<void> {
    if (await im.countIdeas() === 0) {
      res.status(404);
      res.end();
    }
    res.send(JSON.stringify(await pm.getNextIdea()));
  }

  public static async getLanguages(req: Request, res: Response): Promise<void> {
    res.send(JSON.stringify(await lm.getLanguages()));
  }

  public static async addIdea(req: Request, res: Response): Promise<void> {
    if (!(await im.validateIdeaForAdding(req.body))) {
      res.status(400);
      res.end();
      return;
    }
    const returnIdea = await im.addIdea(req.body as IdeaForAdding);
    res.status(201);
    res.send(JSON.stringify(returnIdea));
  }

  public static async getIdeaById(req: Request, res: Response): Promise<void> {
    let idea;
    if (Number.isNaN(+req.params.id)) {
      res.status(400);
      res.end();
      return;
    }
    try {
      idea = await im.getIdeaById(parseInt(req.params.id, 10));
    } catch {
      // idea doesnt exist
      res.status(404);
      res.end();
      return;
    }
    res.send(idea);
  }

  public static async getLanguageById(req: Request, res: Response): Promise<void> {
    if (Number.isNaN(+req.params.id)) {
      res.status(400);
      res.end();
      return;
    }
    const language = await lm.getLanguageById(parseInt(req.params.id, 10));
    if (language === undefined) {
      res.status(404);
      res.end();
    }
    res.send(language);
  }

  public static async editIdea(req: Request, res: Response): Promise<void> {
    if (!await im.validateIdeaForAdding(req.body)) {
      res.status(400);
      res.end();
      return;
    }
    const idea = req.body as IdeaForAdding;
    if (idea.ee.length === 0) {
      res.status(400);
      res.end();
      return;
    }
    if (idea.ee.filter((e) => e.text.trim() === '').length > 0) {
      res.status(400);
      res.end();
      return;
    }
    // eslint-disable-next-line no-return-await,no-restricted-syntax
    for (const e of idea.ee) {
      // eslint-disable-next-line no-await-in-loop
      if (!(await lm.languageExists(e.languageId))) {
        res.status(400);
        res.end();
        return;
      }
    }
    // below lines is to make sure no two expressions are identical (same language and same text)
    const mapLanguageExpressions = new Map<number, string[]>();
    idea.ee.forEach((e) => mapLanguageExpressions.set(e.languageId, []));
    // eslint-disable-next-line no-restricted-syntax
    for (const e of idea.ee) {
      if (mapLanguageExpressions.get(e.languageId)?.includes(e.text)) {
        res.status(400);
        res.end();
        return;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mapLanguageExpressions.get(e.languageId).push(e.text);
    }
    await im.editIdea(idea, parseInt(req.params.id, 10));
    res.send(await im.getIdeaById(parseInt(req.params.id, 10)));
  }

  public static async deleteIdea(req: Request, res: Response): Promise<void> {
    const ideaId = parseInt(req.params.id, 10);
    if (Number.isNaN(+req.params.id)) {
      res.status(400);
      res.end();
      return;
    }
    try {
      await im.getIdeaById(parseInt(req.params.id, 10));
    } catch {
      // idea doesnt exist
      res.status(404);
      res.end();
      return;
    }
    await im.deleteIdea(ideaId);
    res.send({});
  }

  public static async deleteLanguage(req: Request, res: Response): Promise<void> {
    if (Number.isNaN(+req.params.id)) {
      res.status(400);
      res.end();
      return;
    }
    const id = parseInt(req.params.id, 10);
    if (await lm.getLanguageById(id) === undefined) {
      res.status(404);
      res.end();
      return;
    }
    await lm.deleteLanguage(id);
    res.send({});
  }

  public static async addLanguage(req: Request, res: Response): Promise<void> {
    if (!Controller.checkLanguageForAdding(req.body)
      || await lm.languageNameExists(req.body.name)) {
      res.status(400);
      res.end();
      return;
    }

    const l: Language = await lm.addLanguage(req.body.name);
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
    if (req.body.length !== (await lm.getLanguages()).length) {
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
      ll = await lm.editLanguages(req.body);
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

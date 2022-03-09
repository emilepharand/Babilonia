import { Request, Response } from 'express';
import DataServiceProvider from './model/dataServiceProvider';
import { Language } from './model/languages/language';
import { IdeaForAdding } from './model/ideas/ideaForAdding';
import { SearchContext } from './model/search/searchContext';

const lm = DataServiceProvider.getLanguageManager();
const im = DataServiceProvider.getIdeaManager();
const pm = DataServiceProvider.getPracticeManager();
const dv = DataServiceProvider.getInputValidator();
const search = DataServiceProvider.getSearchHandler();

// This is the contact point for the front-end and the back-end
// Controller as in C in MVC
// It must validate arguments before calling methods of the managers
// It is static because it doesn't hold any state
export default class Controller {
  public static async getLanguageById(req: Request, res: Response): Promise<void> {
    if (!(await Controller.validateLanguageIdInRequest(req, res))) {
      return;
    }
    const languageId = parseInt(req.params.id, 10);
    const language = await lm.getLanguage(languageId);
    res.send(language);
  }

  public static async deleteLanguage(req: Request, res: Response): Promise<void> {
    if (!(await Controller.validateLanguageIdInRequest(req, res))) {
      return;
    }
    const languageId = parseInt(req.params.id, 10);
    await lm.deleteLanguage(languageId);
    res.end();
  }

  public static async addLanguage(req: Request, res: Response): Promise<void> {
    if (!(await dv.validateLanguageForAdding(req.body))) {
      res.status(400);
      res.end();
      return;
    }
    const l: Language = await lm.addLanguage(req.body.name);
    res.status(201);
    res.send(JSON.stringify(l));
  }

  public static async editLanguages(req: Request, res: Response): Promise<void> {
    if (!(await dv.validateLanguagesForEditing(req.body))) {
      res.status(400);
      res.end();
      return;
    }
    const ll = await lm.editLanguages(req.body);
    res.send(JSON.stringify(ll));
  }

  public static async getNextIdea(req: Request, res: Response): Promise<void> {
    if ((await im.countIdeas()) === 0) {
      res.status(404);
      res.end();
    }
    res.send(JSON.stringify(await pm.getNextIdea()));
  }

  public static async getLanguages(req: Request, res: Response): Promise<void> {
    res.send(JSON.stringify(await lm.getLanguages()));
  }

  public static async addIdea(req: Request, res: Response): Promise<void> {
    if (!(await dv.validateIdeaForAdding(req.body))) {
      res.status(400);
      res.end();
      return;
    }
    const returnIdea = await im.addIdea(req.body as IdeaForAdding);
    res.status(201);
    res.send(JSON.stringify(returnIdea));
  }

  public static async getIdeaById(req: Request, res: Response): Promise<void> {
    if (!(await Controller.validateIdeaIdInRequest(req, res))) {
      return;
    }
    const idea = await im.getIdea(parseInt(req.params.id, 10));
    res.send(idea);
  }

  public static async search(req: Request, res: Response): Promise<void> {
    const sc: SearchContext = {
      pattern: req.query.pattern as string,
      language: parseInt(req.query.language as string, 10),
      strict: req.query.strict as true | undefined,
      ideaHas: undefined,
      ideaHasOperator: undefined,
      ideaDoesNotHave: undefined,
      ideaDoesNotHaveOperator: undefined,
    };
    const ideas = await search.executeSearch(sc);
    res.send(ideas);
  }

  public static async deleteIdea(req: Request, res: Response): Promise<void> {
    if (!(await Controller.validateIdeaIdInRequest(req, res))) {
      return;
    }
    await im.deleteIdea(parseInt(req.params.id, 10));
    res.end();
  }

  public static async editIdea(req: Request, res: Response): Promise<void> {
    if (!(await Controller.validateIdeaIdInRequest(req, res))) {
      return;
    }
    if (!(await dv.validateIdeaForAdding(req.body))) {
      res.status(400);
      res.end();
      return;
    }
    const idea = req.body as IdeaForAdding;
    await im.editIdea(idea, parseInt(req.params.id, 10));
    res.send(await im.getIdea(parseInt(req.params.id, 10)));
  }

  public static async deleteAllData(req: Request, res: Response): Promise<void> {
    await DataServiceProvider.deleteAllData();
    res.end();
  }

  private static async validateLanguageIdInRequest(req: Request, res: Response): Promise<boolean> {
    if (Number.isNaN(+req.params.id)) {
      res.status(400);
      res.end();
      return false;
    }
    const ideaId = parseInt(req.params.id, 10);
    if (!(await lm.languageIdExists(ideaId))) {
      res.status(404);
      res.end();
      return false;
    }
    return true;
  }

  private static async validateIdeaIdInRequest(req: Request, res: Response): Promise<boolean> {
    if (Number.isNaN(+req.params.id)) {
      res.status(400);
      res.end();
      return false;
    }
    const ideaId = parseInt(req.params.id, 10);
    if (!(await im.ideaExists(ideaId))) {
      res.status(404);
      res.end();
      return false;
    }
    return true;
  }
}

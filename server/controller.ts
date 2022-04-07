import { Request, Response } from "express";
import DataServiceProvider from "./model/dataServiceProvider";
import { Language } from "./model/languages/language";
import { IdeaForAdding } from "./model/ideas/ideaForAdding";
import { SearchContext } from "./model/search/searchContext";

const lm = DataServiceProvider.getLanguageManager();
const im = DataServiceProvider.getIdeaManager();
const pm = DataServiceProvider.getPracticeManager();
const dv = DataServiceProvider.getInputValidator();
const stats = DataServiceProvider.getStats();
const search = DataServiceProvider.getSearchHandler();

// This is the contact point for the front-end and the back-end
// Controller as in C in MVC
// It must validate arguments before calling methods of the managers
// It is static because it doesn't hold any state
export default class Controller {
	public static async getStats(req: Request, res: Response): Promise<void> {
		const ideasPerLanguage = await stats.getIdeasPerLanguage();
		res.send(JSON.stringify(ideasPerLanguage));
	}

	public static async getNextPracticeIdea(req: Request, res: Response): Promise<void> {
		if ((await im.countIdeas()) === 0) {
			res.status(404);
			res.end();
		}
		try {
			res.send(JSON.stringify(await pm.getNextIdea()));
		} catch {
			// There are no practiceable ideas
			res.status(404);
			res.end();
		}
	}

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
		// Reset practice manager because practiceable ideas may change after editing languages
		pm.clear();
		res.send(JSON.stringify(ll));
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
		const sc: SearchContext = {};
		sc.pattern = (req.query.pattern as string) ?? undefined;
		sc.strict = req.query.strict as true | undefined;
		if (req.query.language) {
			if (!await Controller.validateNumberInRequest(req.query.language as string, res)) {
				return;
			}
			sc.language = parseInt(req.query.language as string, 10);
		}
		if (req.query.ideaHas) {
			const ideaHasArray = (req.query.ideaHas as string).split(',');
			const promises: Promise<boolean>[] = [];
			ideaHasArray.forEach(ideaHas => promises.push(Controller.validateNumberInRequest(ideaHas, res)));
			if (!(await Promise.all(promises)).every(validNumber => validNumber)) {
				return;
			}
			sc.ideaHas = (req.query.ideaHas as string).split(',').map(i => parseInt(i, 10));
		}
		if (req.query.ideaDoesNotHave) {
			if (!await Controller.validateNumberInRequest(req.query.ideaDoesNotHave as string, res)) {
				return;
			}
			sc.ideaDoesNotHave = parseInt(req.query.ideaDoesNotHave as string, 10);
		}
		// Nothing to search
		if (Object.values(sc).every(el => el === undefined)) {
			res.status(400);
			res.end();
			return;
		}
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
		if (!await this.validateNumberInRequest(req.params.id, res)) {
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
		if (!await this.validateNumberInRequest(req.params.id, res)) {
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

	private static async validateNumberInRequest(expectedNumber: string, res: Response): Promise<boolean> {
		if (Number.isNaN(Number(expectedNumber))) {
			res.status(400);
			res.end();
			return false;
		}
		return true;
	}
}

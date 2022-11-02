import type {Request, Response} from 'express';
import * as DataServiceProvider from './model/dataServiceProvider';
import type {Language} from './model/languages/language';
import type {IdeaForAdding} from './model/ideas/ideaForAdding';
import type {SearchContext} from './model/search/searchContext';
import type {Settings} from './model/settings/settings';

const lm = DataServiceProvider.getLanguageManager();
const im = DataServiceProvider.getIdeaManager();
const pm = DataServiceProvider.getPracticeManager();
const iv = DataServiceProvider.getInputValidator();
const sm = DataServiceProvider.getSettingsManager();
const stats = DataServiceProvider.getStats();
const sh = DataServiceProvider.getSearchHandler();

// This is the contact point for the front-end and the back-end
// Controller as in C in MVC
// It must validate arguments before calling methods of the managers
// It is static because it doesn't hold any state
export async function getStats(req: Request, res: Response): Promise<void> {
	const ideasPerLanguage = await stats.getIdeasPerLanguage();
	res.send(JSON.stringify(ideasPerLanguage));
}

export async function getNextPracticeIdea(req: Request, res: Response): Promise<void> {
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

export async function getLanguageById(req: Request, res: Response): Promise<void> {
	if (!(await validateLanguageIdInRequest(req, res))) {
		return;
	}
	const languageId = parseInt(req.params.id, 10);
	const language = await lm.getLanguage(languageId);
	res.send(language);
}

export async function deleteLanguage(req: Request, res: Response): Promise<void> {
	if (!(await validateLanguageIdInRequest(req, res))) {
		return;
	}
	const languageId = parseInt(req.params.id, 10);
	await lm.deleteLanguage(languageId);
	res.end();
}

export async function addLanguage(req: Request, res: Response): Promise<void> {
	if (!(await iv.validateLanguageForAdding(req.body))) {
		res.status(400);
		res.end();
		return;
	}
	const l: Language = await lm.addLanguage(req.body.name);
	res.status(201);
	res.send(JSON.stringify(l));
}

export async function editLanguages(req: Request, res: Response): Promise<void> {
	if (!(await iv.validateLanguagesForEditing(req.body))) {
		res.status(400);
		res.end();
		return;
	}
	const ll = await lm.editLanguages(req.body);
	// Reset practice manager because practiceable ideas may change after editing languages
	pm.clear();
	res.send(JSON.stringify(ll));
}

export async function getLanguages(req: Request, res: Response): Promise<void> {
	res.send(JSON.stringify(await lm.getLanguages()));
}

export async function addIdea(req: Request, res: Response): Promise<void> {
	if (!(await iv.validateIdeaForAdding(req.body))) {
		res.status(400);
		res.end();
		return;
	}
	const returnIdea = await im.addIdea(req.body as IdeaForAdding);
	res.status(201);
	res.send(JSON.stringify(returnIdea));
}

export async function getIdeaById(req: Request, res: Response): Promise<void> {
	if (!(await validateIdeaIdInRequest(req, res))) {
		return;
	}
	const idea = await im.getIdea(parseInt(req.params.id, 10));
	res.send(idea);
}

export async function search(req: Request, res: Response): Promise<void> {
	const sc: SearchContext = {};
	sc.pattern = (req.query.pattern as string) ?? undefined;
	sc.strict = (req.query as SearchContext).strict as true | undefined;
	if (req.query.language) {
		if (!await validateNumberInRequest(req.query.language as string, res)) {
			return;
		}
		sc.language = parseInt(req.query.language as string, 10);
	}
	if (req.query.ideaHas) {
		const ideaHasArray = (req.query.ideaHas as string).split(',');
		const promises: Array<Promise<boolean>> = [];
		ideaHasArray.forEach(ideaHas => promises.push(validateNumberInRequest(ideaHas, res)));
		if (!(await Promise.all(promises)).every(validNumber => validNumber)) {
			return;
		}
		sc.ideaHas = (req.query.ideaHas as string).split(',').map(i => parseInt(i, 10));
	}
	if (req.query.ideaDoesNotHave) {
		if (!await validateNumberInRequest(req.query.ideaDoesNotHave as string, res)) {
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
	const ideas = await sh.executeSearch(sc);
	res.send(ideas);
}

export async function deleteIdea(req: Request, res: Response): Promise<void> {
	if (!(await validateIdeaIdInRequest(req, res))) {
		return;
	}
	await im.deleteIdea(parseInt(req.params.id, 10));
	res.end();
}

export async function editIdea(req: Request, res: Response): Promise<void> {
	if (!(await validateIdeaIdInRequest(req, res))) {
		return;
	}
	if (!(await iv.validateIdeaForAdding(req.body))) {
		res.status(400);
		res.end();
		return;
	}
	const idea = req.body as IdeaForAdding;
	await im.editIdea(idea, parseInt(req.params.id, 10));
	res.send(await im.getIdea(parseInt(req.params.id, 10)));
}

export async function setSettings(req: Request, res: Response): Promise<void> {
	if (!iv.validateSettings(req.body as Settings)) {
		res.status(400);
		res.end();
		return;
	}
	const settings = req.body as Settings;
	await sm.setSettings(settings);
	res.status(200);
	res.end();
}

export async function getSettings(req: Request, res: Response): Promise<void> {
	res.send(JSON.stringify(await sm.getSettings()));
}

export async function deleteAllData(req: Request, res: Response): Promise<void> {
	await DataServiceProvider.deleteAllData();
	res.end();
}

async function validateLanguageIdInRequest(req: Request, res: Response): Promise<boolean> {
	if (!await validateNumberInRequest(req.params.id, res)) {
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

async function validateIdeaIdInRequest(req: Request, res: Response): Promise<boolean> {
	if (!await validateNumberInRequest(req.params.id, res)) {
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

async function validateNumberInRequest(expectedNumber: string, res: Response): Promise<boolean> {
	if (Number.isNaN(Number(expectedNumber))) {
		res.status(400);
		res.end();
		return false;
	}
	return true;
}

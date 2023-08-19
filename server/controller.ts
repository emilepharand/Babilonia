import type {Request, Response} from 'express';
import * as DataServiceProvider from './model/dataServiceProvider';
import type {IdeaForAdding} from './model/ideas/ideaForAdding';
import type {Language} from './model/languages/language';
import type {SearchContext} from './model/search/searchContext';
import type {Settings} from './model/settings/settings';
import {type Manager} from './model/manager';
import AsyncLock from 'async-lock';

const lm = DataServiceProvider.getLanguageManager();
const im = DataServiceProvider.getIdeaManager();
const pm = DataServiceProvider.getPracticeManager();
const iv = DataServiceProvider.getInputValidator();
const sm = DataServiceProvider.getSettingsManager();
const statsCounter = DataServiceProvider.getStats();
const sh = DataServiceProvider.getSearchHandler();

const lock = new AsyncLock();

// This is the contact point for the front-end and the back-end
// Controller as in C in MVC
// It must validate arguments before calling methods of the managers

export async function getStats(_: Request, res: Response): Promise<void> {
	const stats = await statsCounter.getStats();
	res.send(JSON.stringify(stats));
}

export async function getNextPracticeIdea(_: Request, res: Response): Promise<void> {
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
	await lock.acquire('addLanguage', async () => {
		if (!(await iv.validateLanguageForAdding(req.body))) {
			res.status(400);
			res.end();
			return;
		}
		const l: Language = await lm.addLanguage(req.body.name as string);
		res.status(201);
		res.send(JSON.stringify(l));
	});
}

export async function editLanguages(req: Request, res: Response): Promise<void> {
	if (!(await iv.validateLanguagesForEditing(req.body))) {
		res.status(400);
		res.end();
		return;
	}
	const ll = await lm.editLanguages(req.body as Language[]);
	// Reset practice manager because practiceable ideas may change after editing languages
	pm.clear();
	res.send(JSON.stringify(ll));
}

export async function getLanguages(_: Request, res: Response): Promise<void> {
	res.send(JSON.stringify(await lm.getLanguages()));
}

export async function addIdea(req: Request, res: Response): Promise<void> {
	await lock.acquire('addIdea', async () => {
		if (!(await iv.validateIdeaForAdding(req.body as IdeaForAdding))) {
			res.status(400);
			res.end();
			return;
		}
		const ideaForAdding = req.body as IdeaForAdding;
		normalizeIdea(ideaForAdding);
		const returnIdea = await im.addIdea(ideaForAdding);
		res.status(201);
		res.send(JSON.stringify(returnIdea));
	});
}

function normalizeIdea(ideaForAdding: IdeaForAdding) {
	trimExpressions(ideaForAdding);
	normalizeWhitespace(ideaForAdding);
	trimContext(ideaForAdding);
}

function trimExpressions(ideaForAdding: IdeaForAdding) {
	ideaForAdding.ee.forEach(e => {
		e.text = e.text.trim();
	});
	return ideaForAdding;
}

function trimContext(ideaForAdding: IdeaForAdding) {
	ideaForAdding.ee.forEach(e => {
		e.text = e.text.replaceAll(/\s+(?=\))|(?<=\()\s+/g, '');
	});
	return ideaForAdding;
}

function normalizeWhitespace(ideaForAdding: IdeaForAdding) {
	ideaForAdding.ee.forEach(e => {
		e.text = e.text.replaceAll(/\s+/g, ' ');
	});
	return ideaForAdding;
}

export async function getIdeaById(req: Request, res: Response): Promise<void> {
	if (!await validateIdeaIdInRequest(req, res)) {
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
		if (!validateNumberInRequest(req.query.language as string, res)) {
			return;
		}
		sc.language = parseInt(req.query.language as string, 10);
	}
	if (req.query.ideaHas) {
		const ideaHasArray = (req.query.ideaHas as string).split(',');
		for (const ideaHas of ideaHasArray) {
			if (!(validateNumberInRequest(ideaHas, res))) {
				return;
			}
		}
		sc.ideaHas = (req.query.ideaHas as string).split(',').map(i => parseInt(i, 10));
	}
	if (req.query.ideaDoesNotHave) {
		if (!validateNumberInRequest(req.query.ideaDoesNotHave as string, res)) {
			return;
		}
		sc.ideaDoesNotHave = parseInt(req.query.ideaDoesNotHave as string, 10);
	}
	if (req.query.knownExpressions) {
		if (req.query.knownExpressions === 'true') {
			sc.knownExpressions = true;
		} else if (req.query.knownExpressions === 'false') {
			sc.knownExpressions = false;
		} else {
			res.status(400);
			res.end();
			return;
		}
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
	if (!(await iv.validateIdeaForAdding(req.body as IdeaForAdding))) {
		res.status(400);
		res.end();
		return;
	}
	const idea = req.body as IdeaForAdding;
	normalizeIdea(idea);
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
	if (await sm.isPracticeOnlyNotKnown() !== settings.practiceOnlyNotKnown) {
		// Reset practice manager because practiceable ideas may change after changing this setting
		pm.clear();
	}
	await sm.setSettings(settings);
	res.status(200);
	res.end();
}

export async function getSettings(_: Request, res: Response): Promise<void> {
	res.send(JSON.stringify(await sm.getSettings()));
}

export async function deleteAllData(_: Request, res: Response): Promise<void> {
	await DataServiceProvider.clearDatabaseAndCreateSchema();
	res.end();
}

async function validateIdInRequest(req: Request, res: Response, manager: Manager): Promise<boolean> {
	if (!validateNumberInRequest(req.params.id, res)) {
		return false;
	}
	const id = parseInt(req.params.id, 10);
	if (!(await manager.idExists(id))) {
		res.status(404);
		res.end();
		return false;
	}
	return true;
}

async function validateLanguageIdInRequest(req: Request, res: Response): Promise<boolean> {
	return validateIdInRequest(req, res, lm);
}

async function validateIdeaIdInRequest(req: Request, res: Response): Promise<boolean> {
	return validateIdInRequest(req, res, im);
}

function validateNumberInRequest(expectedNumber: string, res: Response): boolean {
	if (Number.isNaN(Number(expectedNumber))) {
		res.status(400);
		res.end();
		return false;
	}
	return true;
}

import fetch, {Response} from 'node-fetch';
import {Idea} from '../../server/model/ideas/idea';
import {Language} from '../../server/model/languages/language';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {SearchContext} from '../../server/model/search/searchContext';
import {NumberIdeasInLanguage} from '../../server/stats/stats';
import {Settings} from '../../server/model/settings/settings';
import {paramsFromSearchContext} from '@/ts/api';
import * as dotenv from 'dotenv';

export const FIRST_LANGUAGE_ID = 1;
export const FIRST_IDEA_ID = 1;
export const FIRST_ORDERING = 0;
export const DEFAULT_IS_PRACTICE = false;

dotenv.config({path: '.env.test'});

export const apiUrl = `${process.env.VITE_API_URL}`;

export async function setSettingsRawObjectAndGetResponse(object: any) {
	return fetch(`${apiUrl}/settings`, {
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: object,
	});
}

export async function setSettingsAndGetResponse(settings: Settings) {
	return setSettingsRawObjectAndGetResponse(JSON.stringify(settings));
}

export async function setSettings(settings: Settings) {
	await setSettingsRawObjectAndGetResponse(JSON.stringify(settings));
}

export async function fetchSettings(): Promise<Settings> {
	return await (await fetch(`${apiUrl}/settings`, {
		method: 'GET',
	})).json() as Settings;
}

export async function addLanguageRawObjectAndGetResponse(object: any): Promise<Response> {
	return fetch(`${apiUrl}/languages`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: object,
	});
}

export async function addLanguageAndGetResponse(name: string): Promise<Response> {
	return addLanguageRawObjectAndGetResponse(JSON.stringify({name}));
}

export async function addLanguage(name: string): Promise<Language> {
	return (await (await addLanguageAndGetResponse(name)).json()) as Language;
}

export async function editLanguagesRawObjectAndGetResponse(object: any): Promise<Response> {
	return fetch(`${apiUrl}/languages`, {
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: object,
	});
}

export async function editLanguagesAndGetResponse(newLanguages: Language[]): Promise<Response> {
	return editLanguagesRawObjectAndGetResponse(JSON.stringify(newLanguages));
}

export async function editLanguages(newLanguages: Language[]): Promise<Language[]> {
	return (await (
		await editLanguagesRawObjectAndGetResponse(JSON.stringify(newLanguages))
	).json()) as Language[];
}

export async function fetchLanguageAndGetResponse(id: number): Promise<Response> {
	return fetch(`${apiUrl}/languages/${id}`, {
		method: 'GET',
		headers: {'Content-Type': 'application/json'},
	});
}

export async function fetchLanguage(id: number): Promise<Language> {
	return (await (await fetchLanguageAndGetResponse(id)).json()) as Language;
}

export async function fetchLanguagesAndGetResponse(): Promise<Response> {
	return fetch(`${apiUrl}/languages`, {
		method: 'GET',
	});
}

export async function fetchLanguages(): Promise<Language[]> {
	return (await (await fetchLanguagesAndGetResponse()).json()) as Language[];
}

export async function deleteLanguage(id: number): Promise<Response> {
	return fetch(`${apiUrl}/languages/${id}`, {
		method: 'DELETE',
	});
}

export async function addIdeaRawObjectAndGetResponse(obj: any): Promise<Response> {
	return fetch(`${apiUrl}/ideas`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: obj,
	});
}

export async function addIdeaAndGetResponse(idea: IdeaForAdding): Promise<Response> {
	return addIdeaRawObjectAndGetResponse(JSON.stringify(idea));
}

export async function addIdea(idea: IdeaForAdding): Promise<Idea> {
	return (await (await addIdeaRawObjectAndGetResponse(JSON.stringify(idea))).json()) as Idea;
}

export async function editIdeaRawObjectAndGetResponse(idea: any, id: number): Promise<Response> {
	return fetch(`${apiUrl}/ideas/${id}`, {
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: idea,
	});
}

export async function editIdeaAndGetResponse(object: any, id: number): Promise<Response> {
	return editIdeaRawObjectAndGetResponse(JSON.stringify(object), id);
}

export async function editIdea(object: any, id: number): Promise<Idea> {
	return (await (await editIdeaRawObjectAndGetResponse(JSON.stringify(object), id)).json()) as Idea;
}

export async function deleteIdea(id: number): Promise<Response> {
	return fetch(`${apiUrl}/ideas/${id}`, {
		method: 'DELETE',
	});
}

export async function fetchIdeaAndGetResponse(id: number): Promise<Response> {
	return fetch(`${apiUrl}/ideas/${id}`, {
		method: 'GET',
	});
}

export async function fetchIdea(id: number): Promise<Idea> {
	return (await (await fetchIdeaAndGetResponse(id)).json()) as Idea;
}

export async function searchRawParamsAndGetResponse(params: string): Promise<Response> {
	const url = encodeURI(`${apiUrl}/ideas?${params}`);
	return fetch(url, {
		method: 'GET',
	});
}

export async function searchAndGetResponse(sc: SearchContext): Promise<Response> {
	const params = paramsFromSearchContext(sc);
	const url = encodeURI(`${apiUrl}/ideas?${params}`);
	return fetch(url, {
		method: 'GET',
	});
}

export async function search(sc: SearchContext): Promise<Idea[]> {
	return (await (await searchAndGetResponse(sc)).json()) as Idea[];
}

export async function rawNextPracticeIdea(): Promise<Response> {
	return fetch(`${apiUrl}/practice-ideas/next`, {
		method: 'GET',
	});
}

export async function nextPracticeIdea(): Promise<Idea> {
	return (await (await rawNextPracticeIdea()).json()) as Idea;
}

export async function getStats(): Promise<NumberIdeasInLanguage[]> {
	return await (await fetch(`${apiUrl}/stats`, {
		method: 'GET',
	})).json() as NumberIdeasInLanguage[];
}

export async function deleteEverything(): Promise<Response> {
	return fetch(`${apiUrl}/everything`, {method: 'DELETE'});
}

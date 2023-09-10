import * as dotenv from 'dotenv';
import fetch, {Response} from 'node-fetch';
import {Idea} from '../../server/model/ideas/idea';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {Language} from '../../server/model/languages/language';
import {SearchContext} from '../../server/model/search/searchContext';
import {Settings} from '../../server/model/settings/settings';
import {AllStats} from '../../server/stats/statsCounter';
import {paramsFromSearchContext} from '../../src/ts/api';
import {getRandomString, settingsFromPartial} from './utils';

export const FIRST_LANGUAGE_ID = 1;
export const FIRST_IDEA_ID = 1;
export const FIRST_ORDERING = 0;
export const DEFAULT_IS_PRACTICE = false;

dotenv.config({path: '.env.test'});

export const apiUrl = `${process.env.VITE_API_URL}`;

function doFetch(url: string, method: 'GET'|'PUT'|'POST'|'DELETE', body?: any) {
	return fetch(url, {method, headers: {'Content-Type': 'application/json'}, body});
}

async function getResources(resource: string): Promise<Response> {
	return doFetch(`${apiUrl}/${resource}`, 'GET');
}

async function getResource(resource: string, id: number): Promise<Response> {
	return doFetch(`${apiUrl}/${resource}/${id}`, 'GET');
}

export async function deleteResource(resource: string, id: number): Promise<Response> {
	return doFetch(`${apiUrl}/${resource}/${id}`, 'DELETE');
}

export async function fetchIdeaAndGetResponse(id: number): Promise<Response> {
	return getResource('ideas', id);
}

export async function fetchIdea(id: number): Promise<Idea> {
	return (await (await fetchIdeaAndGetResponse(id)).json()) as Idea;
}

export async function addIdeaAndGetResponse(idea: IdeaForAdding): Promise<Response> {
	return doFetch(`${apiUrl}/ideas`, 'POST', JSON.stringify(idea));
}

export async function addIdea(idea: IdeaForAdding): Promise<Idea> {
	return (await (await addIdeaAndGetResponse(idea)).json()) as Idea;
}

export async function editIdeaAndGetResponse(idea: any, id: number): Promise<Response> {
	return doFetch(`${apiUrl}/ideas/${id}`, 'PUT', JSON.stringify(idea));
}

export async function editIdea(object: any, id: number): Promise<Idea> {
	return (await (await editIdeaAndGetResponse(object, id)).json()) as Idea;
}

export async function deleteIdea(id: number): Promise<Response> {
	return deleteResource('ideas', id);
}

export async function fetchLanguages(): Promise<Language[]> {
	return (await (await fetchLanguagesAndGetResponse()).json()) as Language[];
}

export async function fetchLanguageAndGetResponse(id: number): Promise<Response> {
	return getResource('languages', id);
}

export async function fetchLanguage(id: number): Promise<Language> {
	return (await (await fetchLanguageAndGetResponse(id)).json()) as Language;
}

export async function fetchLanguagesAndGetResponse(): Promise<Response> {
	return getResources('languages');
}

export async function addLanguageRawObjectAndGetResponse(language: any): Promise<Response> {
	return doFetch(`${apiUrl}/languages`, 'POST', language);
}

export async function addLanguageAndGetResponse(name: string): Promise<Response> {
	return doFetch(`${apiUrl}/languages`, 'POST', JSON.stringify({name}));
}

export async function addLanguage(name: string): Promise<Language> {
	return (await (await addLanguageAndGetResponse(name)).json()) as Language;
}

export async function addAnyLanguage(): Promise<Language> {
	return addLanguage('language ' + getRandomString());
}

export async function editLanguagesRawObjectAndGetResponse(object: any): Promise<Response> {
	return doFetch(`${apiUrl}/languages`, 'PUT', object);
}

export async function editLanguagesAndGetResponse(newLanguages: Language[]): Promise<Response> {
	return editLanguagesRawObjectAndGetResponse(JSON.stringify(newLanguages));
}

export async function editLanguages(newLanguages: Language[]): Promise<Language[]> {
	return (await (await editLanguagesRawObjectAndGetResponse(JSON.stringify(newLanguages))).json()) as Language[];
}

export async function deleteLanguage(id: number): Promise<Response> {
	return deleteResource('languages', id);
}

export async function fetchSettingsAndGetResponse(): Promise<Response> {
	return getResources('settings');
}

export async function fetchSettings(): Promise<Settings> {
	return await (await fetchSettingsAndGetResponse()).json() as Settings;
}

export async function fetchStatsAndGetResponse(): Promise<Response> {
	return getResources('stats');
}

export async function getStats(): Promise<AllStats> {
	return await (await fetchStatsAndGetResponse()).json() as AllStats;
}

export async function setSettingsRawObjectAndGetResponse(object: any) {
	return doFetch(`${apiUrl}/settings`, 'PUT', object);
}

export async function setSettingsAndGetResponse(settings: Settings) {
	return setSettingsRawObjectAndGetResponse(JSON.stringify(settings));
}

export async function setSettings(settings: Partial<Settings>) {
	await setSettingsRawObjectAndGetResponse(JSON.stringify(settingsFromPartial(settings)));
}

export async function searchRawParamsAndGetResponse(params: string): Promise<Response> {
	const url = encodeURI(`${apiUrl}/ideas?${params}`);
	return doFetch(url, 'GET');
}

export async function searchAndGetResponse(sc: SearchContext): Promise<Response> {
	const params = paramsFromSearchContext(sc);
	const url = encodeURI(`${apiUrl}/ideas?${params}`);
	return doFetch(url, 'GET');
}

export async function search(sc: SearchContext): Promise<Idea[]> {
	return (await (await searchAndGetResponse(sc)).json()) as Idea[];
}

export async function rawNextPracticeIdea(): Promise<Response> {
	return doFetch(`${apiUrl}/practice-ideas/next`, 'GET');
}

export async function nextPracticeIdea(): Promise<Idea> {
	return (await (await rawNextPracticeIdea()).json()) as Idea;
}

export async function deleteEverything(): Promise<Response> {
	return doFetch(`${apiUrl}/everything`, 'DELETE');
}

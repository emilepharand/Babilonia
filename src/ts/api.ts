import type {Idea} from '../../server/model/ideas/idea';
import type {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import type {Language} from '../../server/model/languages/language';
import type {SearchContext} from '../../server/model/search/searchContext';
import type {Settings} from '../../server/model/settings/settings';
import type {AllStats} from '../../server/stats/statsCounter';
import {apiUrl} from './const';

async function doFetch(url: string, method: 'GET' | 'PUT' | 'POST' | 'DELETE', body?: string) {
	return fetch(url, {method, headers: {'Content-Type': 'application/json'}, body});
}

async function doPut(url: string, body: unknown): Promise<Response> {
	return doFetch(`${apiUrl}${url}`, 'PUT', JSON.stringify(body));
}

async function doGet(url: string): Promise<Response> {
	return doFetch(`${apiUrl}${url}`, 'GET');
}

async function doPost(url: string, body: unknown): Promise<Response> {
	return doFetch(`${apiUrl}${url}`, 'POST', JSON.stringify(body));
}

async function doDelete(url: string): Promise<void> {
	await doFetch(`${apiUrl}${url}`, 'DELETE');
}

export async function getIdea(ideaId: number): Promise<Idea> {
	const response = await doGet(`/ideas/${ideaId}`);
	if (response.status === 404) {
		return Promise.reject(new Error('Idea not found'));
	}
	return (await response.json()) as Idea;
}

export async function editIdea(
	ideaForAdding: IdeaForAdding,
	id: number,
): Promise<Idea> {
	const response = await doPut(`/ideas/${id}`, ideaForAdding);
	return (await response.json()) as Idea;
}

export async function deleteIdea(ideaId: number): Promise<void> {
	await doDelete(`/ideas/${ideaId}`);
}

export async function deleteLanguage(languageId: number): Promise<void> {
	await doDelete(`/languages/${languageId}`);
}

export async function addIdea(ifa: IdeaForAdding): Promise<Idea> {
	const response = await doPost('/ideas', ifa);
	return (await response.json()) as Idea;
}

export async function getNextIdea(): Promise<Idea | undefined> {
	const response = await doGet('/practice-ideas/next');
	if (response.status === 404) {
		return undefined;
	}
	return (await response.json()) as Idea;
}

export async function addLanguage(name: string): Promise<Language> {
	const response = await doPost('/languages', {name});
	return (await response.json()) as Language;
}

export async function editLanguages(
	languages: Language[],
): Promise<Language[]> {
	const response = await doPut('/languages', languages);
	return (await response.json()) as Language[];
}

export async function getLanguage(id: number): Promise<Language> {
	const response = await doGet(`/languages/${id}`);
	return (await response.json()) as Language;
}

export async function getStats(): Promise<AllStats> {
	const response = await doGet('/stats');
	return (await response.json()) as AllStats;
}

export async function getLanguages(): Promise<Language[]> {
	const response = await doGet('/languages');
	return (await response.json()) as Language[];
}

export async function getSettings(): Promise<Settings> {
	const response = await doGet('/settings');
	return (await response.json()) as Settings;
}

export async function getDatabasePath(): Promise<string> {
	const response = await doGet('/database/path');
	return (await response.json()) as string;
}

export async function changeDatabase(path: string): Promise<Response> {
	return doPut('/database/path', {path});
}

export async function migrateDatabase(path: string): Promise<Response> {
	return doPut('/database/migrate', {path});
}

export async function setSettings(settings: Settings): Promise<void> {
	await doPut('/settings', settings);
}

export async function searchIdeas(sc: SearchContext): Promise<Idea[]> {
	const params = paramsFromSearchContext(sc);
	const response = await doGet(`/ideas?${params}`);
	return (await response.json()) as Idea[];
}

export function paramsFromSearchContext(sc: SearchContext): string {
	return [
		sc.pattern && `pattern=${sc.pattern}`,
		sc.strict && 'strict=true',
		sc.language && `language=${sc.language}`,
		sc.ideaHas && `ideaHas=${sc.ideaHas.join(',')}`,
		sc.ideaDoesNotHave && `ideaDoesNotHave=${sc.ideaDoesNotHave}`,
		sc.knownExpressions !== undefined && `knownExpressions=${sc.knownExpressions ? 'true' : 'false'}`,
	].filter(Boolean).join('&');
}

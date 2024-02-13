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

export async function getIdea(ideaId: number): Promise<Idea> {
	const url = `${apiUrl}/ideas/${ideaId}`;
	const response = await doFetch(url, 'GET');
	if (response.status === 404) {
		return Promise.reject(new Error('Idea not found'));
	}
	return (await response.json()) as Idea;
}

export async function editIdea(
	ideaForAdding: IdeaForAdding,
	id: number,
): Promise<Idea> {
	const url = `${apiUrl}/ideas/${id}`;
	const response = await doFetch(url, 'PUT', JSON.stringify(ideaForAdding));
	return (await response.json()) as Idea;
}

export async function deleteIdea(ideaId: number): Promise<void> {
	const url = `${apiUrl}/ideas/${ideaId}`;
	await doFetch(url, 'DELETE');
}

export async function deleteLanguage(languageId: number): Promise<void> {
	const url = `${apiUrl}/languages/${languageId}`;
	await doFetch(url, 'DELETE');
}

export async function addIdea(ifa: IdeaForAdding): Promise<Idea> {
	const url = `${apiUrl}/ideas`;
	const response = await doFetch(url, 'POST', JSON.stringify(ifa));
	return (await response.json()) as Idea;
}

export async function getNextIdea(): Promise<Idea | undefined> {
	const url = `${apiUrl}/practice-ideas/next`;
	const response = await doFetch(url, 'GET');
	if (response.status === 404) {
		return undefined;
	}
	return (await response.json()) as Idea;
}

export async function addLanguage(name: string): Promise<Language> {
	const url = `${apiUrl}/languages`;
	const response = await doFetch(url, 'POST', JSON.stringify({name}));
	return (await response.json()) as Language;
}

export async function editLanguages(
	languages: Language[],
): Promise<Language[]> {
	const url = `${apiUrl}/languages`;
	const response = await doFetch(url, 'PUT', JSON.stringify(languages));
	return (await response.json()) as Language[];
}

export async function getLanguage(id: number): Promise<Language> {
	const url = `${apiUrl}/languages/${id}`;
	const response = await doFetch(url, 'GET');
	return (await response.json()) as Language;
}

export async function getStats(): Promise<AllStats> {
	const url = `${apiUrl}/stats`;
	const response = await doFetch(url, 'GET');
	return (await response.json()) as AllStats;
}

export async function getLanguages(): Promise<Language[]> {
	const url = `${apiUrl}/languages`;
	const response = await doFetch(url, 'GET');
	return (await response.json()) as Language[];
}

export async function getSettings(): Promise<Settings> {
	const url = `${apiUrl}/settings`;
	const response = await doFetch(url, 'GET');
	return (await response.json()) as Settings;
}

export async function setSettings(settings: Settings): Promise<void> {
	const url = `${apiUrl}/settings`;
	await doFetch(url, 'PUT', JSON.stringify(settings));
}

export async function searchIdeas(sc: SearchContext): Promise<Idea[]> {
	const params = paramsFromSearchContext(sc);
	const url = `${apiUrl}/ideas?${params}`;
	const response = await doFetch(url, 'GET');
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

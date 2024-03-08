import * as fetchUtils from './fetch-utils';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {Language} from '../../server/model/languages/language';
import {SearchContext} from '../../server/model/search/searchContext';
import {Settings} from '../../server/model/settings/settings';
import {Idea} from '../../server/model/ideas/idea';
import {getRandomString, settingsFromPartial} from './utils';
import {AllStats} from '../../server/stats/statsCounter';
import {Response} from 'node-fetch';
import {memoryDatabasePath} from '../../server/const';

async function fetchAndConvert<T>(fetchMethod: (..._args: any[]) => Promise<Response>, ..._args: any[]): Promise<T> {
	const response = await fetchMethod(..._args);
	return await response.json() as Promise<T>;
}

export async function addLanguage(name: string): Promise<Language> {
	return fetchAndConvert<Language>(fetchUtils.addLanguage, name);
}

export async function addAnyLanguage(): Promise<Language> {
	return addLanguage('language ' + getRandomString());
}

export async function addIdea(ideaForAdding: IdeaForAdding) : Promise<Idea> {
	return fetchAndConvert<Idea>(fetchUtils.addIdea, ideaForAdding);
}

export async function changeDatabase(path: string) {
	return fetchUtils.changeDatabase(path);
}

export async function migrateDatabase(path: string) {
	return fetchUtils.migrateDatabase(path);
}

export async function changeDatabaseToMemoryAndDeleteEverything(): Promise<Response> {
	const res = await changeDatabase(memoryDatabasePath);
	if (res.status !== 200) {
		throw new Error('Failed to change database to memory.');
	}
	return deleteEverything();
}

export async function getDatabasePath():Promise<{path:string}> {
	return fetchAndConvert<{path:string}>(fetchUtils.getDatabasePath);
}

export async function editIdea(object: any, id: number): Promise<Idea> {
	return fetchAndConvert<Idea>(fetchUtils.editIdea, object, id);
}

export async function fetchLanguages(): Promise<Language[]> {
	return fetchAndConvert<Language[]>(fetchUtils.fetchLanguages);
}

export async function fetchLanguage(id: number): Promise<Language> {
	return fetchAndConvert<Language>(fetchUtils.fetchLanguage, id);
}

export async function fetchIdea(id: number):Promise<Idea> {
	return fetchAndConvert<Idea>(fetchUtils.fetchIdea, id);
}

export async function editLanguages(newLanguages: Language[]): Promise<Language[]> {
	return fetchAndConvert<Language[]>(fetchUtils.editLanguages, newLanguages);
}

export async function deleteLanguage(id: number) {
	return fetchUtils.deleteLanguage(id);
}

export async function fetchSettings(): Promise<Settings> {
	return fetchAndConvert<Settings>(fetchUtils.fetchSettings);
}

export async function getStats(): Promise<AllStats> {
	return fetchAndConvert<AllStats>(fetchUtils.getStats);
}

export async function setSettings(settings: Partial<Settings>) {
	return fetchUtils.setSettings(settingsFromPartial(settings));
}

export async function search(sc: SearchContext): Promise<Idea[]> {
	return fetchAndConvert<Idea[]>(fetchUtils.search, sc);
}

export async function nextPracticeIdea(): Promise<Idea> {
	return fetchAndConvert<Idea>(fetchUtils.nextPracticeIdea);
}

export async function deleteEverything() {
	return fetchUtils.deleteEverything();
}

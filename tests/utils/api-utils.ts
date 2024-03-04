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

export async function addLanguage(name: string): Promise<Language> {
	return fetchUtils.addLanguage(name).then(r => r.json() as Promise<Language>);
}

export async function addAnyLanguage(): Promise<Language> {
	return addLanguage('language ' + getRandomString());
}

export async function addIdea(ideaForAdding: IdeaForAdding) : Promise<Idea> {
	return fetchUtils.addIdea(ideaForAdding).then(r => r.json() as Promise<Idea>);
}

export async function changeDatabase(path: string) {
	return fetchUtils.changeDatabase(path);
}

export async function getDatabasePath():Promise<{path:string}> {
	return fetchUtils.getDatabasePath().then(r => r.json() as Promise<{path:string}>);
}

export async function changeDatabaseToMemoryAndDeleteEverything(): Promise<Response> {
	const res = await changeDatabase(memoryDatabasePath);
	if (res.status !== 200) {
		throw new Error('Failed to change database to memory.');
	}
	return deleteEverything();
}

export async function editIdea(object: any, id: number): Promise<Idea> {
	return fetchUtils.editIdea(object, id).then(r => r.json() as Promise<Idea>);
}

export async function fetchLanguages(): Promise<Language[]> {
	return fetchUtils.fetchLanguages().then(r => r.json() as Promise<Language[]>);
}

export async function fetchLanguage(id: number): Promise<Language> {
	return fetchUtils.fetchLanguage(id).then(r => r.json() as Promise<Language>);
}

export async function fetchIdea(id: number):Promise<Idea> {
	return fetchUtils.fetchIdea(id).then(r => r.json() as Promise<Idea>);
}

export async function editLanguages(newLanguages: Language[]): Promise<Language[]> {
	return fetchUtils.editLanguages(newLanguages).then(r => r.json() as Promise<Language[]>);
}

export async function deleteLanguage(id: number) {
	return fetchUtils.deleteLanguage(id);
}

export async function fetchSettings(): Promise<Settings> {
	return fetchUtils.fetchSettings().then(r => r.json() as Promise<Settings>);
}

export async function getStats(): Promise<AllStats> {
	return fetchUtils.getStats().then(r => r.json() as Promise<AllStats>);
}

export async function setSettings(settings: Partial<Settings>) {
	return fetchUtils.setSettings(settingsFromPartial(settings));
}

export async function search(sc: SearchContext): Promise<Idea[]> {
	return fetchUtils.search(sc).then(r => r.json() as Promise<Idea[]>);
}

export async function nextPracticeIdea(): Promise<Idea> {
	return fetchUtils.nextPracticeIdea().then(r => r.json() as Promise<Idea>);
}

export async function deleteEverything() {
	return fetchUtils.deleteEverything();
}

import * as dotenv from 'dotenv';
import fetch, {Response} from 'node-fetch';
import {paramsFromSearchContext} from '../../src/ts/api';
import {SearchContext} from '../../server/model/search/searchContext';

export const FIRST_LANGUAGE_ID = 1;
export const FIRST_IDEA_ID = 1;
export const FIRST_ORDERING = 0;
export const DEFAULT_IS_PRACTICE = false;

dotenv.config({path: '.env.test'});

export const apiUrl = `${process.env.VITE_API_URL}`;

async function doFetch(url: string, method: 'GET'|'PUT'|'POST'|'DELETE', body?: any): Promise<Response> {
	return fetch(url, {method, headers: {'Content-Type': 'application/json'}, body});
}

async function fetchResource(resource: string, id?: number, method: 'GET'|'PUT'|'POST'|'DELETE' = 'GET', body?: any): Promise<Response> {
	const url = id ? `${apiUrl}/${resource}/${id}` : `${apiUrl}/${resource}`;
	return doFetch(url, method, body);
}

export async function fetchIdea(id: number): Promise<Response> {
	return fetchResource('ideas', id);
}

export async function addIdea(object: any): Promise<Response> {
	return fetchResource('ideas', undefined, 'POST', JSON.stringify(object));
}

export async function editIdea(object: any, id: number): Promise<Response> {
	return fetchResource('ideas', id, 'PUT', JSON.stringify(object));
}

export async function deleteIdea(id: number): Promise<Response> {
	return fetchResource('ideas', id, 'DELETE');
}

export async function fetchLanguages(): Promise<Response> {
	return fetchResource('languages');
}

export async function fetchLanguage(id: number): Promise<Response> {
	return fetchResource('languages', id);
}

export async function addLanguageRaw(object: any): Promise<Response> {
	return fetchResource('languages', undefined, 'POST', JSON.stringify(object));
}

export async function addLanguage(name: string): Promise<Response> {
	return addLanguageRaw({name});
}

export async function editLanguages(object: any): Promise<Response> {
	return fetchResource('languages', undefined, 'PUT', JSON.stringify(object));
}

export async function deleteLanguage(id: number): Promise<Response> {
	return fetchResource('languages', id, 'DELETE');
}

export async function fetchSettings(): Promise<Response> {
	return fetchResource('settings');
}

export async function getStats(): Promise<Response> {
	return fetchResource('stats');
}

export async function setSettings(object: any) {
	return fetchResource('settings', undefined, 'PUT', JSON.stringify(object));
}

export async function search(sc: SearchContext): Promise<Response> {
	const params = paramsFromSearchContext(sc);
	return searchRaw(params);
}

export async function searchRaw(params: string): Promise<Response> {
	const url = encodeURI(`${apiUrl}/ideas?${params}`);
	return doFetch(url, 'GET');
}

export async function changeDatabase(path: string) {
	return changeDatabaseRaw({path});
}

export async function changeDatabaseRaw(object: any): Promise<Response> {
	return fetchResource('database/path', undefined, 'PUT', JSON.stringify(object));
}

export async function migrateDatabase(path: string): Promise<Response> {
	return migrateDatabaseRaw({path});
}

export async function migrateDatabaseRaw(object: any): Promise<Response> {
	return fetchResource('database/migrate', undefined, 'PUT', JSON.stringify(object));
}

export async function getDatabasePath(): Promise<Response> {
	return fetchResource('database/path');
}

export async function nextPracticeIdea(): Promise<Response> {
	return fetchResource('practice-ideas/next');
}

export async function deleteEverything(): Promise<Response> {
	return fetchResource('everything', undefined, 'DELETE');
}

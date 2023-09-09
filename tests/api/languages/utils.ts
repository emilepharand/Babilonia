import {DEFAULT_IS_PRACTICE, FIRST_ORDERING, addLanguageAndGetResponse, addLanguageRawObjectAndGetResponse, editLanguagesAndGetResponse, editLanguagesRawObjectAndGetResponse, fetchLanguage, fetchLanguageAndGetResponse, fetchLanguages} from '../../utils/fetch-utils';
import {Language, validate} from '../../../server/model/languages/language';

export async function addInvalidLanguageAndTest(object: any): Promise<void> {
	const r = await addLanguageRawObjectAndGetResponse(object);
	expect(r.status).toEqual(400);
	expect((await fetchLanguages()).length).toEqual(0);
}

export async function editInvalidLanguagesAndTest(object: any, ...languages: Language[]): Promise<void> {
	expect((await editLanguagesRawObjectAndGetResponse(object)).status).toEqual(400);

	for (const l of languages) {
		// eslint-disable-next-line no-await-in-loop
		expect(await fetchLanguage(l.id)).toEqual(l);
	}
	expect((await fetchLanguages()).length).toEqual(languages.length);
}

export async function addValidLanguageAndTest(
	name: string,
	expectedId: number,
	expectedOrdering: number,
): Promise<Language> {
	let r = await addLanguageAndGetResponse(name);
	expect(r.status).toEqual(201);
	const responseLanguage = (await r.json()) as Language;

	expect(validate(responseLanguage)).toEqual(true);
	expect(responseLanguage.id).toEqual(expectedId);
	expect(responseLanguage.name).toEqual(name);
	expect(responseLanguage.isPractice).toEqual(DEFAULT_IS_PRACTICE);
	expect(responseLanguage.ordering).toEqual(expectedOrdering);

	r = await fetchLanguageAndGetResponse(expectedId);
	expect(r.status).toEqual(200);
	const fetchedLanguage = await r.json();
	expect(responseLanguage).toEqual(fetchedLanguage);

	return fetchedLanguage as Language;
}

export async function editAndTest(
	newLanguage1: Language,
	newLanguage2: Language,
	changes: boolean,
): Promise<void> {
	const oldLanguage1 = await fetchLanguage(newLanguage1.id);
	const oldLanguage2 = await fetchLanguage(newLanguage2.id);

	const ll: Language[] = [newLanguage1, newLanguage2];
	let r = await editLanguagesAndGetResponse(ll);
	expect(r.status).toEqual(200);

	const [responseLanguage1, responseLanguage2] = (await r.json()) as Language[];

	r = await fetchLanguageAndGetResponse(newLanguage1.id);
	expect(r.status).toEqual(200);
	const fetchedLanguage1 = await r.json();

	r = await fetchLanguageAndGetResponse(newLanguage2.id);
	expect(r.status).toEqual(200);
	const fetchedLanguage2 = await r.json();

	// Validate response language
	expect(validate(responseLanguage1)).toEqual(true);
	expect(validate(responseLanguage2)).toEqual(true);
	expect(responseLanguage1).toEqual(fetchedLanguage1);
	expect(responseLanguage2).toEqual(fetchedLanguage2);

	if (changes) {
		// Sanity checks
		expect(oldLanguage1).not.toEqual(newLanguage1);
		expect(oldLanguage2).not.toEqual(newLanguage2);
		// Check values have changed
		expect(fetchedLanguage1).toEqual(newLanguage1);
		expect(fetchedLanguage2).toEqual(newLanguage2);
	} else {
		// Sanity checks
		expect(oldLanguage1).toEqual(newLanguage1);
		expect(oldLanguage2).toEqual(newLanguage2);
		// Check values have not changed
		expect(fetchedLanguage1).toEqual(oldLanguage1);
		expect(fetchedLanguage2).toEqual(oldLanguage2);
	}
}

export async function testLanguageOrder(ids: number[]) {
	for (let i = 0; i < ids.length; i += 1) {
		// eslint-disable-next-line no-await-in-loop
		expect((await fetchLanguage(ids[i])).ordering).toEqual(FIRST_ORDERING + i);
	}
}

export async function addNLanguages(n: number) {
	for (let i = 0; i < n; i += 1) {
		// eslint-disable-next-line no-await-in-loop
		expect((await addLanguageAndGetResponse(`language ${i}`)).status).toEqual(201);
	}
}

export function copyLanguage(l: Language) {
	return {
		id: l.id,
		name: l.name,
		ordering: l.ordering,
		isPractice: l.isPractice,
	};
}

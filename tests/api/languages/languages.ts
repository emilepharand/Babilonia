import fetch from 'node-fetch';
import {Language} from '../../../server/model/languages/language';
import {
	addInvalidLanguageAndTest,
	addNLanguages,
	addValidLanguageAndTest,
	copyLanguage,
	editAndTest,
	editInvalidLanguagesAndTest,
	testLanguageOrder,
} from './utils';
import * as ApiUtils from '../../utils/api-utils';
import * as FetchUtils from '../../utils/fetch-utils';
import {apiUrl, FIRST_LANGUAGE_ID, FIRST_ORDERING} from '../../utils/fetch-utils';
import {ExpressionForAdding} from '../../../server/model/ideas/expression';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('valid cases', () => {
	test('two languages', async () => {
		// Adding
		const language1 = await addValidLanguageAndTest('first language', FIRST_LANGUAGE_ID, FIRST_ORDERING);
		const language2 = await addValidLanguageAndTest('second language', FIRST_LANGUAGE_ID + 1, FIRST_ORDERING + 1);

		// Editing - no changes
		await editAndTest(language1, language2, false);

		// Editing - with changes
		language1.name += ' edited';
		language2.name += ' edited';
		language1.isPractice = !language1.isPractice;
		language2.isPractice = !language2.isPractice;
		language1.ordering += 1;
		language2.ordering -= 1;
		await editAndTest(language1, language2, true);
	});

	test('language name is trimmed', async () => {
		const trimmed = 'a name with trailing spaces';

		const l = await ApiUtils.addLanguage(`  ${trimmed}  `);
		expect(l.name).toEqual(trimmed);

		const oldLanguage = await ApiUtils.addAnyLanguage();
		oldLanguage.name = `  ${trimmed}2  `;
		await ApiUtils.editLanguages([l, oldLanguage]);
		const edited = await ApiUtils.fetchLanguage(oldLanguage.id);
		expect(edited.name).toEqual(`${trimmed}2`);
	});

	test('concurrent requests', async () => {
		const promises: Array<Promise<Language>> = [];
		for (let i = 0; i < 10; i++) {
			promises.push(ApiUtils.addLanguage(`language ${i}`));
		}
		const promises2 = await Promise.all(promises);
		const uniqueLanguages = Array.from(new Set(promises2.map(p => p.id)));
		expect(uniqueLanguages.length).toEqual(10);
	});

	test('editing empty array when database is empty', async () => {
		expect((await FetchUtils.editLanguages([])).status).toEqual(200);
	});

	test('no languages returns an empty array', async () => {
		const r = await FetchUtils.fetchLanguages();
		expect(r.status).toEqual(200);
		expect(await r.json()).toEqual([]);
	});
});

describe('invalid cases', () => {
	test('getting nonexistent language returns 404', async () => {
		const r = await FetchUtils.fetchLanguage(1);
		expect(r.status).toEqual(404);
	});

	test('name already exists', async () => {
		// Adding
		const l1Name = 'l1';
		expect((await FetchUtils.addLanguage(l1Name)).status).toEqual(201);
		expect((await FetchUtils.addLanguage(l1Name)).status).toEqual(400);
		expect((await FetchUtils.fetchLanguage(FIRST_LANGUAGE_ID + 1)).status).toEqual(404);
		const ll = await ApiUtils.fetchLanguages();
		expect(ll.length).toEqual(1);
		const language1 = ll[0];

		// Editing
		const language2 = await ApiUtils.addLanguage('l2');
		const newLanguage2 = copyLanguage(language2);
		newLanguage2.name = 'l1';
		expect((await FetchUtils.editLanguages([language1, newLanguage2])).status).toEqual(400);
		expect((await ApiUtils.fetchLanguages()).length).toEqual(2);
		expect(await ApiUtils.fetchLanguage(language2.id)).toEqual(language2);
		expect(await ApiUtils.fetchLanguage(language1.id)).toEqual(language1);
	});

	test('name is blank', async () => {
		// Adding
		expect((await FetchUtils.addLanguage('')).status).toEqual(400);
		expect((await FetchUtils.addLanguage(' ')).status).toEqual(400);
		expect((await FetchUtils.addLanguage('  ')).status).toEqual(400);
		expect((await ApiUtils.fetchLanguages()).length).toEqual(0);

		// Editing
		const oldLanguage1 = await ApiUtils.addLanguage('old language 1');
		const newLanguage1 = copyLanguage(oldLanguage1);
		newLanguage1.name = '';
		await editInvalidLanguagesAndTest(JSON.stringify([newLanguage1]), oldLanguage1);
		newLanguage1.name = ' ';
		await editInvalidLanguagesAndTest(JSON.stringify([newLanguage1]), oldLanguage1);
		newLanguage1.name = '  ';
		await editInvalidLanguagesAndTest(JSON.stringify([newLanguage1]), oldLanguage1);
	});

	test('shape is invalid - adding', async () => {
		// Array
		await addInvalidLanguageAndTest(JSON.stringify([{name: 'array'}]));
		// Empty object
		await addInvalidLanguageAndTest(JSON.stringify({}));
		// Object without name key with other keys
		await addInvalidLanguageAndTest(JSON.stringify({id: 1}));
		// Object with name key and other possible keys
		await addInvalidLanguageAndTest(JSON.stringify({id: 1, name: 'a language'}));
		// Object with name key and other impossible keys
		await addInvalidLanguageAndTest(JSON.stringify({name: 'a language', plus: 'something'}));
		// Name is a number
		await addInvalidLanguageAndTest(JSON.stringify({name: 1}));
		// Wrong JSON format
		await addInvalidLanguageAndTest('<');
	});

	test('shape is invalid - editing', async () => {
		const language = await ApiUtils.addLanguage('language');

		// Empty array when database is not empty
		await editInvalidLanguagesAndTest(JSON.stringify([]), language);
		// Array with empty object
		await editInvalidLanguagesAndTest(JSON.stringify([{}]), language);
		// Language instead of array
		await editInvalidLanguagesAndTest(JSON.stringify(language), language);
		// Missing keys
		await editInvalidLanguagesAndTest(JSON.stringify([{id: language.id, name: 'a new language'}]), language);
		// Missing id key
		await editInvalidLanguagesAndTest(JSON.stringify([{name: 'a new language'}]), language);
		// Object with additional keys
		await editInvalidLanguagesAndTest(JSON.stringify([{...language, plus: 'something'}]), language);
	});

	test('some languages are not included', async () => {
		const oldLanguage1 = await ApiUtils.addLanguage('old language 1');
		const oldLanguage2 = await ApiUtils.addLanguage('old language 2');
		const newLanguage1 = copyLanguage(oldLanguage1);
		newLanguage1.name = 'a new language';
		await editInvalidLanguagesAndTest(JSON.stringify([newLanguage1]), oldLanguage1, oldLanguage2);
	});

	test('nonexisting languages are included', async () => {
		const oldLanguage1 = await ApiUtils.addLanguage('old language 1');
		const oldLanguage2 = await ApiUtils.addLanguage('old language 2');
		await ApiUtils.deleteLanguage(oldLanguage2.id);
		await editInvalidLanguagesAndTest(JSON.stringify([oldLanguage1, oldLanguage2]), oldLanguage1);
	});

	test('has duplicate ids', async () => {
		const oldLanguage1 = await ApiUtils.addLanguage('old language 1');
		const oldLanguage2 = copyLanguage(oldLanguage1);
		oldLanguage2.name = 'old language 2';
		oldLanguage2.ordering = FIRST_ORDERING + 1;
		await editInvalidLanguagesAndTest(JSON.stringify([oldLanguage1, oldLanguage2]), oldLanguage1);
	});

	test('ordering has duplicates', async () => {
		const oldLanguage1 = await ApiUtils.addLanguage('old language 1');
		const oldLanguage2 = await ApiUtils.addLanguage('old language 2');
		const newLanguage2 = copyLanguage(oldLanguage2);
		newLanguage2.ordering = oldLanguage1.ordering;
		await editInvalidLanguagesAndTest(JSON.stringify([oldLanguage1, newLanguage2]), oldLanguage1, oldLanguage2);
	});

	test('ordering does not start at 0', async () => {
		const oldLanguage1 = await ApiUtils.addLanguage('old language 1');
		const oldLanguage2 = await ApiUtils.addLanguage('old language 2');
		const newLanguage1 = copyLanguage(oldLanguage1);
		const newLanguage2 = copyLanguage(oldLanguage2);
		newLanguage1.ordering = FIRST_ORDERING + 1;
		newLanguage2.ordering = FIRST_ORDERING + 2;
		await editInvalidLanguagesAndTest(JSON.stringify([newLanguage1, newLanguage2]), oldLanguage1, oldLanguage2);
	});

	test('ordering has a gap', async () => {
		const oldLanguage1 = await ApiUtils.addLanguage('old language 1');
		const oldLanguage2 = await ApiUtils.addLanguage('old language 2');
		const newLanguage2 = copyLanguage(oldLanguage2);
		newLanguage2.ordering = FIRST_ORDERING + 2;
		await editInvalidLanguagesAndTest(JSON.stringify([oldLanguage1, newLanguage2]), oldLanguage1, oldLanguage2);
	});

	test('name is a number', async () => {
		const oldLanguage = await ApiUtils.addLanguage('old language 1');
		const newLanguage = copyLanguage(oldLanguage) as any;
		newLanguage.name = 256;
		await editInvalidLanguagesAndTest(JSON.stringify([newLanguage]), oldLanguage);
	});

	test('isPractice is a string', async () => {
		const oldLanguage = await ApiUtils.addLanguage('old language 1');
		const newLanguage = copyLanguage(oldLanguage) as any;
		newLanguage.isPractice = 'false';
		await editInvalidLanguagesAndTest(JSON.stringify([newLanguage]), oldLanguage);
	});

	test('invalid JSON', async () => {
		const oldLanguage = await ApiUtils.addLanguage('old language 1');
		await editInvalidLanguagesAndTest('?', oldLanguage);
	});
});

async function testDeletingALanguageReordersLanguages(n: number, initialOrder: number[], idToDelete: number, expectedOrder: number[]) {
	await addNLanguages(n);
	await testLanguageOrder(initialOrder);
	await ApiUtils.deleteLanguage(idToDelete);
	await testLanguageOrder(expectedOrder);
}

describe('deleting languages', () => {
	test('deleting a language', async () => {
		expect((await FetchUtils.fetchLanguage(FIRST_LANGUAGE_ID)).status).toEqual(404);
		expect((await FetchUtils.addLanguage('a language')).status).toEqual(201);
		expect((await FetchUtils.fetchLanguage(FIRST_LANGUAGE_ID)).status).not.toEqual(404);
		expect((await ApiUtils.deleteLanguage(FIRST_LANGUAGE_ID)).status).toEqual(200);
		expect((await FetchUtils.fetchLanguage(FIRST_LANGUAGE_ID)).status).toEqual(404);
	});

	test('deleting a language reorders languages: first', async () => {
		await testDeletingALanguageReordersLanguages(5, [1, 2, 3, 4, 5], 1, [2, 3, 4, 5]);
	});

	test('deleting a language reorders languages: middle', async () => {
		await testDeletingALanguageReordersLanguages(5, [1, 2, 3, 4, 5], 3, [1, 2, 4, 5]);
	});

	test('deleting a language reorders languages: last', async () => {
		await testDeletingALanguageReordersLanguages(5, [1, 2, 3, 4, 5], 5, [1, 2, 3, 4]);
	});

	test('deleting should delete all expressions of that language', async () => {
		const l1: Language = await ApiUtils.addLanguage('language 1');
		const l2: Language = await ApiUtils.addLanguage('language 2');
		const l3: Language = await ApiUtils.addLanguage('language 3');

		const e1: ExpressionForAdding = {text: 'e1', languageId: l1.id};
		const e2: ExpressionForAdding = {text: 'e2', languageId: l2.id};
		const e3: ExpressionForAdding = {text: 'e3', languageId: l3.id};
		const e4: ExpressionForAdding = {text: 'e4', languageId: l3.id};
		await ApiUtils.addIdea({ee: [e1, e2, e3, e4]});

		const e5: ExpressionForAdding = {text: 'e5', languageId: l1.id};
		const e6: ExpressionForAdding = {text: 'e6', languageId: l2.id};
		const e7: ExpressionForAdding = {text: 'e7', languageId: l2.id};
		const e8: ExpressionForAdding = {text: 'e8', languageId: l3.id};
		await ApiUtils.addIdea({ee: [e5, e6, e7, e8]});

		await ApiUtils.deleteLanguage(l3.id);

		const idea1 = await ApiUtils.fetchIdea(1);
		expect(idea1.ee.length).toEqual(2);
		expect(idea1.ee[0].text).toEqual(e1.text);
		expect(idea1.ee[1].text).toEqual(e2.text);
		const idea2 = await ApiUtils.fetchIdea(2);
		expect(idea2.ee.length).toEqual(3);
		expect(idea2.ee[0].text).toEqual(e5.text);
		expect(idea2.ee[1].text).toEqual(e6.text);
		expect(idea2.ee[2].text).toEqual(e7.text);
	});
});

describe('deleting invalid languages', () => {
	test('deleting a nonexisting language', async () => {
		expect((await FetchUtils.addLanguage('a language')).status).toEqual(201);
		expect((await ApiUtils.deleteLanguage(FIRST_LANGUAGE_ID + 1)).status).toEqual(404);
		expect((await FetchUtils.fetchLanguage(FIRST_LANGUAGE_ID)).status).toEqual(200);
	});

	test('id is not numeric', async () => {
		expect((await FetchUtils.addLanguage('a language')).status).toEqual(201);
		const r = await fetch(`${apiUrl}/languages/123letters`, {
			method: 'DELETE',
		});
		expect(r.status).toEqual(400);
		expect((await FetchUtils.fetchLanguage(FIRST_LANGUAGE_ID)).status).toEqual(200);
	});
});

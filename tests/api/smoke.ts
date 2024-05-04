import * as ApiUtils from '../utils/api-utils';
import * as FetchUtils from '../utils/fetch-utils';
import {
	addAnyIdea, addAnyIdeaAndTest,
	editAnyIdeaAndTest,
	getBasicIdeaForAdding,
} from './ideas/utils';
import {addAnyLanguageAndTest, editAnyLanguageAndtest as editAnyLanguageAndTest} from './languages/utils';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('smoke tests', () => {
	test('add idea', async () => {
		await addAnyIdeaAndTest();
	});

	test('get idea', async () => {
		const idea = await ApiUtils.addIdea(await getBasicIdeaForAdding());
		expect((await FetchUtils.fetchIdea(idea.id)).status).toEqual(200);
		const fetchedIdea = await ApiUtils.fetchIdea(idea.id);
		expect(fetchedIdea).toEqual(idea);
	});

	test('edit idea', async () => {
		await editAnyIdeaAndTest();
	});

	test('delete idea', async () => {
		const idea = await addAnyIdea();
		expect((await FetchUtils.deleteIdea(idea.id)).status).toEqual(200);
		expect((await FetchUtils.fetchIdea(idea.id)).status).toEqual(404);
	});

	test('add language', async () => {
		await addAnyLanguageAndTest();
	});

	test('get language', async () => {
		const language = await ApiUtils.addLanguage('l');
		expect((await FetchUtils.fetchLanguage(language.id)).status).toEqual(200);
		const fetchedLanguage = await ApiUtils.fetchLanguage(language.id);
		expect(fetchedLanguage).toEqual(language);
	});

	test('edit language', async () => {
		await editAnyLanguageAndTest();
	});

	test('delete language', async () => {
		const language = await ApiUtils.addLanguage('l');
		expect((await FetchUtils.deleteLanguage(language.id)).status).toEqual(200);
		expect((await FetchUtils.fetchLanguage(language.id)).status).toEqual(404);
	});
});

import {getIdeaForAddingFromIdea} from '../../server/model/ideas/ideaForAdding';
import * as ApiUtils from '../utils/api-utils';
import * as FetchUtils from '../utils/fetch-utils';
import {
	addAnyIdea, addValidIdeaAndTest, editValidIdeaAndTest, makeIdeaForAdding,
} from './ideas/utils';
import {addValidLanguageAndTest} from './languages/utils';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('smoke', () => {
	test('add idea', async () => {
		const i = {ee: [{language: 'l', text: 'e'}, {language: 'l2', text: 'e2'}]};
		await addValidIdeaAndTest(await makeIdeaForAdding(i));
	});

	test('get idea', async () => {
		const idea = await ApiUtils.addIdea(await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]}));
		expect((await FetchUtils.fetchIdea(idea.id)).status).toEqual(200);
		const fetchedIdea = await ApiUtils.fetchIdea(idea.id);
		expect(fetchedIdea).toEqual(idea);
	});

	test('edit idea', async () => {
		const i = {ee: [{language: 'l', text: 'e'}]};
		const idea = await ApiUtils.addIdea(await makeIdeaForAdding(i));
		idea.ee[0].text = 'e2';
		await editValidIdeaAndTest(idea, getIdeaForAddingFromIdea(idea));
	});

	test('delete idea', async () => {
		const idea = await addAnyIdea();
		expect((await FetchUtils.deleteIdea(idea.id)).status).toEqual(200);
		expect((await FetchUtils.fetchIdea(idea.id)).status).toEqual(404);
	});

	test('add language', async () => {
		await addValidLanguageAndTest('l1', FetchUtils.FIRST_LANGUAGE_ID, FetchUtils.FIRST_ORDERING);
	});

	test('get language', async () => {
		const language = await ApiUtils.addLanguage('l');
		expect((await FetchUtils.fetchLanguage(language.id)).status).toEqual(200);
		const fetchedLanguage = await ApiUtils.fetchLanguage(language.id);
		expect(fetchedLanguage).toEqual(language);
	});

	test('edit language', async () => {
		const language = await ApiUtils.addLanguage('l');
		language.name = 'l2';
		await ApiUtils.editLanguages([language]);
		const fetchedLanguage = await ApiUtils.fetchLanguage(language.id);
		expect(fetchedLanguage).toEqual(language);
	});

	test('delete language', async () => {
		const language = await ApiUtils.addLanguage('l');
		expect((await FetchUtils.deleteLanguage(language.id)).status).toEqual(200);
		expect((await FetchUtils.fetchLanguage(language.id)).status).toEqual(404);
	});
});

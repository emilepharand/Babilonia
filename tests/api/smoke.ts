import * as ApiUtils from '../utils/api-utils';
import * as FetchUtils from '../utils/fetch-utils';
import {
	addAnyIdea, addAnyIdeaAndTest,
	editValidIdeaAndTest, getBasicIdeaForAdding,
} from './ideas/utils';
import {addValidLanguageAndTest} from './languages/utils';

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
		const ideaForAdding = await getBasicIdeaForAdding();
		const idea = await ApiUtils.addIdea(ideaForAdding);
		const editedIdea = ideaForAdding;
		editedIdea.ee[0].text = 'a new expression 1';
		editedIdea.ee[1].text = 'a new expression 2';
		editedIdea.ee[2] = {languageId: editedIdea.ee[0].languageId, text: 'a new expression 3', known: true};
		editedIdea.ee[3] = {languageId: editedIdea.ee[2].languageId, text: 'a new expression 4', known: false};
		await editValidIdeaAndTest(idea, editedIdea);
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

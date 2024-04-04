import fetch from 'node-fetch';
import {Idea} from '../../../server/model/ideas/idea';
import {getIdeaForAddingFromIdea, IdeaForAdding} from '../../../server/model/ideas/ideaForAdding';
import {Language} from '../../../server/model/languages/language';
import * as ApiUtils from '../../utils/api-utils';
import * as FetchUtils from '../../utils/fetch-utils';
import {apiUrl, FIRST_IDEA_ID} from '../../utils/fetch-utils';
import {
	addAnyIdea,
	addInvalidIdeaAndTest,
	addValidIdeaAndTest,
	editInvalidIdeaAndTest,
	editValidIdeaAndTest,
	makeIdeaForAdding,
} from './utils';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('valid cases', () => {
	test('only one language is valid', async () => {
		const i = {ee: [{language: 'l1', text: 'l1 e1'}, {language: 'l1', text: 'l1 e2'}]};

		// Adding
		const idea = await addValidIdeaAndTest(await makeIdeaForAdding(i));

		// Editing
		const newIdea = getIdeaForAddingFromIdea(idea);
		newIdea.ee[0].text = 'new1';
		newIdea.ee[1].text = 'new2';
		await editValidIdeaAndTest(idea, newIdea);
	});

	test('concurrent requests - adding', async () => {
		const l = await ApiUtils.addLanguage('l');
		const promises: Array<Promise<Idea>> = [];
		for (let i = 0; i < 10; i++) {
			promises.push(ApiUtils.addIdea({ee: [{languageId: l.id, text: 'e'}]}));
		}
		const uniqueIdeas = Array.from(new Set((await Promise.all(promises)).map(i => i.id)));
		expect(uniqueIdeas.length).toEqual(10);
	});

	test('concurrent requests - editing', async () => {
		const idea = await addAnyIdea();
		const promises: Array<Promise<Idea>> = [];
		for (let i = 0; i < 10; i++) {
			promises.push(ApiUtils.editIdea({ee: [{languageId: idea.id, text: `e${i}`}]}, idea.id));
		}
		const uniqueExpressions = Array.from(new Set((await Promise.all(promises)).map(i => i.ee[0].text)));
		expect(uniqueExpressions.length).toEqual(10);
	});

	test('deleting an idea deletes associated languages', async () => {
		const idea = await addAnyIdea();
		await FetchUtils.deleteIdea(idea.id);
		for (const e of idea.ee) {
			// eslint-disable-next-line no-await-in-loop
			expect((await FetchUtils.fetchLanguage(e.language.id)).status).toEqual(200);
		}
	});
});

describe('invalid cases', () => {
	test('adding an idea with a non-existent language', async () => {
		const l1: Language = await ApiUtils.addLanguage('language');
		const e1 = {languageId: l1.id + 1, text: 'expression'};
		const ideaForAdding: IdeaForAdding = {ee: [e1]};
		await addInvalidIdeaAndTest(ideaForAdding);
	});

	test('editing an idea with a non-existent language', async () => {
		const ideaForAdding = await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]});
		const idea = await ApiUtils.addIdea(ideaForAdding);
		ideaForAdding.ee[0].languageId += 1;
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);
	});

	test('no expression', async () => {
		// Adding
		await addInvalidIdeaAndTest({ee: []});

		// Editing
		const idea = await addAnyIdea();
		const ideaForAdding = getIdeaForAddingFromIdea(idea);
		ideaForAdding.ee = [];
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);
	});

	test('invalid data', async () => {
		const l1: Language = await ApiUtils.addLanguage('language');
		const e1 = {languageId: l1.id, text: 'expression'};
		const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'}]};
		const invalidIdeas = [{}, {id: 1, ee: [e1]}, {ee: 'expression'}, [ideaForAdding]];
		const invalidExpressions = [
			{ee: [{id: 1, languageId: l1.id, text: 'expression'}]},
			{ee: [{text: 'a'}]},
			{ee: [{languageId: l1.id}]},
			{ee: [{languageId: '1', text: 'a'}]},
			{ee: [{languageId: l1.id, text: 256}]},
		];

		// Adding
		await Promise.all(invalidIdeas.map(i => addInvalidIdeaAndTest(i)));
		await Promise.all(invalidExpressions.map(e => addInvalidIdeaAndTest(e)));

		// Editing
		const idea = await ApiUtils.addIdea(ideaForAdding);
		await Promise.all(invalidIdeas.map(i => editInvalidIdeaAndTest(i, idea.id)));
		await Promise.all(invalidExpressions.map(e => editInvalidIdeaAndTest(e, idea.id)));
	});

	test('actions on nonexistent ideas return 404', async () => {
		expect((await FetchUtils.fetchIdea(FIRST_IDEA_ID)).status).toEqual(404);
		expect((await FetchUtils.editIdea(await makeIdeaForAdding({
			ee: [{
				language: 'l',
				text: 'e',
			}],
		}), FIRST_IDEA_ID)).status).toEqual(404);
		expect((await FetchUtils.deleteIdea(FIRST_IDEA_ID)).status).toEqual(404);
	});

	test('editing non-numerical id returns 400', async () => {
		const promises = ['PUT', 'GET', 'DELETE']
			.map(method => fetch(`${apiUrl}/ideas/123letters`, {
				method,
				headers: {'Content-Type': 'application/json'},
			}));
		(await Promise.all(promises)).forEach(p => expect(p.status).toEqual(400));
	});
});

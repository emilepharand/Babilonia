import {getIdeaForAddingFromIdea} from '../../../server/model/ideas/ideaForAdding';
import {Language} from '../../../server/model/languages/language';
import * as ApiUtils from '../../utils/api-utils';
import {
	addValidIdeaAndTest,
	editValidIdeaAndTest,
	validateIdea,
} from './utils';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

test('ordering of expressions', async () => {
	const l1: Language = await ApiUtils.addLanguage('language 1');
	const l2: Language = await ApiUtils.addLanguage('language 2');
	const l3: Language = await ApiUtils.addLanguage('language 3');
	const l4: Language = await ApiUtils.addLanguage('language 4');
	const e1 = {languageId: l1.id, text: 'l1 e1'};
	const e2 = {languageId: l1.id, text: 'l1 e2'};
	const e3 = {languageId: l1.id, text: 'l1 e3'};
	const e4 = {languageId: l2.id, text: 'l2 e1'};
	const e5 = {languageId: l2.id, text: 'l2 e2'};
	const e6 = {languageId: l3.id, text: 'l3 e1'};
	const e7 = {languageId: l4.id, text: 'l4 e1'};
	let idea = await addValidIdeaAndTest({ee: [e4, e5, e1, e2, e3, e7, e6]}, [e1, e2, e3, e4, e5, e6, e7]);

	idea = await ApiUtils.fetchIdea(idea.id);
	let ideaForAdding = getIdeaForAddingFromIdea(idea);

	l1.ordering = 3;
	l2.ordering = 2;
	l3.ordering = 1;
	l4.ordering = 0;
	await ApiUtils.editLanguages([l1, l2, l3, l4]);
	await validateIdea(idea, ideaForAdding, [e7, e6, e4, e5, e1, e2, e3]);

	l1.ordering = 0;
	l2.ordering = 1;
	l3.ordering = 2;
	l4.ordering = 3;
	await ApiUtils.editLanguages([l1, l2, l3, l4]);

	async function editAndTestOrdering(indices: number[]) {
		const expressionsInOrder = indices.map(index => ideaForAdding.ee[index]);
		idea = await editValidIdeaAndTest(idea, ideaForAdding, expressionsInOrder);
		ideaForAdding = getIdeaForAddingFromIdea(idea);
	}

	idea = await ApiUtils.fetchIdea(idea.id);
	ideaForAdding = getIdeaForAddingFromIdea(idea);
	ideaForAdding.ee[0].languageId = l2.id;
	ideaForAdding.ee[1].languageId = l1.id;
	ideaForAdding.ee[2].languageId = l3.id;
	ideaForAdding.ee[3].languageId = l1.id;
	ideaForAdding.ee[4].languageId = l4.id;
	ideaForAdding.ee[5].languageId = l1.id;
	ideaForAdding.ee[6].languageId = l2.id;
	await editAndTestOrdering([1, 3, 5, 0, 6, 2, 4]);

	ideaForAdding.ee[3].text = 'new l2 e1';
	ideaForAdding.ee[1].text = 'l1 (context) e2';
	await editAndTestOrdering([0, 1, 2, 3, 4, 5, 6]);
});

test('ordering of expressions with same expression texts within idea', async () => {
	const l1: Language = await ApiUtils.addLanguage('language 1');
	const l2: Language = await ApiUtils.addLanguage('language 2');
	const e1 = {languageId: l1.id, text: 'text 1'};
	const e2 = {languageId: l1.id, text: 'text 2'};
	const e3 = {languageId: l2.id, text: 'text 2'};
	const e4 = {languageId: l2.id, text: 'text 1'};
	const idea = await addValidIdeaAndTest({ee: [e1, e2, e3, e4]});

	expect(idea.ee[0].ordering).toBe(0);
	expect(idea.ee[1].ordering).toBe(1);
	expect(idea.ee[2].ordering).toBe(2);
	expect(idea.ee[3].ordering).toBe(3);

	const ideaForAdding = getIdeaForAddingFromIdea(idea);

	ideaForAdding.ee[0].text = 'text 2';
	ideaForAdding.ee[1].text = 'text 1';
	ideaForAdding.ee[2].text = 'text 1';
	ideaForAdding.ee[3].text = 'text 2';

	await editValidIdeaAndTest(idea, ideaForAdding);

	expect(idea.ee[0].ordering).toBe(0);
	expect(idea.ee[1].ordering).toBe(1);
	expect(idea.ee[2].ordering).toBe(2);
	expect(idea.ee[3].ordering).toBe(3);
});

test('ordering of expressions with same expression texts across ideas', async () => {
	const l1: Language = await ApiUtils.addLanguage('language 1');
	const l2: Language = await ApiUtils.addLanguage('language 2');
	const e1 = {languageId: l1.id, text: 'text 1'};
	const e2 = {languageId: l2.id, text: 'text 2'};
	const e3 = {languageId: l1.id, text: 'text 2'};
	const e4 = {languageId: l2.id, text: 'text 1'};
	let idea1 = await addValidIdeaAndTest({ee: [e1, e2]});
	let idea2 = await addValidIdeaAndTest({ee: [e3, e4]});

	expect(idea1.ee[0].ordering).toBe(0);
	expect(idea1.ee[1].ordering).toBe(1);
	expect(idea2.ee[0].ordering).toBe(0);
	expect(idea2.ee[1].ordering).toBe(1);

	const ideaForAdding1 = getIdeaForAddingFromIdea(idea1);
	const ideaForAdding2 = getIdeaForAddingFromIdea(idea2);

	ideaForAdding1.ee[0].text = 'text 2';
	ideaForAdding1.ee[1].text = 'text 1';
	ideaForAdding2.ee[0].text = 'text 1';
	ideaForAdding2.ee[1].text = 'text 2';

	idea1 = await editValidIdeaAndTest(idea1, ideaForAdding1);
	idea2 = await editValidIdeaAndTest(idea2, ideaForAdding2);

	expect(idea1.ee[0].ordering).toBe(0);
	expect(idea1.ee[1].ordering).toBe(1);
	expect(idea2.ee[0].ordering).toBe(0);
	expect(idea2.ee[1].ordering).toBe(1);
});

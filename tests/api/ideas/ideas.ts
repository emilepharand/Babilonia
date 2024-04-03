import fetch from 'node-fetch';
import {Idea} from '../../../server/model/ideas/idea';
import {getIdeaForAddingFromIdea, IdeaForAdding} from '../../../server/model/ideas/ideaForAdding';
import {Language} from '../../../server/model/languages/language';
import * as ApiUtils from '../../utils/api-utils';
import {addIdea} from '../../utils/api-utils';
import * as FetchUtils from '../../utils/fetch-utils';
import {apiUrl, FIRST_IDEA_ID} from '../../utils/fetch-utils';
import {
	addAnyIdea,
	addInvalidIdeaAndTest,
	addMultipleInvalidIdeasAndTest,
	addValidIdeaAndTest,
	editInvalidIdeaAndTest,
	editMultipleInvalidIdeasAndTest,
	editValidIdeaAndTest,
	makeIdeaForAdding,
	testTransformExpressions,
	validateIdea,
} from './utils';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('valid cases', () => {
	test('expression id changes only when expression is modified', async () => {
		const i = {
			ee: [{language: 'english', text: '(red) apple'}, {language: 'french', text: 'pomme (rouge)'}],
		};

		let ideaForAdding = await makeIdeaForAdding(i);
		let previousIdea = await addIdea(ideaForAdding);
		let editedIdea = previousIdea;
		ideaForAdding = getIdeaForAddingFromIdea(previousIdea);

		async function editAndTest(id1ShouldBeModified: boolean, id2ShouldBeModified: boolean, swapped?: boolean) {
			if (swapped) {
				editedIdea = await editValidIdeaAndTest(editedIdea, ideaForAdding, [ideaForAdding.ee[1], ideaForAdding.ee[0]]);
			} else {
				editedIdea = await editValidIdeaAndTest(editedIdea, ideaForAdding);
			}
			function checkIdModification(index: number, shouldBeModified: boolean) {
				if (shouldBeModified) {
					expect(previousIdea.ee[index].id).not.toBe(editedIdea.ee[index].id);
				} else {
					expect(previousIdea.ee[index].id).toBe(editedIdea.ee[index].id);
				}
			}
			checkIdModification(0, id1ShouldBeModified);
			checkIdModification(1, id2ShouldBeModified);
			previousIdea = editedIdea;
		}

		function changeTexts(text1: string, text2: string) {
			ideaForAdding = getIdeaForAddingFromIdea(editedIdea);
			ideaForAdding.ee[0].text = text1;
			ideaForAdding.ee[1].text = text2;
		}

		changeTexts('(green) apple', 'pomme (verte)');
		await editAndTest(false, false);

		changeTexts('apple', 'pomme');
		await editAndTest(false, false);

		changeTexts('(yellow) apple', 'pomme (jaune)');
		await editAndTest(false, false);

		changeTexts('(yellow) potato', 'pomme (jaune)');
		await editAndTest(true, false);

		changeTexts('(yellow) potato', 'patate (jaune)');
		await editAndTest(false, true);

		changeTexts('tomato', 'tomate');
		await editAndTest(true, true);

		changeTexts('(a wonderful) tomato (that is red)', '(une merveilleuse) tomate (rouge)');
		await editAndTest(false, false);

		changeTexts('(a wonderful) tomato', '(une merveilleuse) tomate');
		await editAndTest(false, false);

		changeTexts('a wonderful tomato', 'une merveilleuse tomate');
		await editAndTest(true, true);

		changeTexts('(a) wonderful and delicious (tomato)', 'une (merveilleuse et délicieuse) tomate');
		await editAndTest(true, true);

		changeTexts('wonderful and delicious', 'une merveilleuse tomate');
		await editAndTest(false, true);

		changeTexts('wonderful (and) delicious', 'une (merveilleuse) tomate');
		await editAndTest(true, true);

		changeTexts('wonderful delicious', 'une tomate');
		await editAndTest(false, false);

		// Swap the expressions
		changeTexts('une tomate', 'wonderful delicious');
		const temp = ideaForAdding.ee[0].languageId;
		ideaForAdding.ee[0].languageId = ideaForAdding.ee[1].languageId;
		ideaForAdding.ee[1].languageId = temp;
		await editAndTest(false, false, true);

		// Swap only the expression texts (last edit returned ['wonderful delicious', 'une tomate'])
		changeTexts('une tomate', 'wonderful delicious');
		await editAndTest(true, true);

		// Change the language of the first expression
		ideaForAdding.ee[0].languageId = ideaForAdding.ee[1].languageId;
		await editAndTest(true, false);
	});

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

	test('basic test', async () => {
		// Adding
		const i = {
			ee: [
				{language: 'l1', text: 'l1 e1', known: true},
				{language: 'l1', text: 'l1 e2'},
				{language: 'l2', text: 'l2 e1'},
				{language: 'l3', text: 'l3 e1', known: false},
				{language: 'l3', text: 'l3 e2'},
			],
		};
		const idea = await addValidIdeaAndTest(await makeIdeaForAdding(i));

		// Editing
		const newIdea = getIdeaForAddingFromIdea(idea);
		newIdea.ee[0].text = 'a new expression 1';
		newIdea.ee[1].text = 'a new expression 2';
		newIdea.ee[2] = {languageId: newIdea.ee[0].languageId, text: 'a new expression 3', known: true};
		newIdea.ee[3] = {languageId: newIdea.ee[2].languageId, text: 'a new expression 4', known: false};
		await editValidIdeaAndTest(idea, newIdea);
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

	test('whitespace normalization', async () => {
		await testTransformExpressions(
			[' trim whitespace ', 'two  spaces  between  words', ' trim,		tab  and multiple   spaces '],
			['trim whitespace', 'two spaces between words', 'trim, tab and multiple spaces'],
		);
	});

	test('context trimming', async () => {
		await testTransformExpressions(
			['to ( play ) a sport', 'to (  play) a (	sport)', 'to ( 	play   ) ( sport)'],
			['to (play) a sport', 'to (play) a (sport)', 'to (play) (sport)'],
		);
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

	test('empty expression text', async () => {
		const emptyStrings = ['', ' ', '  ', '	'];

		// Adding
		await addMultipleInvalidIdeasAndTest(emptyStrings);

		// Editing
		await editMultipleInvalidIdeasAndTest(emptyStrings);
	});

	test('duplicate expressions', async () => {
		// Adding
		await addInvalidIdeaAndTest(makeIdeaForAdding({
			ee: [{language: 'l', text: 'duplicate'}, {language: 'l', text: 'duplicate'}],
		}));
		await addInvalidIdeaAndTest(makeIdeaForAdding({
			ee: [{language: 'l2', text: 'to (play sport)'}, {language: 'l2', text: 'to ( play sport)'}],
		}));

		// Editing
		const idea = await addAnyIdea();
		const ideaForAdding = getIdeaForAddingFromIdea(idea);
		ideaForAdding.ee[1] = ideaForAdding.ee[0];
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);

		ideaForAdding.ee[0].text = 'to (play sport)';
		ideaForAdding.ee[1].text = 'to ( play sport)';
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

	test('parentheses (context)', async () => {
		const invalidExpressions = [
			// Double parenthesis
			'to ((play sport))',
			'to ( (play sport))',
			'to ( (play sport)',
			// Opening parenthesis before the first one is closed
			'to ((play) sport',
			'to (p(lay) sport',
			'(to (play)) sport',
			'to (play (sport))',
			'to (p(la)y) sport',
			// An expression that contains only context
			'(only context)',
			'  (only context) ',
			'(only) (context)',
			'()',
			// Unclosed opening parenthesis
			'to (play sport',
			'to (',
			'to ((play sport)',
			'(to play sport',
			'to (play) (sport',
			// Unmatched closing parenthesis
			'to play) sport',
			'to (play)) sport',
			'to (play) sport)',
			')(to play sport)',
			// Parentheses are not balanced
			'to )play( sport',
			'to )play( (sport',
			'to (play) )sport',
			')(',
			// Empty context content
			'to () sport',
			'to (  ) sport',
		];

		// Adding
		await addMultipleInvalidIdeasAndTest(invalidExpressions);

		// Editing
		await editMultipleInvalidIdeasAndTest(invalidExpressions);
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

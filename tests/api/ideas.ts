import fetch from 'node-fetch';
import {
	ExpressionForAdding,
	getExpressionForAddingFromExpression,
} from '../../server/model/ideas/expression';
import {Idea, validate} from '../../server/model/ideas/idea';
import {
	IdeaForAdding,
	getIdeaForAddingFromIdea,
} from '../../server/model/ideas/ideaForAdding';
import {Language} from '../../server/model/languages/language';
import {
	FIRST_IDEA_ID,
	addIdea,
	addIdeaRawObjectAndGetResponse,
	addLanguage,
	apiUrl,
	deleteEverything,
	deleteIdea,
	editIdea,
	editIdeaAndGetResponse,
	editIdeaRawObjectAndGetResponse,
	fetchIdea,
	fetchIdeaAndGetResponse,
	fetchLanguage,
	fetchLanguageAndGetResponse,
} from '../utils/utils';

beforeEach(async () => {
	await deleteEverything();
});

async function makeIdeaForAdding(i: {ee:(Omit<ExpressionForAdding, 'languageId'> & {language: string;})[]}): Promise<IdeaForAdding> {
	const uniqueLanguages = Array.from(new Set(i.ee.map(e => e.language)));
	const languagePromises = uniqueLanguages.map(language => addLanguage(language));
	const ll = await Promise.all(languagePromises);
	return {ee: i.ee.map(e => ({languageId: ll.find(lang => lang.name === e.language)!.id, text: e.text}))};
}

async function addIdeaHavingExpressions(ee: string[]): Promise<Idea> {
	const l = await addLanguage('language ' + Math.random().toString(36).substring(10));
	return addIdea({ee: ee.map(e => ({languageId: l.id, text: e}))});
}

async function addInvalidIdeaAndTest(invalidIdea: any): Promise<void> {
	const r = await addIdeaRawObjectAndGetResponse(JSON.stringify(invalidIdea));
	expect(r.status).toEqual(400);
	expect((await fetchIdeaAndGetResponse(FIRST_IDEA_ID)).status).toEqual(404);
}

async function addValidIdeaAndTest(
	ideaForAdding: IdeaForAdding,
	expressionsInOrder?: ExpressionForAdding[],
): Promise<Idea> {
	let r = await addIdeaRawObjectAndGetResponse(JSON.stringify(ideaForAdding));
	expect(r.status).toEqual(201);
	const responseIdea = (await r.json()) as Idea;
	expect(validate(responseIdea)).toEqual(true);

	r = await fetchIdeaAndGetResponse(1);
	const fetchedIdea = (await r.json()) as Idea;
	expect(r.status).toEqual(200);
	expect(validate(fetchedIdea)).toEqual(true);

	for (let i = 0; i < ideaForAdding.ee.length; i += 1) {
		const e: ExpressionForAdding = expressionsInOrder ? expressionsInOrder[i] : ideaForAdding.ee[i];
		const fetchedExpression = fetchedIdea.ee[i];
		expect(fetchedExpression.text).toEqual(e.text);
		expect(fetchedExpression.language.id).toEqual(e.languageId);
		if (e.known) {
			expect(fetchedExpression.known).toEqual(e.known);
		}
		// eslint-disable-next-line no-await-in-loop
		const fetchedLanguage = await fetchLanguage(fetchedExpression.language.id);
		expect(fetchedLanguage).toEqual(fetchedExpression.language);
	}

	return responseIdea;
}

async function editValidIdeaAndTest(
	idea: Idea,
	newIdea: IdeaForAdding,
	expressionsInOrder?: ExpressionForAdding[],
) {
	let r = await editIdeaAndGetResponse(newIdea, idea.id);

	expect(r.status).toEqual(200);
	const responseIdea = (await r.json()) as Idea;
	expect(validate(responseIdea)).toEqual(true);

	r = await fetchIdeaAndGetResponse(idea.id);
	const fetchedIdea = (await r.json()) as Idea;
	expect(r.status).toEqual(200);
	expect(validate(fetchedIdea)).toEqual(true);
	expect(responseIdea.ee.length).toEqual(newIdea.ee.length);

	for (let i = 0; i < responseIdea.ee.length; i += 1) {
		const e: ExpressionForAdding = expressionsInOrder
			? expressionsInOrder[i]
			: getExpressionForAddingFromExpression(responseIdea.ee[i]);
		expect(responseIdea.ee[i].text).toEqual(e.text);
		expect(responseIdea.ee[i].language.id).toEqual(e.languageId);
		expect(responseIdea.ee[i].known).toEqual(e.known);
	}
	return fetchedIdea;
}

async function editInvalidIdeaAndTest(ideaForAdding: unknown, id: number): Promise<void> {
	const idea1 = await fetchIdea(id);
	expect((await editIdeaRawObjectAndGetResponse(JSON.stringify(ideaForAdding), id)).status).toEqual(
		400,
	);
	const idea2 = await fetchIdea(id);
	expect(idea1).toEqual(idea2);
}

describe('valid cases', () => {
	test('only one expression', async () => {
		const i = {ee: [{language: 'l', text: 'e'}]};
		// Adding
		const idea = await addValidIdeaAndTest(await makeIdeaForAdding(i));
		// Editing
		const newIdea = getIdeaForAddingFromIdea(idea);
		newIdea.ee[0].text = 'new';
		await editValidIdeaAndTest(idea, newIdea);
	});

	test('only one language', async () => {
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
		const i = {ee: [
			{language: 'l1', text: 'l1 e1', known: true},
			{language: 'l1', text: 'l1 e2'},
			{language: 'l2', text: 'l2 e1'},
			{language: 'l3', text: 'l3 e1', known: false},
			{language: 'l3', text: 'l3 e2'},
		]};
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
		// Adding
		const l1: Language = await addLanguage('language 1');
		const l2: Language = await addLanguage('language 2');
		const l3: Language = await addLanguage('language 3');
		const l4: Language = await addLanguage('language 4');
		const e1 = {languageId: l1.id, text: 'l1 e1'};
		const e2 = {languageId: l1.id, text: 'l1 e2'};
		const e3 = {languageId: l1.id, text: 'l1 e3'};
		const e4 = {languageId: l2.id, text: 'l2 e1'};
		const e5 = {languageId: l2.id, text: 'l2 e2'};
		const e6 = {languageId: l3.id, text: 'l3 e1'};
		const e7 = {languageId: l4.id, text: 'l4 e1'};
		const idea = await addValidIdeaAndTest({ee: [e4, e5, e1, e2, e3, e7, e6]}, [e1, e2, e3, e4, e5, e6, e7]);

		// Editing
		const ideaForAdding = getIdeaForAddingFromIdea(idea);
		ideaForAdding.ee[0].languageId = l2.id;
		ideaForAdding.ee[1].languageId = l1.id;
		ideaForAdding.ee[2].languageId = l3.id;
		ideaForAdding.ee[3].languageId = l1.id;
		ideaForAdding.ee[4].languageId = l4.id;
		ideaForAdding.ee[5].languageId = l1.id;
		ideaForAdding.ee[6].languageId = l2.id;

		await editValidIdeaAndTest(idea, ideaForAdding, [
			ideaForAdding.ee[1],
			ideaForAdding.ee[3],
			ideaForAdding.ee[5],
			ideaForAdding.ee[0],
			ideaForAdding.ee[6],
			ideaForAdding.ee[2],
			ideaForAdding.ee[4],
		]);
	});

	test('concurrent requests - adding', async () => {
		const l = await addLanguage('l');
		const promises: Array<Promise<Idea>> = [];
		for (let i = 0; i < 10; i++) {
			promises.push(addIdea({ee: [{languageId: l.id, text: 'e'}]}));
		}
		const uniqueIdeas = Array.from(new Set((await Promise.all(promises)).map(i => i.id)));
		expect(uniqueIdeas.length).toEqual(10);
	});

	test('concurrent requests - editing', async () => {
		const ideaForAdding = await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]});
		const idea = await addIdea(ideaForAdding);
		const promises: Array<Promise<Idea>> = [];
		for (let i = 0; i < 10; i++) {
			promises.push(editIdea({ee: [{languageId: idea.id, text: `e${i}`}]}, idea.id));
		}
		const uniqueExpressions = Array.from(new Set((await Promise.all(promises)).map(i => i.ee[0].text)));
		expect(uniqueExpressions.length).toEqual(10);
	});

	test('whitespace normalization', async () => {
		const ideaForAdding1 = await makeIdeaForAdding(
			{ee:	[
				{language: 'l', text: ' an expression starting with whitespace '},
				{language: 'l', text: 'an expression	with a tab'},
				{language: 'l', text: 'an  expression  with  two  spaces'},
			]});
		const ideaForAdding2 = {...ideaForAdding1};
		const addedIdea = await addIdea(ideaForAdding1);

		const tempIdea = await addIdea(await makeIdeaForAdding({ee: [{language: 'l2', text: 'e'}]}));
		const editedIdea = await editValidIdeaAndTest(tempIdea, ideaForAdding2);

		// Adding
		expect(addedIdea.ee[0].text).toEqual('an expression starting with whitespace');
		expect(addedIdea.ee[1].text).toEqual('an expression with a tab');
		expect(addedIdea.ee[2].text).toEqual('an expression with two spaces');
		// Editing
		expect(editedIdea.ee[0].text).toEqual(addedIdea.ee[0].text);
		expect(editedIdea.ee[1].text).toEqual(addedIdea.ee[1].text);
		expect(editedIdea.ee[2].text).toEqual(addedIdea.ee[2].text);
	});

	test('context trimming', async () => {
		const ideaForAdding = await makeIdeaForAdding({ee: [
			{language: 'l', text: 'to ( play ) sport'},
			{language: 'l', text: 'to (  play) sport'},
		]});

		// Adding
		const idea = await addIdea(ideaForAdding);
		idea.ee.forEach(e => expect(e.text).toEqual('to (play) sport'));

		// Editing
		const tempIdea = await addIdeaHavingExpressions(['e']);
		const idea2 = await editValidIdeaAndTest(tempIdea, ideaForAdding);
		idea2.ee.forEach(e => expect(e.text).toEqual('to (play) sport'));
	});

	test('deleting an idea', async () => {
		const ideaForAdding = await makeIdeaForAdding({ee: [
			{language: 'l', text: 'expression'}, {language: 'l2', text: 'e2'},
		]});
		const idea = await addIdea(ideaForAdding);
		expect((await deleteIdea(idea.id)).status).toEqual(200);
		expect((await fetchIdeaAndGetResponse(idea.id)).status).toEqual(404);
		idea.ee.forEach(async e => expect((await fetchLanguageAndGetResponse(e.language.id)).status).toEqual(200));
	});
});

describe('invalid cases', () => {
	test('adding an idea with a non-existent language', async () => {
		const l1: Language = await addLanguage('language');
		const e1 = {languageId: l1.id + 1, text: 'expression'};
		const ideaForAdding: IdeaForAdding = {ee: [e1]};
		await addInvalidIdeaAndTest(ideaForAdding);
	});

	test('editing an idea with a non-existent language', async () => {
		const ideaForAdding = await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]});
		const idea = await addIdea(ideaForAdding);
		ideaForAdding.ee[0].languageId += 1;
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);
	});

	test('empty expression text', async () => {
		const ideaForAdding = await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]});
		const emptyStrings = ['', ' ', '  ', '	'];

		// Adding
		await Promise.all(emptyStrings.map(e => addInvalidIdeaAndTest({ee: [{...ideaForAdding.ee[0], text: e}]})));
		// Test with multiple expressions
		await addInvalidIdeaAndTest({ee: [{...ideaForAdding.ee[0]}, {...ideaForAdding.ee[0], text: 'e'}]});

		// Editing
		const idea = await addIdea(ideaForAdding);
		await Promise.all(emptyStrings.map(e => editInvalidIdeaAndTest({ee: [{...ideaForAdding.ee[0], text: e}]}, idea.id)));
		await editInvalidIdeaAndTest({ee: [{...ideaForAdding.ee[0]}, {...ideaForAdding.ee[0], text: 'e'}]}, idea.id);
	});

	test('duplicate expressions', async () => {
		// Adding
		await addInvalidIdeaAndTest(makeIdeaForAdding({
			ee: [{language: 'l', text: 'duplicate'}, {language: 'l', text: 'duplicate'}],
		}));

		// Editing
		const idea = await addIdeaHavingExpressions(['duplicate expression', 'not a duplicate expression']);
		const ideaForAdding = getIdeaForAddingFromIdea(idea);
		ideaForAdding.ee[1].text = 'duplicate expression';
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);
	});

	test('no expression', async () => {
		// Adding
		await addInvalidIdeaAndTest({ee: []});
		// Editing
		const idea = await addIdeaHavingExpressions(['e']);
		const ideaForAdding = getIdeaForAddingFromIdea(idea);
		ideaForAdding.ee = [];
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);
	});

	test('parentheses (context)', async () => {
		const ideaForAdding = await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]});

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
		await Promise.all(invalidExpressions.map(e => addInvalidIdeaAndTest({ee: [{...ideaForAdding.ee[0], text: e}]})));

		// Editing
		const idea = await addIdea(ideaForAdding);
		await Promise.all(invalidExpressions.map(e => editInvalidIdeaAndTest({ee: [{...ideaForAdding.ee[0], text: e}]}, idea.id)));
	});

	test('invalid shapes - adding', async () => {
		const l1: Language = await addLanguage('language');
		const e1 = {languageId: l1.id, text: 'expression'};

		// Idea
		// Missing properties
		await addInvalidIdeaAndTest({});
		// Additional property
		await addInvalidIdeaAndTest({id: 1, ee: [e1]});
		// Property is of an invalid type
		await addInvalidIdeaAndTest({ee: 'expression'});
		// Array
		await addInvalidIdeaAndTest([{ee: 'expression'}]);

		// Expression
		// Additional property
		await addInvalidIdeaAndTest({ee: [{id: 1, languageId: l1.id, text: 'expression'}]});
		// Missing required properties (languageId)
		await addInvalidIdeaAndTest({ee: [{text: 'a'}]});
		// Missing required properties (text)
		await addInvalidIdeaAndTest({ee: [{languageId: l1.id}]});
		// Property is of an invalid type (languageId)
		await addInvalidIdeaAndTest({ee: [{languageId: '1', text: 'a'}]});
		// Property is of an invalid type (text)
		await addInvalidIdeaAndTest({ee: [{languageId: l1.id, text: 256}]});
	});

	test('invalid shapes - editing', async () => {
		const l1: Language = await addLanguage('language');
		const e1 = {languageId: l1.id, text: 'expression'};
		const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'}]};
		const idea = await addIdea(ideaForAdding);

		// Idea
		// Missing properties
		await editInvalidIdeaAndTest({}, idea.id);
		// Additional property
		await editInvalidIdeaAndTest({id: 1, ee: [e1]}, idea.id);
		// Property is of an invalid type
		await editInvalidIdeaAndTest({ee: 'expression'}, idea.id);
		// Array
		await editInvalidIdeaAndTest([ideaForAdding], idea.id);

		// Expression
		// Additional property
		await editInvalidIdeaAndTest({ee: [{id: 1, languageId: l1.id, text: 'expression'}]}, idea.id);
		// Missing required properties (languageId)
		await editInvalidIdeaAndTest({ee: [{text: 'a'}]}, idea.id);
		// Missing required properties (text)
		await editInvalidIdeaAndTest({ee: [{languageId: l1.id}]}, idea.id);
		// Property is of an invalid type (languageId)
		await editInvalidIdeaAndTest({ee: [{languageId: '1', text: 'a'}]}, idea.id);
		// Property is of an invalid type (text)
		await editInvalidIdeaAndTest({ee: [{languageId: l1.id, text: 256}]}, idea.id);
	});

	test('actions on nonexistent ideas return 404', async () => {
		expect((await fetchIdeaAndGetResponse(FIRST_IDEA_ID)).status).toEqual(404);
		expect((await editIdeaAndGetResponse(await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]}), FIRST_IDEA_ID)).status).toEqual(404);
		expect((await deleteIdea(FIRST_IDEA_ID)).status).toEqual(404);
	});

	test('editing non-numerical id returns 400', async () => {
		const promises = ['PUT', 'GET', 'DELETE']
			.map(method => fetch(`${apiUrl}/ideas/123letters`, {method, headers: {'Content-Type': 'application/json'}}));
		(await Promise.all(promises)).forEach(p => expect(p.status).toEqual(400));
	});
});

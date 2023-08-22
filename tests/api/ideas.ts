import fetch from 'node-fetch';
import {
	ExpressionForAdding,
	getExpressionForAddingFromExpression,
} from '../../server/model/ideas/expression';
import {Language} from '../../server/model/languages/language';
import {Idea, validate} from '../../server/model/ideas/idea';
import {
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
	FIRST_IDEA_ID,
} from '../utils/utils';
import {
	getIdeaForAddingFromIdea,
	IdeaForAdding,
} from '../../server/model/ideas/ideaForAdding';

type IdeaForTesting = {
	ee: (Omit<ExpressionForAdding, 'languageId'> & {
		language: string;
	})[];
};

async function makeIdeaForAdding(i: IdeaForTesting): Promise<IdeaForAdding> {
	const uniqueLanguages = Array.from(new Set(i.ee.map(e => e.language)));
	const languagePromises = uniqueLanguages.map(language => addLanguage(language));
	const ll = await Promise.all(languagePromises);
	const ee = i.ee.map(e => {
		const l = ll.find(lang => lang.name === e.language)!;
		return {languageId: l.id, text: e.text};
	});
	return {ee};
}

beforeEach(async () => {
	await deleteEverything();
});

async function addMultipleInvalidIdeasAndTest(l: Language, expressions: String[]): Promise<void> {
	const promises = expressions.map(e => addIdeaRawObjectAndGetResponse(JSON.stringify({ee: [{languageId: l.id, text: e}]})));
	const responses = await Promise.all(promises);
	responses.forEach(response => expect(response.status).toEqual(400));
}

async function addInvalidIdeaAndTest(invalidIdea: any, expectIdeas?: boolean): Promise<void> {
	const r = await addIdeaRawObjectAndGetResponse(JSON.stringify(invalidIdea));
	expect(r.status).toEqual(400);
	if (!expectIdeas) {
		expect((await fetchIdeaAndGetResponse(FIRST_IDEA_ID)).status).toEqual(404);
	}
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

describe('getting invalid ideas', () => {
	test('nonexistent idea returns 404', async () => {
		expect((await fetchIdeaAndGetResponse(FIRST_IDEA_ID)).status).toEqual(404);
	});

	test('id is not numeric returns 400', async () => {
		const r = await fetch(`${apiUrl}/ideas/123letters`, {
			method: 'GET',
			headers: {'Content-Type': 'application/json'},
		});
		expect(r.status).toEqual(400);
	});
});

describe('adding invalid ideas', () => {
	test('language doesn\'t exist', async () => {
		const l1: Language = await addLanguage('language');
		const e1 = {languageId: l1.id + 1, text: 'expression'};
		const ideaForAdding: IdeaForAdding = {ee: [e1]};
		await addInvalidIdeaAndTest(ideaForAdding);
	});

	test('no expression', async () => {
		const ideaForAdding: IdeaForAdding = {ee: []};
		await addInvalidIdeaAndTest(ideaForAdding);
	});

	test('parentheses (context)', async () => {
		const l1: Language = await addLanguage('language 1');
		// Double parenthesis
		await addMultipleInvalidIdeasAndTest(l1, ['to ((play sport))', 'to ( (play sport))', 'to ( (play sport)']);
		// Opening parenthesis before the first one is closed
		await addMultipleInvalidIdeasAndTest(l1, ['to ((play) sport', 'to (p(lay) sport', '(to (play)) sport', 'to (play (sport))', 'to (p(la)y) sport']);
		// An expression that contains only context
		await addMultipleInvalidIdeasAndTest(l1, ['(only context)', '  (only context) ', '(only) (context)', '()']);
		// Unclosed opening parenthesis
		await addMultipleInvalidIdeasAndTest(l1, ['to (play sport', 'to (', 'to ((play sport)', '(to play sport', 'to (play) (sport']);
		// Unmatched closing parenthesis
		await addMultipleInvalidIdeasAndTest(l1, ['to play) sport', 'to (play)) sport', 'to (play) sport)', ')(to play sport)']);
		// Parentheses are not balanced
		await addMultipleInvalidIdeasAndTest(l1, ['to )play( sport', 'to )play( (sport', 'to (play) )sport', ')(']);
		// Empty context content
		await addMultipleInvalidIdeasAndTest(l1, ['to () sport', 'to (  ) sport']);
		// Context is trimmed
		const idea = await addIdea({ee:	[{languageId: l1.id, text: 'to ( play ) sport'},
			{languageId: l1.id, text: 'to (  play) sport'}]});
		expect(idea.ee[0].text).toEqual('to (play) sport');
		expect(idea.ee[1].text).toEqual('to (play) sport');
	});

	test('parentheses (context)', async () => {
		const l1: Language = await addLanguage('language 1');
		const e1 = {languageId: l1.id, text: 'language 1 expression 1'};
		let idea = await addIdea({ee: [e1]});
		// Unmatched opening parenthesis
		await editInvalidIdeaAndTest({ee: [{languageId: l1.id, text: 'to (play sport'}]}, idea.id);
		// Context trimming
		idea = await editValidIdeaAndTest(idea, {ee: [{languageId: l1.id, text: 'to ( play ) sport'}]});
		expect(idea.ee[0].text).toEqual('to (play) sport');
	});

	test('duplicate expressions', async () => {
		await addInvalidIdeaAndTest(makeIdeaForAdding({
			ee: [{language: 'l', text: 'duplicate'}, {language: 'l', text: 'duplicate'}],
		}));
	});

	test('idea: invalid shapes', async () => {
		const l1: Language = await addLanguage('language');
		const e1 = {languageId: l1.id, text: 'expression'};
		// Missing properties
		await addInvalidIdeaAndTest({});
		// Additional property
		await addInvalidIdeaAndTest({id: 1, ee: [e1]});
		// Property is of an invalid type
		await addInvalidIdeaAndTest({ee: 'expression'});
		// Array
		await addInvalidIdeaAndTest([{ee: 'expression'}]);
	});

	test('expression: invalid shapes', async () => {
		const l1: Language = await addLanguage('language');
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
});

describe('adding and editing (valid cases)', () => {
	test('only one expression', async () => {
		const i: IdeaForTesting = {ee: [{language: 'l1', text: 'l1 e1'}]};
		const idea = await addValidIdeaAndTest(await makeIdeaForAdding(i));
		const newIdea = getIdeaForAddingFromIdea(idea);
		newIdea.ee[0].text = 'new';
		await editValidIdeaAndTest(idea, newIdea);
	});

	test('only one language', async () => {
		const i: IdeaForTesting = {ee: [{language: 'l1', text: 'l1 e1'}, {language: 'l1', text: 'l1 e2'}]};
		const idea = await addValidIdeaAndTest(await makeIdeaForAdding(i));
		const newIdea = getIdeaForAddingFromIdea(idea);
		newIdea.ee[0].text = 'new1';
		newIdea.ee[1].text = 'new2';
		await editValidIdeaAndTest(idea, newIdea);
	});

	test('basic test', async () => {
		// Adding
		const i: IdeaForTesting = {ee: [
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
		const idea1 = await addIdea(ideaForAdding1);

		const tempIdea = await addIdea(await makeIdeaForAdding({ee: [{language: 'l2', text: 'e'}]}));
		const idea2 = await editValidIdeaAndTest(tempIdea, ideaForAdding2);

		expect(idea1.ee[0].text).toEqual('an expression starting with whitespace');
		expect(idea1.ee[1].text).toEqual('an expression with a tab');
		expect(idea1.ee[2].text).toEqual('an expression with two spaces');

		expect(idea1.ee[0].text).toEqual(idea2.ee[0].text);
	});
});

describe('adding and editing (error cases)', () => {
	test('language doesn\'t exist', async () => {
		const ideaForAdding = await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]});
		const idea = await addIdea(ideaForAdding);
		ideaForAdding.ee[0].languageId += 1;
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);
	});

	test('no expression', async () => {
		const ideaForAdding = await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]});
		const idea = await addIdea(ideaForAdding);
		ideaForAdding.ee = [];
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);
	});

	test('empty expression text', async () => {
		const ideaForAdding = await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]});
		const idea = await addIdea(ideaForAdding);

		const promises: Array<Promise<void>> = [];
		for (const emptyString of ['', ' ', '  ', '	']) {
			ideaForAdding.ee[0].text = emptyString;
			promises.push(editInvalidIdeaAndTest(ideaForAdding, idea.id));
			promises.push(addInvalidIdeaAndTest(ideaForAdding, true));
		}

		ideaForAdding.ee.push({languageId: ideaForAdding.ee[0].languageId, text: 'e'});
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);
		await addInvalidIdeaAndTest(ideaForAdding, true);

		await Promise.all(promises);
	});

	test('id is not numeric', async () => {
		const idea = await addIdea(await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]}));
		const ideaForAdding = getIdeaForAddingFromIdea(idea);
		const r = await fetch(`${apiUrl}/ideas/123letters`, {
			method: 'PUT',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(ideaForAdding),
		});
		expect(r.status).toEqual(400);
	});

	test('duplicate expressions', async () => {
		const l1: Language = await addLanguage('language');
		const e1 = {languageId: l1.id, text: 'duplicate expression'};
		const e2 = {languageId: l1.id, text: 'not a duplicate expression'};
		const ideaForAdding: IdeaForAdding = {ee: [e1, e2]};
		const idea = await addIdea(ideaForAdding);
		ideaForAdding.ee[1].text = 'duplicate expression';
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);
	});

	test('idea: invalid shapes', async () => {
		const l1: Language = await addLanguage('language');
		const e1 = {languageId: l1.id, text: 'expression'};
		const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'}]};
		const idea = await addIdea(ideaForAdding);
		// Missing properties
		await editInvalidIdeaAndTest({}, idea.id);
		// Additional property
		await editInvalidIdeaAndTest({id: 1, ee: [e1]}, idea.id);
		// Property is of an invalid type
		await editInvalidIdeaAndTest({ee: 'expression'}, idea.id);
		// Array
		await editInvalidIdeaAndTest([ideaForAdding], idea.id);
	});

	test('expression: invalid shapes', async () => {
		const l1: Language = await addLanguage('language');
		const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'}]};
		const idea = await addIdea(ideaForAdding);
		// Additional property
		await editInvalidIdeaAndTest(
			{
				ee: [
					{
						id: 1,
						languageId: l1.id,
						text: 'expression',
					},
				],
			},
			idea.id,
		);
		// Missing required properties (languageId)
		await editInvalidIdeaAndTest({ee: [{text: 'a'}]}, idea.id);
		// Missing required properties (text)
		await editInvalidIdeaAndTest({ee: [{languageId: l1.id}]}, idea.id);
		// Property is of an invalid type (languageId)
		await editInvalidIdeaAndTest({ee: [{languageId: '1', text: 'a'}]}, idea.id);
		// Property is of an invalid type (text)
		await editInvalidIdeaAndTest({ee: [{languageId: l1.id, text: 256}]}, idea.id);
	});
});

describe('deleting ideas', () => {
	test('simple test', async () => {
		const l1: Language = await addLanguage('language 1');
		const l2: Language = await addLanguage('language 2');
		const e1 = {languageId: l1.id, text: 'language 1 expression 1'};
		const e2 = {languageId: l1.id, text: 'language 1 expression 2'};
		const ideaForAdding: IdeaForAdding = {ee: [e1, e2]};
		const idea = await addIdea(ideaForAdding);
		expect((await deleteIdea(idea.id)).status).toEqual(200);
		expect((await fetchIdeaAndGetResponse(idea.id)).status).toEqual(404);
		expect((await fetchLanguageAndGetResponse(l1.id)).status).toEqual(200);
		expect((await fetchLanguageAndGetResponse(l2.id)).status).toEqual(200);
	});
});

describe('deleting invalid ideas', () => {
	test('deleting nonexisting idea', async () => {
		expect((await deleteIdea(FIRST_IDEA_ID)).status).toEqual(404);
	});

	test('id is not numeric', async () => {
		const r = await fetch(`${apiUrl}/ideas/123letters`, {
			method: 'DELETE',
		});
		expect(r.status).toEqual(400);
	});
});

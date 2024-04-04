import {ExpressionForAdding} from '../../../server/model/ideas/expression';
import {Idea, validate} from '../../../server/model/ideas/idea';
import {IdeaForAdding, getIdeaForAddingFromIdea} from '../../../server/model/ideas/ideaForAdding';
import {Language} from '../../../server/model/languages/language';
import * as ApiUtils from '../../utils/api-utils';
import {addAnyLanguage} from '../../utils/api-utils';
import * as FetchUtils from '../../utils/fetch-utils';
import {FIRST_IDEA_ID} from '../../utils/fetch-utils';

export async function getBasicIdeaForAdding() {
	return makeIdeaForAdding({
		ee: [
			{language: 'l1', text: 'l1 e1', known: true},
			{language: 'l1', text: 'l1 e2'},
			{language: 'l2', text: 'l2 e1'},
			{language: 'l3', text: 'l3 e1', known: false},
			{language: 'l3', text: 'l3 e2'},
		],
	});
}

export async function addAnyIdeaAndTest() {
	const idea = await getBasicIdeaForAdding();
	await addValidIdeaAndTest(idea);
}

export async function makeIdeaForAdding(i: {
	ee:(Omit<ExpressionForAdding, 'languageId'> & {language: string;})[]
}): Promise<IdeaForAdding> {
	const uniqueLanguages = Array.from(new Set(i.ee.map(e => e.language)));
	const ll = await Promise.all(uniqueLanguages.map(language => ApiUtils.addLanguage(language)));
	return {ee: i.ee.map(e => ({languageId: ll.find(lang => lang.name === e.language)!.id, text: e.text}))};
}

export async function addIdeaHavingExpressions(ee: string[]): Promise<Idea> {
	const ll = await Promise.all(ee.map(_ => addAnyLanguage()));
	return ApiUtils.addIdea({ee: ee.map((e, i) => ({languageId: ll[i].id, text: e}))});
}

export async function addIdeaHavingLanguages(...languages: Language[]): Promise<Idea> {
	const ee = await Promise.all(languages.map(language => ({languageId: language.id, text: 'e'})));
	return ApiUtils.addIdea({ee});
}

export async function addAnyIdea(): Promise<Idea> {
	return addIdeaHavingExpressions(['e']);
}

export async function testTransformExpressions(inputExpressions: string[], expectedExpressions: string[]) {
	// Adding
	const addedIdea = await addIdeaHavingExpressions(inputExpressions);
	expect(addedIdea.ee.map(e => e.text)).toEqual(expectedExpressions);

	// Editing
	const idea = {...addedIdea};
	idea.ee.forEach((e, i) => {
		e.text = inputExpressions[i];
	});
	const editedIdea = await ApiUtils.editIdea(getIdeaForAddingFromIdea(idea), addedIdea.id);
	expect(editedIdea.ee.map(e => e.text)).toEqual(expectedExpressions);
}

export async function addValidIdeaAndTest(ideaForAdding: IdeaForAdding, expressionsInOrder?: ExpressionForAdding[]): Promise<Idea> {
	const responseIdea = await FetchUtils.addIdea(ideaForAdding);
	expect(responseIdea.status).toEqual(201);
	const idea = await responseIdea.json() as Idea;
	await validateIdea(idea, ideaForAdding, expressionsInOrder);
	return idea;
}

export async function editValidIdeaAndTest(idea: Idea,	newIdea: IdeaForAdding,	expressionsInOrder?: ExpressionForAdding[]) {
	const r = await FetchUtils.editIdea(newIdea, idea.id);
	expect(r.status).toEqual(200);
	const responseIdea = await r.json() as Idea;
	await validateIdea(responseIdea, newIdea, expressionsInOrder);
	return responseIdea;
}

export async function validateIdea(responseIdea: Idea, ideaForAdding: IdeaForAdding, expressionsInOrder?: ExpressionForAdding[]): Promise<void> {
	expect(validate(responseIdea)).toEqual(true);

	const r = await FetchUtils.fetchIdea(responseIdea.id);
	const fetchedIdea = (await r.json()) as Idea;
	expect(r.status).toEqual(200);
	expect(validate(fetchedIdea)).toEqual(true);

	expect(responseIdea.ee.length).toEqual(ideaForAdding.ee.length);

	const languagePromises = [];
	for (let i = 0; i < ideaForAdding.ee.length; i++) {
		const e = expressionsInOrder ? expressionsInOrder[i] : ideaForAdding.ee[i];
		const fetchedExpression = fetchedIdea.ee[i];
		expect(fetchedExpression.text).toEqual(e.text);
		expect(fetchedExpression.language.id).toEqual(e.languageId);
		if (e.known) {
			expect(fetchedExpression.known).toEqual(e.known);
		} else {
			expect(fetchedExpression.known).toBeFalsy();
		}
		languagePromises.push(ApiUtils.fetchLanguage(fetchedExpression.language.id));
	}

	const languages = await Promise.all(languagePromises);
	for (let i = 0; i < ideaForAdding.ee.length; i++) {
		expect(languages[i]).toEqual(fetchedIdea.ee[i].language);
	}
}

export async function editInvalidIdeaAndTest(ideaForAdding: unknown, id: number): Promise<void> {
	const idea1 = await ApiUtils.fetchIdea(id);
	expect((await FetchUtils.editIdea(ideaForAdding, id)).status).toEqual(400);
	const idea2 = await ApiUtils.fetchIdea(id);
	expect(idea1).toEqual(idea2);
}

export async function addInvalidIdeaAndTest(invalidIdea: any): Promise<void> {
	const r = await FetchUtils.addIdea(invalidIdea);
	expect(r.status).toEqual(400);
	expect((await FetchUtils.fetchIdea(FIRST_IDEA_ID)).status).toEqual(404);
}

export async function addMultipleInvalidIdeasAndTest(expressions: string[]) {
	const ideaForAdding = await makeIdeaForAdding({ee: [{language: 'l', text: 'e'}]});
	await Promise.all(expressions.map(e => addInvalidIdeaAndTest({ee: [{...ideaForAdding.ee[0], text: e}]})));
	// Multiple expressions
	await Promise.all(expressions.map(e => addInvalidIdeaAndTest({ee: [{...ideaForAdding.ee[0], text: 'e2'}, {...ideaForAdding.ee[0], text: e}]})));
}

export async function editMultipleInvalidIdeasAndTest(expressions: string[]) {
	const idea = await addIdeaHavingExpressions(['e']);
	const ideaForAdding = getIdeaForAddingFromIdea(idea);

	await Promise.all(expressions.map(e => editInvalidIdeaAndTest({ee: [{...ideaForAdding.ee[0], text: e}]}, idea.id)));
	// Multiple expressions
	await Promise.all(expressions.map(e => editInvalidIdeaAndTest({ee: [{...ideaForAdding.ee[0], text: 'e2'}, {...ideaForAdding.ee[0], text: e}]}, idea.id)));
}

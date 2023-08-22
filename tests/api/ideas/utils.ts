import {ExpressionForAdding, getExpressionForAddingFromExpression} from '../../../server/model/ideas/expression';
import {Idea, validate} from '../../../server/model/ideas/idea';
import {IdeaForAdding} from '../../../server/model/ideas/ideaForAdding';
import {FIRST_IDEA_ID, addIdea, addIdeaRawObjectAndGetResponse, addLanguage, editIdeaAndGetResponse, editIdeaRawObjectAndGetResponse, fetchIdea, fetchIdeaAndGetResponse, fetchLanguage} from '../../utils/utils';

export async function makeIdeaForAdding(i: {ee:(Omit<ExpressionForAdding, 'languageId'> & {language: string;})[]}): Promise<IdeaForAdding> {
	const uniqueLanguages = Array.from(new Set(i.ee.map(e => e.language)));
	const languagePromises = uniqueLanguages.map(language => addLanguage(language));
	const ll = await Promise.all(languagePromises);
	return {ee: i.ee.map(e => ({languageId: ll.find(lang => lang.name === e.language)!.id, text: e.text}))};
}

export async function addIdeaHavingExpressions(ee: string[]): Promise<Idea> {
	const l = await addLanguage('language ' + Math.random().toString(36).substring(10));
	return addIdea({ee: ee.map(e => ({languageId: l.id, text: e}))});
}

export async function addInvalidIdeaAndTest(invalidIdea: any): Promise<void> {
	const r = await addIdeaRawObjectAndGetResponse(JSON.stringify(invalidIdea));
	expect(r.status).toEqual(400);
	expect((await fetchIdeaAndGetResponse(FIRST_IDEA_ID)).status).toEqual(404);
}

export async function addValidIdeaAndTest(ideaForAdding: IdeaForAdding, expressionsInOrder?: ExpressionForAdding[]): Promise<Idea> {
	let r = await addIdeaRawObjectAndGetResponse(JSON.stringify(ideaForAdding));
	expect(r.status).toEqual(201);
	const responseIdea = (await r.json()) as Idea;
	expect(validate(responseIdea)).toEqual(true);

	r = await fetchIdeaAndGetResponse(1);
	const fetchedIdea = (await r.json()) as Idea;
	expect(r.status).toEqual(200);
	expect(validate(fetchedIdea)).toEqual(true);

	const languagePromises = [];
	for (let i = 0; i < ideaForAdding.ee.length; i += 1) {
		const e = expressionsInOrder ? expressionsInOrder[i] : ideaForAdding.ee[i];
		const fetchedExpression = fetchedIdea.ee[i];
		expect(fetchedExpression.text).toEqual(e.text);
		expect(fetchedExpression.language.id).toEqual(e.languageId);
		if (e.known) {
			expect(fetchedExpression.known).toEqual(e.known);
		}
		languagePromises.push(fetchLanguage(fetchedExpression.language.id));
	}

	const languages = await Promise.all(languagePromises);
	for (let i = 0; i < ideaForAdding.ee.length; i += 1) {
		expect(languages[i]).toEqual(fetchedIdea.ee[i].language);
	}

	return responseIdea;
}

export async function editValidIdeaAndTest(idea: Idea,	newIdea: IdeaForAdding,	expressionsInOrder?: ExpressionForAdding[]) {
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

export async function editInvalidIdeaAndTest(ideaForAdding: unknown, id: number): Promise<void> {
	const idea1 = await fetchIdea(id);
	expect((await editIdeaRawObjectAndGetResponse(JSON.stringify(ideaForAdding), id)).status).toEqual(400);
	const idea2 = await fetchIdea(id);
	expect(idea1).toEqual(idea2);
}

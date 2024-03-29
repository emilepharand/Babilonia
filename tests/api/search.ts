import {Idea} from '../../server/model/ideas/idea';
import * as ApiUtils from '../utils/api-utils';
import * as FetchUtils from '../utils/fetch-utils';
import {SearchContext} from '../../server/model/search/searchContext';
import {ExpressionForAdding} from '../../server/model/ideas/expression';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

async function testSearch(
	sc: SearchContext,
	ideasThatShouldMatch: Idea[],
	expressionsThatShouldMatch2D: string[][],
	languageId?: number,
) {
	const matchedIdeas = await ApiUtils.search(sc);
	expect(matchedIdeas.length).toEqual(ideasThatShouldMatch.length);
	expect(matchedIdeas).toMatchObject(ideasThatShouldMatch);
	matchedIdeas.forEach((matchedIdea, i) => {
		const expressionsThatShouldMatch = expressionsThatShouldMatch2D[i];
		expect(matchedIdea.ee.every(e => typeof e.matched === 'boolean'));
		const matchedExpressions = matchedIdea.ee.filter(e => e.matched);
		expect(matchedExpressions.length).toEqual(expressionsThatShouldMatch.length);
		matchedExpressions.forEach((matchedExpression, j) => {
			const expressionThatShouldMatch = expressionsThatShouldMatch[j];
			expect(matchedExpression.text).toEqual(expressionThatShouldMatch);
			expect(matchedExpression.matched).toEqual(true);
			if (languageId) {
				expect(matchedExpression.language.id).toEqual(languageId);
			}
		});
	});
}

describe('searching expressions', () => {
	test('searching for expressions in a language', async () => {
		const fr = await ApiUtils.addLanguage('français');
		const en = await ApiUtils.addLanguage('anglais');
		const es = await ApiUtils.addLanguage('español');
		const fr1: ExpressionForAdding = {text: 'fr lorem ipsum', languageId: fr.id};
		const en1: ExpressionForAdding = {text: 'en lorem ipsum', languageId: en.id};
		const es1: ExpressionForAdding = {text: 'es lorem ipsum', languageId: es.id};
		const fr2: ExpressionForAdding = {text: 'fr ipsum sed', languageId: fr.id};
		const en2: ExpressionForAdding = {text: 'en ipsum sed', languageId: en.id};
		const fr3: ExpressionForAdding = {text: 'fr ipsum sed dolor', languageId: fr.id};
		const i1 = await ApiUtils.addIdea({ee: [fr1, en1, es1]});
		const i2 = await ApiUtils.addIdea({ee: [fr2, en2]});
		const i3 = await ApiUtils.addIdea({ee: [fr3]});

		// No duplicates (3 expressions match 'lorem', but idea should show only once)
		const sc: SearchContext = {pattern: 'lorem'};
		const matchedIdeas = await ApiUtils.search(sc);
		expect(matchedIdeas.length).toEqual(1);

		sc.pattern = 'lorem ipsum';
		sc.language = fr.id;
		await testSearch(sc, [i1], [['fr lorem ipsum']], fr.id);

		sc.pattern = 'fr';
		await testSearch(
			sc,
			[i1, i2, i3],
			[['fr lorem ipsum'], ['fr ipsum sed'], ['fr ipsum sed dolor']],
			fr.id,
		);

		sc.pattern = 'fr';
		sc.strict = true;
		await testSearch(sc, [], []);

		sc.pattern = 'fr ipsum sed';
		sc.strict = true;
		await testSearch(sc, [i2], [['fr ipsum sed']], fr.id);
	});

	test('searching for ideas that contain specific languages and does not contain another', async () => {
		const fr = await ApiUtils.addLanguage('français');
		const en = await ApiUtils.addLanguage('anglais');
		const es = await ApiUtils.addLanguage('español');
		const it = await ApiUtils.addLanguage('italiano');
		const de = await ApiUtils.addLanguage('deutsch');
		const pt = await ApiUtils.addLanguage('português');

		// Idea 1: fr, en, es, de, it, pt
		const fr1: ExpressionForAdding = {text: 'bonjour', languageId: fr.id};
		const en1: ExpressionForAdding = {text: 'hello', languageId: en.id};
		const es1: ExpressionForAdding = {text: 'buenos días', languageId: es.id};
		const de1: ExpressionForAdding = {text: 'guten Tag', languageId: de.id};
		const pt1: ExpressionForAdding = {text: 'bom Dia', languageId: pt.id};
		const it1: ExpressionForAdding = {text: 'buongiorno', languageId: it.id};
		const i1 = await ApiUtils.addIdea({ee: [fr1, en1, es1, de1, pt1, it1]});

		// Idea 2: fr, en, es, de, pt
		const fr2: ExpressionForAdding = {text: 'bonne nuit', languageId: fr.id};
		const en2: ExpressionForAdding = {text: 'good night', languageId: en.id};
		const es2: ExpressionForAdding = {text: 'buenas noches', languageId: es.id};
		const pt2: ExpressionForAdding = {text: 'boa noite', languageId: pt.id};
		const de2: ExpressionForAdding = {text: 'gute Natch', languageId: de.id};
		const i2 = await ApiUtils.addIdea({ee: [fr2, en2, es2, pt2, de2]});

		// Idea 3: fr, en, es
		const fr3: ExpressionForAdding = {text: 'bonsoir', languageId: fr.id};
		const fr4: ExpressionForAdding = {text: 'bonsoir 2', languageId: fr.id};
		const en3: ExpressionForAdding = {text: 'good evening', languageId: en.id};
		const en4: ExpressionForAdding = {text: 'good evening 2', languageId: en.id};
		const es3: ExpressionForAdding = {text: 'buenas noches', languageId: es.id};
		const es4: ExpressionForAdding = {text: 'buenas noches 2', languageId: es.id};
		const i3 = await ApiUtils.addIdea({ee: [fr3, fr4, en3, en4, es3, es4]});

		// All ideas containing Spanish and French
		const sc: SearchContext = {
			ideaHas: [es.id, fr.id],
		};
		await testSearch(sc,
			[i1, i2, i3],
			[[fr1.text, es1.text],
				[fr2.text, es2.text],
				[fr3.text, fr4.text, es3.text, es4.text]],
		);

		// All ideas containing Spanish and French but not Italian
		sc.ideaHas = [es.id, fr.id];
		sc.ideaDoesNotHave = it.id;
		await testSearch(sc,
			[i2, i3],
			[[fr2.text, es2.text], [fr3.text, fr4.text, es3.text, es4.text]],
		);

		// All ideas containing Spanish and German
		sc.ideaHas = [es.id, de.id];
		sc.ideaDoesNotHave = undefined;
		await testSearch(sc,
			[i1, i2],
			[[es1.text, de1.text], [es2.text, de2.text]],
		);

		// All ideas containing Spanish and English but not German
		sc.ideaHas = [es.id, en.id];
		sc.ideaDoesNotHave = de.id;
		await testSearch(sc,
			[i3],
			[i3.ee.filter(e => e.language.id === es.id || e.language.id === en.id).map(e => e.text)],
		);

		// All ideas containing Italian
		sc.ideaHas = [it.id];
		sc.ideaDoesNotHave = undefined;
		await testSearch(sc,
			[i1],
			[i1.ee.filter(e => e.language.id === it.id).map(e => e.text)],
		);

		// All ideas containing French but not English
		sc.ideaHas = [fr.id];
		sc.ideaDoesNotHave = en.id;
		await testSearch(sc,
			[],
			[],
		);

		// Expressions in French matching "b" in languages containing Portuguese
		sc.pattern = 'b';
		sc.strict = undefined;
		sc.language = fr.id;
		sc.ideaHas = [pt.id];
		sc.ideaDoesNotHave = undefined;
		await testSearch(sc,
			[i1, i2],
			[[fr1.text], [fr2.text]],
		);

		// Expressions in French matching "b" in languages containing Portuguese but not Italian
		sc.pattern = 'b';
		sc.strict = undefined;
		sc.language = fr.id;
		sc.ideaHas = [pt.id];
		sc.ideaDoesNotHave = it.id;
		await testSearch(sc,
			[i2],
			[[fr2.text]],
		);
	});

	test('known expressions', async () => {
		const fr = await ApiUtils.addLanguage('français');
		const en = await ApiUtils.addLanguage('anglais');
		const es = await ApiUtils.addLanguage('español');
		const de = await ApiUtils.addLanguage('deutsch');
		const pt = await ApiUtils.addLanguage('português');

		const fr1: ExpressionForAdding = {text: 'bonjour', languageId: fr.id, known: true};
		const en1: ExpressionForAdding = {text: 'hello', languageId: en.id, known: true};
		const es1: ExpressionForAdding = {text: 'buenos días', languageId: es.id, known: true};
		const de1: ExpressionForAdding = {text: 'guten Tag', languageId: de.id};
		const pt1: ExpressionForAdding = {text: 'bom Dia', languageId: pt.id};
		const i1 = await ApiUtils.addIdea({ee: [fr1, en1, es1, de1, pt1]});

		const fr2: ExpressionForAdding = {text: 'bonne nuit', languageId: fr.id, known: true};
		const en2: ExpressionForAdding = {text: 'good night', languageId: en.id, known: true};
		const es2: ExpressionForAdding = {text: 'buenas noches', languageId: es.id, known: true};
		const es22: ExpressionForAdding = {text: 'buenas noches 2', languageId: es.id};
		const pt2: ExpressionForAdding = {text: 'boa noite', languageId: pt.id};
		const i2 = await ApiUtils.addIdea({ee: [fr2, en2, es2, es22, pt2]});

		const en3: ExpressionForAdding = {text: 'good evening', languageId: en.id};
		const en32: ExpressionForAdding = {text: 'good evening 2', languageId: en.id};
		const es3: ExpressionForAdding = {text: 'buenas noches', languageId: es.id};
		const es32: ExpressionForAdding = {text: 'buenas noches 2', languageId: es.id};
		await ApiUtils.addIdea({ee: [en3, en32, es3, es32]});

		const en4: ExpressionForAdding = {text: 'good evening', languageId: en.id};
		const en42: ExpressionForAdding = {text: 'good evening 2', languageId: en.id};
		const es4: ExpressionForAdding = {text: 'buenas noches', languageId: es.id, known: true};
		const es42: ExpressionForAdding = {text: 'buenas noches 2', languageId: es.id};
		const i4 = await ApiUtils.addIdea({ee: [en4, en42, es4, es42]});

		// Not known Portuguese
		const sc: SearchContext = {
			language: pt.id,
			knownExpressions: false,
		};
		await testSearch(sc,
			[i1, i2],
			[[pt1.text], [pt2.text]],
		);

		// Not known Portuguese containing German
		sc.ideaHas = [de.id, pt.id];
		await testSearch(sc,
			[i1],
			[[pt1.text]],
		);

		// Known Spanish containing English
		sc.knownExpressions = true;
		sc.language = es.id;
		sc.ideaHas = [es.id, en.id];
		await testSearch(sc,
			[i1, i2, i4],
			[[es1.text], [es2.text], [es4.text]],
		);

		// All known
		sc.knownExpressions = true;
		sc.language = undefined;
		sc.ideaHas = undefined;
		await testSearch(sc,
			[i1, i2, i4],
			[[fr1.text, en1.text, es1.text],
				[fr2.text, en2.text, es2.text],
				[es4.text]],
		);
	});

	describe('invalid requests', () => {
		test('no value set', async () => {
			const r = await FetchUtils.search({});
			expect(r.status).toEqual(400);
		});

		test('language is not numeric', async () => {
			await testInvalidRequests('language=a');
		});

		test('ideaHas is not numeric', async () => {
			await testInvalidRequests('ideaHas=a');
		});

		test('ideaDoesNotHave is not numeric', async () => {
			await testInvalidRequests('ideaDoesNotHave=a');
		});

		test('knownExpressions is not boolean', async () => {
			await testInvalidRequests('knownExpressions=notBoolean');
		});
	});
});

async function testInvalidRequests(params: string) {
	const r = await FetchUtils.searchRaw(params);
	expect(r.status).toEqual(400);
}

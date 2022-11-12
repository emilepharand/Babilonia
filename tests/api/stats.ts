import {
	addIdea,
	addLanguage,
	deleteEverything,
	getStats,
} from '../utils/utils';
import {ExpressionForAdding} from '../../server/model/ideas/expression';

beforeEach(async () => {
	await deleteEverything();
});

describe('getting stats', () => {
	test('getting stats', async () => {
		const fr = await addLanguage('français');
		const en = await addLanguage('english');
		const es = await addLanguage('español');
		const it = await addLanguage('italiano');
		const de = await addLanguage('deutsch');
		const pt = await addLanguage('português');
		await addLanguage('klingon');

		// Idea 1: fr, en, es, de, it, pt
		const fr1: ExpressionForAdding = {text: 'bonjour', languageId: fr.id, known: true};
		const en1: ExpressionForAdding = {text: 'hello', languageId: en.id, known: true};
		const es1: ExpressionForAdding = {text: 'buenos días', languageId: es.id};
		const de1: ExpressionForAdding = {text: 'guten Tag', languageId: de.id, known: true};
		const pt1: ExpressionForAdding = {text: 'bom Dia', languageId: pt.id};
		const it1: ExpressionForAdding = {text: 'buongiorno', languageId: it.id, known: true};
		await addIdea({ee: [fr1, en1, es1, de1, pt1, it1]});

		// Idea 2: fr, en, es, de, pt
		const fr2: ExpressionForAdding = {text: 'bonne nuit', languageId: fr.id};
		const en2: ExpressionForAdding = {text: 'good night', languageId: en.id};
		const es2: ExpressionForAdding = {text: 'buenas noches', languageId: es.id};
		const pt2: ExpressionForAdding = {text: 'boa noite', languageId: pt.id, known: true};
		const de2: ExpressionForAdding = {text: 'gute Natch', languageId: de.id};
		await addIdea({ee: [fr2, en2, es2, pt2, de2]});

		// Idea 3: fr, en, es
		const fr3: ExpressionForAdding = {text: 'bonsoir', languageId: fr.id};
		const fr4: ExpressionForAdding = {text: 'bonsoir 2', languageId: fr.id};
		const en3: ExpressionForAdding = {text: 'good evening', languageId: en.id, known: true};
		const en4: ExpressionForAdding = {text: 'good evening 2', languageId: en.id, known: true};
		const es3: ExpressionForAdding = {text: 'buenas noches', languageId: es.id, known: true};
		const es4: ExpressionForAdding = {text: 'buenas noches 2', languageId: es.id, known: true};
		await addIdea({ee: [fr3, fr4, en3, en4, es3, es4]});

		const stats = await getStats();
		expect(stats).toHaveLength(7);

		let frCovered = false;
		let enCovered = false;
		let esCovered = false;
		let itCovered = false;
		let deCovered = false;
		let ptCovered = false;
		let klCovered = false;

		for (const a of stats) {
			switch (a.language.name) {
				// Ideas: 1/3, expressions: 1/4
				case 'français':
					expect(a.knownIdeasCount).toEqual(1);
					expect(a.totalIdeasCount).toEqual(3);
					expect(a.knownExpressionsCount).toEqual(1);
					expect(a.totalExpressionsCount).toEqual(4);
					frCovered = true;
					break;
					// Ideas: 2/3, expressions: 3/4
				case 'english':
					expect(a.knownIdeasCount).toEqual(2);
					expect(a.totalIdeasCount).toEqual(3);
					expect(a.knownExpressionsCount).toEqual(3);
					expect(a.totalExpressionsCount).toEqual(4);
					enCovered = true;
					break;
				// Ideas: 1/3, expressions: 2/3
				case 'español':
					expect(a.knownIdeasCount).toEqual(1);
					expect(a.totalIdeasCount).toEqual(3);
					expect(a.knownExpressionsCount).toEqual(2);
					expect(a.totalExpressionsCount).toEqual(4);
					esCovered = true;
					break;
				// Ideas: 1/1, expressions: 1/1
				case 'italiano':
					expect(a.knownIdeasCount).toEqual(1);
					expect(a.totalIdeasCount).toEqual(1);
					expect(a.knownExpressionsCount).toEqual(1);
					expect(a.totalExpressionsCount).toEqual(1);
					itCovered = true;
					break;
				// Ideas: 1/2, expressions: 1/2
				case 'deutsch':
					expect(a.knownIdeasCount).toEqual(1);
					expect(a.totalIdeasCount).toEqual(2);
					expect(a.knownExpressionsCount).toEqual(1);
					expect(a.totalExpressionsCount).toEqual(2);
					deCovered = true;
					break;
				// Ideas: 1/2, expressions: 1/2
				case 'português':
					expect(a.knownIdeasCount).toEqual(1);
					expect(a.totalIdeasCount).toEqual(2);
					expect(a.knownExpressionsCount).toEqual(1);
					expect(a.totalExpressionsCount).toEqual(2);
					ptCovered = true;
					break;
				// Ideas: 0/0, expressions: 0/0
				case 'klingon':
					expect(a.knownIdeasCount).toEqual(0);
					expect(a.totalIdeasCount).toEqual(0);
					expect(a.knownExpressionsCount).toEqual(0);
					expect(a.totalExpressionsCount).toEqual(0);
					klCovered = true;
					break;
				default:
					throw new Error('invalid language');
			}
		}

		expect(frCovered).toBeTruthy();
		expect(enCovered).toBeTruthy();
		expect(esCovered).toBeTruthy();
		expect(itCovered).toBeTruthy();
		expect(deCovered).toBeTruthy();
		expect(ptCovered).toBeTruthy();
		expect(klCovered).toBeTruthy();
	});
});

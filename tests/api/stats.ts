import {
	addIdea,
	addLanguage,
	deleteEverything,
	editLanguagesAndGetResponse,
	getStats,
} from '../utils/utils';
import {ExpressionForAdding} from '../../server/model/ideas/expression';
import {LanguageStats} from '../../server/stats/statsCounter';

beforeEach(async () => {
	await deleteEverything();
});

describe('getting stats', () => {
	test('getting stats', async () => {
		let stats = await getStats();

		expect(stats.allLanguageStats).toHaveLength(0);
		expect(stats.globalStats.totalExpressionsCount).toBe(0);
		expect(stats.globalStats.totalIdeasCount).toBe(0);

		const fr = await addLanguage('français');
		const en = await addLanguage('english');
		const es = await addLanguage('español');
		const it = await addLanguage('italiano');
		const de = await addLanguage('deutsch');
		const pt = await addLanguage('português');
		const kl = await addLanguage('klingon');

		stats = await getStats();
		expect(stats.allLanguageStats).toHaveLength(7);
		expect(stats.globalStats.totalExpressionsCount).toBe(0);
		expect(stats.globalStats.totalIdeasCount).toBe(0);
		expect(stats.globalStats.totalKnownIdeas).toBe(0);
		expect(stats.globalStats.totalKnownExpressions).toBe(0);

		// Ordering
		expect(stats.allLanguageStats[0].language.id).toEqual(fr.id);
		expect(stats.allLanguageStats[6].language.id).toEqual(kl.id);
		kl.ordering = 0;
		fr.ordering = 6;
		await editLanguagesAndGetResponse([kl, en, es, it, de, pt, fr]);
		stats = await getStats();
		expect(stats.allLanguageStats[0].language.id).toEqual(kl.id);
		expect(stats.allLanguageStats[6].language.id).toEqual(fr.id);

		// Idea 1: fr, en, es
		const fr3: ExpressionForAdding = {text: 'bonsoir', languageId: fr.id};
		const fr4: ExpressionForAdding = {text: 'bonsoir 2', languageId: fr.id};
		const en3: ExpressionForAdding = {text: 'good evening', languageId: en.id, known: true};
		const en4: ExpressionForAdding = {text: 'good evening 2', languageId: en.id, known: true};
		const es3: ExpressionForAdding = {text: 'buenas noches', languageId: es.id, known: true};
		const es4: ExpressionForAdding = {text: 'buenas noches 2', languageId: es.id, known: true};
		await addIdea({ee: [fr3, fr4, en3, en4, es3, es4]});

		await addIdea({ee: [fr3]});

		stats = await getStats();
		expect(stats.allLanguageStats).toHaveLength(7);
		expect(stats.globalStats.totalExpressionsCount).toBe(7);
		expect(stats.globalStats.totalIdeasCount).toBe(2);
		expect(stats.globalStats.totalKnownIdeas).toBe(1);
		expect(stats.globalStats.totalKnownExpressions).toBe(4);

		let frCovered = false;
		let enCovered = false;
		let esCovered = false;
		let itCovered = false;
		let deCovered = false;
		let ptCovered = false;
		let klCovered = false;

		for (const a of stats.allLanguageStats) {
			switch (a.language.name) {
				// Ideas: 0/2, expressions: 0/2
				case 'français':
					testStats(a, {knownIdeasCount: 0, totalIdeasCount: 2, knownExpressionsCount: 0, totalExpressionsCount: 3} as LanguageStats);
					frCovered = true;
					break;
				// Ideas: 1/1, expressions: 2/2
				case 'english':
					testStats(a, {knownIdeasCount: 1, totalIdeasCount: 1, knownExpressionsCount: 2, totalExpressionsCount: 2} as LanguageStats);
					enCovered = true;
					break;
				// Ideas: 1/1, expressions: 2/2
				case 'español':
					testStats(a, {knownIdeasCount: 1, totalIdeasCount: 1, knownExpressionsCount: 2, totalExpressionsCount: 2} as LanguageStats);
					esCovered = true;
					break;
				// Ideas: 0/0, expressions: 0/0
				case 'italiano':
					testStats(a, {knownIdeasCount: 0, totalIdeasCount: 0, knownExpressionsCount: 0, totalExpressionsCount: 0} as LanguageStats);
					itCovered = true;
					break;
				// Ideas: 0/0, expressions: 0/0
				case 'deutsch':
					testStats(a, {knownIdeasCount: 0, totalIdeasCount: 0, knownExpressionsCount: 0, totalExpressionsCount: 0} as LanguageStats);
					deCovered = true;
					break;
				// Ideas: 0/0, expressions: 0/0
				case 'português':
					testStats(a, {knownIdeasCount: 0, totalIdeasCount: 0, knownExpressionsCount: 0, totalExpressionsCount: 0} as LanguageStats);
					ptCovered = true;
					break;
				// Ideas: 0/0, expressions: 0/0
				case 'klingon':
					testStats(a, {knownIdeasCount: 0, totalIdeasCount: 0, knownExpressionsCount: 0, totalExpressionsCount: 0} as LanguageStats);
					klCovered = true;
					break;
				default:
					throw new Error('invalid language');
			}
		}

		expect(frCovered).toEqual(true);
		expect(enCovered).toEqual(true);
		expect(esCovered).toEqual(true);
		expect(itCovered).toEqual(true);
		expect(deCovered).toEqual(true);
		expect(ptCovered).toEqual(true);
		expect(klCovered).toEqual(true);

		// Idea 2: fr, en, es, de, it, pt
		const fr1: ExpressionForAdding = {text: 'bonjour', languageId: fr.id, known: true};
		const en1: ExpressionForAdding = {text: 'hello', languageId: en.id, known: true};
		const es1: ExpressionForAdding = {text: 'buenos días', languageId: es.id};
		const de1: ExpressionForAdding = {text: 'guten Tag', languageId: de.id, known: true};
		const pt1: ExpressionForAdding = {text: 'bom Dia', languageId: pt.id};
		const it1: ExpressionForAdding = {text: 'buongiorno', languageId: it.id, known: true};
		await addIdea({ee: [fr1, en1, es1, de1, pt1, it1]});

		// Idea 3: fr, en, es, de, pt
		const fr2: ExpressionForAdding = {text: 'bonne nuit', languageId: fr.id};
		const en2: ExpressionForAdding = {text: 'good night', languageId: en.id};
		const es2: ExpressionForAdding = {text: 'buenas noches', languageId: es.id};
		const pt2: ExpressionForAdding = {text: 'boa noite', languageId: pt.id, known: true};
		const de2: ExpressionForAdding = {text: 'gute Natch', languageId: de.id};
		await addIdea({ee: [fr2, en2, es2, pt2, de2]});

		stats = await getStats();
		expect(stats.allLanguageStats).toHaveLength(7);
		expect(stats.globalStats.totalExpressionsCount).toBe(18);
		expect(stats.globalStats.totalIdeasCount).toBe(4);
		expect(stats.globalStats.totalKnownIdeas).toBe(3);
		expect(stats.globalStats.totalKnownExpressions).toBe(9);

		frCovered = false;
		enCovered = false;
		esCovered = false;
		itCovered = false;
		deCovered = false;
		ptCovered = false;
		klCovered = false;

		for (const a of stats.allLanguageStats) {
			switch (a.language.name) {
				case 'français':
					testStats(a, {knownIdeasCount: 1, totalIdeasCount: 4, knownExpressionsCount: 1, totalExpressionsCount: 5} as LanguageStats);
					frCovered = true;
					break;
				case 'english':
					testStats(a, {knownIdeasCount: 2, totalIdeasCount: 3, knownExpressionsCount: 3, totalExpressionsCount: 4} as LanguageStats);
					enCovered = true;
					break;
				case 'español':
					testStats(a, {knownIdeasCount: 1, totalIdeasCount: 3, knownExpressionsCount: 2, totalExpressionsCount: 4} as LanguageStats);
					esCovered = true;
					break;
				case 'italiano':
					testStats(a, {knownIdeasCount: 1, totalIdeasCount: 1, knownExpressionsCount: 1, totalExpressionsCount: 1} as LanguageStats);
					itCovered = true;
					break;
				case 'deutsch':
					testStats(a, {knownIdeasCount: 1, totalIdeasCount: 2, knownExpressionsCount: 1, totalExpressionsCount: 2} as LanguageStats);
					deCovered = true;
					break;
				case 'português':
					testStats(a, {knownIdeasCount: 1, totalIdeasCount: 2, knownExpressionsCount: 1, totalExpressionsCount: 2} as LanguageStats);
					ptCovered = true;
					break;
				case 'klingon':
					testStats(a, {knownIdeasCount: 0, totalIdeasCount: 0, knownExpressionsCount: 0, totalExpressionsCount: 0} as LanguageStats);
					klCovered = true;
					break;
				default:
					throw new Error('invalid language');
			}
		}

		expect(frCovered).toEqual(true);
		expect(enCovered).toEqual(true);
		expect(esCovered).toEqual(true);
		expect(itCovered).toEqual(true);
		expect(deCovered).toEqual(true);
		expect(ptCovered).toEqual(true);
		expect(klCovered).toEqual(true);
	});
});

function testStats(actualStats: LanguageStats, expectedStats: LanguageStats) {
	expect(actualStats.knownIdeasCount).toEqual(expectedStats.knownIdeasCount);
	expect(actualStats.totalIdeasCount).toEqual(expectedStats.totalIdeasCount);
	expect(actualStats.knownExpressionsCount).toEqual(expectedStats.knownExpressionsCount);
	expect(actualStats.totalExpressionsCount).toEqual(expectedStats.totalExpressionsCount);
}

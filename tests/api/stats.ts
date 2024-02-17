import {
	addIdea,
	addLanguage,
	changeDatabaseToMemoryAndDeleteEverything,
	editLanguagesAndGetResponse,
	getStats,
} from '../utils/fetch-utils';
import {ExpressionForAdding} from '../../server/model/ideas/expression';
import {LanguageStats} from '../../server/stats/statsCounter';

beforeEach(async () => {
	await changeDatabaseToMemoryAndDeleteEverything();
});

describe('getting stats', () => {
	test('getting stats', async () => {
		let actualStats = await getStats();

		expect(actualStats.allLanguageStats).toHaveLength(0);
		expect(actualStats.globalStats.totalExpressionsCount).toBe(0);
		expect(actualStats.globalStats.totalIdeasCount).toBe(0);

		const fr = await addLanguage('français');
		const en = await addLanguage('english');
		const es = await addLanguage('español');
		const it = await addLanguage('italiano');
		const de = await addLanguage('deutsch');
		const pt = await addLanguage('português');
		const kl = await addLanguage('klingon');

		actualStats = await getStats();
		expect(actualStats.allLanguageStats).toHaveLength(7);
		expect(actualStats.globalStats.totalExpressionsCount).toBe(0);
		expect(actualStats.globalStats.totalIdeasCount).toBe(0);
		expect(actualStats.globalStats.totalKnownIdeas).toBe(0);
		expect(actualStats.globalStats.totalKnownExpressions).toBe(0);

		// Ordering
		expect(actualStats.allLanguageStats[0].language.id).toEqual(fr.id);
		expect(actualStats.allLanguageStats[6].language.id).toEqual(kl.id);
		kl.ordering = 0;
		fr.ordering = 6;
		await editLanguagesAndGetResponse([kl, en, es, it, de, pt, fr]);
		actualStats = await getStats();
		expect(actualStats.allLanguageStats[0].language.id).toEqual(kl.id);
		expect(actualStats.allLanguageStats[6].language.id).toEqual(fr.id);

		// Idea 1: fr, en, es
		const fr3: ExpressionForAdding = {text: 'bonsoir', languageId: fr.id};
		const fr4: ExpressionForAdding = {text: 'bonsoir 2', languageId: fr.id};
		const en3: ExpressionForAdding = {text: 'good evening', languageId: en.id, known: true};
		const en4: ExpressionForAdding = {text: 'good evening 2', languageId: en.id, known: true};
		const es3: ExpressionForAdding = {text: 'buenas noches', languageId: es.id, known: true};
		const es4: ExpressionForAdding = {text: 'buenas noches 2', languageId: es.id, known: true};
		await addIdea({ee: [fr3, fr4, en3, en4, es3, es4]});

		await addIdea({ee: [fr3]});

		actualStats = await getStats();
		expect(actualStats.allLanguageStats).toHaveLength(7);
		expect(actualStats.globalStats.totalExpressionsCount).toBe(7);
		expect(actualStats.globalStats.totalIdeasCount).toBe(2);
		expect(actualStats.globalStats.totalKnownIdeas).toBe(1);
		expect(actualStats.globalStats.totalKnownExpressions).toBe(4);

		let expectedStats: Array<LanguageStats & {covered: boolean}> = [
			// Ideas: 0/2, expressions: 0/2
			{
				language: fr, knownIdeasCount: 0, totalIdeasCount: 2, knownExpressionsCount: 0, totalExpressionsCount: 3, covered: false,
			},
			// Ideas: 1/1, expressions: 2/2
			{
				language: en, knownIdeasCount: 1, totalIdeasCount: 1, knownExpressionsCount: 2, totalExpressionsCount: 2, covered: false,
			},
			// Ideas: 1/1, expressions: 2/2
			{
				language: es, knownIdeasCount: 1, totalIdeasCount: 1, knownExpressionsCount: 2, totalExpressionsCount: 2, covered: false,
			},
			// Ideas: 0/0, expressions: 0/0
			{
				language: it, knownIdeasCount: 0, totalIdeasCount: 0, knownExpressionsCount: 0, totalExpressionsCount: 0, covered: false,
			},
			// Ideas: 0/0, expressions: 0/0
			{
				language: de, knownIdeasCount: 0, totalIdeasCount: 0, knownExpressionsCount: 0, totalExpressionsCount: 0, covered: false,
			},
			// Ideas: 0/0, expressions: 0/0
			{
				language: pt, knownIdeasCount: 0, totalIdeasCount: 0, knownExpressionsCount: 0, totalExpressionsCount: 0, covered: false,
			},
			// Ideas: 0/0, expressions: 0/0
			{
				language: kl, knownIdeasCount: 0, totalIdeasCount: 0, knownExpressionsCount: 0, totalExpressionsCount: 0, covered: false,
			},
		];

		testStats(actualStats.allLanguageStats, expectedStats);

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

		actualStats = await getStats();
		expect(actualStats.allLanguageStats).toHaveLength(7);
		expect(actualStats.globalStats.totalExpressionsCount).toBe(18);
		expect(actualStats.globalStats.totalIdeasCount).toBe(4);
		expect(actualStats.globalStats.totalKnownIdeas).toBe(3);
		expect(actualStats.globalStats.totalKnownExpressions).toBe(9);

		expectedStats = [
			{
				language: fr, knownIdeasCount: 1, totalIdeasCount: 4, knownExpressionsCount: 1, totalExpressionsCount: 5, covered: false,
			},
			{
				language: en, knownIdeasCount: 2, totalIdeasCount: 3, knownExpressionsCount: 3, totalExpressionsCount: 4, covered: false,
			},
			{
				language: es, knownIdeasCount: 1, totalIdeasCount: 3, knownExpressionsCount: 2, totalExpressionsCount: 4, covered: false,
			},
			{
				language: it, knownIdeasCount: 1, totalIdeasCount: 1, knownExpressionsCount: 1, totalExpressionsCount: 1, covered: false,
			},
			{
				language: de, knownIdeasCount: 1, totalIdeasCount: 2, knownExpressionsCount: 1, totalExpressionsCount: 2, covered: false,
			},
			{
				language: pt, knownIdeasCount: 1, totalIdeasCount: 2, knownExpressionsCount: 1, totalExpressionsCount: 2, covered: false,
			},
			{
				language: kl, knownIdeasCount: 0, totalIdeasCount: 0, knownExpressionsCount: 0, totalExpressionsCount: 0, covered: false,
			},
		];

		testStats(actualStats.allLanguageStats, expectedStats);
	});
});

function testStats(actualStats: LanguageStats[], expectedStats: Array<LanguageStats & {covered: boolean}>) {
	for (const actualStatsItem of actualStats) {
		const expectedStatsItem = expectedStats.find(i => i.language.id === actualStatsItem.language.id);
		if (expectedStatsItem === undefined) {
			throw new Error(`Invalid language: ${actualStatsItem.language.name}`);
		} else {
			expect(actualStatsItem.knownIdeasCount).toEqual(expectedStatsItem.knownIdeasCount);
			expect(actualStatsItem.totalIdeasCount).toEqual(expectedStatsItem.totalIdeasCount);
			expect(actualStatsItem.knownExpressionsCount).toEqual(expectedStatsItem.knownExpressionsCount);
			expect(actualStatsItem.totalExpressionsCount).toEqual(expectedStatsItem.totalExpressionsCount);
			expectedStatsItem.covered = true;
		}
	}
	expectedStats.forEach(s => expect(s.covered).toEqual(true));
}

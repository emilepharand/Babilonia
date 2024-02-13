import {
	addIdea,
	addLanguage,
	deleteEverything,
	editLanguages,
	nextPracticeIdea,
	rawNextPracticeIdea,
	setSettings,
} from '../utils/fetch-utils';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {Language} from '../../server/model/languages/language';
import {Idea, validate} from '../../server/model/ideas/idea';
import {addIdeaHavingExpressions, addIdeaHavingLanguages} from './ideas/utils';
import {areInSameOrder, executeNTimes} from '../utils/utils';

beforeEach(async () => {
	await deleteEverything();
});

describe('getting practice ideas when there are no practiceable ideas', () => {
	test('there is no idea at all', async () => {
		expect((await rawNextPracticeIdea()).status).toEqual(404);
	});

	test('there are ideas but none is practiceable', async () => {
		const l1: Language = await addLanguage('language');
		l1.isPractice = true;
		await editLanguages([l1]);
		const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'}]};
		await addIdea(ideaForAdding);
		expect((await rawNextPracticeIdea()).status).toEqual(404);
	});
});

describe('getting practice ideas', () => {
	async function iterateNextPracticeIdeas(ideaIds: number[][], n: number) {
		for (let i = 0; i < ideaIds.length; i++) {
			const promises = [];
			for (let i = 0; i < n; i++) {
				promises.push(nextPracticeIdea());
			}
			// eslint-disable-next-line no-await-in-loop
			(await Promise.all(promises)).forEach(idea => ideaIds[i].push(idea.id));
		}
		return ideaIds;
	}

	test('only one idea loops', async () => {
		const addedIdea = await addIdeaHavingExpressions(['e1', 'e2']);
		addedIdea.ee[0].language.isPractice = true;
		addedIdea.ee[1].language.isPractice = false;
		await editLanguages([addedIdea.ee[0].language, addedIdea.ee[1].language]);

		const promises = [];
		for (let i = 0; i < 10; i++) {
			promises.push(rawNextPracticeIdea());
		}
		const responses = await Promise.all(promises);
		responses.forEach(r => expect(r.status).toEqual(200));
		const ideas = await Promise.all(responses.map(r => r.json())) as Idea[];
		ideas.forEach(i => expect(i.id).toEqual(addedIdea.id));
		ideas.forEach(i => expect(validate(i)).toEqual(true));
	});

	test('ten ideas loop randomly', async () => {
		const l1: Language = await addLanguage('l1');
		const l2: Language = await addLanguage('l2');
		l1.isPractice = true;
		await editLanguages([l1, l2]);

		await executeNTimes(10, () => addIdeaHavingLanguages(l1, l2));

		const promises = [];
		for (let i = 0; i < 2; i++) {
			const ideaIds = new Set();
			for (let i = 0; i < 10; i++) {
				promises.push(nextPracticeIdea());
			}
			// eslint-disable-next-line no-await-in-loop
			(await Promise.all(promises)).forEach(i => ideaIds.add(i.id));
			expect(ideaIds.size).toEqual(10);
		}
	});

	test('random practice setting', async () => {
		// Add languages
		const l1 = await addLanguage('l1');
		const l2 = await addLanguage('l2');

		// Add ideas
		await Promise.all(Array.from({length: 10}, () => addIdeaHavingLanguages(l1, l2)));

		// Make sure there are practiceable ideas
		l1.isPractice = true;
		await editLanguages([l1, l2]);

		// Random: true
		await setSettings({randomPractice: true, practiceOnlyNotKnown: false});

		let firstIdeaIds = [] as number[];
		let secondIdeaIds = [] as number[];
		const ideaIds = [firstIdeaIds, secondIdeaIds];
		await iterateNextPracticeIdeas(ideaIds, 10);
		// This might fail when it should pass but the chance is small
		expect(areInSameOrder(firstIdeaIds, secondIdeaIds)).toEqual(false);

		// Random: false
		await setSettings({randomPractice: false, practiceOnlyNotKnown: false});

		firstIdeaIds = [];
		secondIdeaIds = [];
		await iterateNextPracticeIdeas(ideaIds, 10);
		expect(areInSameOrder(firstIdeaIds, secondIdeaIds)).toEqual(true);
	});

	test('only practice languages, mixed and no practice languages', async () => {
		const llPromises = [];
		for (let i = 0; i < 4; i++) {
			llPromises.push(addLanguage(String('language' + i)));
		}
		const ll = await Promise.all(llPromises);
		ll[0].isPractice = true;
		ll[1].isPractice = true;
		ll[2].isPractice = false;
		ll[3].isPractice = false;
		await editLanguages(ll);

		await setSettings({randomPractice: false, practiceOnlyNotKnown: false});

		// Only practice languages (not practiceable)
		const i1 = await addIdeaHavingLanguages(ll[0], ll[1]);
		// Mixed (practiceable)
		const i2 = await addIdeaHavingLanguages(ll[1], ll[2]);
		// No practice languages (not practiceable)
		const i3 = await addIdeaHavingLanguages(ll[2], ll[3]);

		const ideaIds = [] as number[];
		await iterateNextPracticeIdeas([ideaIds], 4);
		expect(new Set(ideaIds).size).toEqual(1);
		expect(ideaIds).toContain(i2.id);
		expect(ideaIds).not.toContain(i1.id);
		expect(ideaIds).not.toContain(i3.id);
	});

	test('ideas with only known expressions in practice languages are not practiceable (depending on settings)', async () => {
		const practiceLanguage = await addLanguage('practice language 1');
		const practiceLanguage2 = await addLanguage('practice language 2');
		const noPracticeLanguage = await addLanguage('no practice language 1');
		practiceLanguage.isPractice = true;
		practiceLanguage2.isPractice = true;
		noPracticeLanguage.isPractice = false;
		await editLanguages([practiceLanguage, practiceLanguage2, noPracticeLanguage]);

		const ideaWithOnlyKnownExpressions = await addIdea(
			{ee: [{languageId: practiceLanguage.id, text: 'e1', known: true}, {languageId: noPracticeLanguage.id, text: 'e2'}]},
		);
		const ideaWithPracticeAndNoPracticeLanguage = await addIdea(
			{ee: [{languageId: practiceLanguage.id, text: 'e1'}, {languageId: noPracticeLanguage.id, text: 'e2'}]},
		);

		// Practice only known is false
		await setSettings({practiceOnlyNotKnown: false, randomPractice: false});
		expect((await nextPracticeIdea()).id).toEqual(ideaWithOnlyKnownExpressions.id);
		expect((await nextPracticeIdea()).id).toEqual(ideaWithPracticeAndNoPracticeLanguage.id);

		// Practice only known is true
		await setSettings({practiceOnlyNotKnown: true});
		expect((await nextPracticeIdea()).id).toEqual(ideaWithPracticeAndNoPracticeLanguage.id);
		expect((await nextPracticeIdea()).id).toEqual(ideaWithPracticeAndNoPracticeLanguage.id);
	});

	test('ideas with known expressions only in non practice languages are practiceable', async () => {
		const practiceLanguage: Language = await addLanguage('practice language 1');
		const nonPracticeLanguage: Language = await addLanguage('no practice language 1');
		practiceLanguage.isPractice = true;
		await editLanguages([practiceLanguage, nonPracticeLanguage]);

		const idea = await addIdea({
			ee: [{languageId: practiceLanguage.id, text: 'e1'},
				{languageId: nonPracticeLanguage.id, text: 'e2', known: true}],
		});

		// Practice only known is false
		await setSettings({practiceOnlyNotKnown: false, randomPractice: false});
		expect((await nextPracticeIdea()).id).toEqual(idea.id);

		// Practice only known is true
		await setSettings({practiceOnlyNotKnown: true});
		expect((await nextPracticeIdea()).id).toEqual(idea.id);
	});

	test('changing which languages are practiceable changes practiceable ideas', async () => {
		const l1: Language = await addLanguage('language 1');
		const l2: Language = await addLanguage('language 2');
		const l3: Language = await addLanguage('language 3');
		l1.isPractice = true;
		l2.isPractice = true;
		l3.isPractice = false;
		await editLanguages([l1, l2, l3]);

		await setSettings({practiceOnlyNotKnown: false, randomPractice: false});

		const idea1 = await addIdeaHavingLanguages(l1, l2);
		const idea2 = await addIdeaHavingLanguages(l1, l3);

		expect((await nextPracticeIdea()).id).toEqual(idea2.id);
		expect((await nextPracticeIdea()).id).toEqual(idea2.id);

		l2.isPractice = false;
		l3.isPractice = true;
		await editLanguages([l1, l2, l3]);

		expect((await nextPracticeIdea()).id).toEqual(idea1.id);
		expect((await nextPracticeIdea()).id).toEqual(idea1.id);
	});

	test('changing which languages are practiceable resets loop', async () => {
		const l1: Language = await addLanguage('language 1');
		const l2: Language = await addLanguage('language 2');
		const l3: Language = await addLanguage('language 3');
		l1.isPractice = true;
		l2.isPractice = true;
		l3.isPractice = false;
		await editLanguages([l1, l2, l3]);

		await setSettings({practiceOnlyNotKnown: false, randomPractice: true});

		await executeNTimes(20, () => addIdeaHavingLanguages(l1, l2));
		await executeNTimes(20, () => addIdeaHavingLanguages(l1, l3));

		const firstIdeaIds = [] as number[];
		await iterateNextPracticeIdeas([firstIdeaIds], 10);
		expect(new Set(firstIdeaIds).size).toEqual(10);

		l1.isPractice = true;
		l2.isPractice = true;
		l3.isPractice = false;
		await editLanguages([l1, l2, l3]);

		await iterateNextPracticeIdeas([firstIdeaIds], 10);
		// This test might fail when it should pass but the chance is small
		expect(new Set(firstIdeaIds).size).not.toEqual(10);
	});
});

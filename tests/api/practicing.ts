import {
	addIdea,
	addLanguage,
	deleteEverything,
	editLanguages,
	nextPracticeIdea,
	rawNextPracticeIdea,
} from '../utils/utils';
import {IdeaForAdding} from '../../server/model/ideas/ideaForAdding';
import {Language} from '../../server/model/languages/language';
import {Idea, validate} from '../../server/model/ideas/idea';

beforeEach(async () => {
	await deleteEverything();
});

describe('getting practice ideas when there are no practiceable ideas', () => {
	test('404 when no idea at all', async () => {
		expect((await rawNextPracticeIdea()).status).toEqual(404);
	});

	test('404 when no practiceable idea is available', async () => {
		const l1: Language = await addLanguage('language');
		l1.isPractice = true;
		await editLanguages([l1]);
		const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'}]};
		await addIdea(ideaForAdding);
		expect((await rawNextPracticeIdea()).status).toEqual(404);
	});
});

describe('getting practice ideas', () => {
	test('only one idea loops', async () => {
		const l1: Language = await addLanguage('language 1');
		const l2: Language = await addLanguage('language 2');
		l1.isPractice = true;
		await editLanguages([l1, l2]);
		const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'},
			{languageId: l2.id, text: 'expression2'}]};
		await addIdea(ideaForAdding);
		let r = await rawNextPracticeIdea();
		let idea = await r.json() as Idea;
		expect(validate(idea)).toEqual(true);
		expect(r.status).toEqual(200);
		r = await rawNextPracticeIdea();
		idea = await r.json() as Idea;
		expect(validate(idea)).toEqual(true);
		expect(r.status).toEqual(200);
	});

	test('ten ideas loop randomly', async () => {
		const l1: Language = await addLanguage('language 1');
		const l2: Language = await addLanguage('language 2');
		l1.isPractice = true;
		await editLanguages([l1, l2]);
		const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'},
			{languageId: l2.id, text: 'expression2'}]};
		for (let i = 0; i < 10; i++) {
			// Allow await because this API call should not be made many times at once
			// eslint-disable-next-line no-await-in-loop
			await addIdea(ideaForAdding);
		}
		const ideaIds = new Set();
		for (let i = 0; i < 10; i++) {
			// Allow await because this API call should not be made many times at once
			// eslint-disable-next-line no-await-in-loop
			ideaIds.add((await nextPracticeIdea()).id);
		}
		expect(ideaIds.size).toEqual(10);
		ideaIds.clear();
		expect(ideaIds.size).toEqual(0);
		for (let i = 0; i < 10; i++) {
			// Allow await because this API call should not be made many times at once
			// eslint-disable-next-line no-await-in-loop
			ideaIds.add((await nextPracticeIdea()).id);
		}
		expect(ideaIds.size).toEqual(10);
	});

	test('many expressions and languages', async () => {
		const ll = [];
		const ii = [];
		for (let i = 0; i < 10; i++) {
			// Allow await because this API call should not be made many times at once
			// eslint-disable-next-line no-await-in-loop
			ll.push((await addLanguage(String('language' + i))));
		}
		for (let i = 10; i < 20; i++) {
			// eslint-disable-next-line no-await-in-loop
			ll.push((await addLanguage(String('language' + i))));
		}
		for (let i = 0; i < 10; i += 2) {
			ll[i].isPractice = true;
		}
		await editLanguages(ll);
		for (let i = 0; i < 10; i += 2) {
			const ideaForAdding: IdeaForAdding = {ee: [{languageId: ll[i].id, text: 'expression'},
				{languageId: ll[i + 1].id, text: 'expression2'}]};
			// Allow await because this API call should not be made many times at once
			// eslint-disable-next-line no-await-in-loop
			ii.push((await addIdea(ideaForAdding)));
		}
		for (let i = 10; i < 10; i += 2) {
			const ideaForAdding: IdeaForAdding = {ee: [{languageId: ll[i].id, text: 'expression'},
				{languageId: ll[i + 1].id, text: 'expression2'}]};
			// Allow await because this API call should not be made many times at once
			// eslint-disable-next-line no-await-in-loop
			ii.push((await addIdea(ideaForAdding)));
		}
		const ideaIds = new Set();
		for (let i = 0; i < 10; i++) {
			// Allow await because this API call should not be made many times at once
			// eslint-disable-next-line no-await-in-loop
			ideaIds.add((await nextPracticeIdea()).id);
		}
		expect(ideaIds.size).toEqual(5);
	});

	test('ideas with only practice languages are not practiceable', async () => {
		const practiceLanguage: Language = await addLanguage('practice language 1');
		const practiceLanguage2: Language = await addLanguage('practice language 2');
		const noPracticeLanguage: Language = await addLanguage('no practice language 1');
		practiceLanguage.isPractice = true;
		practiceLanguage2.isPractice = true;
		await editLanguages([practiceLanguage, practiceLanguage2, noPracticeLanguage]);
		const ideaWithOnlyPracticeLanguage: IdeaForAdding = {ee: [{languageId: practiceLanguage.id, text: 'expression'},
			{languageId: practiceLanguage2.id, text: 'expression2'}]};
		const ideaWithPracticeAndNoPracticeLanguage: IdeaForAdding = {ee: [{languageId: practiceLanguage.id, text: 'expression'},
			{languageId: noPracticeLanguage.id, text: 'expression2'}]};
		await addIdea(ideaWithOnlyPracticeLanguage);
		const fetchedIdeaWithPracticeAndNoPracticeLanguage = await addIdea(ideaWithPracticeAndNoPracticeLanguage);
		expect((await nextPracticeIdea()).id).toEqual(fetchedIdeaWithPracticeAndNoPracticeLanguage.id);
		expect((await nextPracticeIdea()).id).toEqual(fetchedIdeaWithPracticeAndNoPracticeLanguage.id);
	});

	test('ideas with no practice languages are not practiceable', async () => {
		const practiceLanguage: Language = await addLanguage('practice language 1');
		const noPracticeLanguage: Language = await addLanguage('no practice language 1');
		const noPracticeLanguage2: Language = await addLanguage('no practice language 2');
		practiceLanguage.isPractice = true;
		await editLanguages([practiceLanguage, noPracticeLanguage, noPracticeLanguage2]);
		const ideaWithNoPracticeLanguage: IdeaForAdding = {ee: [{languageId: noPracticeLanguage.id, text: 'expression'},
			{languageId: noPracticeLanguage2.id, text: 'expression2'}]};
		const ideaWithPracticeAndNoPracticeLanguage: IdeaForAdding = {ee: [{languageId: practiceLanguage.id, text: 'expression'},
			{languageId: noPracticeLanguage.id, text: 'expression2'}]};
		await addIdea(ideaWithNoPracticeLanguage);
		const fetchedIdeaWithPracticeAndNoPracticeLanguage = await addIdea(ideaWithPracticeAndNoPracticeLanguage);
		expect((await nextPracticeIdea()).id).toEqual(fetchedIdeaWithPracticeAndNoPracticeLanguage.id);
		expect((await nextPracticeIdea()).id).toEqual(fetchedIdeaWithPracticeAndNoPracticeLanguage.id);
	});

	test('changing which languages are practiceable changes practiceable ideas', async () => {
		const l1: Language = await addLanguage('language 1');
		const l2: Language = await addLanguage('language 2');
		const l3: Language = await addLanguage('language 3');
		l1.isPractice = true;
		l2.isPractice = true;
		l3.isPractice = false;
		await editLanguages([l1, l2, l3]);

		const idea1: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'},
			{languageId: l2.id, text: 'expression2'}]};
		const idea2: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'},
			{languageId: l3.id, text: 'expression2'}]};

		const fetchedIdea1 = await addIdea(idea1);
		const fetchedIdea2 = await addIdea(idea2);
		expect((await nextPracticeIdea()).id).toEqual(fetchedIdea2.id);

		l2.isPractice = false;
		l3.isPractice = true;
		await editLanguages([l1, l2, l3]);

		expect((await nextPracticeIdea()).id).toEqual(fetchedIdea1.id);
	});

	test('changing which languages are practiceable resets loop', async () => {
		const l1: Language = await addLanguage('language 1');
		const l2: Language = await addLanguage('language 2');
		const l3: Language = await addLanguage('language 3');
		l1.isPractice = true;
		l2.isPractice = true;
		l3.isPractice = false;
		await editLanguages([l1, l2, l3]);

		const idea1: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'},
			{languageId: l2.id, text: 'expression2'}]};
		const idea2: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'},
			{languageId: l3.id, text: 'expression2'}]};

		for (let i = 0; i < 20; i++) {
			// Allow await because this API call should not be made many times at once
			// eslint-disable-next-line no-await-in-loop
			await addIdea(idea1);
		}
		for (let i = 0; i < 20; i++) {
			// Allow await because this API call should not be made many times at once
			// eslint-disable-next-line no-await-in-loop
			await addIdea(idea2);
		}
		const firstIdeaIds = new Set();
		for (let i = 0; i < 10; i++) {
			// Allow await because this API call should not be made many times at once
			// eslint-disable-next-line no-await-in-loop
			firstIdeaIds.add((await nextPracticeIdea()).id);
		}
		expect(firstIdeaIds.size).toEqual(10);

		l1.isPractice = true;
		l2.isPractice = true;
		l3.isPractice = false;
		await editLanguages([l1, l2, l3]);

		for (let i = 0; i < 10; i++) {
			// Allow await because this API call should not be made many times at once
			// eslint-disable-next-line no-await-in-loop
			firstIdeaIds.add((await nextPracticeIdea()).id);
		}
		// This test might pass when it should fail but the chance is statistically small
		// because nextPracticeIdea() is random
		expect(firstIdeaIds.size).not.toEqual(20);
	});
});

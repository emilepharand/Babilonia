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
import {Idea} from '../../server/model/ideas/idea';

beforeEach(async () => {
	await deleteEverything();
});

describe('getting practice ideas erroneously', () => {
	// Test('404 when no idea at all', async () => {
	// 	expect((await rawNextPracticeIdea()).status).toEqual(404);
	// });
	//
	// test('404 when no practiceable idea because there is only one language', async () => {
	// 	const l1: Language = await addLanguage('language');
	// 	l1.isPractice = true;
	// 	await editLanguages([l1]);
	// 	const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'}]};
	// 	await addIdea(ideaForAdding);
	// 	expect((await rawNextPracticeIdea()).status).toEqual(404);
	// });
	//
	// test('404 when no practiceable idea because only one language is practiceable', async () => {
	// 	const l1: Language = await addLanguage('language 1');
	// 	const l2: Language = await addLanguage('language 2');
	// 	l1.isPractice = true;
	// 	await editLanguages([l1, l2]);
	// 	const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'},
	// 		{languageId: l2.id, text: 'expression2'}]};
	// 	await addIdea(ideaForAdding);
	// 	expect((await rawNextPracticeIdea()).status).toEqual(404);
	// });
});

describe('getting practice ideas', () => {
	test('only one idea loops', async () => {
		const l1: Language = await addLanguage('language 1');
		const l2: Language = await addLanguage('language 2');
		l1.isPractice = true;
		l2.isPractice = true;
		await editLanguages([l1, l2]);
		const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'},
			{languageId: l2.id, text: 'expression2'}]};
		await addIdea(ideaForAdding);
		const r = await rawNextPracticeIdea();
		expect(r.status).toEqual(200);
		const idea = await nextPracticeIdea();
		console.log(JSON.stringify(idea));
	});

	test('ten ideas loop randomly', async () => {
		const l1: Language = await addLanguage('language 1');
		const l2: Language = await addLanguage('language 2');
		l1.isPractice = true;
		l2.isPractice = true;
		await editLanguages([l1, l2]);
		const ideaForAdding: IdeaForAdding = {ee: [{languageId: l1.id, text: 'expression'},
			{languageId: l2.id, text: 'expression2'}]};
		await addIdea(ideaForAdding);
		await addIdea(ideaForAdding);
		await addIdea(ideaForAdding);
		await addIdea(ideaForAdding);
		await addIdea(ideaForAdding);
		const ideaIds = new Set();
		const promises1: Promise<Idea>[] = [];
		for (let i = 0; i < 10; i++) {
			promises1.push(addIdea(ideaForAdding));
		}
		await Promise.all(promises1);
		for (let i = 0; i < 10; i++) {
			// eslint-disable-next-line no-await-in-loop
			ideaIds.add((await nextPracticeIdea()).id);
		}
		expect(ideaIds.size).toEqual(10);
	});
});

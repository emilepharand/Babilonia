import {getIdeaForAddingFromIdea} from 'server/model/ideas/ideaForAdding';
import * as ApiUtils from '../../utils/api-utils';
import {
	addAnyIdea,
	addInvalidIdeaAndTest,
	addMultipleInvalidIdeasAndTest,
	editInvalidIdeaAndTest,
	editMultipleInvalidIdeasAndTest,
	editValidIdeaAndTest,
	makeIdeaForAdding,
	testTransformExpressions,
} from './utils';

beforeEach(async () => {
	await ApiUtils.changeDatabaseToMemoryAndDeleteEverything();
});

describe('string validation and normalization', () => {
	test('whitespace', async () => {
		await testTransformExpressions(
			[' trim whitespace ', 'two  spaces  between  words', ' trim,		tab  and multiple   spaces '],
			['trim whitespace', 'two spaces between words', 'trim, tab and multiple spaces'],
		);
	});

	test('context', async () => {
		await testTransformExpressions(
			['to ( play ) a sport', 'to (  play) a (	sport)', 'to ( 	play   ) ( sport)'],
			['to (play) a sport', 'to (play) a (sport)', 'to (play) (sport)'],
		);
	});

	test('empty expression text', async () => {
		const emptyStrings = ['', ' ', '  ', '	'];
		await addMultipleInvalidIdeasAndTest(emptyStrings);
		await editMultipleInvalidIdeasAndTest(emptyStrings);
	});
});

describe('duplicates', () => {
	test('duplicate expressions within idea', async () => {
		// Adding
		await addInvalidIdeaAndTest(makeIdeaForAdding({
			ee: [{language: 'l', text: 'duplicate'}, {language: 'l', text: 'duplicate'}],
		}));
		await addInvalidIdeaAndTest(makeIdeaForAdding({
			ee: [{language: 'l2', text: 'to (play sport)'}, {language: 'l2', text: 'to ( play sport)'}],
		}));

		// Editing
		const idea = await addAnyIdea();
		const ideaForAdding = getIdeaForAddingFromIdea(idea);
		ideaForAdding.ee[1] = ideaForAdding.ee[0];
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);

		ideaForAdding.ee[0].text = 'to (play sport)';
		ideaForAdding.ee[1].text = 'to ( play sport)';
		await editInvalidIdeaAndTest(ideaForAdding, idea.id);
	});
});

describe('context', () => {
	test('parentheses (context)', async () => {
		const invalidExpressions = [
			// Double parenthesis
			'to ((play sport))',
			'to ( (play sport))',
			'to ( (play sport)',
			// Opening parenthesis before the first one is closed
			'to ((play) sport',
			'to (p(lay) sport',
			'(to (play)) sport',
			'to (play (sport))',
			'to (p(la)y) sport',
			// An expression that contains only context
			'(only context)',
			'  (only context) ',
			'(only) (context)',
			'()',
			// Unclosed opening parenthesis
			'to (play sport',
			'to (',
			'to ((play sport)',
			'(to play sport',
			'to (play) (sport',
			// Unmatched closing parenthesis
			'to play) sport',
			'to (play)) sport',
			'to (play) sport)',
			')(to play sport)',
			// Parentheses are not balanced
			'to )play( sport',
			'to )play( (sport',
			'to (play) )sport',
			')(',
			// Empty context content
			'to () sport',
			'to (  ) sport',
		];

		// Adding
		await addMultipleInvalidIdeasAndTest(invalidExpressions);

		// Editing
		await editMultipleInvalidIdeasAndTest(invalidExpressions);
	});
});

describe('id of expressions', () => {
	test('expression id changes only when effective expression is modified', async () => {
		const i = {
			ee: [{language: 'english', text: '(red) apple'}, {language: 'french', text: 'pomme (rouge)'}],
		};

		let ideaForAdding = await makeIdeaForAdding(i);
		let previousIdea = await ApiUtils.addIdea(ideaForAdding);
		let editedIdea = previousIdea;
		ideaForAdding = getIdeaForAddingFromIdea(previousIdea);

		async function editAndTest(id1ShouldBeModified: boolean, id2ShouldBeModified: boolean, swapped?: boolean) {
			if (swapped) {
				editedIdea = await editValidIdeaAndTest(editedIdea, ideaForAdding, [ideaForAdding.ee[1], ideaForAdding.ee[0]]);
			} else {
				editedIdea = await editValidIdeaAndTest(editedIdea, ideaForAdding);
			}
			function checkIdModification(index: number, shouldBeModified: boolean) {
				if (shouldBeModified) {
					expect(previousIdea.ee[index].id).not.toBe(editedIdea.ee[index].id);
				} else {
					expect(previousIdea.ee[index].id).toBe(editedIdea.ee[index].id);
				}
			}
			checkIdModification(0, id1ShouldBeModified);
			checkIdModification(1, id2ShouldBeModified);
			previousIdea = editedIdea;
		}

		function changeTexts(text1: string, text2: string) {
			ideaForAdding = getIdeaForAddingFromIdea(editedIdea);
			ideaForAdding.ee[0].text = text1;
			ideaForAdding.ee[1].text = text2;
		}

		changeTexts('(green) apple', 'pomme (verte)');
		await editAndTest(false, false);

		changeTexts('apple', 'pomme');
		await editAndTest(false, false);

		changeTexts('(yellow) apple', 'pomme (jaune)');
		await editAndTest(false, false);

		changeTexts('(yellow) potato', 'pomme (jaune)');
		await editAndTest(true, false);

		changeTexts('(yellow) potato', 'patate (jaune)');
		await editAndTest(false, true);

		changeTexts('tomato', 'tomate');
		await editAndTest(true, true);

		changeTexts('(a wonderful) tomato (that is red)', '(une merveilleuse) tomate (rouge)');
		await editAndTest(false, false);

		changeTexts('(a wonderful) tomato', '(une merveilleuse) tomate');
		await editAndTest(false, false);

		changeTexts('a wonderful tomato', 'une merveilleuse tomate');
		await editAndTest(true, true);

		changeTexts('(a) wonderful and delicious (tomato)', 'une (merveilleuse et délicieuse) tomate');
		await editAndTest(true, true);

		changeTexts('wonderful and delicious', 'une merveilleuse tomate');
		await editAndTest(false, true);

		changeTexts('wonderful (and) delicious', 'une (merveilleuse) tomate');
		await editAndTest(true, true);

		changeTexts('wonderful delicious', 'une tomate');
		await editAndTest(false, false);

		// Swap the expressions
		changeTexts('une tomate', 'wonderful delicious');
		const temp = ideaForAdding.ee[0].languageId;
		ideaForAdding.ee[0].languageId = ideaForAdding.ee[1].languageId;
		ideaForAdding.ee[1].languageId = temp;
		await editAndTest(false, false, true);

		// Swap only the expression texts (last edit returned ['wonderful delicious', 'une tomate'])
		changeTexts('une tomate', 'wonderful delicious');
		await editAndTest(true, true);

		// Change the language of the first expression
		ideaForAdding.ee[0].languageId = ideaForAdding.ee[1].languageId;
		await editAndTest(true, false);
	});
});

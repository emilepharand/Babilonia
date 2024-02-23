import {ExpressionForAdding} from '../../../../server/model/ideas/expression';
import {IdeaForAdding} from '../../../../server/model/ideas/ideaForAdding';
import {
	addLanguages, apiUrl, cyRequestPost, cyRequestPut, setSettings,
} from '../../cy-utils';
import {
	assertRowInputHasFocus,
	assertRowInputIsNotPracticeable,
	assertRowMatchIsFullMatch,
	assertRowMatchIsNeutral,
	getNextButton,
	typeInRow,
	waitForTableToLoad,
} from './utils';

context('Specific cases', () => {
	specify('Settings to practice only not known expressions', () => {
		const languages = addLanguages();
		const e1: ExpressionForAdding = {languageId: 1, text: 'bonjour', known: true};
		const e2: ExpressionForAdding = {languageId: 1, text: 'salut (mon) cher'};
		const e3: ExpressionForAdding = {languageId: 1, text: 'salut (mon) (bel) ami'};
		const e4: ExpressionForAdding = {languageId: 2, text: 'hello'};
		const e5: ExpressionForAdding = {languageId: 3, text: 'buenos días', known: true};
		const e6: ExpressionForAdding = {languageId: 4, text: 'buongiorno'};
		const e7: ExpressionForAdding = {languageId: 5, text: 'guten Tag'};
		const i1: IdeaForAdding = {ee: [e1, e2, e3, e4, e5, e6, e7]};
		cyRequestPost(`${apiUrl}/ideas`, i1);

		// Make some languages practiceable
		languages.forEach(l => {
			l.isPractice = true;
		});
		languages[1].isPractice = false;
		cyRequestPut(`${apiUrl}/languages`, languages);

		cy.get('#practice-link').click();

		waitForTableToLoad(7);

		assertRowMatchIsNeutral(1);
		assertRowMatchIsNeutral(4);

		setSettings({randomPractice: false, strictCharacters: false, practiceOnlyNotKnown: true});
		cy.then(() => {
			cy.reload();
		});

		waitForTableToLoad(7);

		assertRowInputIsNotPracticeable(1, 'bonjour');
		assertRowInputIsNotPracticeable(4, 'buenos días');
		assertRowInputHasFocus(2);

		typeInRow(2, '{downArrow}{downArrow}');
		assertRowInputHasFocus(5);
		typeInRow(5, '{downArrow}{downArrow}{downArrow}{downArrow}');
		assertRowInputHasFocus(2);
	});

	specify('Passive mode', () => {
		setSettings({passiveMode: false});

		const languages = addLanguages();
		const e1: ExpressionForAdding = {languageId: 1, text: 'bonjour', known: true};
		const e2: ExpressionForAdding = {languageId: 2, text: 'hello', known: true};
		const i1: IdeaForAdding = {ee: [e1, e2]};
		cyRequestPost(`${apiUrl}/ideas`, i1);

		// Make some languages practiceable
		languages.forEach(l => {
			l.isPractice = true;
		});
		languages[1].isPractice = false;
		cyRequestPut(`${apiUrl}/languages`, languages);

		cy.get('#practice-link').click();

		waitForTableToLoad(2);

		assertRowMatchIsNeutral(1);

		setSettings({passiveMode: true});
		cy.then(() => {
			cy.reload();
		});

		waitForTableToLoad(2);

		assertRowInputIsNotPracticeable(1, 'bonjour');
	});

	specify('When there is only one idea', () => {
		const languageNames = [
			'français',
			'english',
		];
		for (const languageName of languageNames) {
			cyRequestPost(`${apiUrl}/languages`, {name: languageName});
		}

		const e1: ExpressionForAdding = {languageId: 1, text: 'bonjour'};
		const e2: ExpressionForAdding = {languageId: 2, text: 'hello'};
		const i1: IdeaForAdding = {ee: [e1, e2]};
		cyRequestPost(`${apiUrl}/ideas`, i1);

		// Make some languages practiceable
		cyRequestPut(`${apiUrl}/languages`, [{
			id: 1, name: 'français', ordering: 0, isPractice: true,
		}, {
			id: 2, name: 'english', ordering: 1, isPractice: false,
		}]);

		cy.get('#practice-link').click();

		waitForTableToLoad(2);

		typeInRow(1, 'bonjour');
		assertRowMatchIsFullMatch(1, 'bonjour');
		getNextButton().click();
		assertRowMatchIsNeutral(1);
	});
});

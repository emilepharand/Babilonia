import {ExpressionForAdding} from '../../../../server/model/ideas/expression';
import {IdeaForAdding} from '../../../../server/model/ideas/ideaForAdding';
import {
	addLanguages,
	apiUrl,
	setSettings,
} from '../../cy-utils';
import {assertRowInputHasFocus, assertRowInputIsNotPracticeable, assertRowMatchIsFullMatch,
	assertRowMatchIsNeutral, getNextButton, typeInRow, waitForTableToLoad} from './utils';

beforeEach(() => {
	cy.request('DELETE', `${apiUrl}/everything`);
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('Specific cases', () => {
	specify('Settings to practice only not known expressions', () => {
		addLanguages();
		const e1: ExpressionForAdding = {languageId: 1, text: 'bonjour', known: true};
		const e2: ExpressionForAdding = {languageId: 1, text: 'salut (mon) cher'};
		const e3: ExpressionForAdding = {languageId: 1, text: 'salut (mon) (bel) ami'};
		const e4: ExpressionForAdding = {languageId: 2, text: 'hello'};
		const e5: ExpressionForAdding = {languageId: 3, text: 'buenos días', known: true};
		const e6: ExpressionForAdding = {languageId: 4, text: 'buongiorno'};
		const e7: ExpressionForAdding = {languageId: 5, text: 'guten Tag'};
		const i1: IdeaForAdding = {ee: [e1, e2, e3, e4, e5, e6, e7]};
		cy.request({
			url: `${apiUrl}/ideas`,
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: `${JSON.stringify(i1)}`,
		});

		// Make some languages practiceable
		const json
			= '[{"id":1,"name":"français","ordering":0,"isPractice":true},'
			+ '{"id":2,"name":"english","ordering":1,"isPractice":false},'
			+ '{"id":3,"name":"español","ordering":2,"isPractice":true},'
			+ '{"id":4,"name":"italiano","ordering":3,"isPractice":true},'
			+ '{"id":5,"name":"deutsch","ordering":4,"isPractice":true},'
			+ '{"id":6,"name":"português","ordering":5,"isPractice":true}]';
		cy.request({
			url: `${apiUrl}/languages`,
			method: 'PUT',
			headers: {'Content-Type': 'application/json'},
			body: `${json}`,
		});

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

		addLanguages();
		const e1: ExpressionForAdding = {languageId: 1, text: 'bonjour', known: true};
		const e2: ExpressionForAdding = {languageId: 2, text: 'hello', known: true};
		const i1: IdeaForAdding = {ee: [e1, e2]};
		cy.request({
			url: `${apiUrl}/ideas`,
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: `${JSON.stringify(i1)}`,
		});

		// Make some languages practiceable
		const json
			= '[{"id":1,"name":"français","ordering":0,"isPractice":true},'
			+ '{"id":2,"name":"english","ordering":1,"isPractice":false},'
			+ '{"id":3,"name":"español","ordering":2,"isPractice":true},'
			+ '{"id":4,"name":"italiano","ordering":3,"isPractice":true},'
			+ '{"id":5,"name":"deutsch","ordering":4,"isPractice":true},'
			+ '{"id":6,"name":"português","ordering":5,"isPractice":true}]';
		cy.request({
			url: `${apiUrl}/languages`,
			method: 'PUT',
			headers: {'Content-Type': 'application/json'},
			body: `${json}`,
		});

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
			cy.request({
				url: `${apiUrl}/languages`,
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: `{"name":"${languageName}"}`,
			});
		}

		const e1: ExpressionForAdding = {languageId: 1, text: 'bonjour'};
		const e2: ExpressionForAdding = {languageId: 2, text: 'hello'};
		const i1: IdeaForAdding = {ee: [e1, e2]};
		cy.request({
			url: `${apiUrl}/ideas`,
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: `${JSON.stringify(i1)}`,
		});

		// Make some languages practiceable
		const json
			= '[{"id":1,"name":"français","ordering":0,"isPractice":true},'
			+ '{"id":2,"name":"english","ordering":1,"isPractice":false}]';
		cy.request({
			url: `${apiUrl}/languages`,
			method: 'PUT',
			headers: {'Content-Type': 'application/json'},
			body: `${json}`,
		});

		cy.get('#practice-link').click();

		waitForTableToLoad(2);

		typeInRow(1, 'bonjour');
		assertRowMatchIsFullMatch(1, 'bonjour');
		getNextButton().click();
		assertRowMatchIsNeutral(1);
	});
});

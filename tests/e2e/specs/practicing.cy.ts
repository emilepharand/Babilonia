import {ExpressionForAdding} from '../../../server/model/ideas/expression';
import {IdeaForAdding} from '../../../server/model/ideas/ideaForAdding';
import {
	addIdeas,
	addLanguages,
	apiUrl,
	assertFetchIdeaReturnsStatus,
	setSettings,
} from '../cy-utils';

beforeEach(() => {
	cy.request('DELETE', `${apiUrl}/everything`);
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

function getRow(rowNbr: number) {
	return cy.get('#practice-table')
		.find('.practice-row')
		.eq(rowNbr);
}

function waitForTableToLoad(length: number) {
	cy.get('#practice-table')
		.find('.practice-row')
		.should('have.length', length);
}

function assertLanguageName(rowNbr: number, name: string) {
	getRow(rowNbr).find('.language-name').should('have.text', name);
}

context('Practicing', () => {
	specify('Practicing works', () => {
		// Idea 1: bonjour, hello, buenos días, buongiorno, guten Tag
		// Idea 2: salut, allô, hi, hey, HOLA éàíôüáéíóú, ciao, salve
		addIdeas();

		cy.get('#practice-link').click();

		waitForTableToLoad(5);

		assertLanguageName(0, 'français');
		assertLanguageName(1, 'english');
		assertLanguageName(2, 'español');
		assertLanguageName(3, 'italiano');
		assertLanguageName(4, 'deutsch');

		cy.get('#edit-idea-link')
			.should('have.attr', 'href')
			.and('include', '/ideas/1');

		getNextButton().should('not.have.class', 'btn-success');

		assertRowInputIsNotPracticeable(0, 'bonjour');

		assertRowInputHasFocus(1);

		// Match: nothing typed, no match, partial match, full match, and switching between all
		assertRowMatchIsNeutral(1);
		typeInRow(1, 'b');
		assertRowMatchIsNoMatch(1);
		typeInRow(1, '{backspace}');
		assertRowMatchIsNeutral(1);
		typeInRow(1, 'h');
		assertRowMatchIsPartialMatch(1);
		typeInRow(1, 'ell');
		assertRowMatchIsPartialMatch(1);
		typeInRow(1, 'w');
		assertRowMatchIsNoMatch(1);
		// Cannot input more letters when no match
		typeInRow(1, 'x');
		assertIsTyped(1, 'hellw');
		typeInRow(1, '{backspace}{backspace}{backspace}{backspace}{backspace}');
		assertRowMatchIsNeutral(1);
		typeInRow(1, 'hell');
		assertRowMatchIsPartialMatch(1);
		typeInRow(1, 'uu');
		// Cannot input more letters when no match (previous bug allowed this after backspaces)
		assertIsTyped(1, 'hellu');
		assertRowMatchIsNoMatch(1);
		typeInRow(1, '{backspace}{upArrow}{downArrow}o');
		assertRowMatchIsFullMatch(1, 'hello');

		getNextButton().should('not.have.class', 'btn-success');

		// Focus should now be on next row
		assertRowInputHasFocus(2);

		// Test up and down arrows
		typeInRow(2, '{downArrow}');
		assertRowInputHasFocus(3);
		typeInRow(3, '{downArrow}');
		assertRowInputHasFocus(4);
		typeInRow(4, '{downArrow}');
		assertRowInputHasFocus(2);
		// UpArrow must be last because it is not the usual direction so we need to make sure it's
		// not stuck in that direction the next time it changes focus
		typeInRow(2, '{upArrow}');
		assertRowInputHasFocus(4);

		// Test right and left arrows
		typeInRow(4, '{rightArrow}');
		getRowHintButton(4)
			.should('have.focus')
			.type('{rightArrow}');
		getRowShowButton(4)
			.should('have.focus')
			.type('{rightArrow}');
		getRowKnownButton(4)
			.should('have.focus')
			.type('{rightArrow}')
			.should('have.focus')
			.type('{leftArrow}');
		getRowShowButton(4)
			.should('have.focus')
			.type('{leftArrow}');
		getRowHintButton(4)
			.should('have.focus')
			.type('{leftArrow}');
		getRowInput(4)
			.should('have.focus')
			.type('{leftArrow}')
			.should('have.focus');

		// Test hinting
		assertRowMatchIsNeutral(4);
		for (let i = 0; i < 2; i++) {
			hint(4);
			assertRowInputHasFocus(4);
			assertRowMatchIsPartialMatch(4);
			assertIsTyped(4, 'guten Tag'.substring(0, i + 1));
		}
		typeInRow(4, 'ten');
		assertIsTyped(4, 'guten');
		typeInRow(4, '{rightArrow}');
		getRowHintButton(4).should('have.focus').click();
		assertRowInputHasFocus(4);
		assertIsTyped(4, 'guten T');
		assertRowMatchIsPartialMatch(4);
		typeInRow(4, 'a');
		assertIsTyped(4, 'guten Ta');
		assertRowMatchIsPartialMatch(4);
		hint(4);
		assertRowMatchIsFullMatch(4, 'guten Tag');
		assertRowInputHasFocus(2);

		getNextButton().should('not.have.class', 'btn-success');

		// Test showing
		show(2);
		assertRowMatchIsFullMatch(2, 'buenos días');
		assertRowInputHasFocus(3);
		typeInRow(3, 'b');
		assertRowMatchIsPartialMatch(3);
		show(3);
		assertRowMatchIsFullMatch(3, 'buongiorno');

		getNextButton().should('have.class', 'btn-success');
		getNextButton().should('have.focus');

		getResetButton().click();

		getNextButton().should('not.have.class', 'btn-success');

		assertRowInputHasFocus(1);

		assertRowMatchIsNeutral(1);
		assertRowMatchIsNeutral(2);
		assertRowMatchIsNeutral(3);
		assertRowMatchIsNeutral(4);

		// Show should only focus next row if its row was focused
		show(2);
		assertRowInputHasFocus(1);
		typeInRow(1, '{downArrow}');
		// Should skip fully matched row
		assertRowInputHasFocus(3);
		typeInRow(3, '{upArrow}');
		assertRowInputHasFocus(1);
		show(1);
		assertRowInputHasFocus(3);
		show(4);
		assertRowInputHasFocus(3);
		typeInRow(3, '{upArrow}');
		assertRowInputHasFocus(3);
		typeInRow(3, '{downArrow}');
		assertRowInputHasFocus(3);
		show(3);

		getNextButton().should('have.class', 'btn-success');
		getNextButton().should('have.focus');

		getNextButton().click();

		// Wait for table to load
		waitForTableToLoad(8);

		assertLanguageName(0, 'français');
		assertLanguageName(1, 'français');
		assertLanguageName(2, 'english');
		assertLanguageName(3, 'english');
		assertLanguageName(4, 'español');
		assertLanguageName(5, 'italiano');
		assertLanguageName(6, 'italiano');
		assertLanguageName(7, 'deutsch');

		assertRowInputHasFocus(2);

		// Character mapping (strict enabled)
		typeInRow(4, 'hola EAIOUAEIOU');
		assertRowMatchIsFullMatch(4, 'HOLA éàíôüáéíóú');

		getResetButton().click();

		// Character mapping (strict disabled)
		setSettings({randomPractice: false, strictCharacters: true, practiceOnlyNotKnown: false});
		cy.then(() => {
			cy.reload();
		});
		waitForTableToLoad(5);
		getNextButton().click();
		waitForTableToLoad(8);
		typeInRow(4, 'hola EAIOUAEIOU');
		assertIsTyped(4, 'h');
		assertRowMatchIsNoMatch(4);
		typeInRow(4, '{backspace}HOLA éàíôüáéíóú');
		assertRowMatchIsFullMatch(4, 'HOLA éàíôüáéíóú');

		getRowKnownButton(2)
			.should('not.be.checked')
			.click()
			.should('be.checked')
			.click()
			.should('not.be.checked')
			.type('{enter}')
			.should('be.checked')
			.type('{enter}')
			.should('not.be.checked');
		cy.get('.expression-known-wrapper')
			.eq(2)
			.click();
		getRowKnownButton(2)
			.should('be.checked');
		cy.get('.expression-known-wrapper')
			.eq(2)
			.click();
		getRowKnownButton(2)
			.should('not.be.checked');
		typeInRow(3, '{rightArrow}{rightArrow}{rightArrow}');
		getRowKnownButton(3)
			.should('have.focus')
			.should('not.be.checked')
			.type('{enter}')
			.should('be.checked');

		assertFetchIdeaReturnsStatus(2, 200, ['"known":true']);
	});

	specify('Settings to practice only not know expressions', () => {
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
		typeInRow(5, '{downArrow}{downArrow}');
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

context('Context', () => {
	specify('Context works', () => {
		addLanguages();
		const e1: ExpressionForAdding = {languageId: 1, text: '(bien le) bonjour (à vous)'};
		const e2: ExpressionForAdding = {languageId: 1, text: 'salut (mon) cher'};
		const e3: ExpressionForAdding = {languageId: 1, text: 'salut (mon) (bel) ami'};
		const e4: ExpressionForAdding = {languageId: 2, text: 'hello'};
		const e5: ExpressionForAdding = {languageId: 3, text: 'buenos días'};
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

		// Context at beginning of expression is shown
		assertIsTyped(1, '(bien le) ');
		assertRowMatchIsPartialMatch(1);

		// Start to type
		typeInRow(1, 'b');
		assertIsTyped(1, '(bien le) b');

		// Complete
		assertRowMatchIsPartialMatch(1);
		typeInRow(1, 'onjour');
		assertRowMatchIsFullMatch(1, '(bien le) bonjour (à vous)');

		// Context appears
		typeInRow(2, 'salu');
		assertIsTyped(2, 'salu');
		typeInRow(2, 't');
		assertIsTyped(2, 'salut (mon) ');
		assertRowMatchIsPartialMatch(2);

		// Don't have to type space
		typeInRow(2, 'c');
		assertIsTyped(2, 'salut (mon) c');
		assertRowMatchIsPartialMatch(2);

		// Complete
		assertRowMatchIsPartialMatch(2);
		typeInRow(2, 'her');
		assertRowMatchIsFullMatch(2, 'salut (mon) cher');

		// Two contexts in a row
		typeInRow(3, 'salut');
		assertIsTyped(3, 'salut (mon) (bel) ');
		assertRowMatchIsPartialMatch(3);
		typeInRow(3, 'ami');
		assertRowMatchIsFullMatch(3, 'salut (mon) (bel) ami');

		getResetButton().click();

		// Hinting
		getRowHintButton(1).click();
		assertIsTyped(1, '(bien le) b');
		assertRowMatchIsPartialMatch(1);
		typeInRow(1, 'onjou');
		assertIsTyped(1, '(bien le) bonjou');
		assertRowMatchIsPartialMatch(1);
		getRowHintButton(1).click();
		assertRowMatchIsFullMatch(1, '(bien le) bonjour (à vous)');

		typeInRow(2, 'salu');
		getRowHintButton(2).click();
		assertIsTyped(2, 'salut (mon) ');
		getRowHintButton(2).click();
		assertIsTyped(2, 'salut (mon) c');
		getRowShowButton(2).click();
		assertRowMatchIsFullMatch(2, 'salut (mon) cher');

		typeInRow(3, 'salu');
		getRowHintButton(3).click();
		assertIsTyped(3, 'salut (mon) (bel) ');
		getRowHintButton(3).click();
		assertIsTyped(3, 'salut (mon) (bel) a');
		getRowShowButton(3).click();
		assertRowMatchIsFullMatch(3, 'salut (mon) (bel) ami');
	});
});

function hint(rowNbr: number) {
	getRowHintButton(rowNbr).click();
}

function getRowHintButton(rowNbr: number) {
	return getRow(rowNbr).find('.hint-button');
}

function getRowKnownButton(rowNbr: number) {
	return getRow(rowNbr).find('.expression-known-checkbox');
}

function getNextButton() {
	return cy.get('.next-button');
}

function getResetButton() {
	return cy.get('.reset-button');
}

function getRowShowButton(rowNbr: number) {
	return getRow(rowNbr).find('.show-button');
}

function show(rowNbr: number) {
	getRowShowButton(rowNbr).click();
}

function assertRowInputHasFocus(rowNbr: number) {
	getRowInput(rowNbr).should('have.focus');
}

function getRowInput(rowNbr: number) {
	return getRow(rowNbr).find('.expression-input');
}

function assertIsTyped(rowNbr: number, typed: string) {
	getRowInput(rowNbr).should('have.value', typed);
}

function typeInRow(rowNbr: number, toType: string) {
	getRow(rowNbr)
		.within(() => {
			cy.get('.expression-input').type(toType);
		});
}

function assertRowInputIsNotPracticeable(rowNbr: number, typed: string) {
	getRowInput(rowNbr)
		.should('not.have.class', 'neutral')
		.should('not.have.class', 'no-match')
		.should('not.have.class', 'partial-match')
		.should('not.have.class', 'full-match')
		.should('be.disabled')
		.should('have.value', typed);
	assertButtonsAreDisabled(rowNbr);
}

function assertRowMatchIsNeutral(rowNbr: number) {
	getRowInput(rowNbr)
		.should('have.class', 'neutral')
		.should('not.have.class', 'no-match')
		.should('not.have.class', 'partial-match')
		.should('not.have.class', 'full-match')
		.should('not.be.disabled');
	assertButtonsAreNotDisabled(rowNbr);
}

function assertRowMatchIsNoMatch(rowNbr: number) {
	getRowInput(rowNbr)
		.should('not.have.class', 'neutral')
		.should('have.class', 'no-match')
		.should('not.have.class', 'partial-match')
		.should('not.have.class', 'full-match');
	assertButtonsAreNotDisabled(rowNbr);
}

function assertButtonsAreDisabled(rowNbr: number) {
	getRowHintButton(rowNbr).should('be.disabled');
	getRowShowButton(rowNbr).should('be.disabled');
}

function assertButtonsAreNotDisabled(rowNbr: number) {
	getRowHintButton(rowNbr).should('not.be.disabled');
	getRowShowButton(rowNbr).should('not.be.disabled');
}

function assertRowMatchIsPartialMatch(rowNbr: number) {
	getRowInput(rowNbr)
		.should('not.have.class', 'neutral')
		.should('not.have.class', 'no-match')
		.should('have.class', 'partial-match')
		.should('not.have.class', 'full-match')
		.should('not.be.disabled');
	assertButtonsAreNotDisabled(rowNbr);
}

function assertRowMatchIsFullMatch(rowNbr: number, typed: string) {
	getRowInput(rowNbr)
		.should('not.have.class', 'neutral')
		.should('not.have.class', 'no-match')
		.should('not.have.class', 'partial-match')
		.should('have.class', 'full-match')
		.should('be.disabled');
	assertIsTyped(rowNbr, typed);
	assertButtonsAreDisabled(rowNbr);
}

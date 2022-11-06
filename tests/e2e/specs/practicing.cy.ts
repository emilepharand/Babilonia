import {addIdeas, addLanguages, apiUrl, setSettings} from '../cy-utils';
import {ExpressionForAdding} from '../../../server/model/ideas/expression';
import {IdeaForAdding} from '../../../server/model/ideas/ideaForAdding';

before(() => {
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
			.type('{rightArrow}')
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
		setSettings({randomPractice: false, strictCharacters: true});
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
	});
});

context.only('Context', () => {
	specify('Context works', () => {
		addLanguages();
		const e1: ExpressionForAdding = {languageId: 1, text: '(bien le) bonjour (à vous)'};
		const e2: ExpressionForAdding = {languageId: 1, text: 'salut (mon) cher'};
		const e3: ExpressionForAdding = {languageId: 2, text: 'hello'};
		const e4: ExpressionForAdding = {languageId: 3, text: 'buenos días'};
		const e5: ExpressionForAdding = {languageId: 4, text: 'buongiorno'};
		const e6: ExpressionForAdding = {languageId: 5, text: 'guten Tag'};
		const i1: IdeaForAdding = {ee: [e1, e2, e3, e4, e5, e6]};
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

		waitForTableToLoad(5);

		// Context at beginning of expression is shown
		assertIsTyped(0, '(bien le)');
		assertRowMatchIsNeutral(0);

		// Start to type
		typeInRow(0, 'b');
		assertIsTyped(0, '(bien le) b');

		// Complete
		assertRowMatchIsPartialMatch(0);
		typeInRow(0, 'bonjour');
		assertRowMatchIsFullMatch(0, '(bien le) bonjour (à vous)');

		// Context appears
		typeInRow(1, 'salu');
		assertIsTyped(1, 'salu');
		typeInRow(1, 't');
		assertIsTyped(1, 'salut (mon)');
		assertRowMatchIsPartialMatch(1);

		// Don't have to type space
		typeInRow(1, 'c');
		assertIsTyped(1, 'salut (mon) c');
		assertRowMatchIsPartialMatch(1);

		// Complete
		assertRowMatchIsPartialMatch(1);
		typeInRow(1, 'her');
		assertRowMatchIsFullMatch(1, 'salut (mon) cher');
	});
});

function hint(rowNbr: number) {
	getRowHintButton(rowNbr).click();
}

function getRowHintButton(rowNbr: number) {
	return getRow(rowNbr).find('.hint-button');
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

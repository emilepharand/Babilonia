import {addIdeas, assertFetchIdeaReturnsStatus, setSettings} from '../../cy-utils';
import {
	assertIsTyped,
	assertLanguageName,
	assertRowInputHasFocus,
	assertRowInputIsNotPracticeable,
	assertRowMatchIsFullMatch,
	assertRowMatchIsNeutral,
	assertRowMatchIsNoMatch,
	assertRowMatchIsPartialMatch,
	getEditButton,
	getNextButton,
	getResetButton,
	getRowHintButton,
	getRowInput,
	getRowKnownButton,
	getRowShowButton,
	hint,
	show,
	typeInRow,
	waitForTableToLoad,
} from './utils';

context('Interation on the practice page', () => {
	specify('Typing, hinting, showing, and navigating', () => {
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
		getNextButton()
			.should('be.focused')
			.type('{downArrow}');
		getEditButton()
			.should('be.focused')
			.type('{upArrow}');
		getNextButton()
			.should('be.focused')
			.type('{leftArrow}');
		getResetButton()
			.should('be.focused')
			.type('{rightArrow}');
		getNextButton()
			.should('be.focused')
			.type('{upArrow}');
		assertRowInputHasFocus(4);
		typeInRow(4, '{downArrow}');
		getNextButton()
			.should('be.focused')
			.type('{downArrow}');
		getEditButton()
			.should('be.focused')
			.type('{downArrow}');
		assertRowInputHasFocus(2);
		// UpArrow must be last because it is not the usual direction so we need to make sure it's
		// not stuck in that direction the next time it changes focus
		typeInRow(2, '{upArrow}');
		getEditButton()
			.should('be.focused')
			.type('{upArrow}{upArrow}{upArrow}');

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
		getEditButton().should('be.focused').type('{downArrow}');
		assertRowInputHasFocus(3);
		typeInRow(3, '{downArrow}');
		getNextButton().should('be.focused').type('{upArrow}');
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
});

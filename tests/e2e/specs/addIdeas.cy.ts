import {
	addLanguages,
	apiUrl,
	assertAllInputsEmpty,
	assertExpressionHasValues,
	assertExpressionIsKnown,
	assertFetchIdeaReturnsStatus,
	getAddRowsButton,
	getExpressionTextInputRow,
	getKnownExpressionCheckbox,
	getLanguageSelect,
	getSaveButton,
	inputExpression,
	toggleExpressionKnown,
} from '../cy-utils';

context('The idea page', () => {
	beforeEach(() => {
		addLanguages();
	});
	specify('Adding ideas', () => {
		// Idea 1 doesn't exist
		assertFetchIdeaReturnsStatus(1, 404);

		// Navigate
		cy.get('#add-ideas-link').click();

		// No expressions have been entered, this should show an error
		cy.get('#save-idea').click();
		cy.get('#error-text').should('contain.text', 'Empty');

		// Invalid parenthesis context
		inputExpression(0, 'english', 'to (play sport');
		cy.get('#save-idea').click();
		cy.get('#error-text').should('contain.text', 'context');

		// Duplicate expressions
		inputExpression(0, 'english', 'hi');
		inputExpression(1, 'english', 'hi');
		cy.get('#save-idea').click();
		cy.get('#error-text').should('contain.text', 'identical');

		assertFetchIdeaReturnsStatus(1, 404);

		// Enter expressions
		const ee = [['français', 'bonjour'],
			['english', 'hello'],
			['español', 'buenos días'],
			['italiano', 'buongiorno'],
			['deutsch', 'guten Tag']];
		ee.forEach((e, i) => inputExpression(i, e[0], e[1]));

		cy.intercept('POST', `${apiUrl}/ideas`).as('saveIdea');

		// Click save
		cy.get('#save-idea').click();

		cy.wait('@saveIdea').its('response.statusCode').should('eq', 201);

		cy.get('#error-text').should('not.be.visible');

		// Idea 1 was created (testing a sample of expressions)
		assertFetchIdeaReturnsStatus(1, 200, ['guten Tag', 'bonjour', 'buenos días']);

		// All inputs are emptied
		assertAllInputsEmpty();

		// Idea 2 doesn't exist
		assertFetchIdeaReturnsStatus(2, 404);

		// Enter expressions
		ee.forEach((e, i) => inputExpression(i, e[0], e[1]));

		// Add more rows
		cy.get('#add-rows').click();

		// There are now 10 rows
		cy.get('#ideas').find('.expression').should('have.length', 10);

		// Add more rows
		cy.get('#add-rows').click();

		// There are now 15 rows
		cy.get('#ideas').find('.expression').should('have.length', 15);

		// Adding rows did not remove previous expressions
		ee.forEach((e, i) => {
			assertExpressionHasValues(i, e[0], e[1]);
		});

		// Leaving gaps
		inputExpression(7, 'français', 'salut');
		inputExpression(9, 'english', 'hi');
		inputExpression(11, 'português', 'bom dia');
		inputExpression(12, 'français', 'toto');

		// Click save
		cy.get('#save-idea').click();

		cy.wait('@saveIdea').its('response.statusCode').should('eq', 201);

		// Idea 2 was created (testing a sample of expressions)
		assertFetchIdeaReturnsStatus(2, 200, ['toto', 'bom dia', 'hi', 'salut', 'bonjour', 'guten Tag']);

		// All inputs are emptied
		assertAllInputsEmpty();

		// There are still 15 rows
		cy.get('#ideas').find('.expression').should('have.length', 15);

		const expectedLanguages = ee.map(e => e[0]);
		expectedLanguages.push('français', 'français', 'français', 'français', 'english', 'français', 'português', 'français');

		// Check languages stayed the same
		expectedLanguages.forEach((_, i) => {
			assertExpressionHasValues(i, expectedLanguages[i], '');
		});
	});

	specify('Interactivity', () => {
		cy.get('#add-ideas-link').click();

		// First row
		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('{rightArrow}');
		getKnownExpressionCheckbox(0)
			.should('be.focused')
			.type('{leftArrow}');
		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('{leftArrow}');
		getLanguageSelect(0)
			.should('be.focused')
			.type('{rightArrow}');
		getExpressionTextInputRow(0)
			.should('be.focused');

		// Second row
		getExpressionTextInputRow(0)
			.type('{downArrow}');
		getExpressionTextInputRow(1)
			.should('be.focused')
			.type('{rightArrow}');
		getKnownExpressionCheckbox(1)
			.should('be.focused')
			.type('{leftArrow}');
		getExpressionTextInputRow(1)
			.should('be.focused')
			.type('{leftArrow}');
		getLanguageSelect(1)
			.should('be.focused')
			.type('{rightArrow}');
		getExpressionTextInputRow(1)
			.should('be.focused')
			.type('{rightArrow}');

		// Known expression toggle
		getKnownExpressionCheckbox(1)
			.should('be.focused')
			.type('{enter}')
			.should('be.checked')
			.type('{enter}')
			.should('not.be.checked');
		cy.get('.expression-known-wrapper')
			.eq(1)
			.click();
		getKnownExpressionCheckbox(1)
			.should('be.checked');
		cy.get('.expression-known-wrapper')
			.eq(1)
			.click();
		getKnownExpressionCheckbox(1)
			.should('not.be.checked')
			.type('{downArrow}{downArrow}{downArrow}');
		getKnownExpressionCheckbox(4)
			.should('be.focused')
			.type('{downArrow}');
		getKnownExpressionCheckbox(0)
			.should('be.focused')
			.type('{upArrow}');
		getKnownExpressionCheckbox(4)
			.should('be.focused')
			.type('{upArrow}');
		getKnownExpressionCheckbox(3)
			.should('be.focused')
			.type('{downArrow}');
		getKnownExpressionCheckbox(4)
			.should('be.focused')
			.type('{downArrow}');
		getKnownExpressionCheckbox(0)
			.should('be.focused')
			.type('{leftArrow}');

		// Inputs and buttons
		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('{downArrow}');
		getExpressionTextInputRow(1)
			.should('be.focused')
			.type('{downArrow}{downArrow}{downArrow}{downArrow}');
		getAddRowsButton()
			.should('be.focused')
			.type('{downArrow}');
		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('{upArrow}');
		getAddRowsButton()
			.should('be.focused')
			.type('{upArrow}');
		getExpressionTextInputRow(4)
			.should('be.focused')
			.type('{downArrow}');
		getAddRowsButton()
			.should('be.focused')
			.type('{rightArrow}');
		getSaveButton()
			.should('be.focused')
			.type('{downArrow}');
		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('{upArrow}');
		getSaveButton()
			.should('be.focused')
			.type('{leftArrow}');
		getAddRowsButton()
			.should('be.focused')
			.type('{rightArrow}');
		getSaveButton()
			.should('be.focused')
			.type('{downArrow}');
		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('{upArrow}');
		getSaveButton()
			.should('be.focused')
			.type('{upArrow}');
		getExpressionTextInputRow(4)
			.should('be.focused')
			.type('{downArrow}{downArrow}{downArrow}{downArrow}{downArrow}{downArrow}{downArrow}');
		getSaveButton()
			.should('be.focused')
			.type('{leftArrow}');
		getAddRowsButton()
			.should('be.focused')
			.type('{downArrow}{downArrow}{downArrow}{downArrow}{downArrow}{downArrow}');
		getAddRowsButton()
			.should('be.focused')
			.click();
		getExpressionTextInputRow(0)
			.should('be.focused');
		cy.get('#ideas')
			.find('.expression')
			.should('have.length', 10);
		for (let i = 0; i < 10; i++) {
			getExpressionTextInputRow(i)
				.should('have.focus')
				.type('{downArrow}');
		}

		cy.reload();

		// Add rows + more tests
		cy.get('#ideas')
			.find('.expression')
			.should('have.length', 5);
		getExpressionTextInputRow(0)
			.should('be.focused')
			.type('bonjour');
		getAddRowsButton()
			.click();
		cy.get('#ideas')
			.find('.expression')
			.should('have.length', 10);
		getExpressionTextInputRow(1)
			.should('be.focused')
			.type('hello')
			.type('{upArrow}');
		getExpressionTextInputRow(0)
			.should('be.focused')
			.clear()
			.type('{downArrow}{downArrow}');
		getExpressionTextInputRow(2)
			.should('be.focused');
		getAddRowsButton()
			.click();
		cy.get('#ideas')
			.find('.expression')
			.should('have.length', 15);
		getExpressionTextInputRow(0)
			.should('be.focused');
	});

	specify('Known expressions', () => {
		cy.get('#add-ideas-link').click();

		inputExpression(0, 'français', 'bonjour');
		inputExpression(1, 'english', 'hello');

		toggleExpressionKnown(0);

		cy.get('#save-idea').click();

		assertFetchIdeaReturnsStatus(1, 200, ['"known":true', '"known":false']);

		cy.get('.expression-known-checkbox').each(e => cy.wrap(e).should('not.be.checked'));

		cy.visit('/').visit('/ideas/1');

		assertExpressionIsKnown(0, true);
		assertExpressionIsKnown(1, false);
	});
});

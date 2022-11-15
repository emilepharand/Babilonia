import {
	addLanguages,
	apiUrl,
	assertExpressionHasValues,
	assertExpressionIsKnown,
	assertFetchIdeaReturnsStatus,
	inputExpression,
	toggleExpressionKnown,
} from '../cy-utils';

beforeEach(() => {
	cy.request('DELETE', `${apiUrl}/everything`);
	// This is important to go to the webpage but also to register spy to fail on console errors
	addLanguages();
	cy.visit('/');
});

context('The idea page', () => {
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

		// Click save
		cy.get('#save-idea').click();

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

	specify('Known expressions', () => {
		cy.get('#add-ideas-link').click();

		inputExpression(0, 'français', 'bonjour');
		inputExpression(1, 'english', 'hello');

		toggleExpressionKnown(0);

		cy.get('#save-idea').click();

		assertFetchIdeaReturnsStatus(1, 200, ['"known":true', '"known":false']);

		cy.visit('/').visit('/ideas/1');

		assertExpressionIsKnown(0, true);
		assertExpressionIsKnown(1, false);
	});
});

function assertAllInputsEmpty() {
	cy.get('.expression-text').each(e => cy.wrap(e).should('have.value', ''));
}

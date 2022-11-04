import {
	addIdeas,
	apiUrl,
	assertExpressionHasValues,
	assertFetchIdeaReturnsStatus,
	inputExpression,
} from '../cy-utils';

before(() => {
	cy.request('DELETE', `${apiUrl}/everything`);
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('The idea page', () => {
	specify('Editing ideas', () => {
		addIdeas();

		cy.visit('/ideas/100');
		cy.contains('not found');
		cy.get('button').should('not.be.visible');

		cy.visit('/ideas/1');

		waitForTableToLoad(5);

		assertFetchIdeaReturnsStatus(1, 200, ['bonjour']);

		// Test editing an idea works
		inputExpression(0, 'deutsch', 'was');
		cy.get('#edit-button').click();
		assertFetchIdeaReturnsStatus(1, 200, ['was']);

		waitForTableToLoad(5);

		// Expressions should be reordered
		assertExpressionHasValues(0, 'english', 'hello');
		assertExpressionHasValues(3, 'deutsch', 'was');

		cy.get('#add-rows').click();

		cy.get('#ideas').find('.expression').should('have.length', 10);

		// Expressions should not change
		assertExpressionHasValues(3, 'deutsch', 'was');

		// Empty idea (not valid)
		for (let i = 0; i < 5; i++) {
			inputExpression(i, 'deutsch', '');
		}
		cy.get('#edit-button').click();
		cy.get('#error-text').should('contain.text', 'Empty');

		// Invalid parenthesis context
		inputExpression(3, 'english', 'to play sport)');
		cy.get('#edit-button').click();
		cy.get('#error-text').should('contain.text', 'context');

		assertFetchIdeaReturnsStatus(1, 200, ['hello']);

		// Test delete
		cy.get('#confirm-delete-modal').should('not.be.visible');
		cy.get('#delete-button').click();
		cy.get('#confirm-delete-modal').should('be.visible');
		cy.get('#modal-delete-button').click();

		assertFetchIdeaReturnsStatus(1, 404, []);
	});
});

function waitForTableToLoad(length: number) {
	cy.get('#ideas')
		.find('.expression')
		.should('have.length', length);
}

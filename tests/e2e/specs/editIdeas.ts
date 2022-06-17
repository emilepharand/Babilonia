import {
	addIdeas,
	assertFetchIdeaReturnsStatus,
	inputExpression,
} from '../cy-utils';

before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('The idea page', () => {
	specify('Editing ideas', () => {
		addIdeas();

		cy.visit('/ideas/100');
		cy.contains('not found');
		cy.get('button').should('not.exist');

		cy.visit('/ideas/1');

		assertFetchIdeaReturnsStatus(1, 200, ['bonjour']);

		// Test editing an idea works
		inputExpression(0, 'deutsch', 'mutter');
		cy.get('#edit-button').click();
		assertFetchIdeaReturnsStatus(1, 200, ['mutter']);
	});
});

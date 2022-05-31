import {addIdeas} from '../cy-utils';

before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('Search', () => {
	specify('Searching works', () => {
		addIdeas();

		cy.get('#search-ideas-link').click();
	});
});

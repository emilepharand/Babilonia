import * as cyutils from '../cy-utils';

before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('Practicing', () => {
	specify('Practicing works', () => {
		cyutils.addIdeas();
	});
});

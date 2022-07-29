import * as cyutils from '../cy-utils';

before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('Practicing', () => {
	specify('Practicing works', () => {
		cyutils.addIdeas();

		cy.reload();

		cy.get('.dashboard-row')
			.should('have.length', 5);

		cy.get('.dashboard-row').eq(0)
			.should('contain', 'français')
			.should('contain', '2');
		cy.get('.dashboard-row').eq(1)
			.should('contain', 'english')
			.should('contain', '2');
		cy.get('.dashboard-row').eq(2)
			.should('contain', 'español')
			.should('contain', '2');
		cy.get('.dashboard-row').eq(3)
			.should('contain', 'italiano')
			.should('contain', '2');
		cy.get('.dashboard-row').eq(4)
			.should('contain', 'deutsch')
			.should('contain', '2');
	});
});

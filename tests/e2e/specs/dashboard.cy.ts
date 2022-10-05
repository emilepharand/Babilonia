import * as cyutils from '../cy-utils';
import {apiUrl} from '../cy-utils';

before(() => {
	cy.request('DELETE', `${apiUrl}/everything`);
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('Dashboard page', () => {
	specify('Stats display correctly', () => {
		cyutils.addIdeasDifferentSet();

		cy.reload();

		cy.get('.dashboard-row')
			.should('have.length', 6);

		cy.get('.dashboard-row').eq(0)
			.should('contain', 'français')
			.should('contain', '3');
		cy.get('.dashboard-row').eq(1)
			.should('contain', 'english')
			.should('contain', '3');
		cy.get('.dashboard-row').eq(2)
			.should('contain', 'español')
			.should('contain', '3');
		cy.get('.dashboard-row').eq(3)
			.should('contain', 'italiano')
			.should('contain', '1');
		cy.get('.dashboard-row').eq(4)
			.should('contain', 'deutsch')
			.should('contain', '2');
		cy.get('.dashboard-row').eq(5)
			.should('contain', 'português')
			.should('contain', '2');
	});
});

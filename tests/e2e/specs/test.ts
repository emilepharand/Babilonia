before(() => cy.visit('/'));

describe('When database is empty', () => {
	it('Displays dashboard correctly', () => {
		cy.get('#dashboard-link').click();
		cy.contains('No ideas')
			.should('not.contain.text', 'can express');
	});
	it('Displays practice page correctly', () => {
		cy.get('#practice-link').click();
		cy.contains('No ideas');
		cy.get('button').should('not.exist');
	});
});

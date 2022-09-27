before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

describe('When database is empty', () => {
	it('Displays dashboard correctly', () => {
		cy.get('#dashboard-link').click();
		cy.contains('No ideas');
		cy.should('not.have.text', 'can express');
	});
	it('Displays practice page correctly', () => {
		cy.get('#practice-link').click();
		cy.contains('No ideas');
		cy.get('button').should('not.exist');
	});
	it('Displays add ideas page correctly', () => {
		cy.get('#add-ideas-link').click();
		cy.contains('No language');
		cy.get('button').should('not.exist');
	});
	it('Displays search ideas page correctly', () => {
		cy.get('#search-ideas-link').click();
	});
	it('Displays languages page correctly', () => {
		cy.get('#languages-link').click();
		// There are no languages to edit
		cy.get('.edit-languages-block').should('not.exist');
		cy.get('.view')
			.should('not.contain', 'Edit')
			.should('not.contain', 'Save');
	});
	it('Displays settings page correctly', () => {
		cy.get('#settings-link').click();
	});
	it('Displays help page correctly', () => {
		cy.get('#help-link').click();
	});
});

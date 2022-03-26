before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('The language page', () => {
	specify('Adding languages works and the page updates', () => {
		cy.get('#languages-link').click();
		// Add three languages
		for (let i = 0; i < 3; i++) {
			const languageName = `Language ${i}`;
			// Add language
			cy.get('#new-language-name').type(languageName);
			cy.get('#add-language-button').click();
			// Check that language table has updated
			cy.get('.languages-table')
				.find('.language-row').should('have.length', i + 1);
			// Name
			cy.get('.languages-table')
				.find('.language-row')
				.eq(i)
				.find('.language-name')
				.should('have.value', languageName);
			// Ordering (default is last available)
			cy.get('.languages-table')
				.find('.language-row')
				.eq(i)
				.find('.language-ordering')
				.should('have.value', i);
			// Practice (default is false)
			cy.get('.languages-table')
				.find('.language-row')
				.eq(i)
				.find('.language-is-practice')
				.should('not.be.checked');
		}
	});

	specify('Editing languages works and the page updates', () => {
		// Edit languages configuration
		for (let i = 0; i < 3; i++) {
			const languageName = `Modified language ${i}`;
			// New name
			cy.get('.languages-table')
				.find('.language-row')
				.eq(i)
				.find('.language-name')
				.clear()
				.type(languageName);
			// New ordering
			cy.get('.languages-table')
				.find('.language-ordering')
				.eq(i)
				.clear()
				.type(`${2 - i}`);
			// New practice
			cy.get('.languages-table')
				.find('.language-is-practice')
				.eq(i)
				.check();
		}
		cy.get('#save-languages-button').click();
	});
});

before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('The language page', () => {
	specify('Adding languages works and the page updates upon adding', () => {
		cy.get('#languages-link').click();
		for (let i = 0; i < 3; i++) {
			const languageName = `Language ${i}`;
			cy.get('#new-language-name')
				.type(languageName);
			cy.get('#add-language-button')
				.click();
			cy.get('.languages-table')
				.find('.language-row')
				.should('have.length', i + 1);
			// Cy.get('.languages-table')
			// 	.find('.language-row')
			// 	.eq(i)
			// 	.get('.language-name')
			// 	.should('have.value', languageName);
		}
	});
});

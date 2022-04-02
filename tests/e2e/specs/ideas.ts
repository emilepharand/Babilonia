before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	const languageNames = ['français', 'english', 'español', 'italiano', 'deutsch', 'português'];
	for (const languageName of languageNames) {
		cy.request({
			url: 'http://localhost:5555/languages',
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: `{"name":"${languageName}"}`,
		});
	}
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('The idea page', () => {
	specify('Adding idea works and the page updates', async () => {
		assertFetchIdeaReturnsStatus(1, 404);
		cy.get('#add-ideas-link').click();
		inputExpression(0, 'français', 'bonjour');
		inputExpression(1, 'english', 'hello');
		inputExpression(2, 'español', 'buenos días');
		inputExpression(3, 'italiano', 'buongiorno');
		inputExpression(4, 'deutsch', 'guten Tag');
		cy.get('#save-idea').click();
		assertFetchIdeaReturnsStatus(1, 200);
		assertAllInputsEmpty();
	});
});

function assertFetchIdeaReturnsStatus(id: number, status: number) {
	cy.request({
		method: 'GET',
		url: `http://localhost:5555/ideas/${id}`,
		failOnStatusCode: false,
	}).its('status')
		.should('equal', status);
}

function assertAllInputsEmpty() {
	cy.get('.expression-text').each(e => cy.wrap(e).should('have.value', ''));
}

function inputExpression(rowNbr: number, language: string, text: string) {
	cy.get('#ideas')
		.find('.expression')
		.eq(rowNbr)
		.find('.expression-language')
		.select(language);
	cy.get('#ideas')
		.find('.expression')
		.eq(rowNbr)
		.find('.expression-text')
		.clear()
		.type(text);
}

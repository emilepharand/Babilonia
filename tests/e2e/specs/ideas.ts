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
		cy.get('#add-ideas-link').click();
	});
});

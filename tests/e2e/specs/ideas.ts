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
	specify('Adding ideas', () => {
		// Idea 1 doesn't exist
		assertFetchIdeaReturnsStatus(1, 404);

		// Navigate
		cy.get('#add-ideas-link').click();

		// Enter expressions
		const ee = [['français', 'bonjour'],
			['english', 'hello'],
			['español', 'buenos días'],
			['italiano', 'buongiorno'],
			['deutsch', 'guten Tag']];
		ee.forEach((e, i) => {
			inputExpression(i, e[0], e[1]);
		});

		// Click save
		cy.get('#save-idea').click();

		// Idea 1 was created (testing a sample of expressions)
		assertFetchIdeaReturnsStatus(1, 200, ['guten Tag', 'bonjour', 'buenos días']);

		// All inputs are emptied
		assertAllInputsEmpty();

		// Idea 2 doesn't exist
		assertFetchIdeaReturnsStatus(2, 404);

		// Enter expressions
		ee.forEach((e, i) => {
			inputExpression(i, e[0], e[1]);
		});

		// Add more rows
		cy.get('#add-rows').click();

		// There are now 10  rows
		cy.get('#ideas').find('.expression').should('have.length', 10);

		// Add more rows
		cy.get('#add-rows').click();

		// There are now 15 rows
		cy.get('#ideas').find('.expression').should('have.length', 15);

		// Adding rows did not remove previous expressions
		ee.forEach((e, i) => {
			assertExpressionHasValues(i, e[0], e[1]);
		});

		// Leaving gaps
		inputExpression(7, 'français', 'salut');
		inputExpression(9, 'english', 'hi');
		inputExpression(11, 'português', 'bom dia');
		inputExpression(12, 'français', 'toto');

		// Click save
		cy.get('#save-idea').click();

		// Idea 2 was created (testing a sample of expressions)
		assertFetchIdeaReturnsStatus(2, 200, ['toto', 'bom dia', 'hi', 'salut', 'bonjour', 'guten tag']);

		// All inputs are emptied
		assertAllInputsEmpty();

		// There are still 15 rows
		cy.get('#ideas').find('.expression').should('have.length', 15);

		// Check languages stayed the same
	});
});

function assertExpressionHasValues(rowNbr: number, languageName: string, text: string) {
	cy.get('#ideas .expression').eq(rowNbr).within(() => {
		cy.get('.expression-language :selected').should('have.text', languageName);
		cy.get('.expression-text').should('have.value', text);
	});
}

function assertFetchIdeaReturnsStatus(id: number, status: number, contains?: string[]) {
	cy.request({
		url: `http://localhost:5555/ideas/${id}`,
		failOnStatusCode: false,
	}).then(r => {
		cy.wrap(r).its('status').should('equal', status);
		if (contains) {
			for (const c of contains) {
				cy.wrap(JSON.stringify(r.body)).should('contain', c);
			}
		}
	});
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

import * as cyutils from '../cy-utils';

before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

function getRow(rowNbr: number) {
	return cy.get('#practice-table')
		.find('.practice-row')
		.eq(rowNbr);
}

context('Practicing', () => {
	specify('Practicing works', () => {
		// Idea 1: bonjour, hello, buenos días, buongiorno, guten Tag
		// Idea 2: salut, allô, hi, hey, hola, ciao, salve
		cyutils.addIdeas();

		cy.get('#practice-link').click();

		// Wait for table to load
		cy.get('#practice-table')
			.find('.practice-row')
			.should('have.length', 5);

		// Match: nothing typed, no match, partial match, full match, and switching between all
		assertRowMatchIsNeutral(1);
		typeInRow(1, 'b');
		assertRowMatchIsNoMatch(1);
		typeInRow(1, '{backspace}');
		assertRowMatchIsNeutral(1);
		typeInRow(1, 'h');
		assertRowMatchIsPartialMatch(1);
		typeInRow(1, 'ell');
		assertRowMatchIsPartialMatch(1);
		typeInRow(1, 'o');
		assertRowMatchIsFullMatch(1);
	});
});

function typeInRow(rowNbr: number, toType: string) {
	getRow(rowNbr)
		.within(() => {
			cy.get('.expression-input').type(toType);
		});
}

function assertRowMatchIsNeutral(rowNbr: number) {
	getRow(rowNbr)
		.within(() => {
			cy.get('.expression-input')
				.should('have.class', 'neutral')
				.should('not.have.class', 'no-match')
				.should('not.have.class', 'partial-match')
				.should('not.have.class', 'full-match')
				.should('not.be.disabled');
		});
}

function assertRowMatchIsNoMatch(rowNbr: number) {
	getRow(rowNbr)
		.within(() => {
			cy.get('.expression-input')
				.should('not.have.class', 'neutral')
				.should('have.class', 'no-match')
				.should('not.have.class', 'partial-match')
				.should('not.have.class', 'full-match')
				.should('not.be.disabled');
		});
}

function assertRowMatchIsPartialMatch(rowNbr: number) {
	getRow(rowNbr)
		.within(() => {
			cy.get('.expression-input')
				.should('not.have.class', 'neutral')
				.should('not.have.class', 'no-match')
				.should('have.class', 'partial-match')
				.should('not.have.class', 'full-match')
				.should('not.be.disabled');
		});
}

function assertRowMatchIsFullMatch(rowNbr: number) {
	getRow(rowNbr)
		.within(() => {
			cy.get('.expression-input')
				.should('not.have.class', 'neutral')
				.should('not.have.class', 'no-match')
				.should('not.have.class', 'partial-match')
				.should('have.class', 'full-match')
				.should('be.disabled');
		});
}

// Cannot input more letters when no match
// Hint when nothing typed, no match, partial match and full match
// -> should then focus on input
// Show when nothing typed, no match, partial match and full match
// -> should then focus on next input IFF focus was previously on this row
// Up/down keys with and without matched expressions in between
// -> should loop around
// -> should focus at end of text
// Left/right keys
// Character mapping
// Reset button

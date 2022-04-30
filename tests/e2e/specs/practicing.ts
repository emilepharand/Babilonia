import * as cyutils from '../cy-utils';

before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

context('Practicing', () => {
	specify('Practicing works', () => {
		cyutils.addIdeas();
	});
});

// Match: nothing typed, no match, partial match, full match, and switching between all
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

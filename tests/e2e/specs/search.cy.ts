import {addIdeasDifferentSet} from '../cy-utils';

before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

// This test should focus on whether the buttons and filters are correctly taken into account
// and whether results are correctly displayed
// It should not test whether the search itself is correctly implemented, as that should already be
// thoroughly tested in the API tests
context('Search', () => {
	specify('Searching works', () => {
		addIdeasDifferentSet();

		cy.get('#search-ideas-link').click();

		// Reset button
		typePattern('pattern');
		checkStrict();
		selectLanguage('français');
		selectIdeaHasLanguages('english', 'deutsch');
		selectIdeaDoesNotHave('italiano');
		reset();
		getPatternInput().should('have.value', '');
		getStrictCheckbox().should('not.be.checked');
		cy.get('.expression-language :selected').should('have.text', '');
		getIdeaHasSelect().invoke('val').should('deep.equal', []);
		cy.get('#ideaDoesNotHave :selected').should('have.text', '');

		// Searching requires at least one filter
		clickSearch();
		cy.get('#error-text')
			.should('be.visible')
			.should('have.class', 'text-danger')
			.should('contain.text', 'at least one filter');

		// Pattern no results
		typePattern('this pattern should not find anything');
		clickSearch();
		assertThereAreNoResults();

		// Pattern (not strict)
		typePattern('bonjou');
		clickSearch();
		assertThereAreNResults(1);
		assertNthResultHasMatchedExpressions(0, 'bonjour');

		// Pattern (strict)
		typePattern('bonjou');
		checkStrict();
		clickSearch();
		assertThereAreNoResults();

		// Language
		reset();
		cy.get('#expressionLanguage').select('français');
		clickSearch();
		assertThereAreNResults(3);

		// Expressions in French matching "b" in languages containing Portuguese but not Italian
		reset();
		typePattern('b');
		selectLanguage('français');
		selectIdeaHasLanguages('português');
		selectIdeaDoesNotHave('italiano');
		clickSearch();
		assertThereAreNResults(1);
		assertNthResultHasMatchedExpressions(0, 'bonne nuit');

		reset();
	});
});

function assertNthResultHasMatchedExpressions(nth: number, ...texts: string[]) {
	for (let i = 0; i < texts.length; i++) {
		getSearchResultsDiv().find('.search-result')
			.eq(0)
			.find('b')
			.eq(i)
			.should('have.text', texts[i]);
	}
}

function assertThereAreNResults(n: number) {
	assertThereAreResults();
	getSearchResultsDiv().find('.search-result').should('have.length', n);
}

function assertThereAreResults() {
	getSearchResultsDiv().should('not.contain.text', 'No results');
}

function assertThereAreNoResults() {
	getSearchResultsDiv().should('contain.text', 'No results');
}

function getPatternInput() {
	return cy.get('#pattern');
}

function typePattern(pattern: string) {
	getPatternInput().clear().type(pattern);
}

function getStrictCheckbox() {
	return cy.get('#strict');
}

function checkStrict() {
	getStrictCheckbox().check();
}

function getSearchButton() {
	return cy.get('#search-button');
}

function clickSearch() {
	getSearchButton().click();
}

function getResetButton() {
	return cy.get('#reset-button');
}

function reset() {
	getResetButton().click();
}

function getSearchResultsDiv() {
	return cy.get('#search-results');
}

function getLanguageInput() {
	return cy.get('#expressionLanguage');
}

function selectLanguage(name: string) {
	getLanguageInput().select(name);
}

function getIdeaHasSelect() {
	return cy.get('#ideaHas');
}

function selectIdeaHasLanguages(...names: string[]) {
	getIdeaHasSelect().select(names);
}

function getIdeaDoesNotHaveSelect() {
	return cy.get('#ideaDoesNotHave');
}

function selectIdeaDoesNotHave(name: string) {
	getIdeaDoesNotHaveSelect().select(name);
}

import {ExpressionForAdding} from 'server/model/ideas/expression';
import {IdeaForAdding} from 'server/model/ideas/ideaForAdding';
import {
	addIdeasDifferentSet, addLanguages, apiUrl, cyRequestPost,
} from '../cy-utils';

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

		getKnownExpressionsCheckbox().check();
		getKnownExpressionsCheckbox().should('be.checked');
		getUnknownExpressionsCheckbox().should('not.be.checked');
		getUnknownExpressionsCheckbox().check();
		getKnownExpressionsCheckbox().should('not.be.checked');
		getUnknownExpressionsCheckbox().should('be.checked');
		clickSearch();
		assertThereAreNResults(2);
		getKnownExpressionsCheckbox().check();
		clickSearch();
		assertThereAreNResults(1);
	});

	specify('Paging', () => {
		addLanguages();

		// Add 11 ideas
		for (let i = 0; i < 11; i++) {
			const fr1: ExpressionForAdding = {text: `bonjour ${i}`, languageId: 1, known: true};
			const en1: ExpressionForAdding = {text: 'hello', languageId: 2, known: true};
			const es1: ExpressionForAdding = {text: 'buenos días', languageId: 3, known: true};
			const de1: ExpressionForAdding = {text: 'guten Tag', languageId: 5, known: true};
			const pt1: ExpressionForAdding = {text: 'bom Dia', languageId: 6, known: true};
			const it1: ExpressionForAdding = {text: 'buongiorno', languageId: 4, known: true};
			const i1: IdeaForAdding = {ee: [fr1, en1, es1, de1, pt1, it1]};

			cyRequestPost(`${apiUrl}/ideas`, i1);
		}

		cy.get('#search-ideas-link').click();

		getKnownExpressionsCheckbox().check();
		clickSearch();

		assertThereAreNResults(10);
		assertNthResultHasMatchedExpressions(5, 'bonjour 5');
		getPreviousPageButton()
			.should('be.disabled');
		getNextPageButton()
			.should('be.visible')
			.click();

		assertThereAreNResults(1);
		assertNthResultHasMatchedExpressions(0, 'bonjour 10');
		getNextPageButton()
			.should('be.disabled');
		getPreviousPageButton()
			.should('be.visible')
			.should('not.be.disabled')
			.click();

		assertThereAreNResults(10);
		assertNthResultHasMatchedExpressions(5, 'bonjour 5');
		getPreviousPageButton()
			.should('be.disabled');
		getNextPageButton()
			.should('be.visible')
			.click();

		assertThereAreNResults(1);
		assertNthResultHasMatchedExpressions(0, 'bonjour 10');
		getNextPageButton()
			.should('be.disabled');
		getPreviousPageButton()
			.should('be.visible')
			.should('not.be.disabled');
	});
});

function assertNthResultHasMatchedExpressions(nth: number, ...texts: string[]) {
	for (let i = 0; i < texts.length; i++) {
		getSearchResultsDiv().find('.search-result')
			.eq(nth)
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

function getKnownExpressionsCheckbox() {
	return cy.get('#knownExpressions');
}

function getUnknownExpressionsCheckbox() {
	return cy.get('#unknownExpressions');
}

function checkStrict() {
	getStrictCheckbox().check();
}

function getNextPageButton() {
	return cy.get('#next-page-button');
}

function getPreviousPageButton() {
	return cy.get('#previous-page-button');
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

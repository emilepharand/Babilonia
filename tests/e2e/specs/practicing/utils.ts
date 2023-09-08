
export function getRow(rowNbr: number) {
	return cy.get('#practice-table')
		.find('.practice-row')
		.eq(rowNbr);
}

export function waitForTableToLoad(length: number) {
	cy.get('#practice-table')
		.find('.practice-row')
		.should('have.length', length);
}

export function assertLanguageName(rowNbr: number, name: string) {
	getRow(rowNbr).find('.language-name').should('have.text', name);
}

export function hint(rowNbr: number) {
	getRowHintButton(rowNbr).click();
}

export function getRowHintButton(rowNbr: number) {
	return getRow(rowNbr).find('.hint-button');
}

export function getRowKnownButton(rowNbr: number) {
	return getRow(rowNbr).find('.expression-known-checkbox');
}

export function getNextButton() {
	return cy.get('.next-button');
}

export function getResetButton() {
	return cy.get('.reset-button');
}

export function getEditButton() {
	return cy.get('#edit-idea-link');
}

export function getRowShowButton(rowNbr: number) {
	return getRow(rowNbr).find('.show-button');
}

export function show(rowNbr: number) {
	getRowShowButton(rowNbr).click();
}

export function assertRowInputHasFocus(rowNbr: number) {
	getRowInput(rowNbr).should('have.focus');
}

export function getRowInput(rowNbr: number) {
	return getRow(rowNbr).find('.expression-input');
}

export function assertIsTyped(rowNbr: number, typed: string) {
	getRowInput(rowNbr).should('have.value', typed);
}

export function typeInRow(rowNbr: number, toType: string) {
	getRow(rowNbr)
		.within(() => {
			cy.get('.expression-input').type(toType);
		});
}

export function assertRowInputIsNotPracticeable(rowNbr: number, typed: string) {
	getRowInput(rowNbr)
		.should('not.have.class', 'neutral')
		.should('not.have.class', 'no-match')
		.should('not.have.class', 'partial-match')
		.should('not.have.class', 'full-match')
		.should('be.disabled')
		.should('have.value', typed);
	assertButtonsAreDisabled(rowNbr);
}

export function assertRowMatchIsNeutral(rowNbr: number) {
	getRowInput(rowNbr)
		.should('have.class', 'neutral')
		.should('not.have.class', 'no-match')
		.should('not.have.class', 'partial-match')
		.should('not.have.class', 'full-match')
		.should('not.be.disabled');
	assertButtonsAreNotDisabled(rowNbr);
}

export function assertRowMatchIsNoMatch(rowNbr: number) {
	getRowInput(rowNbr)
		.should('not.have.class', 'neutral')
		.should('have.class', 'no-match')
		.should('not.have.class', 'partial-match')
		.should('not.have.class', 'full-match');
	assertButtonsAreNotDisabled(rowNbr);
}

export function assertButtonsAreDisabled(rowNbr: number) {
	getRowHintButton(rowNbr).should('be.disabled');
	getRowShowButton(rowNbr).should('be.disabled');
}

export function assertButtonsAreNotDisabled(rowNbr: number) {
	getRowHintButton(rowNbr).should('not.be.disabled');
	getRowShowButton(rowNbr).should('not.be.disabled');
}

export function assertRowMatchIsPartialMatch(rowNbr: number) {
	getRowInput(rowNbr)
		.should('not.have.class', 'neutral')
		.should('not.have.class', 'no-match')
		.should('have.class', 'partial-match')
		.should('not.have.class', 'full-match')
		.should('not.be.disabled');
	assertButtonsAreNotDisabled(rowNbr);
}

export function assertRowMatchIsFullMatch(rowNbr: number, typed: string) {
	getRowInput(rowNbr)
		.should('not.have.class', 'neutral')
		.should('not.have.class', 'no-match')
		.should('not.have.class', 'partial-match')
		.should('have.class', 'full-match')
		.should('be.disabled');
	assertIsTyped(rowNbr, typed);
	assertButtonsAreDisabled(rowNbr);
}

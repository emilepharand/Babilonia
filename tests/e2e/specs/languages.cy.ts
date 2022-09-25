before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

function clickSave() {
	cy.get('#save-languages-button').click();
}

context('Valid inputs in the language page', () => {
	specify('Adding languages works and the page updates', () => {
		cy.get('#languages-link').click();
		// Add three languages
		for (let i = 0; i < 3; i++) {
			const languageName = `Language ${i}`;
			addLanguage(languageName);
			// Check that language table has updated
			cy.get('.languages-table')
				.find('.language-row').should('have.length', i + 1);
			// Default ordering is last available, default isPractice is false
			checkLanguageRowHasValues(i, languageName, i.toString(), false);
		}

		// Edit languages configuration
		for (let i = 0; i < 3; i++) {
			const languageName = `Modified language ${i}`;
			inputLanguageChange(i, languageName, (2 - i).toString(), true);
		}
		clickSave();
		cy.get('#languages-saved-text').should('be.visible');
		cy.reload();
		checkLanguageRowHasValues(0, 'Modified language 2', '0', true);
		checkLanguageRowHasValues(1, 'Modified language 1', '1', true);
		checkLanguageRowHasValues(2, 'Modified language 0', '2', true);

		// Delete languages one by one
		deleteLanguage(1);
		cy.get('.languages-table').find('.language-row').should('have.length', 2);
		checkLanguageRowHasValues(0, 'Modified language 2', '0', true);
		checkLanguageRowHasValues(1, 'Modified language 0', '1', true);
		deleteLanguage(0);
		cy.get('.languages-table').find('.language-row').should('have.length', 1);
		checkLanguageRowHasValues(0, 'Modified language 0', '0', true);
		deleteLanguage(0);
		cy.get('.languages-table').should('not.exist');
	});
});

context('Error handling in the language page', () => {
	specify('Adding invalid language', () => {
		// Empty name
		addLanguage('');
		assertAddLanguageErrorMsgVisible('valid language');
		assertSaveLanguagesErrorMsgNotVisible();
		// Valid language
		addLanguage('Valid language');
		assertAddLanguageErrorMsgNotVisible();
		assertSaveLanguagesErrorMsgNotVisible();
		// Blank name
		addLanguage(' ');
		assertAddLanguageErrorMsgVisible('valid language');
		assertSaveLanguagesErrorMsgNotVisible();
		// Valid language
		addLanguage('Valid language 2');
		assertAddLanguageErrorMsgNotVisible();
		assertSaveLanguagesErrorMsgNotVisible();
		// Duplicate name
		addLanguage('Valid language');
		assertAddLanguageErrorMsgVisible('already exists');
		assertSaveLanguagesErrorMsgNotVisible();
	});

	specify('Editing language with invalid input', () => {
		// Blank name
		inputLanguageChange(0, '', '0', true);
		clickSave();
		assertSaveLanguageErrorMsgVisible('blank');
		assertAddLanguageErrorMsgNotVisible();
		// Blank ordering
		inputLanguageChange(0, 'any language', '', true);
		clickSave();
		assertSaveLanguageErrorMsgVisible('ordering');
		assertAddLanguageErrorMsgNotVisible();
		// Wrong ordering
		inputLanguageChange(0, 'any language 1', '0', true);
		inputLanguageChange(1, 'any language 2', '2', true);
		clickSave();
		assertSaveLanguageErrorMsgVisible('ordering');
		assertAddLanguageErrorMsgNotVisible();
		// Duplicate language names
		inputLanguageChange(1, 'any language 1', '1', true);
		clickSave();
		assertSaveLanguageErrorMsgVisible('duplicate');
		assertAddLanguageErrorMsgNotVisible();
	});
});

function addLanguage(name: string) {
	cy.get('#new-language-name').clear();
	if (name !== '') {
		cy.get('#new-language-name').type(name);
	}
	cy.get('#add-language-button').click();
}

function deleteLanguage(rowNbr: number) {
	cy.get('.languages-table').find('.language-row').eq(rowNbr)
		.find('.delete-language-button').click();
}

function assertAddLanguageErrorMsgNotVisible() {
	cy.get('#error-add-language-text').should('not.exist');
}

function assertSaveLanguagesErrorMsgNotVisible() {
	cy.get('#error-save-text').should('not.exist');
}

function assertAddLanguageErrorMsgVisible(containsText: string) {
	cy.get('#error-add-language-text')
		.should('be.visible')
		.should('contain.text', containsText);
}

function assertSaveLanguageErrorMsgVisible(containsText: string) {
	cy.get('#error-save-text')
		.should('be.visible')
		.should('contain.text', containsText);
}

function inputLanguageChange(rowNbr: number, name: string, ordering: string, isPractice: boolean) {
	cy.get('.languages-table').find('.language-row').eq(rowNbr).within(() => {
		cy.get('.language-name').clear().type(name);
		cy.get('.language-ordering').clear().type(ordering.toString());
		if (isPractice) {
			cy.get('.language-is-practice').check();
		} else {
			cy.get('.language-is-practice').uncheck();
		}
	});
}

function checkLanguageRowHasValues(rowNbr: number, name: string, ordering: string, isPractice: boolean) {
	cy.get('.languages-table').find('.language-row')
		.eq(rowNbr).find('.language-name')
		.should('have.value', name);
	cy.get('.languages-table').find('.language-row')
		.eq(rowNbr).find('.language-ordering')
		.should('have.value', ordering);
	cy.get('.languages-table').find('.language-row')
		.eq(rowNbr).find('.language-is-practice')
		.should(isPractice ? 'be.checked' : 'not.be.checked');
}

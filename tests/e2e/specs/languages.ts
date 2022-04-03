before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

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
			checkLanguageRowHasValues(i, languageName, i, false);
		}

		// Edit languages configuration
		for (let i = 0; i < 3; i++) {
			const languageName = `Modified language ${i}`;
			inputLanguageChange(i, languageName, 2 - i, true);
		}
		cy.get('#save-languages-button').click();
		cy.get('#languages-saved-text').should('be.visible');
		cy.reload();
		checkLanguageRowHasValues(0, 'Modified language 2', 0, true);
		checkLanguageRowHasValues(1, 'Modified language 1', 1, true);
		checkLanguageRowHasValues(2, 'Modified language 0', 2, true);

		// Delete languages one by one
		deleteLanguage(1);
		cy.get('.languages-table').find('.language-row').should('have.length', 2);
		checkLanguageRowHasValues(0, 'Modified language 2', 0, true);
		checkLanguageRowHasValues(1, 'Modified language 0', 1, true);
		deleteLanguage(0);
		cy.get('.languages-table').find('.language-row').should('have.length', 1);
		checkLanguageRowHasValues(0, 'Modified language 0', 0, true);
		deleteLanguage(0);
		cy.get('.languages-table').should('not.exist');
	});
});

context('Error handling in the language page', () => {
	specify('Invalid inputs', () => {
		// Empty name
		addLanguage('');
		assertAddLanguageErrorMsgVisible('valid language');
		// Valid language
		addLanguage('Valid language');
		assertAddLanguageErrorMsgNotVisible();
		// Blank name
		addLanguage(' ');
		assertAddLanguageErrorMsgVisible('valid language');
		// Valid language
		addLanguage('Valid language 2');
		assertAddLanguageErrorMsgNotVisible();
		// Duplicate name
		addLanguage('Valid language');
		assertAddLanguageErrorMsgVisible('already exists');
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
	cy.get('#error-add-language-text')
		.should('not.be.visible');
}

function assertAddLanguageErrorMsgVisible(containsText: string) {
	cy.get('#error-add-language-text')
		.should('be.visible')
		.should('contain.text', containsText);
}

function inputLanguageChange(rowNbr: number, name: string, ordering: number, isPractice: boolean) {
	cy.get('.languages-table').find('.language-row').eq(rowNbr).find('.language-name')
		.clear().type(name);
	cy.get('.languages-table').find('.language-ordering').eq(rowNbr)
		.clear().type(ordering.toString());
	if (isPractice) {
		cy.get('.languages-table').find('.language-is-practice').eq(rowNbr)
			.check();
	} else {
		cy.get('.languages-table').find('.language-is-practice').eq(rowNbr)
			.uncheck();
	}
}

function checkLanguageRowHasValues(rowNbr: number, name: string, ordering: number, isPractice: boolean) {
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

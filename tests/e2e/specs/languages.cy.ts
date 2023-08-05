import {apiUrl} from '../cy-utils';

beforeEach(() => {
	cy.request('DELETE', `${apiUrl}/everything`);
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

		// Test delete modal focus
		cy.get('.languages-table').find('.language-row')
			.eq(0)
			.find('.delete-language-button')
			.click();
		cy.get('#modal-cancel-button')
			.should('be.focused')
			.type('{rightArrow}');
		cy.get('#modal-delete-button')
			.should('be.focused')
			.type('{leftArrow}');
		cy.get('#modal-cancel-button')
			.should('be.focused')
			.click();

		// Delete languages one by one
		deleteLanguageButCancel(1);
		cy.get('.languages-table').find('.language-row').should('have.length', 3);
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

context('Interactivity', () => {
	specify('Input focusing', () => {
		cy.get('#languages-link').click();

		getNewLanguageNameInput()
			.should('be.focused')
			.type('fr')
			.type('{enter}');

		checkLanguageRowHasValues(0, 'fr', '0', false);

		getNewLanguageNameInput()
			.should('be.focused');

		inputLanguageChange(0, 'en', '0', true);

		getNewLanguageNameInput()
			.should('not.be.focused');
	});
});

context('Error handling on the language page', () => {
	specify('Adding/editing with invalid input', () => {
		cy.get('#languages-link').click();

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

		// Cannot write non-digit in ordering
		cy.get('.languages-table').find('.language-row').eq(0).within(() => {
			cy.get('.language-ordering').clear();
			cy.get('.language-ordering').type('a');
		});
		cy.get('.languages-table').find('.language-row')
			.eq(0).find('.language-ordering')
			.should('be.empty');

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

function getNewLanguageNameInput() {
	return cy.get('#new-language-name');
}

function addLanguage(name: string) {
	getNewLanguageNameInput().clear();
	if (name !== '') {
		getNewLanguageNameInput().type(name);
	}
	cy.get('#add-language-button').click();
}

function deleteLanguage(rowNbr: number) {
	cy.get('#confirm-delete-modal').should('not.be.visible');
	cy.get('.languages-table').find('.language-row').eq(rowNbr)
		.find('.delete-language-button').click();
	cy.get('#confirm-delete-modal').should('be.visible');
	// eslint-disable-next-line cypress/no-unnecessary-waiting
	cy.wait(500).get('#modal-delete-button').click();
	cy.get('#confirm-delete-modal').should('not.be.visible');
}

function deleteLanguageButCancel(rowNbr: number) {
	cy.get('#confirm-delete-modal').should('not.be.visible');
	cy.get('.languages-table').find('.language-row').eq(rowNbr)
		.find('.delete-language-button').click();
	cy.get('#confirm-delete-modal').should('be.visible');
	// eslint-disable-next-line cypress/no-unnecessary-waiting
	cy.wait(500).get('#modal-cancel-button').click();
	cy.get('#confirm-delete-modal').should('not.be.visible');
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
		cy.get('.language-name').clear();
		cy.get('.language-ordering').clear();
		cy.get('.language-name').type(name);
		cy.get('.language-ordering').type(ordering.toString());
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

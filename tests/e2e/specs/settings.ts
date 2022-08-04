import {Settings} from '../../../server/model/settings/settings';

before(() => {
	cy.request('DELETE', 'http://localhost:5555/everything');
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

describe('The settings page', () => {
	it('Works correctly', () => {
		setSettings({randomPractice: true, strictCharacters: false});
		assertSettingsEquals({randomPractice: true, strictCharacters: false});
		cy.get('#settings-link').click();
		cy.get('#randomPractice').should('be.checked');
		cy.get('#strictCharacters').should('not.be.checked');
		cy.get('#settingsSavedText').should('not.exist');
		cy.get('#strictCharacters').check();
		cy.get('#saveButton').click();
		cy.get('#settingsSavedText').should('be.visible');
		assertSettingsEquals({randomPractice: true, strictCharacters: true});
	});
});

function setSettings(settings: Settings) {
	cy.request({
		url: 'http://localhost:5555/settings',
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		body: `${JSON.stringify(settings)}`,
	});
}

export function assertSettingsEquals(settings: Settings) {
	cy.request({
		url: 'http://localhost:5555/settings',
	}).then(r => {
		// Little hack to make it work, compare stringified, without double quotes, without backlashes
		cy.wrap(JSON.stringify(r.body)
			.replaceAll('\\', '')
			.replaceAll('"', ''))
			.should('equal', JSON.stringify(settings)
				.replaceAll('\\', '')
				.replaceAll('"', ''));
	});
}
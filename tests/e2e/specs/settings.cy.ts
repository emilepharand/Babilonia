import {Settings} from '../../../server/model/settings/settings';

import {apiUrl, setSettings} from '../cy-utils';
import {memoryDatabasePath} from '../../../server/const';

const db21 = 'tests/db/2.1-simple.db';

describe('The settings page', () => {
	it('Works correctly', () => {
		setSettings({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: '2.1',
		});
		assertSettingsEquals({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: '2.1',
		});
		cy.get('#settings-link').click();

		cy.get('#randomPractice').should('be.checked');
		cy.get('#strictCharacters').should('be.checked');
		cy.get('#practiceOnlyNotKnown').should('not.be.checked');
		cy.get('#passiveMode').should('not.be.checked');
		cy.get('#databasePath').should('be.visible').should('have.value', memoryDatabasePath);

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(db21);
		cy.get('#saveButton').click();
		cy.get('#settingsSavedText').should('be.visible');
		cy.get('#settingsErrorText').should('not.exist');
		assertSettingsEquals({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: '2.1',
		});

		cy.get('#strictCharacters').uncheck();

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type('tests/db/unsupported-version.db');
		cy.get('#saveButton').click();
		cy.get('#settingsSavedText').should('not.exist');
		cy.get('#settingsErrorText').should('be.visible').should('contain', 'The version of the database is not supported.');
		assertSettingsEquals({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: '2.1',
		});

		cy.get('#saveButton').click();
		cy.get('#settingsSavedText').should('not.exist');
		cy.get('#settingsErrorText').should('be.visible').should('contain', 'The version of the database is not supported.');
		assertSettingsEquals({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: '2.1',
		});

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type('');
		cy.get('#saveButton').click();
		cy.get('#settingsSavedText').should('not.exist');
		cy.get('#settingsErrorText').should('be.visible').should('contain', 'Database path could not be changed. Please check the path and try again.');
		assertSettingsEquals({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: '2.1',
		});

		cy.get('#saveButton').click();
		cy.get('#settingsSavedText').should('not.exist');
		cy.get('#settingsErrorText').should('be.visible').should('contain', 'Database path could not be changed. Please check the path and try again.');
		assertSettingsEquals({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: '2.1',
		});

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(memoryDatabasePath);
		cy.get('#saveButton').click();
		cy.get('#settingsSavedText').should('be.visible');
		cy.get('#settingsErrorText').should('not.exist');
		cy.get('#strictCharacters').uncheck();
		assertSettingsEquals({
			randomPractice: true, strictCharacters: false, practiceOnlyNotKnown: false, passiveMode: false, version: '2.1',
		});

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(memoryDatabasePath);
		cy.get('#saveButton').click();
		cy.get('#settingsSavedText').should('be.visible');
		cy.get('#settingsErrorText').should('not.exist');
		assertSettingsEquals({
			randomPractice: true, strictCharacters: false, practiceOnlyNotKnown: false, passiveMode: false, version: '2.1',
		});
	});
});

export function assertSettingsEquals(settings: Settings) {
	cy.request({
		url: `${apiUrl}/settings`,
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

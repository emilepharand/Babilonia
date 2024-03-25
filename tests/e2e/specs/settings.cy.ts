import {Settings} from '../../../server/model/settings/settings';

import {memoryDatabasePath} from '../../../server/const';
import {oldVersionDatabasePath} from '../../utils/const';
import {apiUrl, setSettings} from '../cy-utils';

const db21 = 'tests/db/2.1-simple.db';

describe('The settings page', () => {
	it('Works correctly', () => {
		setSettings({
			randomPractice: true,
			strictCharacters: true,
			practiceOnlyNotKnown: false,
			passiveMode: false,
			version: '2.1',
			enableEditing: false,
		});
		assertSettingsEquals({
			randomPractice: true,
			strictCharacters: true,
			practiceOnlyNotKnown: false,
			passiveMode: false,
			version: '2.1',
			enableEditing: false,
		});
		cy.get('#settings-link').click();

		cy.get('#randomPractice').should('be.checked');
		cy.get('#strictCharacters').should('be.checked');
		cy.get('#practiceOnlyNotKnown').should('not.be.checked');
		cy.get('#passiveMode').should('not.be.checked');
		cy.get('#enableEditing').should('not.be.checked');
		cy.get('#databasePath').should('be.visible').should('have.value', memoryDatabasePath);

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(db21);
		cy.get('#saveButton').click();
		cy.get('#successMessage').should('be.visible');
		cy.get('#settingsErrorText').should('not.exist');
		assertSettingsEquals({
			randomPractice: true,
			strictCharacters: true,
			practiceOnlyNotKnown: false,
			passiveMode: false,
			version: '2.1',
			enableEditing: false,
		});

		cy.get('#enableEditing').check();
		cy.get('#strictCharacters').uncheck();
		cy.get('#databasePath').clear();
		cy.get('#databasePath').type('');
		cy.get('#saveButton').click();
		cy.get('#successMessage').should('not.exist');
		cy.get('#settingsErrorText').should('be.visible').should('contain', 'Invalid database path.');
		assertSettingsEquals({
			randomPractice: true,
			strictCharacters: true,
			practiceOnlyNotKnown: false,
			passiveMode: false,
			version: '2.1',
			enableEditing: true,
		});

		cy.get('#saveButton').click();
		cy.get('#successMessage').should('not.exist');
		cy.get('#settingsErrorText').should('be.visible').should('contain', 'Invalid database path.');
		assertSettingsEquals({
			randomPractice: true,
			strictCharacters: true,
			practiceOnlyNotKnown: false,
			passiveMode: false,
			version: '2.1',
			enableEditing: true,
		});

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(memoryDatabasePath);
		cy.get('#enableEditing').uncheck();
		cy.get('#saveButton').click();
		cy.get('#successMessage').should('be.visible');
		cy.get('#settingsErrorText').should('not.exist');
		cy.get('#strictCharacters').uncheck();
		assertSettingsEquals({
			randomPractice: true,
			strictCharacters: false,
			practiceOnlyNotKnown: false,
			passiveMode: false,
			version: '2.1',
			enableEditing: false,
		});

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(memoryDatabasePath);
		cy.get('#saveButton').click();
		cy.get('#successMessage').should('be.visible');
		cy.get('#settingsErrorText').should('not.exist');
		assertSettingsEquals({
			randomPractice: true,
			strictCharacters: false,
			practiceOnlyNotKnown: false,
			passiveMode: false,
			version: '2.1',
			enableEditing: false,
		});

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(oldVersionDatabasePath);
		cy.get('#saveButton').click();
		cy.get('#settingsErrorText').should('not.exist');
		cy.get('#confirm-migrate-modal').should('be.visible');
		cy.get('#modal-cancel-button').should('be.visible');
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.get('#modal-cancel-button').wait(500).click();
		cy.get('#settingsErrorText').should('not.exist');
		cy.get('#successMessage').should('be.visible');
		cy.get('#saveButton').click();
		cy.get('#successMessage').should('not.exist');
		cy.get('#settingsErrorText').should('not.exist');
		cy.get('#confirm-migrate-modal').should('be.visible');
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.get('#modal-migrate-button').wait(500).click();
		cy.get('#successMessage').should('be.visible')
			.should('contain', 'Settings saved.')
			.should('contain', 'Database migrated.');
		assertSettingsEquals({
			randomPractice: true,
			strictCharacters: false,
			practiceOnlyNotKnown: false,
			passiveMode: false,
			version: '2.1',
			enableEditing: false,
		});
		cy.reload();
		cy.get('#databasePath').should('have.value', oldVersionDatabasePath);
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

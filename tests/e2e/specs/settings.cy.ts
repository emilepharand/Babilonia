import {Settings} from '../../../server/model/settings/settings';

import {currentVersion, memoryDatabasePath} from '../../../server/const';
import {getBadDatabasePath, getTestDatabaseVersionPath, penultimateVersion} from '../../utils/versions';
import {apiUrl, setSettings} from '../cy-utils';

describe('The settings page', () => {
	it('Displays an error when migration fails', () => {
		cy.get('#settings-link').click();
		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(getBadDatabasePath().getPathToProvide());
		cy.get('#saveButton').click();
		cy.get('#confirm-migrate-modal').should('be.visible');
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.get('#modal-migrate-button').wait(500).click();
		cy.get('#settingsErrorText')
			.should('be.visible')
			.should('contain', 'Error migrating database.');
		cy.get('#successMessage').should('not.exist');

		cy.reload();

		cy.get('#databasePath').should('have.value', memoryDatabasePath);
	});

	it('Works correctly', () => {
		setSettings({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: currentVersion,
		});
		assertSettingsEquals({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: currentVersion,
		});
		cy.get('#settings-link').click();

		cy.get('#randomPractice').should('be.checked');
		cy.get('#strictCharacters').should('be.checked');
		cy.get('#practiceOnlyNotKnown').should('not.be.checked');
		cy.get('#passiveMode').should('not.be.checked');
		cy.get('#databasePath').should('be.visible').should('have.value', memoryDatabasePath);

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(getTestDatabaseVersionPath(currentVersion).getPathToProvide());
		cy.get('#saveButton').click();
		cy.get('#successMessage').should('be.visible');
		cy.get('#settingsErrorText').should('not.exist');
		assertSettingsEquals({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: currentVersion,
		});

		cy.get('#strictCharacters').uncheck();
		cy.get('#databasePath').clear();
		cy.get('#databasePath').type('');
		cy.get('#saveButton').click();
		cy.get('#successMessage').should('not.exist');
		cy.get('#settingsErrorText').should('be.visible').should('contain', 'Invalid database path.');
		assertSettingsEquals({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: currentVersion,
		});

		cy.get('#saveButton').click();
		cy.get('#successMessage').should('not.exist');
		cy.get('#settingsErrorText').should('be.visible').should('contain', 'Invalid database path.');
		assertSettingsEquals({
			randomPractice: true, strictCharacters: true, practiceOnlyNotKnown: false, passiveMode: false, version: currentVersion,
		});

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(memoryDatabasePath);
		cy.get('#saveButton').click();
		cy.get('#successMessage').should('be.visible');
		cy.get('#settingsErrorText').should('not.exist');
		cy.get('#strictCharacters').uncheck();
		assertSettingsEquals({
			randomPractice: true, strictCharacters: false, practiceOnlyNotKnown: false, passiveMode: false, version: currentVersion,
		});

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(memoryDatabasePath);
		cy.get('#saveButton').click();
		cy.get('#successMessage').should('be.visible');
		cy.get('#settingsErrorText').should('not.exist');
		assertSettingsEquals({
			randomPractice: true, strictCharacters: false, practiceOnlyNotKnown: false, passiveMode: false, version: currentVersion,
		});

		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(getTestDatabaseVersionPath(penultimateVersion).getPathToProvide());
		cy.get('#saveButton').click();
		cy.get('#settingsErrorText').should('not.exist');
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.get('#modal-cancel-button').wait(500).click();
		cy.get('#settingsErrorText').should('not.exist');
		cy.get('#successMessage').should('be.visible');
		cy.get('#saveButton').click();
		cy.get('#successMessage').should('not.exist');
		cy.get('#settingsErrorText').should('not.exist');
		cy.get('#confirm-migrate-modal').should('be.visible');

		cy.intercept('database/migrate').as('migrate');

		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.get('#modal-migrate-button').wait(500).click();
		cy.get('#successMessage').should('be.visible')
			.should('contain', 'Settings saved.')
			.should('contain', 'Migration successful.');

		cy.wait('@migrate').its('request.body').should('include', {noContentUpdate: false});

		assertSettingsEquals({
			randomPractice: true, strictCharacters: false, practiceOnlyNotKnown: false, passiveMode: false, version: currentVersion,
		});
		cy.reload();
		cy.get('#databasePath').should('have.value', getTestDatabaseVersionPath(penultimateVersion).getPathToProvide());
	});

	it('Migration with no content update', () => {
		cy.get('#settings-link').click();
		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.get('#databasePath').wait(1000).clear();
		cy.get('#databasePath').type(getTestDatabaseVersionPath('another-2.0').getPathToProvide());
		cy.get('#saveButton').click();

		cy.intercept('database/migrate').as('migrate');

		// eslint-disable-next-line cypress/no-unnecessary-waiting
		cy.get('#noContentUpdate').wait(500).click();
		cy.get('#modal-migrate-button').click();

		cy.wait('@migrate').its('request.body').should('include', {noContentUpdate: true});
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

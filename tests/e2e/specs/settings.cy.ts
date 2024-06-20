'not.be.visible';
import {currentVersion, memoryDatabasePath} from '../../../server/const';
import {getBadDatabasePath, getTestDatabaseVersionPath, penultimateVersion} from '../../utils/versions';

beforeEach(() => {
	cy.intercept('PUT', 'settings').as('putSettings');
	cy.intercept('GET', 'settings').as('getSettings');
	cy.intercept('PUT', 'database/path').as('putDatabasePath');
	cy.intercept('PUT', 'database/migrate').as('migrate');
});

describe('The settings page', () => {
	it('Displays the current settings and allows changing them', () => {
		goToSettingsPage();

		assertNoMessage();

		assertSettingsAreDefault();

		cy.get('#randomPractice').uncheck();
		cy.get('#strictCharacters').check();
		cy.get('#practiceOnlyNotKnown').check();
		cy.get('#passiveMode').check();

		saveSettingsAndAssert();

		cy.get('#randomPractice').should('not.be.checked');
		cy.get('#strictCharacters').should('be.checked');
		cy.get('#practiceOnlyNotKnown').should('be.checked');
		cy.get('#passiveMode').should('be.checked');
		cy.reload(true);
		cy.get('#randomPractice').should('not.be.checked');
		cy.get('#strictCharacters').should('be.checked');
		cy.get('#practiceOnlyNotKnown').should('be.checked');
		cy.get('#passiveMode').should('be.checked');
	});

	it('Displays the current database path and allows changing it', () => {
		goToSettingsPage();

		// Test the interaction of saving settings then changing database
		cy.get('#randomPractice').uncheck();
		cy.get('#strictCharacters').check();
		cy.get('#passiveMode').check();

		saveSettingsAndAssert();

		// Define a new intercept because the previous one was used
		cy.intercept('PUT', 'settings').as('putSettings2');

		// This should be overriden when the database is changed
		cy.get('#practiceOnlyNotKnown').check();

		changeDatabaseAndAssert(getTestDatabaseVersionPath(currentVersion).getPathToProvide());

		cy.get('@putSettings2').should('not.exist');

		// Settings are updated to the values from the database
		assertSettingsAreDefault();
		cy.reload(true);
		assertSettingsAreDefault();
	});

	it('Handles errors when the database path is invalid', () => {
		goToSettingsPage();
		changeDatabase('');
		assertErrorMessage('Invalid database path.');
		cy.get('@putSettings').should('not.exist');
		changeDatabaseAndAssert(memoryDatabasePath);
	});

	it('Allows migrating the database', () => {
		goToSettingsPage();

		const databaseToMigratePath = getTestDatabaseVersionPath(penultimateVersion).getPathToProvide();

		changeDatabase(databaseToMigratePath);

		assertNotMigrated();

		waitForMigrateModal();
		cy.get('#modal-cancel-button').click();

		assertNotMigrated();

		cy.get('#changeDatabaseButton').click();

		waitForMigrateModal();

		cy.get('#modal-migrate-button').click();
		assertSuccessMessage('Migration successful.');

		cy.get('@putSettings').should('not.exist');
		assertMigrated(false);

		cy.reload(true);

		assertDatabasePath(databaseToMigratePath);
	});

	it('Allows migrating the database without content update', () => {
		goToSettingsPage();

		changeDatabase(getTestDatabaseVersionPath('another-2.0').getPathToProvide());

		waitForMigrateModal();
		cy.get('#noContentUpdate').click();
		cy.get('#modal-migrate-button').click();

		assertMigrated(true);
	});

	it('Displays an error when migration fails', () => {
		goToSettingsPage();

		changeDatabase(getBadDatabasePath().getPathToProvide());

		waitForMigrateModal();
		cy.get('#modal-migrate-button').click();
		assertErrorMessage('Error migrating database. Please check server logs.');

		cy.get('@migrate')
			.should('exist')
			.its('response.statusCode').should('equal', 400);
		cy.get('@putSettings').should('not.exist');

		cy.reload(true);

		assertDatabasePath(memoryDatabasePath);
	});

	function assertSettingsAreDefault() {
		cy.get('#randomPractice').should('be.checked');
		cy.get('#strictCharacters').should('not.be.checked');
		cy.get('#practiceOnlyNotKnown').should('not.be.checked');
		cy.get('#passiveMode').should('not.be.checked');
	}

	function saveSettingsAndAssert() {
		cy.get('#saveButton').click();
		assertSuccessMessage();
		cy.get('@putSettings')
			.should('exist')
			.its('request.method').should('equal', 'PUT');
		cy.get('@putSettings')
			.its('response.statusCode').should('equal', 200);
	}

	function changeDatabaseAndAssert(path: string) {
		changeDatabase(path);
		assertDatabaseChanged(path);
	}

	function assertDatabasePath(path: string) {
		cy.get('#databasePath').should('have.value', path);
	}

	function assertDatabaseChanged(path: string) {
		assertDatabasePath(path);
		cy.get('#successMessage')
			.should('be.visible')
			.should('have.text', 'Database path changed.');
		cy.get('#errorMessage')
			.should('not.exist');
		cy.get('@putDatabasePath').should('exist');
	}

	function changeDatabase(path: string) {
		cy.get('#databasePath').clear();
		cy.get('#databasePath').type(path);
		cy.get('#changeDatabaseButton').click();
	}

	function assertMigrated(noContentUpdate: boolean) {
		cy.get('@migrate')
			.should('exist')
			.its('request.body')
			.should('include', {noContentUpdate});
	}

	function assertNotMigrated() {
		cy.get('@migrate').should('not.exist');
		cy.get('@putSettings').should('not.exist');
		assertNoMessage();
	}

	function assertNoMessage() {
		assertNoErrorMessage();
		assertNoSuccessMessage();
	}

	function assertErrorMessage(message: string) {
		cy.get('#errorMessage')
			.should('be.visible')
			.should('have.text', message);
		assertNoSuccessMessage();
	}

	function assertNoErrorMessage() {
		getErrorMessage().should('not.exist');
	}

	function assertNoSuccessMessage() {
		cy.get('#successMessage').should('not.exist');
	}

	function assertSuccessMessage(message: string = 'Settings saved.') {
		cy.get('#successMessage')
			.should('be.visible')
			.should('have.text', message);
		assertNoErrorMessage();
	}

	function goToSettingsPage() {
		cy.get('#settings-link').click();
		waitForLoad();
	}

	function waitForLoad() {
		// At this point, the page is loaded
		assertDatabasePath(memoryDatabasePath);
	}

	function waitForMigrateModal() {
		cy.get('#confirm-migrate-modal')
			.should('be.visible')
			.should('have.attr', 'loaded', 'true');
	}

	function getErrorMessage() {
		return cy.get('#errorMessage');
	}
});

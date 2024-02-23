// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
import {
	apiUrl, changeDatabase,
} from '../cy-utils';

import '@cypress/code-coverage/support';

// Import commands.js using ES2015 syntax:
import './commands';
// Alternatively you can use CommonJS syntax:
// require('./commands')
import failOnConsoleError from 'cypress-fail-on-console-error';

const config = {
	consoleTypes: ['error', 'warn', 'info'],
	debug: false,
};

failOnConsoleError(config);

beforeEach(() => {
	changeDatabase(':memory:');
	cy.request('DELETE', `${apiUrl}/everything`);
	// This is important to go to the webpage but also to register spy to fail on console errors
	cy.visit('/');
});

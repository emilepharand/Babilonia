const { defineConfig } = require('cypress')
require('dotenv').config({path: '.env.test'});

module.exports = defineConfig({
	screenshotOnRunFailure: true,
	video: false,
	fixturesFolder: 'tests/e2e/fixtures',
	screenshotsFolder: 'tests/e2e/screenshots',
	videosFolder: 'tests/e2e/videos',
	e2e: {
		setupNodeEvents(on, config) {
			require('@cypress/code-coverage/task')(on, config)
			return config
		},
		baseUrl: `${process.env.VITE_BASE_URL}`,
		specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
		supportFile: 'tests/e2e/support/index.js',
		env: {
			VITE_API_URL: `${process.env.VITE_API_URL}`,
		},
	},
});

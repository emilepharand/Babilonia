require('dotenv').config();

const { defineConfig } = require('cypress')

module.exports = defineConfig({
	screenshotOnRunFailure: true,
	video: false,
	fixturesFolder: 'tests/e2e/fixtures',
	screenshotsFolder: 'tests/e2e/screenshots',
	videosFolder: 'tests/e2e/videos',
	pluginsFolder: 'tests/e2e/plugins',
	e2e: {
		// // We've imported your old cypress plugins here.
		// // You may want to clean this up later by importing these.
		baseUrl: `${process.env.BASE_URL}`,
		specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
		supportFile: 'tests/e2e/support/index.js',
		pluginFile: 'tests/e2e/plugins/index.js',
		screenshotsFolder: 'tests/e2e/screenshots',
		env: {
			VUE_APP_API_URL: `${process.env.VUE_APP_API_URL}`,
				codeCoverage: {
					url: `${process.env.BASE_URL}/__coverage__`,
				}
		},
		setupNodeEvents(on, config) {
			require('@cypress/code-coverage/task')(on, config)
			// include any other plugin code...

			// It's IMPORTANT to return the config object
			// with any changed environment variables
			return config
		}
	},
});

import {defineConfig} from 'cypress';

export default defineConfig({
	screenshotOnRunFailure: true,
	video: false,
	fixturesFolder: 'tests/e2e/fixtures',
	screenshotsFolder: 'tests/e2e/screenshots',
	videosFolder: 'tests/e2e/videos',
	e2e: {
		// // We've imported your old cypress plugins here.
		// // You may want to clean this up later by importing these.
		// setupNodeEvents(on, config) {
		// 	return require('./tests/e2e/plugins/index.cjs')(on, config);
		// },
		baseUrl: 'http://localhost:8888',
		specPattern: 'tests/e2e/specs/**/*.cy.{js,jsx,ts,tsx}',
		supportFile: 'tests/e2e/support/index.js',
	},
});

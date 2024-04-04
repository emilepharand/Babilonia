const Sequencer = require('@jest/test-sequencer').default;

class CustomTestSequencer extends Sequencer {
	sort(tests) {
		const smokeTests = tests.find(test => test.path.includes('smoke'));
		const migrationTests = tests.find(test => test.path.includes('migration'));

		tests = tests.filter(test => test !== smokeTests && test !== migrationTests);

		// Smoke tests should run first
		tests.unshift(smokeTests);

		// Migration tests should run last
		tests.push(migrationTests);

		return tests;
	}
}

module.exports = CustomTestSequencer;

const Sequencer = require('@jest/test-sequencer').default;

class CustomTestSequencer extends Sequencer {
	sort(tests) {
		const smokeTests = tests.find(test => test.path.includes('smoke'));

		tests = tests.filter(test => test !== smokeTests);

		// Smoke tests should run first
		tests.unshift(smokeTests);

		return tests;
	}
}

module.exports = CustomTestSequencer;

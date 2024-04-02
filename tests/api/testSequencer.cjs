const Sequencer = require('@jest/test-sequencer').default;

class CustomTestSequencer extends Sequencer {
	sort(tests) {
		const smokeTests = tests.find(test => test.path.includes('smoke'));

		if (smokeTests) {
			const otherTests = tests.filter(test => test !== smokeTests);
			return [smokeTests, ...otherTests];
		}

		return tests;
	}
}

module.exports = CustomTestSequencer;

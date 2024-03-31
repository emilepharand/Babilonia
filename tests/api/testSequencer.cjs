class CustomTestSequencer {
	sort(tests) {
		const specificTestName = 'smoke';
		const specificTest = tests.find(test => test.path.includes(specificTestName));

		if (specificTest) {
			const otherTests = tests.filter(test => test !== specificTest);
			return [specificTest, ...otherTests];
		}

		return tests;
	}
}

module.exports = CustomTestSequencer;

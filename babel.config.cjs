module.exports = function (api) {
	api.cache(true);
	if (process.env.TEST_MODE) {
		return {
			plugins: [
				['babel-plugin-istanbul', {
					extends: '@istanbuljs/nyc-config-typescript',
					extension: ['.ts', '.vue']
				}]
			]
		};
	}
	return {};
};

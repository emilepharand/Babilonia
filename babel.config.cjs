module.exports = function (api) {
	api.cache(true);
	return {
		plugins: [
			['babel-plugin-istanbul', {
				extends: '@istanbuljs/nyc-config-typescript',
				extension: ['.ts', '.vue']
			}]
		]
	};
};

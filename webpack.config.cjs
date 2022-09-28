// Config to compile server

const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
	entry: './index.ts',
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
	externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
	resolve: {
		extensions: ['.ts'],
	},
	output: {
		filename: 'api.cjs',
		path: path.resolve(__dirname, 'dist'),
	},
	experiments: {
		topLevelAwait: true
	},
};

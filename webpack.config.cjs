// Config to compile API server

const path = require('path');
const nodeExternals = require('webpack-node-externals');
const webpack = require('webpack');
require('dotenv').config()

module.exports = {
	entry: './server/index.ts',
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					{
						loader: 'babel-loader'
					},
					{
						loader: 'ts-loader'
					}
				]
			},
		]
	},
	target: 'node',
	externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
	externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
	resolve: {
		extensions: ['.ts'],
	},
	output: {
		filename: 'index.cjs',
		path: path.resolve(__dirname, 'dist')
	},
	experiments: {
		topLevelAwait: true
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.VITE_BASE_PORT': JSON.stringify(process.env.VITE_BASE_PORT),
			'process.env.VITE_API_PORT': JSON.stringify(process.env.VITE_API_PORT),
			'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
			'process.env.TEST_MODE': JSON.stringify(process.env.TEST_MODE),
		}),
	],
};

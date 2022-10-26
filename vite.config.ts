import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
	build: {sourcemap: 'inline'},
	plugins: [
		vue(),
		istanbul({
			exclude: ['node_modules', 'test/'],
			extension: ['.ts', '.vue'],
			forceBuildInstrument: true,
		}),
	],
	define: {
		'process.env': process.env,
	},
});

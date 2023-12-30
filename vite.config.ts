import vue from '@vitejs/plugin-vue';
import {defineConfig} from 'vite';
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
	build: process.env.TEST_MODE ? {sourcemap: 'inline'} : {},
	plugins: process.env.TEST_MODE
		? [
			vue(),
			istanbul({
				exclude: ['node_modules', 'test/'],
				extension: ['.ts', '.vue'],
				forceBuildInstrument: true,
			}),
		]
		: [vue()],
	define: {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'process.env': process.env,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
	},
});

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/** @type {import('vite').UserConfig} */
export default defineConfig({
  build:  {sourcemap: 'inline'},
  plugins: [
    vue()
  ],
})

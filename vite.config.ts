import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import viteCompVue from './vite-plugins-comp-vue'
import path from 'path'

const CWD = process.cwd()
const root: string = CWD

// path resolve
const resolve = _path => path.resolve(root, _path)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    viteCompVue({
      docDir: resolve('./src/packages')
    })
  ],
  resolve: {
    alias: {
      '@': resolve('./src'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ViteCompRuntime from '../vite-plugins-comp-vue/runtime/src'
import ViteCompMarkdown from '../vite-plugins-comp-vue/markdown/src/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    ViteCompRuntime(),
    ViteCompMarkdown()
  ]
})

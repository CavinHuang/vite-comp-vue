import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ViteCompRuntime from 'vite-comp-vue-runtime'
import ViteCompMarkdown from 'vite-comp-vue-markdown/dist/plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vueJsx(),
    ViteCompRuntime(),
    ViteCompMarkdown(),
    vue({
      include: [/\.vue$/, /\.md$/],
    })
  ] 
})

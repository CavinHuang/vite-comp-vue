import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ViteCompRuntime from 'vite-comp-vue-runtime'
import ViteCompMarkdown, { vueDocFiles } from 'vite-comp-vue-markdown/dist/plugin'
import path from 'path'
const APP_PATH = path.resolve(process.cwd(), '../vite-plugins-comp-vue/runtime/src')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vueJsx(),
    ViteCompRuntime({
      appPath: APP_PATH
    }),
    ViteCompMarkdown(),
    vue({
      include: vueDocFiles,
    })
  ] 
})

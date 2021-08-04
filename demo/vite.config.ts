import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import docPlugin from '../vite-plugins-comp-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    docPlugin({
      docDir: path.resolve(__dirname, './src/packages')
    })
  ]
})

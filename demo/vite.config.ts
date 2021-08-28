/*
 * @Author: your name
 * @Date: 2021-08-04 17:43:36
 * @LastEditTime: 2021-08-28 16:40:50
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \vite-comp-vue\demo\vite.config.ts
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ViteCompRuntime from 'vite-comp-vue-runtime'
import ViteCompMarkdown, { vueDocFiles } from 'vite-comp-vue-markdown/dist/plugin'
import ViteCompTypes from 'vite-comp-vue-types/dist/plugin'
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
    ViteCompTypes(),
    vue({
      include: vueDocFiles,
    })
  ]
})

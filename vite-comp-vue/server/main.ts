import { createApp } from 'vue'
import App from './App'


import { content, modules } from 'G:/NodeProjects/vite-comp-vue/src/packages/test1/readme.md'

console.log(content, modules)
  

import './assets/styles/markdown.scss'
import 'prismjs-material-theme/sass/oceanic.scss'
createApp(App, { content: content, modules }).mount('#app')
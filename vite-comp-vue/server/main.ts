import { createApp } from 'vue'
import App from './App'


import { content, modules } from 'E:/project/node/vite-test/src/packages/test1/README.md'

console.log(content, modules)
  

import './assets/styles/markdown.scss'
import 'prismjs-material-theme/sass/oceanic.scss'
createApp(App, { content: content }).mount('#app')
import { createApp } from 'vue'
import App from './App'
import { content, modules } from '@auto-import-md'
import './assets/styles/markdown.scss'
import 'prismjs-material-theme/sass/oceanic.scss'
createApp(App, { content: content, modules }).mount('#app')
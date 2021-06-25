import { createApp } from 'vue'
import App from './App'

{{mdContent}}

import './assets/styles/markdown.scss'
import 'prismjs-material-theme/sass/oceanic.scss'
createApp(App, { content: content, modules }).mount('#app')
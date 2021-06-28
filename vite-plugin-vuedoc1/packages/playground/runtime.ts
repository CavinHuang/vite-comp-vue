import { createApp, defineComponent, h } from 'vue'
// @ts-ignore
import MdContent from '@auto-import-md?md={{mdPath}}'
import 'vite-plugin-vuedoc/style.css'
const App = defineComponent({
  name: 'App',
  render() {
    return h(MdContent)
  }
})

const app = createApp(App)

app.mount('#app')
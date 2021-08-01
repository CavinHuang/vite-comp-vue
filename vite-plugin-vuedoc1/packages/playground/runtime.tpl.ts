import { createApp, defineComponent, h } from '/node_modules/.vite/vue.js'
// @ts-ignore
import MdContent from '{{mdPath}}?import'
console.log(MdContent, h(MdContent))
const App = defineComponent({
  name: 'App',
  template: '<MdContent />'
})

const app = createApp(App)

app.mount('#app')
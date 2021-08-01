import { inBrowser } from './utils'
import 'vite/dynamic-import-polyfill'
import { App, createApp as createClientApp, createSSRApp } from 'vue'
import Layout from './themes/default/Layout'
const NotFound = (() => '404 Not Found')

const VitePressApp = {
  name: 'viteCompRuntime',
  setup() {
    return () => <Layout />
  }
}

function newApp(): App {
  return import.meta.env.PROD
    ? createSSRApp(VitePressApp)
    : createClientApp(VitePressApp)
}

export function createApp() {

  const app = newApp()

  console.log(app)

  return { app }
}

if (inBrowser) {
  const { app } = createApp()

  // wait until page component is fetched before mounting
  app.mount('#app')
}
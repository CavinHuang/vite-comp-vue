import { inBrowser, pathToFile } from './utils'
import 'vite/dynamic-import-polyfill'
import { App, createApp as createClientApp, createSSRApp } from 'vue'
import Layout from './themes/default/Layout'
import { Router,RouterSymbol,createRouter } from './router'

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

function newRouter(): Router {
  let isInitialPageLoad = inBrowser
  let initialPath: string

  return createRouter((path) => {
    let pageFilePath = pathToFile(path)

    if (isInitialPageLoad) {
      initialPath = pageFilePath
    }

    // use lean build if this is the initial page load or navigating back
    // to the initial loaded path (the static vnodes already adopted the
    // static content on that load so no need to re-fetch the page)
    if (isInitialPageLoad || initialPath === pageFilePath) {
      pageFilePath = pageFilePath.replace(/\.js$/,'.lean.js')
    }

    // in browser: native dynamic import
    if (inBrowser) {
      isInitialPageLoad = false

      return import(/*@vite-ignore*/ pageFilePath)
    }

    // SSR: sync require
    // @ts-ignore
    return require(pageFilePath)
  },NotFound)
}

export function createApp() {
  const router = newRouter()
  const app = newApp()
  app.provide(RouterSymbol,router)
  console.log(app)

  return { app, router }
}

if (inBrowser) {
  const { app,router } = createApp()

  // wait until page component is fetched before mounting
  router.go().then(() => {
    app.mount('#app')
  })
}
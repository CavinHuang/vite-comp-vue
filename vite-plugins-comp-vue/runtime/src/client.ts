/**
 * runtime client ts 创建页面实例 和 页面切换
 */

// vite polyfill
import 'vite/dynamic-import-polyfill'
import { App, createApp as createClientApp, createSSRApp, h } from 'vue'
import Theme from './theme/default'
import { createRouter, RouterSymbol } from './router'
import { inBrowser, pathToFile } from './utils'
import { Router } from './types'
import Demo from './components/Demo'
import { ClientOnly } from './components/ClientOnly'

const NotFound = Theme.NotFound || (() => '404 Not Found')

const ViteCompApp = {
  name: 'VitePressApp',
  setup() {
    if (import.meta.env.PROD) {
      // in prod mode, enable intersectionObserver based pre-fetch
    }
    return () => h(Theme.Layout)
  }
}

export function createApp() {
  const router = newRouter()
  console.log(router)

  // 动态更新
  handleHMR(router)

  const app = newApp()

  app.provide(RouterSymbol, router)

  app.component('Demo', Demo)
  app.component('ClientOnly', ClientOnly)

  //const siteDataByRouteRef = useSiteDataByRoute(router.route)
  //const pageDataRef = usePageData(router.route)

  if (inBrowser) {
    // dynamically update head tags
    // useUpdateHead(router.route, siteDataByRouteRef)
  }

  // mixinGlobalComputed(app, siteDataRef, siteDataByRouteRef, pageDataRef)
  // mixinGlobalComponents(app)

  if (Theme.enhanceApp) {
    Theme.enhanceApp({
      app,
      router,
      // siteData: siteDataRef
    })
  }

  return { app, router }
}

function newApp(): App {
  return import.meta.env.PROD
    ? createSSRApp(ViteCompApp)
    : createClientApp(ViteCompApp)
}

/**
 * 返回router实例
 * @returns 
 */
function newRouter(): Router {
  let isInitialPageLoad = inBrowser
  let initialPath: string

  return createRouter((path) => {
    let pageFilePath = pathToFile(path)

    if (isInitialPageLoad) {
      initialPath = pageFilePath
    }

    // 如果这是初始页面加载或导航回初始加载路径（静态vnodes已经在该加载上采用了静态内容，因此无需重新获取页面，则使用精简构建）
    if (isInitialPageLoad || initialPath === pageFilePath) {
      pageFilePath = pageFilePath.replace(/\.js$/, '.lean.js')
    }

    // 在浏览器中：动态导入
    if (inBrowser) {
      isInitialPageLoad = false
      return import(/* @vite-ignore */pageFilePath)
    }

    // SSR: sync require
    return require(pageFilePath)
  }, NotFound)
}

/**
 * 热更新
 * @param router 
 */
function handleHMR(router: Router): void {
  // update route.data on HMR updates of active page
  if (import.meta.hot) {
    // hot reload pageData
    import.meta.hot!.on('viteComp:pageData', (payload) => {
      if (shouldHotReload(payload)) {
        router.route.data = payload.pageData
      }
    })
  }
}

/**
 * 热更新是否需要
 * @param payload 
 * @returns 
 */
function shouldHotReload(payload: any): boolean {
  const payloadPath = payload.path.replace(/(\bindex)?\.md$/, '')
  const locationPath = location.pathname.replace(/(\bindex)?\.html$/, '')

  return payloadPath === locationPath
}

if (inBrowser) {
  const { app, router } = createApp()

  // 等待获取页面组件后再装载
  router.go().then(() => {
    app.mount('#app')
  })
}
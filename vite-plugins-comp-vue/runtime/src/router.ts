/**
 * client 自定义路由
 */
import { Component, InjectionKey, reactive, markRaw, readonly, nextTick, inject } from 'vue'
import { PageData } from '../../shared/types'
import { PageModule, Route, Router } from './types'

/**
 * 路由 aprovide key
 */
export const RouterSymbol: InjectionKey<Router> = Symbol()

// 不能匹配的地址
const fakeHost = `http://a.com`

/**
 * 默认的地址
 * @returns 
 */
const getDefaultRoute = (): Route => ({
  path: '/',
  component: null,
  // 将在初始页面加载时设置，这是在应用程序加载之前，所以它保证在组件中可用
  data: null as any
})

/**
 * 创建路由 runtime
 * @param loadPageModule 加载模块
 * @param fallbackComponent 垫底组件
 * @returns 
 */
export const createRouter = (
  loadPageModule: (path: string) => PageModule | Promise<PageModule>,
  fallbackComponent?: Component
): Router => {
  const route = reactive(getDefaultRoute())
  const inBrowser = typeof window !== 'undefined'

  /**
   * 路由跳转
   * @param href 
   * @returns 
   */
  function go(href: string = inBrowser ? location.href : '/') {
    // 确保正确的深度链接，使页面刷新落在正确的文件上。
    const url = new URL(href, fakeHost)
    if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) {
      url.pathname += '.html'
      href = url.pathname + url.search + url.hash
    }
    if (inBrowser) {
      // 在更改Url之前，先保存滚动位置
      history.replaceState({ scrollPosition: window.scrollY }, document.title)
      history.pushState(null, '', href)
    }
    return loadPage(href)
  }

  // 保存最后在保存的路径
  let latestPendingPath: string | null = null

  /**
   * 获取
   * @param href 
   * @param scrollPosition 
   */
  async function loadPage(href: string, scrollPosition = 0) {
    const targetLoc = new URL(href, fakeHost)
    const pendingPath = (latestPendingPath = targetLoc.pathname)
    try {
      let page = loadPageModule(pendingPath)
      // only await if it returns a Promise - this allows sync resolution
      // on initial render in SSR.
      if ('then' in page && typeof page.then === 'function') {
        page = await page
      }
      if (latestPendingPath === pendingPath) {
        latestPendingPath = null

        const { default: comp, __pageData } = page as PageModule
        if (!comp) {
          throw new Error(`Invalid route component: ${comp}`)
        }

        route.path = pendingPath
        route.component = markRaw(comp)
        route.data = readonly(JSON.parse(__pageData)) as PageData

        if (inBrowser) {
          nextTick(() => {
            if (targetLoc.hash && !scrollPosition) {
              const target = document.querySelector(
                decodeURIComponent(targetLoc.hash)
              ) as HTMLElement
              if (target) {
                scrollTo(target, targetLoc.hash)
                return
              }
            }
            window.scrollTo(0, scrollPosition)
          })
        }
      }
    } catch (err) {
      if (!err.message.match(/fetch/)) {
        console.error(err)
      }
      if (latestPendingPath === pendingPath) {
        latestPendingPath = null
        route.path = pendingPath
        route.component = fallbackComponent ? markRaw(fallbackComponent) : null
      }
    }
  }

  if (inBrowser) {
    window.addEventListener('click', (e) => {
      const link = (e.target as Element).closest('a')
      if (link) {
        const { href, protocol, hostname, pathname, hash, target } = link
        const currentUrl = window.location
        const extMatch = pathname.match(/\.\w+$/)
        // 仅拦截入站链接
        if (!e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey &&
          !e.metaKey &&
          target !== `_blank` &&
          protocol === currentUrl.protocol &&
          hostname === currentUrl.hostname &&
          !(extMatch && extMatch[0] !== '.html')
        ) {
          e.preventDefault()
          if (pathname === currentUrl.pathname) {
            // 在同一页面中的哈希锚点之间进行滚动
            if (hash && hash !== currentUrl.hash) {
              history.pushState(null, '', hash)
              // 当单击标题锚定链接时，请使用平滑滚动
              scrollTo(link, hash, link.classList.contains('header-anchor'))
            }
          } else {
            go(href)
          }
        }
      }
    },
    { capture: true })

    // 路由变化 history
    window.addEventListener('popstate', (e) => {
      loadPage(location.href, (e.state && e.state.scrollPosition) || 0)
    })
    
    // 禁用hashchange
    window.addEventListener('hashchange', (e) => {
      e.preventDefault()
    })
  }

  return {
    route,
    go
  }
}

/**
 * router 信息 在初始化时注入的信息
 * @returns 
 */
export function useRouter(): Router {
  const router = inject(RouterSymbol)
  if (!router) {
    throw new Error('useRouter() is called without provider.')
  }
  return router
}

/**
 * 路由元信息
 * @returns 
 */
export function useRoute(): Route {
  return useRouter().route
}

/**
 * 滑动锚点 h1 h2 h3 h4 h5 h6
 * @param el 
 * @param hash 
 * @param smooth 
 */
function scrollTo(el: HTMLElement, hash: string, smooth = false) {
  const pageOffset = (document.querySelector('.nav-bar') as HTMLElement)
    .offsetHeight
  const target = el.classList.contains('.header-anchor')
    ? el
    : document.querySelector(decodeURIComponent(hash))
  if (target) {
    const targetTop = (target as HTMLElement).offsetTop - pageOffset - 15
    // only smooth scroll if distance is smaller than screen height.
    if (!smooth || Math.abs(targetTop - window.scrollY) > window.innerHeight) {
      window.scrollTo(0, targetTop)
    } else {
      window.scrollTo({
        left: 0,
        top: targetTop,
        behavior: 'smooth'
      })
    }
  }
}
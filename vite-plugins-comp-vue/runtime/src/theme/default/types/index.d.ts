import { App, ComponentOptions } from 'vue'
import { Router } from '../../../types'

/**
 * app 上下文
 */
export interface EnhanceAppContext {
  app: App
  router: Router
  // siteData: Ref<SiteData>
}

/**
 * theme 数据
 */
export interface Theme {
  Layout: ComponentOptions
  NotFound?: ComponentOptions
  enhanceApp?: (ctx: EnhanceAppContext) => void
}

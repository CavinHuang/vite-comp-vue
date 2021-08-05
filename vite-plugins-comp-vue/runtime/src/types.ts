/**
 * runtime 数据类型
 */
import { PageData } from '../../shared/types.d'
import { Component } from 'vue'

/**
 * 路由元信息
 */
export interface Route {
  path: string
  data: PageData
  component: Component | null
}

/**
 * 路由信息
 */
export interface Router {
  route: Route
  go: (href?: string) => Promise<void>
}

/**
 * 页面模块
 */
export interface PageModule {
  __pageData: string
  default: Component
}
/**
 * 公用的类型
 */

/**
 * 多语言配置
 */
export interface LocaleConfig {
  lang: string
  title?: string
  description?: string
  head?: HeadConfig[]
  label?: string
  selectText?: string
}

/**
 * 站点数据
 */
export interface SiteData<ThemeConfig = any> {
  base: string
  lang: string
  title: string
  description: string
  head: HeadConfig[]
  themeConfig: ThemeConfig
  locales: Record<string, LocaleConfig>
  customData: any
}

/**
 * head数据
 */
export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]


/**
 * 页面数据
 */
export interface PageData {
  // 页面的相对路径
  relativePath: string
  // 页面标题
  title: string
  // 页面说明
  description: string
  // 页面headers
  headers: Header[]
  // 页面matter
  frontmatter: Record<string, any>
  // 最后更新的时间
  lastUpdated: number
}

/**
 * 页面header数据
 */
export interface Header {
  // 页面的层级
  level: number
  // 页面header title
  title: string
  // 页面 slug
  slug: string
}
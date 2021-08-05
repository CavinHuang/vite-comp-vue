/**
 * 公用的类型
 */

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
import { Route } from '../../types'

// hash 正则
export const hashRE = /#.*$/
// 后缀 正则
export const extRE = /(index)?\.(md|html)$/
// 是否是 / 结尾
export const endingSlashRE = /\/$/
// 输出正则
export const outboundRE = /^[a-z]+:/i

/**
 * 时候是null 和 undefined
 * @param value 
 * @returns 
 */
export function isNullish(value: any): value is null | undefined {
  return value === null || value === undefined
}

/**
 * 是否是数组
 * @param value 
 * @returns 
 */
export function isArray(value: any): value is any[] {
  return Array.isArray(value)
}

/**
 * 是否是外部链接
 * @param path 
 * @returns 
 */
export function isExternal(path: string): boolean {
  return outboundRE.test(path)
}

/**
 * 当前是否是active
 * @param route 
 * @param path 
 * @returns 
 */
export function isActive(route: Route, path?: string): boolean {
  if (path === undefined) {
    return false
  }

  const routePath = normalize(`/${route.data.relativePath}`)
  const pagePath = normalize(path)

  return routePath === pagePath
}

/**
 * 正常化数据
 * @param path 
 * @returns 
 */
export function normalize(path: string): string {
  return decodeURI(path).replace(hashRE, '').replace(extRE, '')
}

/**
 * 加入URL
 * @param base 
 * @param path 
 * @returns 
 */
export function joinUrl(base: string, path: string): string {
  const baseEndsWithSlash = base.endsWith('/')
  const pathStartsWithSlash = path.startsWith('/')

  if (baseEndsWithSlash && pathStartsWithSlash) {
    return base.slice(0, -1) + path
  }

  if (!baseEndsWithSlash && !pathStartsWithSlash) {
    return `${base}/${path}`
  }

  return base + path
}

/**
 * get the path without filename (the last segment). for example, if the given
 * path is `/guide/getting-started.html`, this method will return `/guide/`.
 * Always with a trailing slash.
 */
export function getPathDirName(path: string): string {
  const segments = path.split('/')

  if (segments[segments.length - 1]) {
    segments.pop()
  }

  return ensureEndingSlash(segments.join('/'))
}

/**
 * 获取 文件 路径
 * @param path 
 * @returns 
 */
export function ensureSlash(path: string): string {
  return ensureEndingSlash(ensureStartingSlash(path))
}

/**
 * 增加 /
 * @param path 
 * @returns 
 */
export function ensureStartingSlash(path: string): string {
  return /^\//.test(path) ? path : `/${path}`
}

/**
 *  结尾增加 /
 * @param path 
 * @returns 
 */
export function ensureEndingSlash(path: string): string {
  return /(\.html|\/)$/.test(path) ? path : `${path}/`
}

/**
 * Remove `.md` or `.html` extention from the given path. It also converts
 * `index` to slush.
 */
export function removeExtention(path: string): string {
  return path.replace(/(index)?(\.(md|html))?$/, '') || '/'
}

export const inBrowser = typeof window !== 'undefined'

/**
 * 转换 \ 为 /
 */
export function joinPath(base: string, path: string): string {
  return `${base}${path}`.replace(/\/+/g, '/')
}

/**
 * 将uRl路径转换为相应的js块文件名。
 */
export function pathToFile(path: string): string {
  let pagePath = path.replace(/\.html$/, '')
  if (pagePath.endsWith('/')) {
    pagePath += 'index'
  }

  if (import.meta.env.DEV) {
    // 开发环境始终是最新的代码
    pagePath += `.md?t=${Date.now()}`
  } else {
    // 在生产过程中，每个.md文件都按照路径转换方案内置到一个.md.js文件中。
    // /foo/bar.html -> ./foo_bar.md
    if (inBrowser) {
      const base = import.meta.env.BASE_URL
      pagePath = pagePath.slice(base.length).replace(/\//g, '_') + '.md'
      // 客户端生产生成需要考虑页面注入，它被直接注入到页面的html中
      const pageHash = __VP_HASH_MAP__[pagePath.toLowerCase()]
      pagePath = `${base}assets/${pagePath}.${pageHash}.js`
    } else {
      // ssr构建使用了更简单的名称映射
      pagePath = `./${pagePath.slice(1).replace(/\//g, '_')}.md.js`
    }
  }

  return pagePath
}

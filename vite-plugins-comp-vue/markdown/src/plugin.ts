/**
 * markdown 解析插件
 */
import { Plugin } from 'vite'
import path from 'path'
import { createMarkdownToVueRenderFn } from './markdownToVue'

const docRoot = path.resolve(process.cwd(), './src/packages')

let hasDeadLinks: boolean = false

export default ():Plugin => {
  const markdownToVue = createMarkdownToVueRenderFn(docRoot, undefined, [])

  return {
    name: 'vite-comp-vue-markdown',
    resolveId(id) {
      if (id.toLowerCase().endsWith('.md')) {
        return path.join(docRoot, id)
      }
    },
    transform(code, id) {
      if (id.toLowerCase().endsWith('.md')) {
        const { vueSrc, deadLinks } = markdownToVue(code, id)
        if (deadLinks.length) {
          hasDeadLinks = true
        }
        return {
          code: vueSrc
        }
      }
      return {
        code
      }
    }
  }
}
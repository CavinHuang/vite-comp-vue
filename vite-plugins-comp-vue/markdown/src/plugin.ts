/**
 * markdown 解析插件
 */
import { Plugin } from 'vite'
import path from 'path'
import { createMarkdownToVueRenderFn } from './markdownToVue'
import { DemoBlockType } from './markdown'
import { slash, resolvePath } from './utils/slash'

const docRoot = path.resolve(process.cwd(), './src/packages')

let hasDeadLinks: boolean = false
let transformVisualVd = false

const cacheDemos: Map<string, DemoBlockType[]> = new Map()


export default ():Plugin => {
  const markdownToVue = createMarkdownToVueRenderFn(docRoot, undefined, [])

  return {
    name: 'vite-comp-vue-markdown',
    resolveId(id) {
      if (id.toLowerCase().endsWith('.md')) {
        return path.join(docRoot, id)
      }
      if (/\.md\.vdpv_(\d+)\.vd$/.test(id)) {
        if (transformVisualVd) return id
        const idPath: string = id.startsWith(docRoot + '/') ? id : path.join(docRoot, id.substr(1))
        transformVisualVd = true
        return idPath
      }
    },
    load(id) {
      const mat = id.match(/\.md\.vdpv_(\d+)\.vd$/)
      if (mat && mat.length >= 2) {
        id = resolvePath(slash(docRoot), slash(id.substr(1)))
        const index: number = Number(mat[1])
        const mdFileName = id.replace(`.vdpv_${index}.vd`, '')
        const demoBlocks = cacheDemos.get(mdFileName)
        console.log('cacheDemos', demoBlocks)
        return 'export default {}'
      }
    },
    transform(code, id) {
      if (id.toLowerCase().endsWith('.md')) {
        const { vueSrc, deadLinks, demoBlocks } = markdownToVue(code, id)
        cacheDemos.set(id, demoBlocks)
        console.log('block', demoBlocks)
        if (deadLinks.length) {
          hasDeadLinks = true
        }
        transformVisualVd = false
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
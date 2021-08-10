/**
 * markdown 解析插件
 */
import { Plugin } from 'vite'
import path from 'path'
import { createMarkdownToVueRenderFn } from './markdownToVue'
import { DemoBlockType } from './markdown'

const docRoot = path.resolve(process.cwd(), './src/packages')

let hasDeadLinks: boolean = false

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
        const idPath: string = id.startsWith(docRoot + '/') ? id : path.join(docRoot, id.substr(1))
        console.log('=少时诵诗书', id)
        console.log('+++++', id)
        console.log('+++++', idPath)
        return idPath
      }
    },
    load(id) {
      const mat = id.match(/\.md\.vdpv_(\d+)\.vd$/)
      if (mat && mat.length >= 2) {
        const index: number = Number(mat[1])
        const mdFileName = id.replace(`.vdpv_${index}.vd`, '')
        console.log(index, mdFileName)
        const demoBlocks = cacheDemos.get(mdFileName)
        return demoBlocks?.[index].code
      }
    },
    transform(code, id) {
      if (id.toLowerCase().endsWith('.md')) {
        const filePath = id.startsWith(docRoot + '/') ? id : path.join(docRoot, id.substr(1))
        const { vueSrc, deadLinks, demoBlocks } = markdownToVue(code, id)
        cacheDemos.set(filePath, demoBlocks)
        // console.log('block', id, vueSrc, demoBlocks)
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
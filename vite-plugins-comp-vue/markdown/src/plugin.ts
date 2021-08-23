import { resetId } from './utils/pageId';
import { cache } from './markdownToVue';
/**
 * markdown 解析插件
 */
import { Plugin, ModuleNode } from 'vite'
import path from 'path'
import { createMarkdownToVueRenderFn } from './markdownToVue'
import { slash, resolvePath } from './utils/slash'
import { demoBlockBus } from './utils/data'
import { DemoBlockType } from './markdown';

const docRoot = path.resolve(process.cwd(), './src/packages')

let hasDeadLinks: boolean = false
let transformVisualVd = false
let vuePlugin: any | undefined
const cacheDemos: Map<string, DemoBlockType[]> = new Map()

export const vueDocFiles = [/\.vue$/, /\.md$/, /\.vd$/]
export default ():Plugin => {

  return {
    name: 'vite-comp-vue-markdown',
    configResolved(resolvedConfig) {
      // store the resolved config
      vuePlugin = resolvedConfig.plugins.find(p => p.name === 'vite:vue')
    },
    resolveId(id) {
      if (id.toLowerCase().endsWith('.md')) {
        return path.join(docRoot, id)
      }
      if (/\.md\.vdpv_(\d+)\.vd$/.test(id)) {
        // if (transformVisualVd) return id
        // const idPath: string = id.startsWith(docRoot + '/') ? id : path.join(docRoot, id.substr(1))
        // transformVisualVd = true
        return id
      }
    },
    load(id) {
      const mat = id.match(/\.md\.vdpv_(\d+)\.vd$/)
      if (mat && mat.length >= 2) {
        console.log('++++++++++++++++', id, docRoot)
        id = resolvePath(slash(docRoot), slash(id))
        const index: number = Number(mat[1])
        const demoId = `vdpv_${index}`
        const mdFileName = id.replace(`.${demoId}.vd`, '').replace(/\\/g, '')
        const demoBlocks = demoBlockBus.getCache(mdFileName)!
        const _demoData = [...demoBlocks || []]
        cacheDemos.set(mdFileName, _demoData)
        console.log('mat',mat)
        console.log('id',id)
        console.log('demoId',demoId)
        console.log('mdFileName',mdFileName)
        console.log('demoBlocks',demoBlocks)
        console.log('_demoData',_demoData)
        console.log('demoBlockBus',demoBlockBus.cacheDemos)
        const getLastDemo = _demoData.filter(item => item.id === demoId)
        console.log('代码块', getLastDemo, getLastDemo[getLastDemo.length - 1])
        transformVisualVd = false
        return demoBlocks ? getLastDemo[getLastDemo.length - 1] : 'export default {}'
      }
    },
    transform(code, id) {
      if (id.toLowerCase().endsWith('.md')) {
        console.log('md path', id)
        const markdownToVue = createMarkdownToVueRenderFn(docRoot, id, undefined, [])
        const { vueSrc, deadLinks } = markdownToVue(code, id)
        if (deadLinks.length) {
          hasDeadLinks = true
        }
        transformVisualVd = false
        return {
          code: vueSrc
        }
      }
      transformVisualVd = false
      return {
        code
      }
    },
    async handleHotUpdate(ctx) {
      if (!vuePlugin) {
        return []
      }
      // handle config hmr
      const { file, read, timestamp, server } = ctx
      const { moduleGraph } = server
      // hot reload .md files as .vue files
      if (file.endsWith('.md')) {
        const content = await read()
        console.log(`handleHotUpdate: md -> ${file}`)
        const cacheKey = file.replace(/[/\\]/g, '')
        // demoBlockBus.setCache(cacheKey, [])
        // resetId(cacheKey)
        const markdownToVue = createMarkdownToVueRenderFn(docRoot, file, undefined, [])
        const { vueSrc, deadLinks, demoBlocks: demos } = markdownToVue(content, file)
        const prevDemoBlocks = [...(cacheDemos.get(cacheKey) || [])]
        const updateModules: ModuleNode[] = []
        //     file: string;
        // timestamp: number;
        // modules: Array<ModuleNode>;
        // read: () => string | Promise<string>;
        // server: ViteDevServer;
        console.log('测试数据新render', demos)
        const demoBlocks = demoBlockBus.getCache(cacheKey) || []
        console.log('上一次跟现有的', prevDemoBlocks, demoBlocks)
        demoBlocks.forEach(async (demo, index) => {
          const prevDemo = prevDemoBlocks[index]
          console.log('++++++sdsdsadasdsa', prevDemo, prevDemoBlocks)
          if (!prevDemo || demo.id !== prevDemo.id || demo.code !== prevDemo.code) {
            let demoFile = `${file}.${demo.id}.vd`
            console.log(demoFile, docRoot)
            // /src/packages/guide/write-demo.md.vdpv_0.vd
            demoFile = demoFile.replace(process.cwd().replace(/\\/g, '/'), '')
            console.log(`handleHotUpdate: demo -> ${demoFile}`)
            const mods = moduleGraph.getModulesByFile(demoFile)
            const ret = await vuePlugin.handleHotUpdate!({
              file: demoFile,
              timestamp: timestamp,
              modules: mods ? [...mods] : [],
              server: server,
              read: () => demo.code
            })
            console.log('+++++++++', vuePlugin, ret)
            if (ret) {
              updateModules.push(...ret)
            }
            // watcher.emit('change', demoFile)
          }
        })
        // reload the content component
        const ret = await vuePlugin.handleHotUpdate!({
          ...ctx,
          read: () => vueSrc
        })
        return [...updateModules, ...(ret || [])]
        // return ret
      }
    }
  }
}
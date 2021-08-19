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
        const mdFileName = id.replace(`.vdpv_${index}.vd`, '').replace(/\\/g, '')
        const demoBlocks = demoBlockBus.getCache(mdFileName)!
        const _demoData = [...demoBlocks]
        cacheDemos.set(mdFileName, _demoData)
        console.log('cacheDemos', mdFileName, demoBlocks, demoBlockBus.cacheDemos)
        return demoBlocks ? demoBlocks[0] : 'export default {}'
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
        const markdownToVue = createMarkdownToVueRenderFn(docRoot, file, undefined, [])
        const { vueSrc, deadLinks } = markdownToVue(content, file)
        const cacheKey = file.replace(/[/\\]/g, '')
        const prevDemoBlocks = [...(cacheDemos.get(cacheKey) || [])]
        const updateModules: ModuleNode[] = []
        console.log(prevDemoBlocks, cacheDemos)
        //     file: string;
        // timestamp: number;
        // modules: Array<ModuleNode>;
        // read: () => string | Promise<string>;
        // server: ViteDevServer;
        const demoBlocks = demoBlockBus.getCache(cacheKey) || []
        demoBlocks.forEach(async (demo, index) => {
          const prevDemo = prevDemoBlocks[index]
          console.log('++++++sdsdsadasdsa', prevDemo, prevDemoBlocks)
          if (prevDemo && (demo.id !== prevDemo.id || demo.code !== prevDemo.code)) {
            const demoFile = `${file}.${prevDemo.id}.vd`
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
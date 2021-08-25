import { resetVisualIndex } from './plugins/demo';
import { resetId } from './utils/pageId';
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
        id = resolvePath(slash(docRoot), slash(id))
        const index: number = Number(mat[1])
        const demoId = `vdpv_${index}`
        const mdFileName = id.replace(`.${demoId}.vd`, '').replace(/\\/g, '')
        const demoBlocks = demoBlockBus.getCache(mdFileName)!
        const _demoData = [...demoBlocks || []]
        cacheDemos.set(mdFileName, _demoData)
        const getLastDemo = _demoData.filter(item => item.id === demoId)
        return demoBlocks ? getLastDemo[getLastDemo.length - 1] : 'export default {}'
      }
    },
    transform(code, id) {
      if (id.toLowerCase().endsWith('.md')) {
        console.log('md path', id)
        resetId(id)
        resetVisualIndex()
        const markdownToVue = createMarkdownToVueRenderFn(docRoot, id, undefined, [])
        const { vueSrc } = markdownToVue(code, id)
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
        const cacheKey = file.replace(/[/\\]/g, '')
        demoBlockBus.setCache(cacheKey, [])
        resetId(cacheKey)
        resetVisualIndex()
        const markdownToVue = createMarkdownToVueRenderFn(docRoot, file, undefined, [])
        const { vueSrc } = markdownToVue(content, file)
        const prevDemoBlocks = [...(cacheDemos.get(cacheKey) || [])]
        const updateModules: ModuleNode[] = []
        //     file: string;
        // timestamp: number;
        // modules: Array<ModuleNode>;
        // read: () => string | Promise<string>;
        // server: ViteDevServer;
        const demoBlocks = demoBlockBus.getCache(cacheKey) || []
        demoBlocks.forEach(async (demo, index) => {
          const prevDemo = prevDemoBlocks[index]
          if (!prevDemo || demo.id !== prevDemo.id || demo.code !== prevDemo.code) {
            let demoFile = `${file}.${demo.id}.vd`
            // /src/packages/guide/write-demo.md.vdpv_0.vd
            demoFile = demoFile.replace(docRoot.replace(/\\/g, '/'), '')
            console.log(`handleHotUpdate: demo -> ${demoFile}`)
            const mods = moduleGraph.getModulesByFile(demoFile)
            const ret = await vuePlugin.handleHotUpdate!({
              file: demoFile,
              timestamp: timestamp,
              modules: mods ? [...mods] : [],
              server: server,
              read: () => demo.code
            })
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
import { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import parseMdPath from './midlewares/parseMdPath'
import sysDebug from 'debug'
import slash from 'slash'
const debug = sysDebug('vite:vuedoc:md')

const autoImportMdContent = (mdPath) => `
    import { createApp, defineComponent, h } from '/node_modules/.vite/vue.js'
    import Md from "${slash(mdPath)}?import"
    console.log(Md)
    const _sfc_md = defineComponent({
      name: 'SFC_MD',
      render() {
        return h(Md)
      }
    })  

    createApp(_sfc_md).mount('#app')
  `
let config: ResolvedConfig = null
export const serverMiddlewares = (): Plugin => ({
  name: 'viteCompVue-server-middleware',
  configResolved(resolvedConfig) {
    // store the resolved config
    config = resolvedConfig
  },
  configureServer (server: ViteDevServer) {
    debug('dev server')
    server.middlewares.use((req, res, next) => {
      parseMdPath(config, req, res, next)
    })
    server.middlewares.use((req, res, next) => {
      if (req.originalUrl.includes('/@auto-import-md')) {
        const mdPath = req.originalUrl.split('?')
        const content = autoImportMdContent(mdPath[1].split('=')[1])
        res.writeHead(200, {'Content-Type': 'application/javascript', 'content-length': content.length}).end(content)
        return
      }
      next()
    })
  }
})
import { ViteDevServer } from 'vite'
import parseMdPath from './midlewares/parseMdPath'
const debug = require('debug')('vite:vuedoc:md')

const autoImportMdContent = (mdPath) => `
    import { content, modules } from ${mdPath}
    console.log(content, modules)
  `

export const serverMiddlewares = () => ({
  name: 'viteCompVue-server-middleware',
  configureServer (server: ViteDevServer) {
    debug('dev server')
    server.middlewares.use(parseMdPath)
  }
})
import { ViteDevServer } from 'vite'
import parseMdPath from './midlewares/parseMdPath'
const debug = require('debug')('vite:vuedoc:md')
export const serverMiddlewares = () => ({
  name: 'viteCompVue-server-middleware',
  configureServer (server: ViteDevServer) {
    debug('dev server')
    server.middlewares.use(parseMdPath)
  }
})
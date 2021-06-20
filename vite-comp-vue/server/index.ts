import { ViteDevServer } from 'vite'
import parseMdPath from './midlewares/parseMdPath'
export const serverMiddlewares = () => ({
  name: 'viteCompVue-server-middleware',
  configureServer (server: ViteDevServer) {
    server.middlewares.use(parseMdPath)
  }
})
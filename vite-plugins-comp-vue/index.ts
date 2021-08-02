import { Plugin } from 'vite'
import { APP_PATH } from './config'
import { routerPaths } from './vite-plugin-comp-runtime/siteData'

export interface ViteCompConfig {
  docDir: string
}

export default (config: ViteCompConfig): Plugin => {

  return {
    name: 'vite-comp-vue',
    resolveId(id) {
      if (id === '@routerPaths') {
        return id
      }
    },

    async load(id) {
      if (id === '@routerPaths') {
        return `export default ${JSON.stringify(await routerPaths(config))}`
      }
    },
    configureServer(server) {
      // serve our index.html after vite history fallback
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.url!.endsWith('.html')) {
            res.statusCode = 200
            res.end(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/@fs/${APP_PATH}/index.tsx"></script>
  </body>
</html>`)
            return
          }
          next()
        })
      }
    },
  }
}
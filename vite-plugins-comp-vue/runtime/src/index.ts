/**
 * runtime plugin
 */
import { Plugin } from 'vite'
import path from 'path'
const APP_PATH = path.resolve(process.cwd(), '../vite-plugins-comp-vue/runtime/src')

export default (): Plugin => {
  return {
    name: 'vite-comp-vue-runtime',
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
    <script type="module" src="/@fs/${APP_PATH}/client.ts"></script>
  </body>
</html>`)
            return
          }
          next()
        })
      }
    }
  }
} 
/**
 * runtime plugin
 */
import { Plugin } from 'vite'

export default (config: {
  appPath: string
}): Plugin => {
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
    <script type="module" src="/@fs/${config.appPath}/client.ts"></script>
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
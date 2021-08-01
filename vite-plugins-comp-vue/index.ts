import { Plugin } from 'vite'
import { APP_PATH } from './config'

export default (): Plugin => {

  return {
    name: 'vite-comp-vue',
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
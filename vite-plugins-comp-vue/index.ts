import { SiteConfig } from './types/index'
import { Plugin } from 'vite'
import { APP_PATH } from './config'
import { routerPaths } from './vite-plugin-comp-runtime/siteData'
import { createMarkdownToVueRenderFn } from './vite-plugin-md/markdownToVue'

export interface ViteCompConfig extends SiteConfig {
  docDir: string
}

let hasDeadLinks = false

export default async (config: ViteCompConfig): Promise<Plugin> => {
  const pages = await routerPaths(config)
  const pagesData = pages.routerPaths.map(page => page.path)
  const markdownToVue = createMarkdownToVueRenderFn(config.docDir, config.markdown, pagesData)

  return {
    name: 'vite-comp-vue',
    resolveId(id) {
      if (id === '@routerPaths') {
        return id
      }
      console.log("+++++++++", id)
      if (id.includes('md')) {
        const item = pages.routerPaths.find(item => id.substring(1, id.length - 3) + '.html' === item.path)
        console.log('++sssss', id.substring(1, id.length - 3), item, pages.routerPaths)
        if (item) {
          return item.filePath
        }
      }
    },

    async load(id) {
      if (id === '@routerPaths') {
        return `export default ${JSON.stringify(pages)}`
      }
    },

    transform(code, id) {
      if (id.endsWith('.md') || id.endsWith('.MD')) {
        // transform .md files into vueSrc so plugin-vue can handle it
        const { vueSrc, deadLinks } = markdownToVue(code, id)
        if (deadLinks.length) {
          hasDeadLinks = true
        }
        return vueSrc
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
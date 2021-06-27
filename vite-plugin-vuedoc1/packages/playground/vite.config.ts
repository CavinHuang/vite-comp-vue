import { Plugin, UserConfig, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { createPlugin, vueDocFiles } from 'vite-plugin-vuedoc'
import { Connect, ResolvedConfig } from 'vite'
import { ServerResponse } from 'http'
import path from 'path'
import { hasDir, readTextFs } from './shared/fs'
import { firstToUpper } from './shared/string'
import sysDebug from 'debug'
import slash from 'slash'


import { resolve } from 'path'
export function useMdContentHtml(mdPath) {
  const content = readTextFs(resolve(__dirname, './index.html'))
  return content.replace('<!--inject-->', `<script type="module" src="/@auto-import-md?md=${slash(mdPath)}"></script>`)
}

const root = process.cwd()
const debug = sysDebug('vite:vuedoc:md')
const serverMiddlewareRewite = (req, res, next) => {
  const reg = /(README*).html/ig
  const originalUrl = req.originalUrl as string
  if (reg.test(originalUrl)) {
    const pathItems = originalUrl.split('/')
    let _path = path.join(root, 'src')
    let i = 0

    while(i < pathItems.length - 1) {
      const curPathItem = pathItems.slice(i, i + 1).pop()
      let upCasePath = path.join(_path, firstToUpper(curPathItem))
      let lowCasePath = path.join(_path, curPathItem.toLowerCase())
      if (hasDir(upCasePath)) {
        _path = upCasePath
      }
      if (hasDir(lowCasePath)) {
        _path = lowCasePath
      }
      i++
    }

    if (hasDir(_path) && i == pathItems.length - 1) {
      const mdFileName = pathItems[pathItems.length - 1].split('.')[0] + '.md'
      const mdFilePath = path.join(_path, mdFileName)
      if (hasDir(mdFilePath)) {
        debug('md path => '+mdFilePath)
        const content = useMdContentHtml(mdFilePath.split(root)[1])
        res.statusCode = 200;
        res.end(content)
        return
      }
    }
  }
  next()
}
const autoImportMdContent = (mdPath) => `import { createApp, defineComponent, h } from '/node_modules/.vite/vue.js'
import Md from "${mdPath}?import"
const _sfc_md = defineComponent({
  name: 'SFC_MD',
  components: {
    Md
  },
  render() {
    return h(Md)
  }
})
const createMyApp = () => createApp(_sfc_md)
createMyApp().mount('#app')
`
const serverPlugin = (): Plugin => {
  return {
    name: 'dev-plugin',
    configureServer (app: ViteDevServer) {
      app.middlewares.use(serverMiddlewareRewite)
      app.middlewares.use((req, res, next) => {
      if (req.originalUrl.includes('/@auto-import-md')) {
        const mdPath = req.originalUrl.split('?')
        const content = autoImportMdContent(mdPath[1].split('=')[1])
        res.writeHead(200, {'Content-Type': 'application/javascript', 'content-length': content.length}).end(content)
        return
      }
      next()
    })
    }
  }
}

const config: UserConfig = {
  plugins: [
    createPlugin({
      highlight: {
        theme: 'one-dark'
      }
    }),
    vue({
      include: [...vueDocFiles]
    }),
    vueJsx(),
    serverPlugin()
  ]
}

export default config

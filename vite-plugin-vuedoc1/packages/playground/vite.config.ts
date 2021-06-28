import { Plugin, UserConfig, ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { createPlugin, vueDocFiles } from 'vite-plugin-vuedoc'
import path from 'path'
import { hasDir, readTextFs } from './shared/fs'
import { firstToUpper } from './shared/string'
import sysDebug from 'debug'
import slash from 'slash'
import { resolve } from 'path'
import fs from 'fs'

let MdPath = ''
export function useMdContentHtml(mdPath) {
  const content = readTextFs(resolve(__dirname, './index.html'))
  MdPath = mdPath
  return content.replace('{{mdPath}}', slash(mdPath))
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

const AppVueContent = (mdPath: string) => {
  return `
import { createHotContext as __vite__createHotContext } from "/@vite/client";
import.meta.hot = __vite__createHotContext("${mdPath.substring(1, mdPath.length)}");
import Doc from "${mdPath}?import";
const App = {
  components: {
    Doc
  }
};
const _sfc_main = App;

import { createVNode as _createVNode, resolveComponent as _resolveComponent, Fragment as _Fragment, openBlock as _openBlock, createBlock as _createBlock, withScopeId as _withScopeId, pushScopeId as _pushScopeId, popScopeId as _popScopeId } from "/node_modules/.vite/vue.js?v=8b124425"
const _withId = /*#__PURE__*/_withScopeId("data-v-7ba5bd90")

_pushScopeId("data-v-7ba5bd90")
const _hoisted_1 = /*#__PURE__*/_createVNode("h1", null, "Vite Playground", -1 /* HOISTED */)
const _hoisted_2 = /*#__PURE__*/_createVNode("div", { class: "d-row" }, "This div should be green", -1 /* HOISTED */)
_popScopeId()

const _sfc_render = /*#__PURE__*/_withId((_ctx, _cache, $props, $setup, $data, $options) => {
  const _component_Doc = _resolveComponent("Doc")

  return (_openBlock(), _createBlock(_Fragment, null, [
    _hoisted_1,
    _hoisted_2,
    _createVNode(_component_Doc)
  ], 64 /* STABLE_FRAGMENT */))
})

_sfc_main.render = _sfc_render
_sfc_main.__scopeId = "data-v-7ba5bd90"
_sfc_main.__file = "${path.join(root, mdPath)}"
export default _sfc_main
_sfc_main.__hmrId = "7ba5bd90"
typeof __VUE_HMR_RUNTIME__ !== 'undefined' && __VUE_HMR_RUNTIME__.createRecord(_sfc_main.__hmrId, _sfc_main)
export const _rerender_only = true
import.meta.hot.accept(({ default: updated, _rerender_only }) => {
  console.log(__VUE_HMR_RUNTIME__, updated)
  if (_rerender_only) {
    console.log(__VUE_HMR_RUNTIME__, updated)
    __VUE_HMR_RUNTIME__.rerender(updated.__hmrId, updated.render)
  } else {
    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated)
  }
})
`
}

const serverPlugin = (): Plugin => {
  return {
    name: 'dev-plugin',
    configureServer (app: ViteDevServer) {
      app.middlewares.use(serverMiddlewareRewite)
      app.middlewares.use((req, res, next) => {
        if (req.originalUrl.includes('App.vue')) {
          res.writeHead(200, { 'Content-Type': 'application/javascript' }).end(AppVueContent(slash(MdPath)))
          return
        }
        // if (req.originalUrl.includes('/runtime.ts')) {
        //   const runtimePath = resolve(root, './runtime.tpl.ts')
        //   const runtimeContent = readTextFs(runtimePath)
        //   res.writeHead(200, { 'Content-Type': 'application/javascript' }).end(runtimeContent.replace('{{mdPath}}', slash(MdPath)))
        //   return
        // }
        // if (req.originalUrl.includes('/@auto-import-md')) {
        //   const mdPath = req.originalUrl.split('?')
        //   const content = autoImportMdContent(mdPath[1].split('=')[1])
        //   res.writeHead(200, {'Content-Type': 'application/javascript', 'content-length': content.length}).end(content)
        //   return
        // }
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

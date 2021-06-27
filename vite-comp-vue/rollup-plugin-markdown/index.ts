import { MdModule, MdModuleType } from './../shared/markdown'
import { createFilter } from 'rollup-pluginutils'
import { PluginOption, ResolvedConfig } from 'vite'
import path from 'path'
import marked from 'marked'
import { createMarkdownRenderFn } from './markdownToVue'
import hljs from 'highlight.js'
import sysDebug from 'debug'

const ext = /\.md$/;
const debug = sysDebug('vite:vuedoc:plugin')
const cacheDemos: Map<string, MdModule> = new Map()

export type VueDocPluginOptions = {
  wrapperClass: string
  previewClass: string
  previewComponent: string
  markdownIt: {
    plugins: any[]
  }
  highlight: {
    theme: 'one-dark' | 'one-light' | string
  }
}

function unquote(str: string) {
  if (!str) {
    return ''
  }
  const reg = /[\'\"]/
  let ret = str
  if (reg.test(ret.charAt(0))) {
    ret = ret.substr(1)
  }
  if (reg.test(ret.charAt(ret.length - 1))) {
    ret = ret.substr(0, ret.length - 1)
  }
  return ret
}

export default function md ( options: Partial<VueDocPluginOptions> = {}): PluginOption {
  const { wrapperClass = '', previewClass = '', previewComponent = '', markdownIt, highlight } = options
  const { plugins = [] } = markdownIt || {}
  const { theme = 'one-dark' } = highlight || {}
  const _options: VueDocPluginOptions = {
    wrapperClass,
    previewClass,
    previewComponent,
    markdownIt: {
      plugins
    },
    highlight: {
      theme
    }
  }
  let config: ResolvedConfig
  return {
      name: 'md',
      configResolved(resolvedConfig) {
        // store the resolved config
        config = resolvedConfig
      },
      resolveId(id) {
        if (/\.md\.vdpv_(\d+)\.vd$/.test(id)) {
          const idPath: string = id.startsWith(config.root + '/') ? id : path.join(config.root, id.substr(1))
          debug('resolve demo:', idPath)
          return idPath
        }
      },
      load(id) {
        const mat = id.match(/\.md\.vdpv_(\d+)\.vd$/)
        if (mat && mat.length >= 2) {
          const index: number = Number(mat[1])
          debug(`load:${id} ${index}`)
          const mdFileName = id.replace(`.vdpv_${index}.vd`, '')
          const mdFilePath = mdFileName.startsWith(config.root + '/')
            ? mdFileName
            : path.join(config.root, mdFileName.substr(1))

          const demoBlocks = cacheDemos.get(mdFilePath)
          return demoBlocks?.[index].code
        }
      },
      transform ( md, id ) {
        if (id.endsWith('.md')) {
          const filePath = id.startsWith(config.root + '/') ? id : path.join(config.root, id.substr(1))
          debug(`transform:md -> ${filePath}`)
          debug(`transform:config -> ${config.root}`)
          const markdownToVue = createMarkdownRenderFn(_options, config)
          const { component, demoBlocks } = markdownToVue(md, filePath)
          cacheDemos.set(filePath, demoBlocks)
          return component
        }
      }
  }
}
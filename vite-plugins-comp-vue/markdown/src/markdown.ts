import MarkdownIt from 'markdown-it'
import { parseHeader } from './utils/parseHeader'
import { highlight } from './plugins/highlight'
import { slugify } from './plugins/slugify'
import { highlightLinePlugin } from './plugins/highlightLines'
import { lineNumberPlugin } from './plugins/lineNumbers'
import { componentPlugin } from './plugins/component'
import { containerPlugin } from './plugins/containers'
import { snippetPlugin } from './plugins/snippet'
import { hoistPlugin } from './plugins/hoist'
import { preWrapperPlugin } from './plugins/preWrapper'
import { linkPlugin } from './plugins/link'
import { extractHeaderPlugin } from './plugins/header'
import { demoPlugin } from './plugins/demo'
import { Header } from '../../shared/types.d'

const emoji = require('markdown-it-emoji')
const anchor = require('markdown-it-anchor')
const toc = require('markdown-it-table-of-contents')

export interface MarkdownOptions extends MarkdownIt.Options {
  lineNumbers?: boolean
  config?: (md: MarkdownIt) => void
  anchor?: {
    permalink?: boolean
    permalinkBefore?: boolean
    permalinkSymbol?: string
  }
  // https://github.com/Oktavilla/markdown-it-table-of-contents
  toc?: any
  externalLinks?: Record<string, string>
}

export interface DemoComponentData {
  componentName: string
  src: string
  htmlStr: string
}

export interface HoistedTags {
  script?: string[]
  style?: string[]
  components?: string[]
}

export interface MarkdownParsedData {
  hoistedTags?: HoistedTags
  links?: string[]
  headers?: Header[]
}

export interface MarkdownRenderer {
  __data: MarkdownParsedData
  render: (src: string, env?: any) => { html: string; data: any }
  realPath?: string
  urlPath?: string
  relativePath?: string
}

export interface MarkdownCreator {
  md: MarkdownRenderer
  demoBlocks: DemoBlockType[]
}

export type DemoBlockType = {
  id: string
  code: string
  isImport?: boolean
}

export const createMarkdownRenderer = (
  root: string,
  options: MarkdownOptions = {}
): MarkdownCreator => {
  let demoBlocks: DemoBlockType[] = []
  const md = MarkdownIt({
    html: true,
    xhtmlOut: true,
    breaks: false,
    langPrefix: 'language-',
    linkify: true,
    typographer: true,
    quotes: '\u201c\u201d\u2018\u2019',
    highlight: (originCode, lang, attrStr) => {
      const { htmlStr, demoBlocks: demoBlocksDemo } = highlight(root, originCode, lang, attrStr)
      demoBlocks = demoBlocksDemo
      return htmlStr
    },
    ...options
  })

  // custom plugins
  md.use((md) => {
    demoPlugin(root, md)
  })
    .use(componentPlugin)
    .use(highlightLinePlugin)
    .use(preWrapperPlugin)
    .use(snippetPlugin, root)
    .use(hoistPlugin)
    .use(containerPlugin)
    .use(extractHeaderPlugin)
    .use(linkPlugin, {
      target: '_blank',
      rel: 'noopener noreferrer',
      ...options.externalLinks
    })

    // 3rd party plugins
    .use(emoji)
    .use(anchor, {
      slugify,
      permalink: true,
      permalinkBefore: true,
      permalinkSymbol: '#',
      permalinkAttrs: () => ({ 'aria-hidden': true }),
      ...options.anchor
    })
    .use(toc, {
      slugify,
      includeLevel: [2, 3],
      format: parseHeader,
      ...options.toc
    })

  // apply user config
  if (options.config) {
    options.config(md)
  }

  if (options.lineNumbers) {
    md.use(lineNumberPlugin)
  }

  // wrap render so that we can return both the html and extracted data.
  const render = md.render
  const wrappedRender: MarkdownRenderer['render'] = (src) => {
    ;(md as any).__data = {}
    const html = render.call(md, src)
    return {
      html,
      data: (md as any).__data
    }
  }
  ;(md as any).render = wrappedRender

  return {
    md: md as any,
    demoBlocks: demoBlocks
  }
}

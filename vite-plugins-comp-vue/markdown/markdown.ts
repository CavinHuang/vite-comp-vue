import MarkdownIt from 'markdown-it'
import { parseHeader } from '../utils/parseHeader'
import { highlight } from './markdown/plugins/highlight'
import { slugify } from './markdown/plugins/slugify'
import { highlightLinePlugin } from './markdown/plugins/highlightLines'
import { lineNumberPlugin } from './markdown/plugins/lineNumbers'
import { componentPlugin } from './markdown/plugins/component'
import { containerPlugin } from './markdown/plugins/containers'
import { snippetPlugin } from './markdown/plugins/snippet'
import { hoistPlugin } from './markdown/plugins/hoist'
import { preWrapperPlugin } from './markdown/plugins/preWrapper'
import { linkPlugin } from './markdown/plugins/link'
import { extractHeaderPlugin } from './markdown/plugins/header'
import { demoPlugin } from './markdown/plugins/demo'
import { Header } from '../../../types/shared'

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
}

export const createMarkdownRenderer = (
  root: string,
  options: MarkdownOptions = {}
): MarkdownRenderer => {
  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight,
    ...options
  })

  // custom plugins
  md.use(demoPlugin)
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

  return md as any
}

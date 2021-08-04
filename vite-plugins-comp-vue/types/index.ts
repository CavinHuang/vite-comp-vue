// types shared between server and client
import { AliasOptions, Plugin } from 'vite'
import { MarkdownOptions } from '../vite-plugin-md/markdown/markdown'
import { Options as VuePluginOptions } from '@vitejs/plugin-vue'

export interface LocaleConfig {
  lang: string
  title?: string
  description?: string
  head?: HeadConfig[]
  label?: string
  selectText?: string
}

export interface SiteData<ThemeConfig = any> {
  base: string
  lang: string
  title: string
  description: string
  head: HeadConfig[]
  themeConfig: ThemeConfig
  locales: Record<string, LocaleConfig>
  customData: any
}

export type HeadConfig =
  | [string, Record<string, string>]
  | [string, Record<string, string>, string]

export interface PageData {
  relativePath: string
  title: string
  description: string
  headers: Header[]
  frontmatter: Record<string, any>
  lastUpdated: number
}

export interface Header {
  level: number
  title: string
  slug: string
}

export interface UserConfig<ThemeConfig = any> {
  lang?: string
  base?: string
  title?: string
  description?: string
  head?: HeadConfig[]
  themeConfig?: ThemeConfig
  locales?: Record<string, LocaleConfig>
  alias?: Record<string, string>
  markdown?: MarkdownOptions
  outDir?: string
  // src
  srcIncludes?: string[]
  customData?: any
  vueOptions?: VuePluginOptions
  vitePlugins?: Plugin[]
}

export interface SiteConfig<ThemeConfig = any> {
  root?: string
  site?: SiteData<ThemeConfig>
  configPath?: string
  themeDir?: string
  outDir?: string
  tempDir?: string
  alias?: AliasOptions
  pages?: string[]
  userConfig?: UserConfig
  markdown?: MarkdownOptions
  vueOptions?: VuePluginOptions
  vitePlugins?: Plugin[]
}
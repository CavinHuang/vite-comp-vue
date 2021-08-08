import path from 'path'
import fs from 'fs-extra'
const chalk = require('chalk')
const prism = require('prismjs')
const loadLanguages = require('prismjs/components/index')
const escapeHtml = require('escape-html')

// required to make embedded highlighting work...
loadLanguages(['markup', 'css', 'javascript'])

function wrap(code: string, lang: string): string {
  if (lang === 'text') {
    code = escapeHtml(code)
  }
  return `<pre v-pre><code>${code}</code></pre>`
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

const renderCodeBlock = (
root: string, 
_code: string, 
lang: string, 
attrStr: string = ''
) => {
  console.log(lang, attrStr)
  let code = _code
  const attrs = attrStr.split(' ')
  const isVueDemo = lang === 'vue' && attrs.includes('demo')
  const srcAttr = attrs.find((attr: string) => attr.startsWith('src='))
  const importSrc = srcAttr ? unquote((srcAttr.split('=')?.[1] || '').trim()) : undefined
  const isImport = !!importSrc
  if (isImport) {
    const importPath = path.resolve(path.dirname(root), importSrc!)
    try {
      const importSource = fs.readFileSync(importPath, 'utf-8')
      code = importSource
    } catch (error) {
      console.error(`demo import fail:${error.message}`)
    }
  }

  if (isVueDemo) {
    console.log(isVueDemo, isImport, importSrc, code)
  }
  return {
    isVueDemo,
    isImport,
    importSrc,
    code
  }
}

export const highlight = (root: string, str: string, lang: string, attrStr: string) => {
  const vueDemoData = renderCodeBlock(root, str, lang, attrStr)
  if (!lang) {
    return {
      htmlStr: wrap(str, 'text'),
      ...vueDemoData
    }
  }
  lang = lang.toLowerCase()
  const rawLang = lang
  if (lang === 'vue' || lang === 'html') {
    lang = 'markup'
  }
  if (lang === 'md') {
    lang = 'markdown'
  }
  if (lang === 'ts') {
    lang = 'typescript'
  }
  if (lang === 'py') {
    lang = 'python'
  }
  if (!prism.languages[lang]) {
    try {
      loadLanguages([lang])
    } catch (e) {
      console.warn(
        chalk.yellow(
          `[vitepress] Syntax highlight for language "${lang}" is not supported.`
        )
      )
    }
  }
  if (prism.languages[lang]) {
    const code = prism.highlight(str, prism.languages[lang], lang)
    return {
      htmlStr: wrap(code, rawLang),
      ...vueDemoData
    }
  }
  return {
    htmlStr: wrap(str, 'text'),
    ...vueDemoData
  }
}

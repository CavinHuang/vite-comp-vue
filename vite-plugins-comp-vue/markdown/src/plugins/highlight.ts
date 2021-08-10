import path from 'path'
import fs from 'fs-extra'
import { DemoBlockType } from 'src/markdown'
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

let id = 0
const getId = () => {
  return id++
}

const demoBlocks: DemoBlockType[] = []

const renderCodeBlock = (
root: string, 
_code: string, 
lang: string, 
attrStr: string = ''
) => {
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
    const componentCode = isImport
      ? `<template>
          <ImportDemo />
        </template>
        <script>
          import ImportDemo from '${importSrc}'
          export default {
            components:{
              ImportDemo
            }
          }
        </script>
        `
      : code
    
    demoBlocks.push({
      id: `vueDemo${getId()}`,
      code: componentCode
    })  
  }
  return demoBlocks
}




export const highlight = (root: string, str: string, lang: string, attrStr: string) => {
  const demoBlocks = renderCodeBlock(root, str, lang, attrStr)
  if (!lang) {
    return {
      htmlStr: wrap(str, 'text'),
      demoBlocks
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
    // if (isVueDemo) {
    //   const code = prism.highlight(componentCode, prism.languages[lang], lang)
    //   console.log(isImport, importSrc, componentCode)
    //   return {
    //     htmlStr: `<Demo codeStr="${componentCode}" htmlStr="${wrap(code, rawLang)}"></Demo>`
    //   }
    // }
    const code = prism.highlight(str, prism.languages[lang], lang)
    return {
      htmlStr: wrap(code, rawLang),
      demoBlocks
    }
  }
  return {
    htmlStr: wrap(str, 'text'),
    demoBlocks
  }
}

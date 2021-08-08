import MarkdownIt from 'markdown-it'
import { MarkdownParsedData } from '../markdown'
import fs from 'fs'
import { highlight } from './highlight'
import path from 'path'
// import matter from 'gray-matter'

// interface DemoProps {
//   componentName: string,
//   htmlStr: string,
//   codeStr: string,
//   title?: string,
//   desc?: string,
// }

let index = 1
// hoist <script> and <style> tags out of the returned html
// so that they can be placed outside as SFC blocks.
export const demoPlugin = (root: string, md: MarkdownIt) => {
  const RE = /<demo /i
  
  md.renderer.rules.html_inline = (tokens, idx) => {
    const content = tokens[idx].content
    const data = (md as any).__data as MarkdownParsedData
    const hoistedTags =
      data.hoistedTags ||
      (data.hoistedTags = {
        script: [],
        style: [],
        components: []
      })
    let language = (content.match(/language=("|')(.*)('|")/) || [])[2] ?? ''
    if (RE.test(content.trim())) {
      const componentName = `demo${index++}`
      
      const src = (content.match(/src=("|')(\S+)('|")/) || [])[2] ?? ''

      const { realPath, urlPath } = md as any
      const absolutePath = path
        .resolve(realPath ?? urlPath, '../', src)
        .split(path.sep)
        .join('/')

      // console.log('urlPath =' + urlPath)
      // console.log('realPath =' + realPath)
      // console.log('absolutePath =' + absolutePath)

      if (!src || !fs.existsSync(absolutePath)) {
        const warningMsg = `${absolutePath} does not exist!`
        console.warn(`[vitepress]: ${warningMsg}`)
        return `<demo src="${absolutePath}" >
        <p>${warningMsg}</p>`
      }
      if (!language) {
        language = (absolutePath.match(/\.(.+)$/) || [])[1] ?? 'vue'
      }

      // TODO cache it
      const codeStr = fs.readFileSync(absolutePath).toString()
      // const { content: codeContent, data: frontmatter } = matter(codeStr)
      let { htmlStr } = highlight(root, codeStr, language, '')
      htmlStr = encodeURIComponent(htmlStr)

      hoistedTags.script!.unshift(
        `import ${componentName} from '${absolutePath}' \n`
      )
      hoistedTags.components!.push(componentName)

      return content.replace(
        '>',
        ` componentName="${componentName}" htmlStr="${htmlStr}" codeStr="${encodeURIComponent(
          codeStr
        )}" >
        <${componentName}></${componentName}>
        `
      )
    } else {
      return content
    }
  }
}

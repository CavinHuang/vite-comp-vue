import { readTextFs } from '../shared/fs'
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'
export function useMdContentHtml(mdPath) {
  console.log('【md】', mdPath)
  transformMdpathToMain(mdPath)
  return readTextFs(resolve(__dirname, './index.html'))
}

function transformMdpathToMain (mdPath) {
  const mainTsPath = resolve(__dirname, './main.ts.tpl')
  let mainTs = readTextFs(mainTsPath)
  const mdContent = `
import { content, modules } from '${mdPath.replace(/\\/g, '/')}'

console.log(content, modules)
  `
  fs.writeFileSync(resolve(__dirname, './main.ts'), mainTs.replace('{{mdContent}}', mdContent))
}
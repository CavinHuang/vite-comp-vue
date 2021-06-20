import { MdModule, MdModuleType } from './markdown';
import marked from 'marked';
/**
 * markdown 解析助手
 */
export type MdModuleType = 'jsx' | 'tsx' | 'css' | 'scss' | 'less'
export interface MdModuleItem {
  type: MdModuleType,
  content: Array<string>
}
export type MdModule = Array<MdModuleItem>
export const parseCode = (codes: Array<marked.Tokens.Code>): MdModule  => {
  const mdModules: MdModule = []
  codes.forEach(code => {
    mdModules.push({
      type: code.lang as MdModuleType,
      content: code.raw.replace(/```(tsx|jsx|css|scss|less)?/ig, '').split('\n').filter(item => item != '')
    })
  })
  return mdModules
}
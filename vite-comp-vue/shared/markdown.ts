import marked from 'marked';
/**
 * markdown 解析助手
 */
export type MdModuleType = 'jsx' | 'tsx' | 'css' | 'scss' | 'less'
export interface MdModuleItem {
  id: string
  type: MdModuleType,
  code: string
}
export type MdModule = Array<MdModuleItem>
export const parseCode = (codes: Array<marked.Tokens.Code>): MdModule  => {
  const mdModules: MdModule = []
  codes.forEach(code => {
    // mdModules.push({
    //   type: code.lang as MdModuleType,
    //   code: code.raw.replace(/```(tsx|jsx|css|scss|less)?/ig, '')
    // })
  })
  return mdModules
}
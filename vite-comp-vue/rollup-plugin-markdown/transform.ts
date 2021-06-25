import { Plugin } from 'vite'
import marked from 'marked'
import { readTextFs } from '../shared/fs'
import { createFilter } from 'rollup-pluginutils'

interface IMd {
  content: string
  modules: marked.Tokens.Code[]
}


export default function transformMd (): Plugin {
  const virtualFileId = '@auto-import-md'

  return {
    name: 'my-plugin', // 必须的，将会显示在 warning 和 error 中
    resolveId(id) {
      if (id === virtualFileId) {
        return virtualFileId
      }
    },
    load(id) {
      if (id === virtualFileId) {
        return `export const msg = "from virtual file"`
      }
    }
  }
}
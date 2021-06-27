import { Plugin } from 'vite'
import marked from 'marked'
import { readTextFs } from '../shared/fs'
import { createFilter } from 'rollup-pluginutils'

export default function transformMd (): Plugin {
  const virtualFileId = 'viteCompMain.ts'

  return {
    name: 'my-plugin', // 必须的，将会显示在 warning 和 error 中
    resolveId(id) {
      if (id.includes(virtualFileId)) {
        return virtualFileId
      }
    },
    transform(code, id) {
      if (id.includes(virtualFileId)) {
        return {
          code: `export `
        }
      }
    }
  }
}
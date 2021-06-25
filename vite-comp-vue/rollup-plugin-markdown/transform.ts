import { Plugin } from 'vite'
import marked from 'marked'
import { readTextFs } from '../shared/fs'
interface IMd {
  content: string
  modules: marked.Tokens.Code[]
}
export default function transformMd (mdPath, isMdContent: Boolean = false): IMd {

  const content = readTextFs(mdPath)

  return {
    content: 
  }
}
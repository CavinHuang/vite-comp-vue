import { readTextFs } from '../shared/fs'
import { resolve } from 'path'
export function useMdContentHtml(mdPath) {
  const content = readTextFs(resolve(__dirname, './index.html'))
  return content.replace('{{mdPath}}', mdPath)
}

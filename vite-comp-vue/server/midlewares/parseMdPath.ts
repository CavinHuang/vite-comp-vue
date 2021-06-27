import { Connect, ResolvedConfig } from 'vite'
import { ServerResponse } from 'http'
import path from 'path'
import { hasDir, readTextFs } from '../../shared/fs'
import { firstToUpper } from '../../shared/string'
import { useMdContentHtml } from '../runtime'
import sysDebug from 'debug'
const root = process.cwd()
const debug = sysDebug('vite:vuedoc:md')

export default function (config: ResolvedConfig, req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) {
  const reg = /(README*).html/ig
  const originalUrl = req.originalUrl as string
  if (reg.test(originalUrl)) {
    const pathItems = originalUrl.split('/')
    let _path = path.join(root, 'src')
    let i = 0

    while(i < pathItems.length - 1) {
      const curPathItem = pathItems.slice(i, i + 1).pop()
      let upCasePath = path.join(_path, firstToUpper(curPathItem))
      let lowCasePath = path.join(_path, curPathItem.toLowerCase())
      if (hasDir(upCasePath)) {
        _path = upCasePath
      }
      if (hasDir(lowCasePath)) {
        _path = lowCasePath
      }
      i++
    }

    if (hasDir(_path) && i == pathItems.length - 1) {
      const mdFileName = pathItems[pathItems.length - 1].split('.')[0] + '.md'
      const mdFilePath = path.join(_path, mdFileName)
      if (hasDir(mdFilePath)) {
        debug('md path => '+mdFilePath)
        const content = useMdContentHtml(mdFilePath.split(root)[1])
        res.statusCode = 200;
        res.end(content)
        return
      }
    }
  }
  next()
}
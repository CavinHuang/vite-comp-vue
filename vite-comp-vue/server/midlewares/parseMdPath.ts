import { Connect } from 'vite'
import { ServerResponse } from 'http'
import path from 'path'
import { hasDir, readTextFs } from '../../shared/fs'
import { firstToUpper } from '../../shared/string'
import { useMdContentHtml } from '../runtime'
const root = process.cwd()
import marked from 'marked';
export default function (req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) {
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
        const content = useMdContentHtml(mdFilePath)
        res.statusCode = 200;
        res.end(content)
        // const content = readTextFs(mdFilePath)
        // const tokens = marked.lexer(content)
        // const codes = parseCode(tokens.filter(item => item.type === 'code') as marked.Tokens.Code[])
        // console.log(codes)
        // res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        // res.statusCode = 200;
        // res.end(marked.parser(tokens))
        return
      }
    }
  }
  next()
}
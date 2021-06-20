import { ViteDevServer } from 'vite'
import path from 'path'
import { hasDir, readTextFs } from '../shared/fs'
import { firstToUpper } from '../shared/string'
import { parseCode } from '../shared/markdown'
const root = process.cwd()
const resolve = (fsPath: string) => path.resolve(root, fsPath)
import marked from 'marked';
export const serverMiddlewares = () => ({
  name: 'viteCompVue-server-middleware',
  configureServer (server: ViteDevServer) {
    server.middlewares.use((req, res, next) => {
      console.log(req.originalUrl)
      const reg = /(README*).html/ig
      const originalUrl = req.originalUrl as string
      if (reg.test(originalUrl)) {
        const pathItems = originalUrl.split('/')
        let _path = path.join(root, 'src')
        let i = 0

        while(i < pathItems.length - 1) {
          const curPathItem = pathItems.slice(i, i + 1).pop()
          console.log(_path, i, curPathItem)
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
            console.log(mdFilePath)
            const content = readTextFs(mdFilePath)
            const tokens = marked.lexer(content)
            const codes = parseCode(tokens.filter(item => item.type === 'code') as marked.Tokens.Code[])
            console.log(codes)
             res.setHeader('Content-Type', 'text/html; charset=UTF-8');
            res.statusCode = 200;
            res.end(marked.parser(tokens))
            return
          }
        }
      }
      next()
    })
  }
})
import { ViteCompConfig } from './../index';
import { globby } from 'globby'
import path from 'path'

export type RouterPaths = {
  path: string
  filePath: string
}

export const buildRoutePath = async (docDir: string): Promise<RouterPaths[]> => {
  const page = await globby(['**.md', '**.MD'], {
    cwd: docDir,
    ignore: ['node_modules', '**/node_modules']
  })
  
  const datas: RouterPaths[] = []
  const reg = /(.*)\.[^.]+/
  page && page.forEach(filePath => {
    const paths = filePath.match(reg)
    datas.push({
      path: paths ? paths[1] + '.html' : '/',
      filePath: path.resolve(docDir, filePath)
    })
  })

  return datas
}

export const routerPaths = async (config: ViteCompConfig) => {
  return {
    routerPaths: await buildRoutePath(config.docDir),
    config
  }
}
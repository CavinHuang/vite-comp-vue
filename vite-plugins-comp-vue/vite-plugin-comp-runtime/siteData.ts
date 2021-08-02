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
  page && page.forEach(filePath => {
    datas.push({
      path: filePath,
      filePath: path.resolve(docDir, filePath)
    })
  })

  return datas
}

export const routerPaths = async (config: ViteCompConfig) => {
  return {
    routerPaths: await buildRoutePath(config.docDir)
  }
}
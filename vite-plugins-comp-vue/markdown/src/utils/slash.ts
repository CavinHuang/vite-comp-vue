import { resolve } from 'path';
export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

export function resolvePath(basePath: string, relativePath: string): string {
  let i = 0
  let tmpStr = ''
  basePath = slash(basePath)
  relativePath = slash(relativePath)
  console.log('basePath', basePath)
  console.log('relativePath', relativePath)
  while(i < relativePath.length) {
    const _tmpStr = tmpStr + relativePath[i]
    if (!basePath.includes(_tmpStr)) {
      break
    }
    tmpStr = _tmpStr
    i++
  }

  console.log('_tmpStr', _tmpStr)

  return resolve(basePath, relativePath.replace(tmpStr, ''))
}
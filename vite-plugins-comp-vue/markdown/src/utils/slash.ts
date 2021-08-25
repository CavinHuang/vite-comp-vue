import path from 'path';
export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

export function resolvePath(basePath: string, relativePath: string): string {
  let i = 0
  let tmpStr = ''
  basePath = slash(basePath)
  relativePath = slash(relativePath)
  while(i < relativePath.length) {
    const _tmpStr = tmpStr + relativePath[i]
    if (!basePath.includes(_tmpStr)) {
      break
    }
    tmpStr = _tmpStr
    i++
  }
  relativePath = relativePath.replace(tmpStr, '')
  return path.join(basePath, relativePath)
}
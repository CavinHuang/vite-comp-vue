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
    console.log('_tmpStr', _tmpStr)
    if (!basePath.includes(_tmpStr)) {
      break
    }
    tmpStr = _tmpStr
    i++
  }
  relativePath = relativePath.replace(tmpStr, '')
  console.log('_tmpStr', tmpStr)
  console.log('basePath', basePath)
  console.log('relativePath', relativePath)
  return path.join(basePath, relativePath)
}
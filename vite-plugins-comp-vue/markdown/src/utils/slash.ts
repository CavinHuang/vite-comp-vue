import { resolve } from 'path';
export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

export function resolvePath(basePath: string, relativePath: string): string {
  let i = 0

  let tmpStr = ''

  while(i < relativePath.length) {
    tmpStr += relativePath[i]
    if (!basePath.includes(tmpStr)) {
      break
    }
    i++
  }

  return resolve(basePath, relativePath.replace(tmpStr, ''))
}
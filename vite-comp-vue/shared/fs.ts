import fs from 'fs'

export const hasDir = (path: string) => fs.existsSync(path) 

export function readTextFs (path: string): string {
  return fs.readFileSync(path, 'utf-8')
}

/**
 * 首字母大写
 * @param str 
 * @returns 
 */
export function firstToUpper(str: string): string{
  return str.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
    return $1.toUpperCase() + $2.toLowerCase()
  })
}
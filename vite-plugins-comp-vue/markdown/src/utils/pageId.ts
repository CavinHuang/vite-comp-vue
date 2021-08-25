const idMaps: {[key: string]: number} = {}
export const getId = (fileName: string) => {
  fileName = fileName.replace(/[\/\\:\.]/g, '')
  let id = idMaps[fileName]
  if (id === void 0) id = 1
  else id++
  idMaps[fileName] = id
  return id
}

export const resetId = (fileName: string) => {
  fileName = fileName.replace(/[\/\\:\.]/g, '')
  idMaps[fileName] = 0
  return true
}
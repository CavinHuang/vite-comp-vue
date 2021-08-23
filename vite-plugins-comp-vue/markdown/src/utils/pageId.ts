const idMaps: {[key: string]: number} = {}
export const getId = (fileName: string) => {
  let id = idMaps[fileName]
  if (id === void 0) id = 1
  else id++
  idMaps[fileName] = id
  return id
}

export const resetId = (fileName: string) => {
  idMaps[fileName] = 1
  return true
}
import { Plugin } from 'vite'
import { vueToJsonData } from './'
import path from 'path'
import fs from 'fs'
const docRoot = path.resolve(process.cwd(), './src/packages')

export default (): Plugin => {

  return {
    name: 'vite-comp-vue-types',
    resolveId(id) {
      if (id.startsWith('vueCompTypes:')) return id
    },
    load(id) {
      console.log('=====================================', id)
      if (id.startsWith('vueCompTypes:')) {
        const _file = path.join(docRoot, id.replace('vueCompTypes:', ''))
        const _dir = path.dirname(_file)
        console.log('=====================================', _file)
        const vueFile = path.join(_dir, '/index.vue')
        console.log('=====================================', vueFile)
        const _code = fs.readFileSync(vueFile).toString()
        const data = vueToJsonData(_code)
        console.log('=====================================', data)
        return `export default ${JSON.stringify(data)}`
      }
    },
    transform(code, id) {
      if (id.startsWith('vueCompTypes:')) {
        return code
      }
    }
  }
}
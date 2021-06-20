import { Plugin } from 'vite'
export default function transformMd (): Plugin {

  return {
    name: 'TransformMd',
    resolveId (source) {
      console.log(source)
      return source
    },
    configResolved (config) {
      console.log(config)
    }
  }
}
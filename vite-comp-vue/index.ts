import markdownPlugin from './rollup-plugin-markdown'
import transformMd from './rollup-plugin-markdown/transform'
import { serverMiddlewares } from './server'
import { PluginOption } from 'vite'

export default function framework(config?): PluginOption[] {
  return [serverMiddlewares(), markdownPlugin(config), transformMd()]
}
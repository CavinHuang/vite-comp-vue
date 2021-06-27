import markdownPlugin from './rollup-plugin-markdown'
import { serverMiddlewares } from './server'
import { PluginOption } from 'vite'

export default function framework(config?): PluginOption[] {
  return [serverMiddlewares(), markdownPlugin(config)]
}
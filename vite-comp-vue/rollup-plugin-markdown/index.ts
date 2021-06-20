import { createFilter } from 'rollup-pluginutils'
import { PluginOption } from 'vite'
import marked from 'marked';
import { parseCode } from '../shared/markdown'

const ext = /\.md$/;

export default function md ( options: any = {} ): PluginOption {
    const filter = createFilter( options.include || [ '**/*.md'], options.exclude );
    if(options.marked){
      marked.setOptions(options.marked)
    }
    return {
        name: 'md',
        transform ( md, id ) {
            if ( !ext.test( id ) ) return null;
            if ( !filter( id ) ) return null;

            const tokens = marked.lexer(md);
            const codes = parseCode(tokens.filter(item => item.type === 'code') as marked.Tokens.Code[])
            const content = marked.parser(tokens)
            return {
                code: `export const content = '${JSON.stringify(content.toString())}';
                export const modules = ${JSON.stringify(codes)};
                export default {
                  modules: ${JSON.stringify(codes)},
                  content: '${JSON.stringify(content.toString())}'
                }
                `,
                map: { mappings: '' }
            };
        }
    };
}
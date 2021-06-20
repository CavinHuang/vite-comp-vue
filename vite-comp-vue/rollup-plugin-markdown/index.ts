import { createFilter } from 'rollup-pluginutils'
import { PluginOption } from 'vite'
import marked from 'marked';
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

            const data = options.marked === false ? md : marked( md );
            return {
                code: `export default ${JSON.stringify(data.toString())};`,
                map: { mappings: '' }
            };
        }
    };
}
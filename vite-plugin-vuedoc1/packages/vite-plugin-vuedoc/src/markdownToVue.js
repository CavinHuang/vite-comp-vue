"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMarkdownRenderFn = exports.VUEDOC_RE = exports.VUEDOC_PREFIX = void 0;
const markdown_it_1 = require("./markdown-it");
const slash = require('slash');
const debug = require('debug')('vite:vuedoc:md');
exports.VUEDOC_PREFIX = 'vdpv_';
exports.VUEDOC_RE = /(.*?\.md)_(vdpv_\d+)/;
function createMarkdownRenderFn(options, config) {
    const { wrapperClass } = options;
    // const { theme = 'default' } = prism
    return (code, file) => {
        const start = Date.now();
        const { template, demoBlocks, matter, toc } = markdown_it_1.remarkFile(code, Object.assign({ vuePrefix: exports.VUEDOC_PREFIX, file: file, isServe: config.command === 'serve' }, options));
        const $vd = { matter, toc };
        // const fileName = path.basename(file)
        // const publicPath = path.relative(config.root, file)
        const docComponent = `
    <template>
      <div class="vuedoc ${wrapperClass || ''} ${matter.wrapperClass || ''}">
        ${template}
      </div>
    </template>
    <script>
    import { defineComponent, reactive, ref, toRefs, onMounted } from 'vue'
    
    ${demoBlocks
            .map(demo => {
            const request = `${slash(file)}.${demo.id}.vd`;
            debug(`import -> ${file}`);
            debug(`import -> ${request}`);
            return `import ${demo.id} from '${request}'`;
        })
            .join('\n')}
    
    function injectCss(css, id) {
      if (!document.head.querySelector('#' + id)) {
        const node = document.createElement('style')
        node.textContent = css 
        node.type = 'text/css'
        node.id = id
        document.head.appendChild(node)
      }
    }
    
    const script = defineComponent({
      components: {
        ${demoBlocks.map(demo => demo.id).join(',')}
      },
      setup(props) {
        ${demoBlocks.map(demo => `const ${demo.id}Ref = ref()`).join('\n')}
        const refs = [${demoBlocks.map(demo => `${demo.id}Ref`).join(',')}]
        const state = reactive({
          ${demoBlocks.map(demo => `${demo.id}Height: 0`).join(',')}
        })

        const toggleCode = (index) => {
          const id = '${exports.VUEDOC_PREFIX}' + index
          if (state[id+'Height'] === 0) {
            state[id+'Height'] = ((refs[index].value ? refs[index].value.offsetHeight : 0) || 0)
          } else {
            state[id+'Height'] = 0
          }
        }

        return {
          toggleCode,
          ...toRefs(state),
          ${demoBlocks.map(demo => `${demo.id}Ref`).join(',')}
        }
      }
    });
    script.$vd = ${JSON.stringify($vd)}
    export default script;
    
    </script>
    `;
        debug(`[render] ${file} in ${Date.now() - start}ms.`);
        const result = { component: docComponent, demoBlocks: [...demoBlocks] };
        return result;
    };
}
exports.createMarkdownRenderFn = createMarkdownRenderFn;
//# sourceMappingURL=markdownToVue.js.map
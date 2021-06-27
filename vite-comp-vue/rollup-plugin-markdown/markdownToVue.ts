// import { remarkFile } from './remark'
// import path from 'path'
import matter from 'gray-matter'
import { ResolvedConfig } from 'vite'
import { VueDocPluginOptions } from './index'
import marked from 'marked'
import hljs from 'highlight.js'
import { hljsDefineVue } from './language-vue'
import { MdModule, MdModuleType } from './../shared/markdown'
import slash from 'slash'
import sysDebug from 'debug'

const debug = sysDebug('vite:vuedoc:md')
hljs.registerLanguage('vue', hljsDefineVue)
export const VUEDOC_PREFIX = 'vdpv_'
export const VUEDOC_RE = /(.*?\.md)_(vdpv_\d+)/

const highlightDebug = sysDebug('vite:vuedoc:highlight')
const render: marked.Renderer = {
  
}

function remarkFile (source: string, options: { vuePrefix: string; file: string; isServe: boolean } & VueDocPluginOptions): {
  template: string
  matter: Record<string, any>
  toc: Array<{ content: string; anchor: string; level: number }>
  demoBlocks: MdModule
} {
  const { vuePrefix, file, previewClass, previewComponent, markdownIt, highlight } = options
  const { plugins } = markdownIt
  const { theme } = highlight
  const demoBlocks: MdModule = []
  let toc: Array<{ content: string; anchor: string; level: number }> = []
  marked.setOptions({
    highlight: function (_code: string, lang: string) {
      let code = _code
      const isVueDemo = lang === 'vue'

      highlightDebug('highlight:', lang)

      const highlighted = hljs.highlight(lang, code, true)
      const { value = '' } = highlighted
      if (isVueDemo) {
        const componentCode = code
        // const id = `${vuePrefix}${demoBlocks.length}_${revisionHash(componentCode)}`
        const id = `${vuePrefix}${demoBlocks.length}`
        demoBlocks.push({
          id,
          type: lang as MdModuleType,
          code: `${componentCode}`
        })
        if (previewComponent) {
          return `<pre style="display:none;"></pre><div class="vuedoc-demo ${previewClass}">
                    <${previewComponent} lang="${lang}" theme="${theme}">
                      <template #code><pre class="hljs language-${lang} hljs--${theme}" v-pre><code>${value}</code></pre></template>
                      <${id} />
                    </${previewComponent}>
                </div>`
        } else {
          return `<pre style="display:none;"></pre><div class="vuedoc-demo ${previewClass}">
                  <div class="vuedoc-demo__inner">
                    <div class="vuedoc-demo__preview">
                      <${id} />
                    </div>
                    <div :style="{ height: ${id}Height + 'px' }" class="vuedoc-demo__source">
                      <div ref="${id}Ref" class="vuedoc-demo__sourceref">
                      <div class="vuedoc__code ${previewClass}"><pre class="hljs vuedoc__hljs language-${lang} hljs--${theme}" v-pre><code>${value}</code></pre></div>
                      </div>
                    </div>
                    <div class="vuedoc-demo__footer" @click="toggleCode(${demoBlocks.length - 1})">
                      {{ ${id}Height > 0 ? 'hidden' : 'show' }}
                    </div>
                  </div>
                </div>`
        }
      }
      return `<pre style="display:none;"></pre><pre class="hljs vuedoc__hljs language-${lang} hljs--${theme}"><code>${value}</code></pre>`
    }
  })
  const { content, data: frontmatter } = matter(source)
  const tokens = marked.lexer(content);
  const template = marked.parser(tokens)
  debug(`mdrender -> ${file}`)
  return { template, demoBlocks, matter: frontmatter, toc }
}

export function createMarkdownRenderFn(options: VueDocPluginOptions, config: ResolvedConfig) {
  console.log('【sssss】', options)

  const { wrapperClass } = options
  // const { theme = 'default' } = prism
  return (code: string, file: string) => {
    const start = Date.now()
    const { template, demoBlocks, matter, toc } = remarkFile(code, {
      vuePrefix: VUEDOC_PREFIX,
      file: file,
      isServe: config.command === 'serve',
      ...options
    })
    const $vd = { matter, toc }
    // const fileName = path.basename(file)
    // const publicPath = path.relative(config.root, file)
    console.log(`template => `, template)
    const docComponent = `
    <template>
      <div class="vuedoc">
        ${template}
      </div>
    </template>
    <script>
    import { defineComponent, reactive, ref, toRefs, onMounted } from 'vue'
    
    ${demoBlocks
      .map(demo => {
        const request = `${slash(file)}.${demo.id}.vd`
        debug(`import -> ${file}`)
        debug(`import -> ${request}`)
        return `import ${demo.id} from '${request}'`
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
          const id = '${VUEDOC_PREFIX}' + index
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
    
    </script>`
    
    debug(`[render] ${file} in ${Date.now() - start}ms.`)

    const result = { component: docComponent, demoBlocks: [...demoBlocks] }
    return result
  }
}

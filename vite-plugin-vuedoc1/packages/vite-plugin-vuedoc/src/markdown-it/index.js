"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remarkFile = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const markdown_it_1 = __importDefault(require("markdown-it"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const highlight_js_1 = __importDefault(require("highlight.js"));
const language_vue_1 = require("./../highlight/language-vue");
const markdown_it_emoji_1 = __importDefault(require("markdown-it-emoji"));
const markdown_it_sub_1 = __importDefault(require("markdown-it-sub"));
const markdown_it_sup_1 = __importDefault(require("markdown-it-sup"));
const markdown_it_footnote_1 = __importDefault(require("markdown-it-footnote"));
const markdown_it_deflist_1 = __importDefault(require("markdown-it-deflist"));
const markdown_it_abbr_1 = __importDefault(require("markdown-it-abbr"));
const markdown_it_ins_1 = __importDefault(require("markdown-it-ins"));
const markdown_it_mark_1 = __importDefault(require("markdown-it-mark"));
const markdown_it_latex_1 = __importDefault(require("markdown-it-latex"));
const markdown_it_katex_1 = __importDefault(require("markdown-it-katex"));
const markdown_it_toc_and_anchor_1 = __importDefault(require("markdown-it-toc-and-anchor"));
const markdown_it_task_lists_1 = __importDefault(require("markdown-it-task-lists"));
const markdown_it_source_map_1 = __importDefault(require("markdown-it-source-map"));
// import MarkdownItContainer from 'markdown-it-container'
// const revisionHash = require('rev-hash')
const debug = require('debug')('vite:vuedoc:markdown-it');
const highlightDebug = require('debug')('vite:vuedoc:highlight');
highlight_js_1.default.registerLanguage('vue', language_vue_1.hljsDefineVue);
function unquote(str) {
    if (!str) {
        return '';
    }
    const reg = /[\'\"]/;
    let ret = str;
    if (reg.test(ret.charAt(0))) {
        ret = ret.substr(1);
    }
    if (reg.test(ret.charAt(ret.length - 1))) {
        ret = ret.substr(0, ret.length - 1);
    }
    return ret;
}
const remarkFile = (source, options) => {
    const { vuePrefix, file, previewClass, previewComponent, markdownIt, highlight } = options;
    const { plugins } = markdownIt;
    const { theme } = highlight;
    const demoBlocks = [];
    let toc = [];
    const md = new markdown_it_1.default({
        html: true,
        xhtmlOut: true,
        breaks: false,
        langPrefix: 'language-',
        linkify: true,
        typographer: true,
        quotes: '\u201c\u201d\u2018\u2019',
        highlight: function (_code, lang, attrStr) {
            var _a;
            let code = _code;
            const attrs = attrStr.split(' ');
            const isVueDemo = lang === 'vue' && attrs.includes('demo');
            const srcAttr = attrs.find((attr) => attr.startsWith('src='));
            const importSrc = srcAttr ? unquote((((_a = srcAttr.split('=')) === null || _a === void 0 ? void 0 : _a[1]) || '').trim()) : undefined;
            const isImport = !!importSrc;
            if (isImport) {
                const importPath = path_1.default.resolve(path_1.default.dirname(file), importSrc);
                try {
                    const importSource = fs_extra_1.default.readFileSync(importPath, 'utf-8');
                    code = importSource;
                }
                catch (error) {
                    console.error(`demo import fail:${error.message}`);
                }
            }
            highlightDebug('highlight:', lang, 'attrs:', attrs);
            const highlighted = highlight_js_1.default.highlight(lang, code, true);
            const { value = '' } = highlighted;
            if (isVueDemo) {
                const componentCode = isImport
                    ? `<template>
              <ImportDemo />
            </template>
            <script>
              import ImportDemo from '${importSrc}'
              export default {
                components:{
                  ImportDemo
                }
              }
            </script>
            `
                    : code;
                // const id = `${vuePrefix}${demoBlocks.length}_${revisionHash(componentCode)}`
                const id = `${vuePrefix}${demoBlocks.length}`;
                demoBlocks.push({
                    id,
                    code: `${componentCode}`
                });
                if (previewComponent) {
                    return `<pre style="display:none;"></pre><div class="vuedoc-demo ${previewClass}">
                    <${previewComponent} lang="${lang}" theme="${theme}">
                      <template #code><pre class="hljs language-${lang} hljs--${theme}" v-pre><code>${value}</code></pre></template>
                      <${id} />
                    </${previewComponent}>
                </div>`;
                }
                else {
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
                </div>`;
                }
            }
            return `<pre style="display:none;"></pre><pre class="hljs vuedoc__hljs language-${lang} hljs--${theme}"><code>${value}</code></pre>`;
        }
    });
    [
        [markdown_it_emoji_1.default],
        [markdown_it_sub_1.default],
        [markdown_it_sup_1.default],
        [markdown_it_footnote_1.default],
        [markdown_it_deflist_1.default],
        [markdown_it_abbr_1.default],
        [markdown_it_ins_1.default],
        [markdown_it_mark_1.default],
        [markdown_it_latex_1.default],
        [markdown_it_katex_1.default],
        [
            markdown_it_toc_and_anchor_1.default,
            {
                includeLevel: [2, 3],
                tocCallback: function (tocMarkdown, tocArray, tocHtml) {
                    toc = tocArray || [];
                }
            }
        ],
        [markdown_it_task_lists_1.default],
        [markdown_it_source_map_1.default],
        ...plugins
    ].forEach((plugin) => {
        md.use(...plugin);
    });
    // containers.forEach(name => {
    //   md.use(MarkdownItContainer, name)
    // })
    const { content, data: frontmatter } = gray_matter_1.default(source);
    const template = md.render(content);
    debug(`mdrender -> ${file}`);
    return { template, demoBlocks, matter: frontmatter || {}, toc };
};
exports.remarkFile = remarkFile;
//# sourceMappingURL=index.js.map
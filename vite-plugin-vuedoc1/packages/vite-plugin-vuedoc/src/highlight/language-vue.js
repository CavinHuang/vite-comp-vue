"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hljsDefineVue = void 0;
function hljsDefineVue(hljs) {
    return {
        subLanguage: 'xml',
        contains: [
            hljs.COMMENT('<!--', '-->', {
                relevance: 10
            }),
            {
                begin: /^(\s*)(<script>)/gm,
                end: /^(\s*)(<\/script>)/gm,
                subLanguage: 'javascript',
                excludeBegin: true,
                excludeEnd: true
            },
            {
                begin: /^(\s*)(<script lang=["'](ts|typescript)["']>)/gm,
                end: /^(\s*)(<\/script>)/gm,
                subLanguage: 'typescript',
                excludeBegin: true,
                excludeEnd: true
            },
            {
                begin: /^(\s*)(<style(\sscoped)?>)/gm,
                end: /^(\s*)(<\/style>)/gm,
                subLanguage: 'css',
                excludeBegin: true,
                excludeEnd: true
            },
            {
                begin: /^(\s*)(<style lang=["'](scss|sass)["'](\sscoped)?>)/gm,
                end: /^(\s*)(<\/style>)/gm,
                subLanguage: 'scss',
                excludeBegin: true,
                excludeEnd: true
            },
            {
                begin: /^(\s*)(<style lang=["']stylus["'](\sscoped)?>)/gm,
                end: /^(\s*)(<\/style>)/gm,
                subLanguage: 'stylus',
                excludeBegin: true,
                excludeEnd: true
            }
        ]
    };
}
exports.hljsDefineVue = hljsDefineVue;
//# sourceMappingURL=language-vue.js.map
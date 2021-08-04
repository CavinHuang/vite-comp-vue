var __require = (x) => {
  if (typeof require !== "undefined")
    return require(x);
  throw new Error('Dynamic require of "' + x + '" is not supported');
};

// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// vite-plugins-comp-vue/config/index.ts
import path from "path";
var APP_PATH = path.resolve("F:\\project\\node\\vite-test\\vite-plugins-comp-vue\\config", "../vite-plugin-comp-runtime");

// vite-plugins-comp-vue/vite-plugin-comp-runtime/siteData.ts
import { globby } from "globby";
import path2 from "path";
var buildRoutePath = async (docDir) => {
  const page = await globby(["**.md", "**.MD"], {
    cwd: docDir,
    ignore: ["node_modules", "**/node_modules"]
  });
  const datas = [];
  const reg = /(.*)\.[^.]+/;
  page && page.forEach((filePath) => {
    const paths = filePath.match(reg);
    datas.push({
      path: paths ? paths[1] + ".html" : "/",
      filePath: path2.resolve(docDir, filePath)
    });
  });
  return datas;
};
var routerPaths = async (config) => {
  return {
    routerPaths: await buildRoutePath(config.docDir),
    config
  };
};

// vite-plugins-comp-vue/vite-plugin-md/markdownToVue.ts
import fs3 from "fs";
import path4 from "path";
import matter from "gray-matter";
import LRUCache from "lru-cache";

// vite-plugins-comp-vue/vite-plugin-md/markdown/markdown.ts
import MarkdownIt from "markdown-it";

// vite-plugins-comp-vue/vite-plugin-md/utils/parseHeader.ts
var parseEmojis = (str) => {
  const emojiData = __require("markdown-it-emoji/lib/data/full.json");
  return String(str).replace(/:(.+?):/g, (placeholder, key) => emojiData[key] || placeholder);
};
var unescapeHtml = (html) => String(html).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x3A;/g, ":").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
var removeMarkdownTokens = (str) => String(str).replace(/(\[(.[^\]]+)\]\((.[^)]+)\))/g, "$2").replace(/(`|\*{1,3}|_)(.*?[^\\])\1/g, "$2").replace(/(\\)(\*|_|`|\!|<|\$)/g, "$2");
var trim = (str) => str.trim();
var removeNonCodeWrappedHTML = (str) => {
  return String(str).replace(/(^|[^><`\\])<.*>([^><`]|$)/g, "$1$2");
};
var compose = (...processors) => {
  if (processors.length === 0)
    return (input) => input;
  if (processors.length === 1)
    return processors[0];
  return processors.reduce((prev, next) => {
    return (str) => next(prev(str));
  });
};
var parseHeader = compose(unescapeHtml, parseEmojis, removeMarkdownTokens, trim);
var deeplyParseHeader = compose(removeNonCodeWrappedHTML, parseHeader);

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/highlight.ts
var chalk = __require("chalk");
var prism = __require("prismjs");
var loadLanguages = __require("prismjs/components/index");
var escapeHtml = __require("escape-html");
loadLanguages(["markup", "css", "javascript"]);
function wrap(code, lang) {
  if (lang === "text") {
    code = escapeHtml(code);
  }
  return `<pre v-pre><code>${code}</code></pre>`;
}
var highlight = (str, lang) => {
  if (!lang) {
    return wrap(str, "text");
  }
  lang = lang.toLowerCase();
  const rawLang = lang;
  if (lang === "vue" || lang === "html") {
    lang = "markup";
  }
  if (lang === "md") {
    lang = "markdown";
  }
  if (lang === "ts") {
    lang = "typescript";
  }
  if (lang === "py") {
    lang = "python";
  }
  if (!prism.languages[lang]) {
    try {
      loadLanguages([lang]);
    } catch (e) {
      console.warn(chalk.yellow(`[vitepress] Syntax highlight for language "${lang}" is not supported.`));
    }
  }
  if (prism.languages[lang]) {
    const code = prism.highlight(str, prism.languages[lang], lang);
    return wrap(code, rawLang);
  }
  return wrap(str, "text");
};

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/slugify.ts
var removeDiacritics = __require("diacritics").remove;
var rControl = /[\u0000-\u001f]/g;
var rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/]+/g;
var slugify = (str) => {
  return removeDiacritics(str).replace(rControl, "").replace(rSpecial, "-").replace(/\-{2,}/g, "-").replace(/^\-+|\-+$/g, "").replace(/^(\d)/, "_$1").toLowerCase();
};

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/highlightLines.ts
var RE = /{([\d,-]+)}/;
var wrapperRE = /^<pre .*?><code>/;
var highlightLinePlugin = (md) => {
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx, options] = args;
    const token = tokens[idx];
    const rawInfo = token.info;
    if (!rawInfo || !RE.test(rawInfo)) {
      return fence(...args);
    }
    const langName = rawInfo.replace(RE, "").trim();
    token.info = langName;
    const lineNumbers = RE.exec(rawInfo)[1].split(",").map((v) => v.split("-").map((v2) => parseInt(v2, 10)));
    const code = options.highlight ? options.highlight(token.content, langName) : token.content;
    const rawCode = code.replace(wrapperRE, "");
    const highlightLinesCode = rawCode.split("\n").map((split, index2) => {
      const lineNumber = index2 + 1;
      const inRange = lineNumbers.some(([start, end]) => {
        if (start && end) {
          return lineNumber >= start && lineNumber <= end;
        }
        return lineNumber === start;
      });
      if (inRange) {
        return `<div class="highlighted">&nbsp;</div>`;
      }
      return "<br>";
    }).join("");
    const highlightLinesWrapperCode = `<div class="highlight-lines">${highlightLinesCode}</div>`;
    return highlightLinesWrapperCode + code;
  };
};

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/lineNumbers.ts
var lineNumberPlugin = (md) => {
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (...args) => {
    const rawCode = fence(...args);
    const code = rawCode.slice(rawCode.indexOf("<code>"), rawCode.indexOf("</code>"));
    const lines = code.split("\n");
    const lineNumbersCode = [...Array(lines.length - 1)].map((line, index2) => `<span class="line-number">${index2 + 1}</span><br>`).join("");
    const lineNumbersWrapperCode = `<div class="line-numbers-wrapper">${lineNumbersCode}</div>`;
    const finalCode = rawCode.replace(/<\/div>$/, `${lineNumbersWrapperCode}</div>`).replace(/"(language-\w+)"/, '"$1 line-numbers-mode"');
    return finalCode;
  };
};

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/component.ts
var blockNames = __require("markdown-it/lib/common/html_blocks");
var HTML_OPEN_CLOSE_TAG_RE = __require("markdown-it/lib/common/html_re").HTML_OPEN_CLOSE_TAG_RE;
var HTML_SEQUENCES = [
  [/^<(script|pre|style)(?=(\s|>|$))/i, /<\/(script|pre|style)>/i, true],
  [/^<!--/, /-->/, true],
  [/^<\?/, /\?>/, true],
  [/^<![A-Z]/, />/, true],
  [/^<!\[CDATA\[/, /\]\]>/, true],
  [/^<[A-Z]/, />/, true],
  [/^<\w+\-/, />/, true],
  [
    new RegExp("^</?(" + blockNames.join("|") + ")(?=(\\s|/?>|$))", "i"),
    /^$/,
    true
  ],
  [new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + "\\s*$"), /^$/, false]
];
var componentPlugin = (md) => {
  md.block.ruler.at("html_block", htmlBlock);
};
var htmlBlock = (state, startLine, endLine, silent) => {
  let i, nextLine, lineText;
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (!state.md.options.html) {
    return false;
  }
  if (state.src.charCodeAt(pos) !== 60) {
    return false;
  }
  lineText = state.src.slice(pos, max);
  for (i = 0; i < HTML_SEQUENCES.length; i++) {
    if (HTML_SEQUENCES[i][0].test(lineText)) {
      break;
    }
  }
  if (i === HTML_SEQUENCES.length) {
    return false;
  }
  if (silent) {
    return HTML_SEQUENCES[i][2];
  }
  nextLine = startLine + 1;
  if (!HTML_SEQUENCES[i][1].test(lineText)) {
    for (; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) {
        break;
      }
      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      lineText = state.src.slice(pos, max);
      if (HTML_SEQUENCES[i][1].test(lineText)) {
        if (lineText.length !== 0) {
          nextLine++;
        }
        break;
      }
    }
  }
  state.line = nextLine;
  const token = state.push("html_block", "", 0);
  token.map = [startLine, nextLine];
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
  return true;
};

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/containers.ts
var container = __require("markdown-it-container");
var containerPlugin = (md) => {
  md.use(...createContainer("tip", "TIP")).use(...createContainer("warning", "WARNING")).use(...createContainer("danger", "WARNING")).use(container, "v-pre", {
    render: (tokens, idx) => tokens[idx].nesting === 1 ? `<div v-pre>
` : `</div>
`
  });
};
function createContainer(klass, defaultTitle) {
  return [
    container,
    klass,
    {
      render(tokens, idx) {
        const token = tokens[idx];
        if (token.nesting === 1) {
          return `<div class="${klass} custom-block">`;
        } else {
          return `</div>
`;
        }
      }
    }
  ];
}

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/snippet.ts
import fs from "fs";
var snippetPlugin = (md, root3) => {
  const parser = (state, startLine, endLine, silent) => {
    const CH = "<".charCodeAt(0);
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    if (state.sCount[startLine] - state.blkIndent >= 4) {
      return false;
    }
    for (let i = 0; i < 3; ++i) {
      const ch = state.src.charCodeAt(pos + i);
      if (ch !== CH || pos + i >= max)
        return false;
    }
    if (silent) {
      return true;
    }
    const start = pos + 3;
    const end = state.skipSpacesBack(max, pos);
    const rawPath = state.src.slice(start, end).trim().replace(/^@/, root3);
    const filename = rawPath.split(/{/).shift().trim();
    const content = fs.existsSync(filename) ? fs.readFileSync(filename).toString() : "Not found: " + filename;
    const meta = rawPath.replace(filename, "");
    state.line = startLine + 1;
    const token = state.push("fence", "code", 0);
    token.info = filename.split(".").pop() + meta;
    token.content = content;
    token.markup = "```";
    token.map = [startLine, startLine + 1];
    return true;
  };
  md.block.ruler.before("fence", "snippet", parser);
};

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/hoist.ts
var hoistPlugin = (md) => {
  const RE2 = /^<(script|style)(?=(\s|>|$))/i;
  md.renderer.rules.html_block = (tokens, idx) => {
    const content = tokens[idx].content;
    const data = md.__data;
    const hoistedTags = data.hoistedTags || (data.hoistedTags = {
      script: [],
      style: [],
      components: []
    });
    const hoistTag = (content.match(RE2) || [])[1];
    if (hoistTag) {
      const tag = hoistTag.toLocaleLowerCase();
      hoistedTags[tag] = hoistedTags[tag] || [];
      hoistedTags[tag]?.push(content.replace(/^<(script|style)(?=(\s|>|$))/gi, ""));
      return "";
    } else {
      return content;
    }
  };
};

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/preWrapper.ts
var preWrapperPlugin = (md) => {
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const rawCode = fence(...args);
    return `<div class="language-${token.info.trim()}">${rawCode}</div>`;
  };
};

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/link.ts
import { URL } from "url";
var indexRE = /(^|.*\/)index.md(#?.*)$/i;
var linkPlugin = (md, externalAttrs) => {
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex("href");
    if (hrefIndex >= 0) {
      const hrefAttr = token.attrs[hrefIndex];
      const url = hrefAttr[1];
      const isExternal = /^https?:/.test(url);
      if (isExternal) {
        Object.entries(externalAttrs).forEach(([key, val]) => {
          token.attrSet(key, val);
        });
      } else if (!url.startsWith("#") && !url.startsWith("mailto:")) {
        normalizeHref(hrefAttr);
      }
    }
    return self.renderToken(tokens, idx, options);
  };
  function normalizeHref(hrefAttr) {
    let url = hrefAttr[1];
    const indexMatch = url.match(indexRE);
    if (indexMatch) {
      const [, path6, hash] = indexMatch;
      url = path6 + hash;
    } else {
      let cleanUrl = url.replace(/\#.*$/, "").replace(/\?.*$/, "");
      if (cleanUrl.endsWith(".md")) {
        cleanUrl = cleanUrl.replace(/\.md$/, ".html");
      }
      if (!cleanUrl.endsWith(".html") && !cleanUrl.endsWith("/")) {
        cleanUrl += ".html";
      }
      const parsed = new URL(url, "http://a.com");
      url = cleanUrl + parsed.search + parsed.hash;
    }
    if (!url.startsWith("/") && !/^\.\//.test(url)) {
      url = "./" + url;
    }
    const data = md.__data;
    const links = data.links || (data.links = []);
    links.push(url.replace(/\.html$/, ""));
    hrefAttr[1] = decodeURI(url);
  }
};

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/header.ts
var extractHeaderPlugin = (md, include = ["h2", "h3"]) => {
  md.renderer.rules.heading_open = (tokens, i, options, env, self) => {
    const token = tokens[i];
    if (include.includes(token.tag)) {
      const title = tokens[i + 1].content;
      const idAttr = token.attrs.find(([name]) => name === "id");
      const slug = idAttr && idAttr[1];
      const data = md.__data;
      const headers = data.headers || (data.headers = []);
      headers.push({
        level: parseInt(token.tag.slice(1), 10),
        title: deeplyParseHeader(title),
        slug: slug || slugify(title)
      });
    }
    return self.renderToken(tokens, i, options);
  };
};

// vite-plugins-comp-vue/vite-plugin-md/markdown/plugins/demo.ts
import fs2 from "fs";
import path3 from "path";
var index = 1;
var demoPlugin = (md) => {
  const RE2 = /<demo /i;
  md.renderer.rules.html_inline = (tokens, idx) => {
    const content = tokens[idx].content;
    const data = md.__data;
    const hoistedTags = data.hoistedTags || (data.hoistedTags = {
      script: [],
      style: [],
      components: []
    });
    if (RE2.test(content.trim())) {
      const componentName = `demo${index++}`;
      let language = (content.match(/language=("|')(.*)('|")/) || [])[2] ?? "";
      const src = (content.match(/src=("|')(\S+)('|")/) || [])[2] ?? "";
      const { realPath, urlPath } = md;
      const absolutePath = path3.resolve(realPath ?? urlPath, "../", src).split(path3.sep).join("/");
      if (!src || !fs2.existsSync(absolutePath)) {
        const warningMsg = `${absolutePath} does not exist!`;
        console.warn(`[vitepress]: ${warningMsg}`);
        return `<demo src="${absolutePath}" >
        <p>${warningMsg}</p>`;
      }
      if (!language) {
        language = (absolutePath.match(/\.(.+)$/) || [])[1] ?? "vue";
      }
      const codeStr = fs2.readFileSync(absolutePath).toString();
      const htmlStr = encodeURIComponent(highlight(codeStr, language));
      hoistedTags.script.unshift(`import ${componentName} from '${absolutePath}' 
`);
      hoistedTags.components.push(componentName);
      return content.replace(">", ` componentName="${componentName}" htmlStr="${htmlStr}" codeStr="${encodeURIComponent(codeStr)}" >
        <${componentName}></${componentName}>
        `);
    } else {
      return content;
    }
  };
};

// vite-plugins-comp-vue/vite-plugin-md/markdown/markdown.ts
var emoji = __require("markdown-it-emoji");
var anchor = __require("markdown-it-anchor");
var toc = __require("markdown-it-table-of-contents");
var createMarkdownRenderer = (root3, options = {}) => {
  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight,
    ...options
  });
  md.use(demoPlugin).use(componentPlugin).use(highlightLinePlugin).use(preWrapperPlugin).use(snippetPlugin, root3).use(hoistPlugin).use(containerPlugin).use(extractHeaderPlugin).use(linkPlugin, {
    target: "_blank",
    rel: "noopener noreferrer",
    ...options.externalLinks
  }).use(emoji).use(anchor, {
    slugify,
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: "#",
    permalinkAttrs: () => ({ "aria-hidden": true }),
    ...options.anchor
  }).use(toc, {
    slugify,
    includeLevel: [2, 3],
    format: parseHeader,
    ...options.toc
  });
  if (options.config) {
    options.config(md);
  }
  if (options.lineNumbers) {
    md.use(lineNumberPlugin);
  }
  const render = md.render;
  const wrappedRender = (src) => {
    ;
    md.__data = {};
    const html = render.call(md, src);
    return {
      html,
      data: md.__data
    };
  };
  md.render = wrappedRender;
  return md;
};

// vite-plugins-comp-vue/vite-plugin-md/utils/slash.ts
function slash(p) {
  return p.replace(/\\/g, "/");
}

// vite-plugins-comp-vue/vite-plugin-md/markdownToVue.ts
import chalk2 from "chalk";
var debug = __require("debug")("vitepress:md");
var cache = new LRUCache({ max: 1024 });
function createMarkdownToVueRenderFn(root3, options = {}, pages2) {
  const md = createMarkdownRenderer(root3, options);
  pages2 = pages2.map((p) => slash(p.replace(/\.md$/, "")));
  return (src, file) => {
    const relativePath = slash(path4.relative(root3, file));
    const cached = cache.get(src);
    if (cached) {
      debug(`[cache hit] ${relativePath}`);
      return cached;
    }
    const start = Date.now();
    const { content, data: frontmatter } = matter(src);
    md.realPath = frontmatter?.map?.realPath;
    md.urlPath = file;
    let { html, data } = md.render(content);
    html = html.replace(/import\.meta/g, "import.<wbr/>meta").replace(/process\.env/g, "process.<wbr/>env");
    const deadLinks = [];
    if (data.links) {
      const dir = path4.dirname(file);
      for (let url of data.links) {
        url = url.replace(/[?#].*$/, "").replace(/\.(html|md)$/, "");
        if (url.endsWith("/"))
          url += `index`;
        const resolved = slash(url.startsWith("/") ? url.slice(1) : path4.relative(root3, path4.resolve(dir, url)));
        if (!pages2.includes(resolved)) {
          console.warn(chalk2.yellow(`
(!) Found dead link ${chalk2.cyan(url)} in file ${chalk2.white.dim(file)}`));
          deadLinks.push(url);
        }
      }
    }
    const pageData = {
      title: inferTitle(frontmatter, content),
      description: inferDescription(frontmatter),
      frontmatter,
      headers: data.headers,
      relativePath,
      lastUpdated: Math.round(fs3.statSync(file).mtimeMs)
    };
    data.hoistedTags = data.hoistedTags || {};
    data.hoistedTags.script = data.hoistedTags.script || [];
    injectComponentData(data.hoistedTags);
    injectPageData(data.hoistedTags, pageData);
    const vueSrc = `<script>${(data.hoistedTags.script ?? []).join("\n")}<\/script><style>${(data.hoistedTags.style ?? []).join("\n")}</style>
<template><div>${html}</div></template>`;
    debug(`[render] ${file} in ${Date.now() - start}ms.`);
    const result = {
      vueSrc,
      pageData,
      deadLinks
    };
    cache.set(src, result);
    return result;
  };
}
function injectPageData(hoistedTags, data) {
  const code = `
export const __pageData = ${JSON.stringify(JSON.stringify(data))}`;
  hoistedTags.script?.push(code);
}
function injectComponentData(hoistedTags) {
  const exportCode = `
export default {
    components: {
      ${(hoistedTags.components || []).join(", ")}
    },
  }
  `;
  hoistedTags.script?.push(exportCode);
}
var inferTitle = (frontmatter, content) => {
  if (frontmatter.home) {
    return "Home";
  }
  if (frontmatter.title) {
    return deeplyParseHeader(frontmatter.title);
  }
  const match = content.match(/^\s*#+\s+(.*)/m);
  if (match) {
    return deeplyParseHeader(match[1].trim());
  }
  return "";
};
var inferDescription = (frontmatter) => {
  const { description, head } = frontmatter;
  if (description !== void 0) {
    return description;
  }
  return head && getHeadMetaContent(head, "description") || "";
};
var getHeadMetaContent = (head, name) => {
  if (!head || !head.length) {
    return void 0;
  }
  const meta = head.find(([tag, attrs = {}]) => {
    return tag === "meta" && attrs.name === name && attrs.content;
  });
  return meta && meta[1].content;
};

// vite-plugins-comp-vue/index.ts
var hasDeadLinks = false;
var vite_plugins_comp_vue_default = (config) => {
  const markdownToVue = createMarkdownToVueRenderFn(root, markdown, pages);
  return {
    name: "vite-comp-vue",
    resolveId(id) {
      if (id === "@routerPaths") {
        return id;
      }
    },
    async load(id) {
      if (id === "@routerPaths") {
        return `export default ${JSON.stringify(await routerPaths(config))}`;
      }
    },
    transform(code, id) {
      console.log("++++++", id);
      if (id.endsWith(".md")) {
        const { vueSrc, deadLinks } = markdownToVue(code, id);
        if (deadLinks.length) {
          hasDeadLinks = true;
        }
        return vueSrc;
      }
    },
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (req.url.endsWith(".html")) {
            res.statusCode = 200;
            res.end(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/@fs/${APP_PATH}/index.tsx"><\/script>
  </body>
</html>`);
            return;
          }
          next();
        });
      };
    }
  };
};

// vite.config.ts
import path5 from "path";
var CWD = process.cwd();
var root2 = CWD;
var resolve = (_path) => path5.resolve(root2, _path);
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vite_plugins_comp_vue_default({
      docDir: resolve("./src/packages")
    })
  ],
  resolve: {
    alias: {
      "@": resolve("./src"),
      "vue": "vue/dist/vue.esm-bundler.js"
    }
  }
});
export {
  vite_config_default as default
};

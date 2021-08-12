"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVueDocPlugin = void 0;
const markdownToVue_1 = require("./markdownToVue");
const path_1 = __importDefault(require("path"));
const debug = require('debug')('vite:vuedoc:plugin');
const cacheDemos = new Map();
function createVueDocPlugin(options) {
    const { wrapperClass = '', previewClass = '', previewComponent = '', markdownIt, highlight } = options;
    const { plugins = [] } = markdownIt || {};
    const { theme = 'one-dark' } = highlight || {};
    const _options = {
        wrapperClass,
        previewClass,
        previewComponent,
        markdownIt: {
            plugins
        },
        highlight: {
            theme
        }
    };
    let config;
    let vuePlugin;
    const vueDocPlugin = {
        name: 'vuedoc',
        configResolved(resolvedConfig) {
            // store the resolved config
            config = resolvedConfig;
            vuePlugin = config.plugins.find(p => p.name === 'vite:vue');
        },
        resolveId(id) {
            if (/\.md\.vdpv_(\d+)\.vd$/.test(id)) {
                const idPath = id.startsWith(config.root + '/') ? id : path_1.default.join(config.root, id.substr(1));
                debug('resolve demo:', idPath);
                return idPath;
            }
        },
        load(id) {
            const mat = id.match(/\.md\.vdpv_(\d+)\.vd$/);
            if (mat && mat.length >= 2) {
                const index = Number(mat[1]);
                debug(`load:${id} ${index}`);
                const mdFileName = id.replace(`.vdpv_${index}.vd`, '');
                const mdFilePath = mdFileName.startsWith(config.root + '/')
                    ? mdFileName
                    : path_1.default.join(config.root, mdFileName.substr(1));
                const demoBlocks = cacheDemos.get(mdFilePath);
                return demoBlocks === null || demoBlocks === void 0 ? void 0 : demoBlocks[index].code;
            }
        },
        transform(code, id) {
            if (id.endsWith('.md')) {
                const filePath = id.startsWith(config.root + '/') ? id : path_1.default.join(config.root, id.substr(1));
                debug(`transform:md -> ${filePath}`);
                debug(`transform:config -> ${config.root}`);
                const markdownToVue = markdownToVue_1.createMarkdownRenderFn(_options, config);
                const { component, demoBlocks } = markdownToVue(code, filePath);
                cacheDemos.set(filePath, demoBlocks);
                console.log(component);
                return component;
            }
        },
        handleHotUpdate(ctx) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!vuePlugin) {
                    return [];
                }
                // handle config hmr
                const { file, read, timestamp, server } = ctx;
                const { moduleGraph } = server;
                // hot reload .md files as .vue files
                if (file.endsWith('.md')) {
                    const content = yield read();
                    debug(`handleHotUpdate: md -> ${file}`);
                    const markdownToVue = markdownToVue_1.createMarkdownRenderFn(_options, config);
                    const { component, demoBlocks } = markdownToVue(content, file);
                    const prevDemoBlocks = [...(cacheDemos.get(file) || [])];
                    cacheDemos.set(file, demoBlocks);
                    const updateModules = [];
                    //     file: string;
                    // timestamp: number;
                    // modules: Array<ModuleNode>;
                    // read: () => string | Promise<string>;
                    // server: ViteDevServer;
                    demoBlocks.forEach((demo, index) => __awaiter(this, void 0, void 0, function* () {
                        const prevDemo = prevDemoBlocks === null || prevDemoBlocks === void 0 ? void 0 : prevDemoBlocks[index];
                        if (!prevDemo || demo.id != prevDemo.id || demo.code !== prevDemo.code) {
                            const demoFile = `${file}.${demo.id}.vd`;
                            debug(`handleHotUpdate: demo -> ${demoFile}`);
                            const mods = moduleGraph.getModulesByFile(demoFile);
                            const ret = yield vuePlugin.handleHotUpdate({
                                file: demoFile,
                                timestamp: timestamp,
                                modules: mods ? [...mods] : [],
                                server: server,
                                read: () => component
                            });
                            if (ret) {
                                debug('ret:', ret);
                                updateModules.push(...ret);
                            }
                            // watcher.emit('change', demoFile)
                        }
                    }));
                    // reload the content component
                    const ret = yield vuePlugin.handleHotUpdate(Object.assign(Object.assign({}, ctx), { read: () => component }));
                    return [...updateModules, ...(ret || [])];
                    // return ret
                }
            });
        }
    };
    return [vueDocPlugin];
}
exports.createVueDocPlugin = createVueDocPlugin;
//# sourceMappingURL=plugin.js.map
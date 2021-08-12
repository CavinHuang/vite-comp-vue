import { ResolvedConfig } from 'vite';
import { VueDocPluginOptions } from './plugin';
export declare const VUEDOC_PREFIX = "vdpv_";
export declare const VUEDOC_RE: RegExp;
export declare function createMarkdownRenderFn(options: VueDocPluginOptions, config: ResolvedConfig): (code: string, file: string) => {
    component: string;
    demoBlocks: import("./markdown-it").DemoBlockType[];
};

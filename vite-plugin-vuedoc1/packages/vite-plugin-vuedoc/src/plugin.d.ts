import { Plugin } from 'vite';
export declare type VueDocPluginOptions = {
    wrapperClass: string;
    previewClass: string;
    previewComponent: string;
    markdownIt: {
        plugins: any[];
    };
    highlight: {
        theme: 'one-dark' | 'one-light' | string;
    };
};
export declare function createVueDocPlugin(options: Partial<VueDocPluginOptions>): Plugin[];

import matter from 'gray-matter';
import { VueDocPluginOptions } from '../plugin';
export declare type DemoBlockType = {
    id: string;
    code: string;
    isImport?: boolean;
};
export declare const remarkFile: (source: string, options: {
    vuePrefix: string;
    file: string;
    isServe: boolean;
} & VueDocPluginOptions) => {
    template: string;
    matter: Record<string, any>;
    toc: {
        content: string;
        anchor: string;
        level: number;
    }[];
    demoBlocks: DemoBlockType[];
};

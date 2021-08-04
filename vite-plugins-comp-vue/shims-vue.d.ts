import { ViteCompConfig } from './index';

declare module '@routerPaths' {
  const routerPaths: {
    routerPaths: Array<{ path: string, filePath: string }>
    config: ViteCompConfig
  }
  export default routerPaths
}

declare module 'markdown-it-table-of-contents'
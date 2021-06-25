declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@auto-import-md' {
  import marked from 'marked'
  export const content: string
  export const modules: marked.Tokens.Code[]
}
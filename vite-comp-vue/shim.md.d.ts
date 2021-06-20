import { modules } from '{{mdpath}}';
import { MdModule } from './shared/markdown';
declare module "*.md" {
    const content: string;
    export default content;
}

declare module "*/README.md" {
  export const modules: MdModule
  export const content: string 
}
declare module "js-yaml" {
  export function load(content: string): any;
  export function safeLoad(content: string): any;
  export function dump(obj: any): string;
  export function safeDump(obj: any): string;
}

declare module "js-yaml" {
  export function load(str: string, options?: any): any;
  export function loadAll(
    str: string,
    iterator?: (doc: any) => void,
    options?: any,
  ): any[];
  export function safeLoad(str: string, options?: any): any;
  export function safeLoadAll(
    str: string,
    iterator?: (doc: any) => void,
    options?: any,
  ): any[];
  export function dump(obj: any, options?: any): string;
  export function safeDump(obj: any, options?: any): string;

  // Add other exports as needed
  export const DEFAULT_SCHEMA: any;
  export const CORE_SCHEMA: any;
  export const DEFAULT_SAFE_SCHEMA: any;
  export const DEFAULT_FULL_SCHEMA: any;
  export const FAILSAFE_SCHEMA: any;
  export const JSON_SCHEMA: any;

  export class Type {
    constructor(tag: string, options?: any);
  }

  export class Schema {
    constructor(options?: any);
  }
}

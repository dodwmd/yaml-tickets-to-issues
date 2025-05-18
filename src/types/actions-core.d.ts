declare module "@actions/core" {
  export function getInput(
    name: string,
    options?: { required?: boolean },
  ): string;
  export function getBooleanInput(
    name: string,
    options?: { required?: boolean },
  ): boolean;
  export function setOutput(name: string, value: unknown): void;
  export function setSecret(secret: string): void;
  export function setCommandEcho(enabled: boolean): void;
  export function setFailed(message: string | Error): void;
  export function debug(message: string): void;
  export function error(
    message: string | Error,
    properties?: Record<string, unknown>,
  ): void;
  export function warning(
    message: string | Error,
    properties?: Record<string, unknown>,
  ): void;
  export function notice(
    message: string | Error,
    properties?: Record<string, unknown>,
  ): void;
  export function info(message: string): void;
  export function startGroup(name: string): void;
  export function endGroup(): void;
  export function group<T>(name: string, fn: () => Promise<T>): Promise<T>;
  export function saveState(name: string, value: unknown): void;
  export function getState(name: string): string;
  export function isDebug(): boolean;
  export function addPath(inputPath: string): void;
  export function exportVariable(name: string, val: string): void;
  export function toCommandValue(input: unknown): string;
  export function toCommandProperties(
    annotationProperties: unknown,
  ): Record<string, string>;
  export function getMultilineInput(
    name: string,
    options?: { required?: boolean },
  ): string[];
  export function toPlatformPath(p: string): string;
  export function toWin32Path(p: string): string;
  export function toPosixPath(p: string): string;
  export function toCommandValue(input: unknown): string;
  export function toCommandProperties(
    annotationProperties: unknown,
  ): Record<string, string>;
}

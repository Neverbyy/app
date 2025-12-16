/// <reference types="vite/client" />

declare module "*.svg?url" {
  const content: string;
  export default content;
}

declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "../../services/electron" {
  export const openExternalUrl: (url: string) => Promise<void>;
  export const openWindow: (params: any) => Promise<number>;
  export const closeWindow: (windowId: number) => Promise<void>;
  export const executeScriptInWindow: (windowId: number, script: string) => Promise<any>;
  export const subscribeOnWindowClosed: (
    windowId: number,
    callback: (closedWindowId: number) => void
  ) => () => void;
}

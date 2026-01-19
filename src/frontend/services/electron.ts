import type { BrowserWindowConstructorOptions } from "electron";

// Используем require вместо импорта, так как electron доступен только в runtime
export const electron = require("electron") as typeof import("electron");
export const ipcRenderer = electron.ipcRenderer;


export const openWindow = async (params: BrowserWindowConstructorOptions & {url: string;  devtools?: boolean}) => {
  const id = await ipcRenderer.invoke("open-auth-window", params);
  return id as number;
};

export const closeWindow = async (windowId: number)=> {
    await ipcRenderer.invoke("close-auth-window", windowId);
}

export const executeScriptInWindow =  async (windowId: number, script: string)=> {
    return await ipcRenderer.invoke("execute-script-in-window", windowId, `(${script})()`);
}

/**
 * Подписывается на событие закрытия окна
 * @param windowId ID окна, на закрытие которого нужно подписаться
 * @param callback Функция, которая будет вызвана при закрытии окна
 * @returns Функция для отписки от события
 */
export const subscribeOnWindowClosed = (
  windowId: number,
  callback: (closedWindowId: number) => void
): (() => void) => {
  const handler = (_event: any, closedWindowId: number) => {
    if (closedWindowId === windowId) {
      callback(closedWindowId);
    }
  };

  ipcRenderer.on("auth-window-closed", handler);

  // Возвращаем функцию для отписки
  return () => {
    ipcRenderer.removeListener("auth-window-closed", handler);
  };
};

export const openExternalUrl = async (url: string) => {
  await ipcRenderer.invoke("open-external-url", url);
};

export const closeApp = async () => {
  await ipcRenderer.invoke("close-app");
};

/**
 * Подписывается на событие запроса закрытия приложения
 * @param callback Функция, которая будет вызвана при запросе закрытия
 * @returns Функция для отписки от события
 */
export const subscribeOnAppCloseRequest = (
  callback: () => void
): (() => void) => {
  const handler = () => {
    callback();
  };

  ipcRenderer.on("app-close-requested", handler);

  // Возвращаем функцию для отписки
  return () => {
    ipcRenderer.removeListener("app-close-requested", handler);
  };
};
import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
  shell,
} from "electron";
import os from "os";
import { readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import started from "electron-squirrel-startup";
import { createMainWindow } from "./mainWindow";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Настройка для работы с VPN: обход прокси для localhost соединений
if (process.platform === "win32") {
  app.commandLine.appendSwitch("host-resolver-rules", "MAP localhost 127.0.0.1");
}

// Хранилище открытых окон для доступа по ID
const allWindows = new Map<number, BrowserWindow>();

// IPC обработчики для работы с окнами авторизации
ipcMain.handle(
  "open-auth-window",
  async (_, options: BrowserWindowConstructorOptions & { url: string, devtools?: boolean }) => {
    const { url, devtools, ...rest } = options;

    // Создаем окно без показа, чтобы не активировать его сразу
    const winOptions = {
      ...rest,
      show: false, // Сначала создаем скрытым
    };
    
    const win = new BrowserWindow(winOptions);
    try {
      await win.loadURL(url);

      // Сохраняем окно в Map
      const windowId = win.id;
      allWindows.set(windowId, win);

      if(devtools){
        win.webContents.openDevTools();
      }

      // Показываем окно без активации (не перехватывает фокус)
      if (rest.show !== false) {
        win.showInactive();
      }

      // Удаляем из Map при закрытии окна и отправляем событие в renderer
      win.on("closed", () => {
        allWindows.delete(windowId);
        // Отправляем событие о закрытии окна в renderer процесс
        const mainWindow = BrowserWindow.getAllWindows().find(
          (win) => win.id !== windowId
        );
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("auth-window-closed", windowId);
        }
      });

      return windowId;
    } catch (err) {
      win.destroy();
      throw err;
    }
  }
);

ipcMain.handle(
  "execute-script-in-window",
  async (_, windowId: number, script: string) => {
    const win = allWindows.get(windowId);
    if (!win || win.isDestroyed()) {
      throw new Error(`Window with id ${windowId} not found or destroyed`);
    }

    try {
      const result = await win.webContents.executeJavaScript(script);
      return result;
    } catch (error) {
      console.error("Error executing script in window:", error);
      throw error;
    }
  }
);

ipcMain.handle("close-auth-window", async (_, windowId: number) => {
  const authWin = allWindows.get(windowId);
  if (authWin && !authWin.isDestroyed()) {
    authWin.close();
    allWindows.delete(windowId);
    return true;
  }
  return false;
});

ipcMain.handle("open-external-url", async (_, url: string) => {
  try {
    const parsedUrl = new URL(url);
    const allowedProtocols = ["http:", "https:"];
    
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      throw new Error(`Недопустимый протокол: ${parsedUrl.protocol}. Разрешены только http:// и https://`);
    }
    
    await shell.openExternal(url);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Некорректный URL: ${url}`);
    }
    throw error;
  }
});

/**
 * Определяет тип дистрибутива Linux (DEB или RPM)
 */
const getLinuxDistroType = (): "DEB" | "RPM" => {
  try {
    // Проверяем наличие dpkg (Debian-based: Ubuntu, Debian, Linux Mint)
    try {
      execSync("which dpkg", { stdio: "ignore" });
      return "DEB";
    } catch {
      // dpkg не найден
    }
    
    // Проверяем наличие rpm (RedHat-based: Fedora, CentOS, RHEL)
    try {
      execSync("which rpm", { stdio: "ignore" });
      return "RPM";
    } catch {
      // rpm не найден
    }
    
    // По умолчанию возвращаем DEB (более популярный)
    return "DEB";
  } catch (error) {
    console.error("Error detecting Linux distro:", error);
    return "DEB";
  }
};

/**
 * Преобразует process.platform в унифицированный формат для бэкенда
 */
const getPlatformEnum = (): "WIN" | "MAC" | "DEB" | "RPM" => {
  switch (process.platform) {
    case "win32":
      return "WIN";
    case "darwin":
      return "MAC";
    case "linux":
      return getLinuxDistroType();
    default:
      return "DEB"; // Fallback
  }
};

ipcMain.handle("get-system-info", async () => {
  const packageJsonPath = join(__dirname, "../../package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  return {
    platform: getPlatformEnum(),
    arch: process.arch,
    osVersion: os.release(),
    electronVersion: process.versions.electron,
    locale: app.getLocale(),
    appVersion: packageJson.version || "1.0.1",
  };
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.once("ready", () => {
  createMainWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  app.quit();
});

import { BrowserWindow, app } from "electron";
import path from "path";
import { existsSync } from "fs";

const getIconPath = (): string | undefined => {
  // Определяем базовый путь к иконкам
  let basePath: string;
  
  if (app.isPackaged) {
    // В production: иконки должны быть в resources/app.asar.unpacked или рядом с exe
    basePath = path.join(process.resourcesPath, "assets", "icons");
  } else {
    
    basePath = path.join(__dirname, "../../assets/icons");
  }

  // Определяем расширение в зависимости от платформы
  let iconFile: string;
  if (process.platform === "win32") {
    iconFile = path.join(basePath, "icon.ico");
  } else if (process.platform === "darwin") {
    iconFile = path.join(basePath, "icon.icns");
  } else {
    iconFile = path.join(basePath, "icon.png");
  }

  // Возвращаем путь только если файл существует
  return existsSync(iconFile) ? iconFile : undefined;
};

export const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false, // Отключено для разрешения CORS запросов
    },
    title: "Sofi Agent",
    icon: getIconPath(),
  });

  // Открываем DevTools только в режиме разработки
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("close", () => {
    app.quit();
  });

  const loadDevServer = async (url: string, retryCount = 0): Promise<void> => {
    try {
      await mainWindow.loadURL(url);
    } catch (error) {
      // Если ошибка подключения и URL содержит localhost, пробуем заменить на 127.0.0.1
      if (
        retryCount === 0 &&
        url.includes("localhost") &&
        (error as Error).message?.includes("ERR_CONNECTION_REFUSED")
      ) {
        const fallbackUrl = url.replace("localhost", "127.0.0.1");
        console.warn(
          `Не удалось подключиться к ${url}, пробуем ${fallbackUrl}`
        );
        return loadDevServer(fallbackUrl, 1);
      }
      throw error;
    }
  };

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    loadDevServer(MAIN_WINDOW_VITE_DEV_SERVER_URL).catch((error) => {
      console.error("Ошибка загрузки dev сервера:", error);
      // Fallback на файл, если dev сервер недоступен
      mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
      );
    });
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  return mainWindow;
};


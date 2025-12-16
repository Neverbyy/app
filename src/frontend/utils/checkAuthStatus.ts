import {
  executeScriptInWindow,
  ipcRenderer,
} from "src/frontend/services/electron";

/**
 * Проверяет, авторизован ли пользователь через IPC
 */
export const checkAuthStatus = async (
  windowId: number
): Promise<"authorized" | "not-authorized" | null> => {
  try {
    const script = () => {
      // @ts-ignore
      if (typeof window.globalVars !== "undefined") {
        // @ts-ignore
        return window.globalVars.userType;
      }
      return null;
    };

    const userType = await executeScriptInWindow(windowId, script.toString());

    if (userType === "applicant") {
      return "authorized";
    }

    if (userType === "anonymous") {
      return "not-authorized";
    }
    return null;
  } catch (error) {
    return null;
  }
};

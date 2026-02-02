import { executeScriptInWindow } from "src/frontend/services/electron";

/**
 * Проверяет, авторизован ли пользователь в окне hh.ru.
 * На странице входа (выбор «Я ищу работу» / «Я ищу сотрудников») возвращает null,
 * чтобы окно не закрывалось до завершения авторизации.
 */
export const checkAuthStatus = async (
  windowId: number
): Promise<"authorized" | "not-authorized" | null> => {
  try {
    const script = () => {
      // @ts-ignore
      if (typeof window.globalVars !== "undefined") {
        // @ts-ignore
        const userType = window.globalVars.userType;
        if (userType === "applicant") return "applicant";
        if (userType === "anonymous") {
          const href = (window.location && window.location.href) || "";
          const bodyText =
            (document.body && document.body.innerText) || "";
          const isLoginOrChoicePage =
            href.indexOf("/account/login") !== -1 ||
            bodyText.indexOf("Я ищу работу") !== -1 ||
            bodyText.indexOf("Вход в личный кабинет") !== -1 ||
            bodyText.indexOf("Я ищу сотрудников") !== -1 ||
            bodyText.indexOf("Профиль соискателя") !== -1;
          if (isLoginOrChoicePage) return "anonymous-on-login-page";
          return "anonymous";
        }
      }
      return null;
    };

    const result = await executeScriptInWindow(windowId, script.toString());

    if (result === "applicant") {
      return "authorized";
    }
    if (result === "anonymous-on-login-page") {
      return null;
    }
    if (result === "anonymous") {
      return "not-authorized";
    }
    return null;
  } catch (error) {
    return null;
  }
};

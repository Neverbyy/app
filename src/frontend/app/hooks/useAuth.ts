import { useState, useEffect } from "react";
import { login, checkAuth, logout, type LoginResponse } from "../../services/authService";
import { tryReloadOnNetworkError } from "../../utils/networkErrorReload";

export type AppStatus =
  | "checking-auth"
  | "checking-hh-auth"
  | "need-auth"
  | "waiting-hh-auth"
  | "response";

export const useAuth = () => {
  const [status, setStatus] = useState<AppStatus>("checking-auth");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [userData, setUserData] = useState<LoginResponse | null>(null);

  // Проверяем авторизацию при загрузке приложения
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const userData = await checkAuth();
        if (userData) {
          console.log("User is already authorized:", userData);
          setUserData(userData);
          setStatus("checking-hh-auth");
          return;
        }
        setStatus("need-auth");
      } catch (error) {
        console.error("Check auth error:", error);
        if (tryReloadOnNetworkError(error)) return;
        setStatus("need-auth");
        setUserData(null);
      }
    };

    checkUserAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const userData = await login(email, password);
      console.log("Login successful:", userData);
      setUserData(userData);
      setStatus("waiting-hh-auth");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Произошла ошибка при входе. Пожалуйста, попробуйте еще раз.";
      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Общая функция для выхода и возврата на страницу логина
  const performLogoutAndReset = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    setStatus("need-auth");
    setUserData(null);
  };

  // Переход на страницу автооткликов после успешной авторизации на hh.ru
  const navigateToAutoResponses = () => {
    setStatus("response");
  };

  const handleHhAuthSuccess = navigateToAutoResponses;
  const handleHhCheckAuthorized = navigateToAutoResponses;
  const handleHhAuthError = performLogoutAndReset;

  const handleHhCheckNotAuthorized = () => {
    // Если пользователь не авторизован на hh.ru, открываем окно авторизации
    setStatus("waiting-hh-auth");
  };

  const handleLogout = performLogoutAndReset;

  return {
    status,
    isLoading,
    loginError,
    handleLogin,
    handleHhAuthSuccess,
    handleHhAuthError,
    handleHhCheckAuthorized,
    handleHhCheckNotAuthorized,
    handleLogout,
  };
};

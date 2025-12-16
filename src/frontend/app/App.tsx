import React, { useState, useEffect } from "react";
import { LoginView } from "./components/LoginView";
import { AutoResponses } from "./components/AutoResponses";
import { AuthRequesting } from "./components/AuthRequesting/AuthRequesting";
import { AuthChecking } from "./components/AuthChecking/AuthChecking";
import { login, checkAuth, logout } from "../services/authService";

const App = () => {
  type State =
    | {
        status: "checking-auth";
      }
    | {
        status: "checking-hh-auth";
      }
    | {
        status: "need-auth";
      }
    | {
        status: "waiting-hh-auth";
      }
    | {
        status: "response";
      };

  const [state, setState] = useState<State>({
    status: "checking-auth",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ user_id?: string } | null>(null);

  // Проверяем авторизацию при загрузке приложения
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const userData = await checkAuth();
        if (userData) {
          console.log("User is already authorized:", userData);
          setUserData(userData);
          
          // Проверяем авторизацию на hh.ru
          setState({
            status: "checking-hh-auth",
          });
        } else {
          setState({
            status: "need-auth",
          });
        }
      } catch (error) {
        console.error("Check auth error:", error);
        setState({
          status: "need-auth",
        });
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

      // Переходим на страницу привязки аккаунта hh.ru
      setState({
        status: "waiting-hh-auth",
      });
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Произошла ошибка при входе. Пожалуйста, попробуйте еще раз.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHhAuthSuccess = () => {
    // После успешной авторизации на hh.ru переходим на страницу автооткликов
    setState({
      status: "response",
    });
  };

  const handleHhAuthError = async () => {
    // При закрытии окна без авторизации на hh.ru делаем logout
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    // Возвращаемся на страницу логина
    setState({
      status: "need-auth",
    });
  };

  const handleHhCheckAuthorized = () => {
    // Если пользователь авторизован на hh.ru, показываем автоотклики
    setState({
      status: "response",
    });
  };

  const handleHhCheckNotAuthorized = () => {
    // Если пользователь не авторизован на hh.ru, открываем окно авторизации
    setState({
      status: "waiting-hh-auth",
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    // В любом случае возвращаем на страницу авторизации
    setState({
      status: "need-auth",
    });
  };

  const renderProccessor = () => {
    if (state.status === "checking-auth" || state.status === "checking-hh-auth") {
      if (state.status === "checking-hh-auth") {
        return (
          <AuthChecking
            onAuthorized={handleHhCheckAuthorized}
            onNotAuthorized={handleHhCheckNotAuthorized}
            onError={handleHhCheckNotAuthorized}
          />
        );
      }
      return null; // Показываем пустой экран во время проверки
    }

    if (state.status === "need-auth") {
      return (
        <LoginView
          onLogin={handleLogin}
          isLoading={isLoading}
          error={loginError}
        />
      );
    }

    if (state.status === "waiting-hh-auth") {
      return (
        <AuthRequesting
          onAuthorized={handleHhAuthSuccess}
          onError={handleHhAuthError}
        />
      );
    }

    if (state.status === "response") {
      return <AutoResponses onLogout={handleLogout} />;
    }
  };

  return <>{renderProccessor()}</>;
};

export default App;



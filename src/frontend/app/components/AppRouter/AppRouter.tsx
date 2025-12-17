import React from "react";
import { LoginView } from "../LoginView";
import { AutoResponses } from "../AutoResponses";
import { AuthRequesting } from "../AuthRequesting/AuthRequesting";
import { AuthChecking } from "../AuthChecking/AuthChecking";
import type { AppStatus } from "../../hooks/useAuth";

type AppRouterProps = {
  status: AppStatus;
  isLoading: boolean;
  loginError: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onHhAuthSuccess: () => void;
  onHhAuthError: () => void;
  onHhCheckAuthorized: () => void;
  onHhCheckNotAuthorized: () => void;
  onLogout: () => void;
};

const AppRouter: React.FC<AppRouterProps> = ({
  status,
  isLoading,
  loginError,
  onLogin,
  onHhAuthSuccess,
  onHhAuthError,
  onHhCheckAuthorized,
  onHhCheckNotAuthorized,
  onLogout,
}) => {
  switch (status) {
    case "checking-auth":
      return null; // Показываем пустой экран во время проверки

    case "checking-hh-auth":
      return (
        <AuthChecking
          onAuthorized={onHhCheckAuthorized}
          onNotAuthorized={onHhCheckNotAuthorized}
          onError={onHhCheckNotAuthorized}
        />
      );

    case "need-auth":
      return (
        <LoginView
          onLogin={onLogin}
          isLoading={isLoading}
          error={loginError}
        />
      );

    case "waiting-hh-auth":
      return (
        <AuthRequesting
          onAuthorized={onHhAuthSuccess}
          onError={onHhAuthError}
        />
      );

    case "response":
      return <AutoResponses onLogout={onLogout} />;

    default:
      return null;
  }
};

export default AppRouter;

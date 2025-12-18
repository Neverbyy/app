import React from "react";
import { AppRouter } from "./components/AppRouter";
import { useAuth } from "./hooks/useAuth";

const App = () => {
  const {
    status,
    loginError,
    handleLogin,
    handleHhAuthSuccess,
    handleHhAuthError,
    handleHhCheckAuthorized,
    handleHhCheckNotAuthorized,
    handleLogout,
  } = useAuth();

  return (
    <AppRouter
      status={status}
      loginError={loginError}
      onLogin={handleLogin}
      onHhAuthSuccess={handleHhAuthSuccess}
      onHhAuthError={handleHhAuthError}
      onHhCheckAuthorized={handleHhCheckAuthorized}
      onHhCheckNotAuthorized={handleHhCheckNotAuthorized}
      onLogout={handleLogout}
    />
  );
};

export default App;



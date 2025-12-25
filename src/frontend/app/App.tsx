import React, { useEffect, useState } from "react";
import { AppRouter } from "./components/AppRouter";
import { useAuth } from "./hooks/useAuth";
import { UpdateModal } from "./components/UpdateModal";
import { checkForUpdates, type CheckUpdateResponse } from "../services/updateService";

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

  const [updateInfo, setUpdateInfo] = useState<CheckUpdateResponse | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    const performUpdateCheck = async () => {
      try {
        const response = await checkForUpdates();
        if (response.update_available) {
          setUpdateInfo(response);
          setIsUpdateModalOpen(true);
        }
      } catch (error) {
        console.error("Ошибка при проверке обновлений:", error);
      }
    };

    // Проверяем обновления при загрузке приложения
    performUpdateCheck();

    // Проверяем обновления каждые 30 минут
    const intervalId = setInterval(performUpdateCheck, 30 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  return (
    <>
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
      {updateInfo && (
        <UpdateModal
          isOpen={isUpdateModalOpen}
          onClose={handleCloseUpdateModal}
          downloadUrl={updateInfo.download_url}
          latestVersion={updateInfo.latest_version}
          releaseNotes={updateInfo.release_notes}
          isMandatory={updateInfo.is_mandatory}
          isCritical={updateInfo.is_critical}
        />
      )}
    </>
  );
};

export default App;



import React, { useEffect, useRef, useState } from "react";
import {
  closeWindow,
  ipcRenderer,
  openWindow,
} from "src/frontend/services/electron";
import { checkAuthStatus } from "src/frontend/utils/checkAuthStatus";

export type Props = {
  onError: () => void;
  onAuthorized: () => void;
  onNotAuthorized: () => void;
};

const AuthChecking$: React.FC<Props> = (props) => {
  const [windowId, setWindowId] = useState<number | null>(null);
  const isDoneRef = useRef(false);

  // Открываем окно авторизации при монтировании компонента
  useEffect(() => {
    const openAuthWindow = async () => {
      try {
        const id = await openWindow({
          url: "https://hh.ru",
          width: 800,
          height: 600,
          title: "HH auth check",
          show: false,
        });
        setWindowId(id);
      } catch (error) {
        console.error("Error opening auth window:", error);
        props.onError();
      }
    };

    openAuthWindow();
  }, []);

  useEffect(() => {
    if (!windowId) {
      return;
    }

    return () => {
      isDoneRef.current = true;
      if (windowId !== null) {
        closeWindow(windowId).catch((error) => {
          console.error("Error closing auth window:", error);
        });
      }
    };
  }, [windowId]);

  // Проверяем статус авторизации периодически
  useEffect(() => {
    if (windowId === null) return;

    const interval = setInterval(async () => {
      const status = await checkAuthStatus(windowId);

      if (isDoneRef.current) {
        return;
      }

      if (!status) {
        return;
      }

      if (status === "authorized") {
        props.onAuthorized();
        return;
      }

      if (status === "not-authorized") {
        props.onNotAuthorized();
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [windowId]);

  // Таймаут для ошибки
  useEffect(() => {
    if (!windowId) return;

    const timeout = setTimeout(() => {
      props.onError();
    }, 20_000);

    return () => {
      clearTimeout(timeout);
    };
  }, [windowId]);

  return null;
};

export const AuthChecking = React.memo(AuthChecking$);

import React, { useEffect, useRef, useState } from "react";
import {
  openWindow,
  closeWindow,
  subscribeOnWindowClosed,
} from "src/frontend/services/electron";
import { checkAuthStatus } from "src/frontend/utils/checkAuthStatus";

export type Props = {
  onError: () => void;
  onAuthorized: () => void;
};

const AuthRequesting$: React.FC<Props> = (props) => {
  const [windowId, setWindowId] = useState<number | null>(null);
  const isDoneRef = useRef(false);

  // Открываем окно авторизации при монтировании компонента
  useEffect(() => {
    const openAuthWindow = async () => {
      try {
        const id = await openWindow({
          url: "https://hh.ru/account/login?role=applicant&backurl=%2F&hhtmFrom=main",
          width: 800,
          height: 600,
          title: "Авторизация в hh",
          show: true,
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

  // Подписываемся на закрытие окна
  useEffect(() => {
    if (windowId === null) return;

    const unsubscribe = subscribeOnWindowClosed(windowId, (closedWindowId) => {
      console.log(`Окно ${closedWindowId} было закрыто`);
      if (!isDoneRef.current) {
        props.onError();
      }
    });

    return () => {
      unsubscribe();
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
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [windowId]);

  return null;
};

export const AuthRequesting = React.memo(AuthRequesting$);

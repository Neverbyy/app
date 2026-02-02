import React, { useEffect, useRef, useState } from "react";
import {
  openWindow,
  closeWindow,
  subscribeOnWindowClosed,
} from "../../../services/electron";
import { checkAuthStatus } from "../../../utils/checkAuthStatus";
import { Loader } from "../UI/Loader";

export type Props = {
  onError: () => void;
  onAuthorized: () => void;
};

const CHECK_INTERVAL_MS = 2000;

const AuthRequesting$: React.FC<Props> = ({ onError, onAuthorized }) => {
  const [windowId, setWindowId] = useState<number | null>(null);

  /**
   * true → финальное состояние уже принято
   * (успешная авторизация или подтверждённая ошибка)
   */
  const isDoneRef = useRef(false);

  /**
   * защита от параллельных проверок
   */
  const isCheckingRef = useRef(false);

  // 1️⃣ Открываем окно авторизации
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
        isDoneRef.current = true;
        onError();
      }
    };

    openAuthWindow();
  }, [onError]);

  // 2️⃣ Закрываем окно при размонтировании
  useEffect(() => {
    if (windowId === null) return;

    return () => {
      isDoneRef.current = true;
      closeWindow(windowId).catch((error) => {
        console.error("Error closing auth window:", error);
      });
    };
  }, [windowId]);

  // 3️⃣ Финальная проверка статуса авторизации
  const finalizeAuthCheck = async () => {
    if (windowId === null || isDoneRef.current || isCheckingRef.current) return;

    isCheckingRef.current = true;
    try {
      const status = await checkAuthStatus(windowId);

      if (status === "authorized") {
        isDoneRef.current = true;
        closeWindow(windowId).catch((err) =>
          console.warn("Ошибка при закрытии окна авторизации:", err)
        );
        onAuthorized();
      } else if (status === "not-authorized") {
        isDoneRef.current = true;
        onError();
      }
    } finally {
      isCheckingRef.current = false;
    }
  };

  // 4️⃣ Периодическая проверка авторизации
  useEffect(() => {
    if (windowId === null) return;

    const interval = setInterval(() => {
      if (!isDoneRef.current) {
        finalizeAuthCheck();
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [windowId]);

  // 5️⃣ Если окно закрыли — делаем финальную проверку
  useEffect(() => {
    if (windowId === null) return;

    const unsubscribe = subscribeOnWindowClosed(windowId, async () => {
      if (isDoneRef.current) return;

      await finalizeAuthCheck();

      if (!isDoneRef.current) {
        isDoneRef.current = true;
        onError();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [windowId]);

  return <Loader text="Ожидание авторизации в hh..." />;
};

export const AuthRequesting = React.memo(AuthRequesting$);

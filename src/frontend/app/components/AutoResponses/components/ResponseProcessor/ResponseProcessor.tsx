import React, { useEffect, useRef, useState } from "react";
import {
  closeWindow,
  executeScriptInWindow,
  openWindow,
} from "src/frontend/services/electron";

export type Props = {
  vacancyId: string;
  onFinish: (isSuccess: boolean) => void;
};

const ResponseProcessor$: React.FC<Props> = (props) => {
  const [windowId, setWindowId] = useState<number | null>(null);
  const isDoneRef = useRef(false);

  // Открываем окно авторизации при монтировании компонента
  useEffect(() => {
    const openAuthWindow = async () => {
      try {
        const id = await openWindow({
          url: "https://hh.ru/vacancy/" + props.vacancyId,
          width: 800,
          height: 600,
          title: "HH vacancy response",
          show: true,
          webPreferences: {
            devTools: true,
          },
          devtools: true,
        });
        setWindowId(id);
      } catch (error) {
        console.error("Error opening auth window:", error);
        props.onFinish(false);
      }
    };

    const timeout = setTimeout(() => {
      openAuthWindow();
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!windowId) {
      return;
    }

    const fn = async () => {
      let button: null | HTMLButtonElement;
      let counter = 0;
      while (!button) {
        button = window.document.querySelector(
          "[data-qa=vacancy-response-link-top]"
        );
        if (!button) {
          await new Promise((res) =>
            setTimeout(() => {
              res(0);
            }, 1000)
          );
        }
        counter++;
        if (counter >= 5) {
          return "button-timeout";
        }
      }

      button.click();
      counter = 0;

      while (true) {
        if (document.body.innerText.includes("Вы откликнулись")) {
          return "success";
        }
        await new Promise((res) =>
          setTimeout(() => {
            res(0);
          }, 1000)
        );
        counter++;
        if (counter >= 10) {
          return "response-timeout";
        }
      }
    };

    executeScriptInWindow(windowId, fn.toString())
      .then((result) => result as ReturnType<Awaited<typeof fn>>)
      .catch(() => "error" as const)
      .then((res) => {
        if (isDoneRef.current) {
          return;
        }

        console.log(`Process result ${res}`);
        switch (res) {
          case "button-timeout":
          case "response-timeout":
          case "error":
            props.onFinish(false);
            return;
          case "success":
            props.onFinish(true);
        }
      });
  }, [windowId]);

  useEffect(() => {
    if (!windowId) return;

    const timeout = setTimeout(() => {
      props.onFinish(false);
    }, 15_000);

    return () => {
      clearTimeout(timeout);
    };
  }, [windowId]);

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

  return null;
};

export const ResponseProcessor = React.memo(ResponseProcessor$);

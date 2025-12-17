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
      // Шаг 1: Находим и нажимаем кнопку отклика
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

      // Шаг 2: Ждем появления модалки и проверяем, нужно ли кликнуть на кнопку "Добавить сопроводительное письмо"
      let addCoverLetterButton: null | HTMLElement;
      counter = 0;
      let shouldContinue = true;
      while (shouldContinue) {
        // Ищем кнопку "Добавить сопроводительное письмо" по тексту
        const allButtons = Array.from(
          window.document.querySelectorAll("button")
        );
        addCoverLetterButton =
          allButtons.find((btn) =>
            btn.textContent?.includes("Добавить сопроводительное")
          ) ||
          allButtons.find((btn) =>
            btn.textContent?.includes("сопроводительное")
          ) ||
          window.document.querySelector(
            "[data-qa*='cover-letter']"
          ) ||
          window.document.querySelector(
            "button[aria-label*='сопроводительное']"
          );

        // Если нашли кнопку - кликаем на неё
        if (addCoverLetterButton) {
          addCoverLetterButton.click();
          // Небольшая задержка для появления поля
          await new Promise((res) =>
            setTimeout(() => {
              res(0);
            }, 1000)
          );
          shouldContinue = false;
          continue;
        }

        // Если не нашли кнопку, проверяем, может быть поле уже доступно
        const existingField =
          window.document.querySelector(
            "textarea[data-qa='vacancy-response-popup-form-letter-input']"
          ) ||
          window.document.querySelector(
            "textarea[data-qa='vacancy-response-popup-form-letter']"
          ) ||
          window.document.querySelector(
            "textarea[name='letter']"
          ) ||
          window.document.querySelector(
            ".bloko-textarea textarea"
          ) ||
          window.document.querySelector(
            "[data-qa='vacancy-response-popup-form'] textarea"
          );

        if (existingField) {
          // Поле уже доступно, кнопка не нужна
          shouldContinue = false;
          continue;
        }

        await new Promise((res) =>
          setTimeout(() => {
            res(0);
          }, 1000)
        );
        counter++;
        if (counter >= 5) {
          // Если не нашли ни кнопку, ни поле за 5 секунд, продолжаем поиск поля
          shouldContinue = false;
        }
      }

      // Шаг 3: Ждем появления поля сопроводительного письма и находим его
      let coverLetterField: null | HTMLTextAreaElement;
      counter = 0;
      while (!coverLetterField) {
        // Пробуем разные селекторы для поля сопроводительного письма
        coverLetterField =
          window.document.querySelector(
            "textarea[data-qa='vacancy-response-popup-form-letter-input']"
          ) ||
          window.document.querySelector(
            "textarea[data-qa='vacancy-response-popup-form-letter']"
          ) ||
          window.document.querySelector(
            "textarea[name='letter']"
          ) ||
          window.document.querySelector(
            ".bloko-textarea textarea"
          ) ||
          window.document.querySelector(
            "[data-qa='vacancy-response-popup-form'] textarea"
          );

        if (!coverLetterField) {
          await new Promise((res) =>
            setTimeout(() => {
              res(0);
            }, 1000)
          );
        }
        counter++;
        if (counter >= 10) {
          return "cover-letter-field-timeout";
        }
      }

      // Шаг 4: Заполняем поле сопроводительного письма
      const coverLetterText =
        "Здравствуйте! Меня заинтересовала данная вакансия. Готов рассмотреть предложение и обсудить детали сотрудничества. С уважением.";
      
      coverLetterField.value = coverLetterText;
      coverLetterField.dispatchEvent(new Event("input", { bubbles: true }));
      coverLetterField.dispatchEvent(new Event("change", { bubbles: true }));

      // Небольшая задержка для обработки события
      await new Promise((res) =>
        setTimeout(() => {
          res(0);
        }, 500)
      );

      // Шаг 5: Находим и нажимаем кнопку отправки отклика
      let submitButton: null | HTMLButtonElement;
      counter = 0;
      while (!submitButton) {
        submitButton =
          window.document.querySelector(
            "[data-qa='vacancy-response-popup-submit-button']"
          ) ||
          window.document.querySelector(
            "[data-qa='vacancy-response-popup-form-submit']"
          ) ||
          window.document.querySelector(
            "button[type='submit']"
          ) ||
          window.document.querySelector(
            "[data-qa='vacancy-response-popup-form'] button[type='submit']"
          );

        if (!submitButton) {
          await new Promise((res) =>
            setTimeout(() => {
              res(0);
            }, 1000)
          );
        }
        counter++;
        if (counter >= 10) {
          return "submit-button-timeout";
        }
      }

      submitButton.click();
      counter = 0;

      // Шаг 6: Проверяем успешность отклика
      // eslint-disable-next-line no-constant-condition
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
        if (counter >= 15) {
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
          case "cover-letter-field-timeout":
          case "submit-button-timeout":
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

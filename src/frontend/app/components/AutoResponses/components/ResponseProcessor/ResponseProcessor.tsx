import React, { useEffect, useRef, useState } from "react";
import {
  closeWindow,
  executeScriptInWindow,
  openWindow,
} from "../../../../../services/electron";
import { updateVacancyStatus } from "../../../../../services/vacanciesService";

export type Props = {
  vacancyId: string;
  coverLetter?: string;
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
          show: false, // Скрываем окно, чтобы пользователь не видел на какую вакансию идёт отклик
          webPreferences: {
            devTools: false,
          },
          devtools: false,
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

    // Встраиваем coverLetter в функцию, так как она сериализуется через toString()
    const coverLetterValue = props.coverLetter || 
      "Здравствуйте! Меня заинтересовала данная вакансия. Готов рассмотреть предложение и обсудить детали сотрудничества. С уважением.";
    
    const fn = async () => {
      // Шаг 0: Проверяем, доступна ли вакансия (недоступная вакансия)
      await new Promise((res) => setTimeout(() => res(0), 2000));
      
      const bodyText = document.body.innerText || "";
      const isVacancyUnavailable = 
        bodyText.includes("Вам недоступна эта вакансия") ||
        bodyText.includes("Войдите как пользователь, у которого есть доступ") ||
        bodyText.includes("недоступна эта вакансия");
      
      if (isVacancyUnavailable) {
        return "vacancy-unavailable";
      }

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

      // Шаг 2: Проверяем, появилось ли предупреждение о релокации (вакансия в другой стране)
      await new Promise((res) =>
        setTimeout(() => {
          res(0);
        }, 1000)
      );

      let relocationWarningButton: null | HTMLButtonElement;
      counter = 0;
      while (counter < 3) {
        // Ищем кнопку подтверждения релокации
        relocationWarningButton = window.document.querySelector(
          "button[data-qa='relocation-warning-confirm']"
        );

        if (relocationWarningButton) {
          console.log("Обнаружено предупреждение о релокации, кликаем 'Все равно откликнуться'");
          relocationWarningButton.click();
          // Ждем закрытия предупреждающей модалки
          await new Promise((res) =>
            setTimeout(() => {
              res(0);
            }, 1000)
          );
          break;
        }

        await new Promise((res) =>
          setTimeout(() => {
            res(0);
          }, 500)
        );
        counter++;
      }

      // Шаг 3: Проверяем, нужно ли выбрать резюме
      await new Promise((res) =>
        setTimeout(() => {
          res(0);
        }, 500)
      );

      const resumeTitleElements = Array.from(window.document.querySelectorAll("[data-qa='resume-title']"));
      const resumeSelectorCard = resumeTitleElements.length > 0
        ? resumeTitleElements[0].closest("[tabindex='0']")
        : null;

      if (resumeSelectorCard) {
        (resumeSelectorCard as HTMLElement).click();
        await new Promise((res) => setTimeout(() => res(0), 500));

        // Ищем опцию резюме (label или radio input)
        const resumeOption = window.document.querySelector("label[data-magritte-select-option]") ||
          (() => {
            const radio = window.document.querySelector("input[type='radio']");
            return radio ? (radio.closest("label") || radio) : null;
          })();

        if (resumeOption) {
          (resumeOption as HTMLElement).click();
          await new Promise((res) => setTimeout(() => res(0), 500));
        }
      }

      // Шаг 5-6: Ищем и кликаем кнопку "Добавить сопроводительное письмо" (если есть), затем находим поле
      const findCoverLetterField = () =>
        window.document.querySelector<HTMLTextAreaElement>(
          "textarea[data-qa='vacancy-response-popup-form-letter-input'], textarea[name='letter']"
        );

      // Определяем функцию поиска кнопки отправки заранее, чтобы использовать её в разных местах
      const findSubmitButton = () =>
        window.document.querySelector<HTMLButtonElement>(
          "[data-qa='vacancy-response-popup-submit-button'], button[type='submit']"
        );

      // Ищем кнопку "Добавить сопроводительное письмо"
      const addButton = Array.from(window.document.querySelectorAll("button")).find(
        (btn) => btn.textContent?.includes("сопроводительное")
      ) || window.document.querySelector<HTMLElement>("[data-qa*='cover-letter'], button[aria-label*='сопроводительное']");

      if (addButton && !findCoverLetterField()) {
        addButton.click();
        await new Promise((res) => setTimeout(() => res(0), 500));
      }

      // Ищем поле сопроводительного письма (ОБЯЗАТЕЛЬНО для отправки отклика)
      let coverLetterField = findCoverLetterField();
      counter = 0;
      while (!coverLetterField && counter < 10) {
        await new Promise((res) => setTimeout(() => res(0), 500));
        coverLetterField = findCoverLetterField();
        counter++;
      }

      // Если поле не найдено - это ошибка, так как отклик можно отправить ТОЛЬКО с письмом
      if (!coverLetterField) {
        return "cover-letter-field-timeout";
      }

      // Шаг 7: Заполняем поле сопроводительного письма
      const coverLetterText = "COVER_LETTER_PLACEHOLDER";
      
      // Фокусируемся на поле
      coverLetterField.focus();
      await new Promise((res) =>
        setTimeout(() => {
          res(0);
        }, 100)
      );

      // Используем нативный setter для обхода React state
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(coverLetterField, coverLetterText);
      } else {
        coverLetterField.value = coverLetterText;
      }

      // Диспатчим события в правильном порядке для React
      coverLetterField.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true })
      );
      coverLetterField.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          cancelable: true,
          inputType: "insertText",
          data: coverLetterText,
        })
      );
      coverLetterField.dispatchEvent(
        new Event("change", { bubbles: true, cancelable: true })
      );
      
      // Blur для завершения ввода
      coverLetterField.blur();
      coverLetterField.focus();

      // Небольшая задержка для обработки события и валидации
      await new Promise((res) =>
        setTimeout(() => {
          res(0);
        }, 500)
      );

      // Шаг 8: Находим и нажимаем кнопку отправки отклика
      let submitButton = findSubmitButton();
      counter = 0;
      while (!submitButton && counter < 10) {
        await new Promise((res) => setTimeout(() => res(0), 500));
        submitButton = findSubmitButton();
        counter++;
      }

      if (!submitButton) {
        return "submit-button-timeout";
      }

      // Проверяем, не заблокирована ли кнопка (может быть из-за валидации)
      if (submitButton.disabled) {
        // Пробуем подождать и проверить снова
        await new Promise((res) => setTimeout(() => res(0), 1000));
        submitButton = findSubmitButton();
        if (!submitButton || submitButton.disabled) {
          return "submit-button-disabled";
        }
      }

      submitButton.click();

      // Шаг 9: Проверяем успешность отклика
      counter = 0;
      while (counter < 15) {
        await new Promise((res) =>
          setTimeout(() => {
            res(0);
          }, 1000)
        );
        
        const bodyText = document.body.innerText || "";
        
        // Проверяем различные индикаторы успеха (отклик должен быть с письмом)
        if (bodyText.includes("Вы откликнулись") || 
            bodyText.includes("откликнулись") ||
            bodyText.includes("Ваш отклик отправлен")) {
          return "success";
        }
        
        counter++;
      }
      
      return "response-timeout";
    };

    // Заменяем плейсхолдер на реальное значение coverLetter перед выполнением
    const scriptString = fn.toString().replace(
      '"COVER_LETTER_PLACEHOLDER"',
      JSON.stringify(coverLetterValue)
    );

    executeScriptInWindow(windowId, scriptString)
      .then((result) => result as ReturnType<Awaited<typeof fn>>)
      .catch(() => "error" as const)
      .then((res) => {
        if (isDoneRef.current) {
          return;
        }

        console.log(`Process result ${res}`);
        
        // Обновляем статус вакансии на сервере в любом случае (и при успехе, и при ошибке)
        // чтобы исключить её из списка, если она в архиве или уже откликались
        const updateStatus = (status: "applied" | "failed") => {
          updateVacancyStatus(props.vacancyId, status)
            .then(() => {
              console.log(`Статус вакансии ${props.vacancyId} успешно обновлён: ${status}`);
            })
            .catch((error: unknown) => {
              console.error(`Ошибка при обновлении статуса вакансии ${props.vacancyId}:`, error);
            });
        };
        
        switch (res) {
          case "success":
            // Успешный отклик с сопроводительным письмом - отправляем applied
            updateStatus("applied");
            props.onFinish(true);
            return;
          
          case "vacancy-unavailable":
            // Недоступная вакансия - отправляем failed
            console.log(`Вакансия ${props.vacancyId} недоступна для просмотра`);
            updateStatus("failed");
            props.onFinish(false);
            return;
          
          case "button-timeout":
          case "cover-letter-field-timeout":
          case "submit-button-timeout":
          case "submit-button-disabled":
          case "response-timeout":
          case "error":
            // Ошибка при обработке (вакансия в архиве, проблемы с формой и т.д.) - отправляем failed
            console.log(`Ошибка при обработке вакансии ${props.vacancyId}: ${res}`);
            updateStatus("failed");
            props.onFinish(false);
            return;
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

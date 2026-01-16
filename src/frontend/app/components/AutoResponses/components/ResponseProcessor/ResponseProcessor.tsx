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
  resumeName?: string; // Название резюме для выбора
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
          show: true, // Скрываем окно, чтобы пользователь не видел на какую вакансию идёт отклик
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

    // Встраиваем coverLetter и resumeName в функцию, так как они сериализуются через toString()
    const coverLetterValue = props.coverLetter || 
      "Здравствуйте! Меня заинтересовала данная вакансия. Готов рассмотреть предложение и обсудить детали сотрудничества. С уважением.";
    const resumeNameValue = props.resumeName || null;
    
    const fn = async () => {
      // Шаг 0: Проверяем, доступна ли вакансия (недоступная вакансия)
      await new Promise((res) => setTimeout(() => res(0), 2000));
      
      const bodyText = document.body.innerText || "";
      const isVacancyUnavailable = 
        bodyText.includes("недоступна эта вакансия") ||
        bodyText.includes("Войдите как пользователь, у которого есть доступ");
      
      if (isVacancyUnavailable) {
        return "vacancy-unavailable";
      }

      // Шаг 1: Находим и нажимаем кнопку отклика
      let button: HTMLButtonElement | null = null;
      for (let attempt = 0; attempt < 5 && !button; attempt++) {
        button = window.document.querySelector("[data-qa=vacancy-response-link-top]");
        if (!button) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!button) {
        return "button-timeout";
      }

      button.click();

      // Шаг 2: Проверяем, появилось ли предупреждение о релокации (вакансия в другой стране)
      await new Promise((res) =>
        setTimeout(() => {
          res(0);
        }, 1000)
      );

      for (let attempt = 0; attempt < 3; attempt++) {
        // Ищем кнопку подтверждения релокации
        const relocationWarningButton = window.document.querySelector<HTMLButtonElement>(
          "button[data-qa='relocation-warning-confirm']"
        );

        if (relocationWarningButton) {
          console.log("Обнаружено предупреждение о релокации, кликаем 'Все равно откликнуться'");
          relocationWarningButton.click();
          // Ждем закрытия предупреждающей модалки
          await new Promise((resolve) => setTimeout(resolve, 1000));
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Шаг 3: Проверяем, нужно ли выбрать резюме
      await new Promise((resolve) => setTimeout(resolve, 500));

      const resumeTitleElements = Array.from(window.document.querySelectorAll("[data-qa='resume-title']"));
      
      if (resumeTitleElements.length > 0) {
        // Открываем селектор резюме
        const resumeSelectorCard = resumeTitleElements[0].closest("[tabindex='0']");
        
        if (resumeSelectorCard) {
          (resumeSelectorCard as HTMLElement).click();
          await new Promise((res) => setTimeout(() => res(0), 500));

          // Получаем значение из глобальной переменной (устанавливается перед выполнением скрипта)
          const targetResumeName: string | null = (window as Window & { __RESUME_NAME_PARAM__?: string | null }).__RESUME_NAME_PARAM__ || null;
          
          let resumeOption: HTMLElement | null = null;
          
          // Ищем резюме по названию
          if (targetResumeName) {
            const resumeByName = Array.from(document.querySelectorAll("[data-qa='resume-title']")).find((el) => {
              const text = el.textContent || "";
              return text.trim() === targetResumeName.trim() || text.includes(targetResumeName.trim());
            });
            
            if (resumeByName) {
              resumeOption = resumeByName.closest("[tabindex='0'], label, [data-magritte-select-option]") as HTMLElement;
            }
          }
          
          // Если не нашли нужное резюме, используем первое (fallback)
          if (!resumeOption) {
            resumeOption = document.querySelector("label[data-magritte-select-option]") ||
              (() => {
                const radio = document.querySelector("input[type='radio']");
                return radio ? (radio.closest("label") || radio) : null;
              })() as HTMLElement | null;
            
            if (targetResumeName) {
              console.warn(`Резюме "${targetResumeName}" не найдено, используется первое в списке`);
            }
          }

          if (resumeOption) {
            (resumeOption as HTMLElement).click();
            await new Promise((res) => setTimeout(() => res(0), 500));
          }
        }
      }

      // Шаг 5: Ищем поле сопроводительного письма в первой модалке (если несколько резюме)
      const findCoverLetterFieldInFirstModal = () =>
        window.document.querySelector<HTMLTextAreaElement>(
          "textarea[data-qa='vacancy-response-popup-form-letter-input'], textarea[name='letter']"
        );

      // Шаг 6: Ищем кнопку "Добавить сопроводительное письмо" в первой модалке
      const addButton = Array.from(window.document.querySelectorAll("button")).find(
        (btn) => btn.textContent?.includes("сопроводительное")
      ) || window.document.querySelector<HTMLElement>("[data-qa*='cover-letter'], button[aria-label*='сопроводительное']");

      // Если есть кнопка "Добавить сопроводительное" и поле ещё не видно - кликаем
      if (addButton && !findCoverLetterFieldInFirstModal()) {
        addButton.click();
        await new Promise((res) => setTimeout(() => res(0), 500));
      }

      // Проверяем, есть ли поле в первой модалке
      let coverLetterField: HTMLTextAreaElement | null = findCoverLetterFieldInFirstModal();
      
      // Если поле не найдено в первой модалке, значит у пользователя одно резюме
      // и нужно сначала кликнуть "Откликнуться", а потом заполнить форму
      if (!coverLetterField) {
        // Ищем кнопку "Откликнуться" в первой модалке
        const findFirstModalSubmitButton = () =>
          window.document.querySelector<HTMLButtonElement>(
            "[data-qa='vacancy-response-popup-submit-button'], button[type='submit']"
          );

        let firstModalSubmitButton: HTMLButtonElement | null = null;
        for (let attempt = 0; attempt < 5 && !firstModalSubmitButton; attempt++) {
          firstModalSubmitButton = findFirstModalSubmitButton();
          if (!firstModalSubmitButton) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        if (!firstModalSubmitButton) {
          return "first-modal-submit-button-timeout";
        }

        // Кликаем "Откликнуться" - это откроет форму с сопроводительным письмом
        firstModalSubmitButton.click();
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Теперь ищем форму с сопроводительным письмом (появляется после клика)
        const findCoverLetterForm = () =>
          window.document.querySelector<HTMLElement>("[data-qa='vacancy-response-letter-informer']");

        let coverLetterForm: HTMLElement | null = null;
        for (let attempt = 0; attempt < 10 && !coverLetterForm; attempt++) {
          coverLetterForm = findCoverLetterForm();
          if (!coverLetterForm) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        if (!coverLetterForm) {
          return "cover-letter-form-timeout";
        }

        // Ищем textarea внутри этой формы (name="text")
        const findCoverLetterFieldInForm = () => {
          const form = coverLetterForm?.querySelector("form");
          if (form) {
            return form.querySelector<HTMLTextAreaElement>("textarea[name='text']");
          }
          return null;
        };

        for (let attempt = 0; attempt < 10 && !coverLetterField; attempt++) {
          coverLetterField = findCoverLetterFieldInForm();
          if (!coverLetterField) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        if (!coverLetterField) {
          return "cover-letter-field-timeout";
        }
      } else {
        // Поле найдено в первой модалке - продолжаем обычный процесс
      }

      // Шаг 7: Заполняем поле сопроводительного письма
      const coverLetterText = "COVER_LETTER_PLACEHOLDER";
      
      // Фокусируемся на поле
      coverLetterField.focus();
      await new Promise((resolve) => setTimeout(resolve, 100));

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
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Шаг 8: Находим и нажимаем кнопку отправки отклика
      // Если мы в форме с одним резюме, ищем кнопку "Отправить" в этой форме
      // Иначе ищем кнопку в первой модалке
      const findSubmitButton = () => {
        // Сначала проверяем, есть ли форма с сопроводительным письмом (для одного резюме)
        const coverLetterForm = window.document.querySelector<HTMLElement>("[data-qa='vacancy-response-letter-informer']");
        if (coverLetterForm) {
          const submitButton = coverLetterForm.querySelector<HTMLButtonElement>(
            "button[data-qa='vacancy-response-letter-submit'], button[type='submit']"
          );
          if (submitButton) {
            return submitButton;
          }
        }
        
        // Иначе ищем в первой модалке
        return window.document.querySelector<HTMLButtonElement>(
          "[data-qa='vacancy-response-popup-submit-button'], button[type='submit']"
        );
      };

      let submitButton: HTMLButtonElement | null = null;
      for (let attempt = 0; attempt < 10 && !submitButton; attempt++) {
        submitButton = findSubmitButton();
        if (!submitButton) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (!submitButton) {
        return "submit-button-timeout";
      }

      // Проверяем, не заблокирована ли кнопка (может быть из-за валидации)
      if (submitButton.disabled) {
        // Пробуем подождать и проверить снова
        await new Promise((resolve) => setTimeout(resolve, 1000));
        submitButton = findSubmitButton();
        if (!submitButton || submitButton.disabled) {
          return "submit-button-disabled";
        }
      }

      submitButton.click();

      // Шаг 9: Проверяем успешность отклика
      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const bodyText = document.body.innerText || "";
        
        // Проверяем различные индикаторы успеха (отклик должен быть с письмом)
        if (bodyText.includes("Вы откликнулись") || 
            bodyText.includes("откликнулись") ||
            bodyText.includes("Ваш отклик отправлен")) {
          return "success";
        }
      }
      
      return "response-timeout";
    };

    // Заменяем плейсхолдеры на реальные значения перед выполнением
    const fnString = fn.toString();
    
    // Заменяем плейсхолдер для coverLetter
    let scriptString = fnString
      .replace('"COVER_LETTER_PLACEHOLDER"', JSON.stringify(coverLetterValue));
    
    // Устанавливаем глобальную переменную с именем резюме перед выполнением функции
    const resumeNameParam = resumeNameValue || null;
    const resumeNameParamJson = JSON.stringify(resumeNameParam);
    
    // нужно передать async функцию, которая установит переменную и вызовет наш код
    scriptString = `async () => {
      try {
        // Устанавливаем глобальную переменную с именем резюме
        window.__RESUME_NAME_PARAM__ = ${resumeNameParamJson};
        // Вызываем основную функцию
        return await (${scriptString})();
      } catch (error) {
        console.error('Error in script execution:', error);
        throw error;
      } finally {
        // Очищаем глобальную переменную после выполнения
        delete window.__RESUME_NAME_PARAM__;
      }
    }`;

    executeScriptInWindow(windowId, scriptString)
      .then((result) => result as ReturnType<Awaited<typeof fn>>)
      .catch(() => "error" as const)
      .then((res) => {
        if (isDoneRef.current) {
          return;
        }

        console.log(`Process result ${res}`);
        
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
          
          case "first-modal-submit-button-timeout":
          case "cover-letter-form-timeout":
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
      if (isDoneRef.current) return;
      
      console.log(`Таймаут обработки вакансии ${props.vacancyId} (15 сек)`);
      updateVacancyStatus(props.vacancyId, "failed")
        .then(() => {
          console.log(`Статус вакансии ${props.vacancyId} обновлён: failed (timeout)`);
        })
        .catch((error: unknown) => {
          console.error(`Ошибка при обновлении статуса вакансии ${props.vacancyId}:`, error);
        });
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

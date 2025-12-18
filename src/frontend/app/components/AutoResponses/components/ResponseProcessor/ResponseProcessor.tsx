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
        }, 1500)
      );

      console.log("Проверка наличия селектора выбора резюме...");

      // Ищем селектор выбора резюме (карточка с резюме, которую нужно раскрыть)
      // Используем селектор из макета: карточка с tabindex="0" и data-qa="resume-title" внутри
      let resumeSelectorCard: Element | null = null;
      
      // Способ 1: Ищем по data-qa='resume-title' и поднимаемся к родительской карточке с tabindex
      const resumeTitleElements = Array.from(window.document.querySelectorAll("[data-qa='resume-title']"));
      if (resumeTitleElements.length > 0) {
        console.log(`Найдено элементов с data-qa='resume-title': ${resumeTitleElements.length}`);
        // Берём первый и ищем ближайшую карточку с tabindex="0"
        resumeSelectorCard = resumeTitleElements[0].closest("[tabindex='0']");
      }
      
      // Способ 2: Если не нашли, ищем по структуре - карточка с tabindex содержащая data-qa='resume-title'
      if (!resumeSelectorCard) {
        const cardsWithTabindex = Array.from(window.document.querySelectorAll("[tabindex='0']"));
        console.log(`Найдено элементов с tabindex='0': ${cardsWithTabindex.length}`);
        resumeSelectorCard = cardsWithTabindex.find((card) => {
          return card.querySelector("[data-qa='resume-title']") !== null;
        }) || null;
      }

      if (resumeSelectorCard) {
        console.log("Обнаружена карточка выбора резюме, кликаем для открытия списка");
        
        // Кликаем на карточку, чтобы открыть выпадающий список
        (resumeSelectorCard as HTMLElement).click();
        
        // Ждем открытия выпадающего списка
        await new Promise((res) =>
          setTimeout(() => {
            res(0);
          }, 1500)
        );

        // Ищем опции в открывшемся списке
        // Используем селектор: label[data-magritte-select-option]
        const resumeOptions = Array.from(
          window.document.querySelectorAll("label[data-magritte-select-option]")
        );
        
        console.log(`Найдено опций резюме в списке: ${resumeOptions.length}`);

        if (resumeOptions.length > 0) {
          // Выбираем первую опцию
          const firstResumeOption = resumeOptions[0];
          console.log("Выбираем первое резюме из списка");
          console.log(`Текст первого резюме: ${firstResumeOption.textContent?.substring(0, 50)}`);
          
          (firstResumeOption as HTMLElement).click();
          
          // Задержка после выбора резюме
          await new Promise((res) =>
            setTimeout(() => {
              res(0);
            }, 1000)
          );
        } else {
          console.log("Не удалось найти опции резюме в выпадающем списке");
          // Попробуем альтернативный способ - поиск по radio input
          const radioInputs = Array.from(
            window.document.querySelectorAll("input[type='radio']")
          );
          console.log(`Найдено radio inputs: ${radioInputs.length}`);
          
          if (radioInputs.length > 0) {
            // Кликаем на первый radio input или его label
            const firstRadio = radioInputs[0];
            const label = (firstRadio as HTMLElement).closest("label");
            if (label) {
              console.log("Кликаем на label первого radio");
              label.click();
            } else {
              console.log("Кликаем на первый radio input");
              (firstRadio as HTMLElement).click();
            }
            
            await new Promise((res) =>
              setTimeout(() => {
                res(0);
              }, 1000)
            );
          } else {
            console.log("Не удалось найти резюме в списке никаким способом, возможно уже выбрано");
          }
        }
      } else {
        console.log("Селектор резюме не найден, возможно не требуется выбирать резюме");
      }

      // Шаг 4: Ждем появления модалки и проверяем, нужно ли кликнуть на кнопку "Добавить сопроводительное письмо"
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

      // Шаг 5: Ждем появления поля сопроводительного письма и находим его
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

      // Шаг 6: Заполняем поле сопроводительного письма
      const coverLetterText =
        "Здравствуйте! Меня заинтересовала данная вакансия. Готов рассмотреть предложение и обсудить детали сотрудничества. С уважением.";
      
      console.log("Начинаем заполнение сопроводительного письма");
      
      // Фокус на поле
      coverLetterField.focus();
      
      // Устанавливаем значение через нативный дескриптор, чтобы обойти React
      const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      
      if (nativeTextAreaValueSetter) {
        nativeTextAreaValueSetter.call(coverLetterField, coverLetterText);
      } else {
        // Fallback на обычную установку
        coverLetterField.value = coverLetterText;
      }
      
      console.log(`Установлено значение: "${coverLetterField.value.substring(0, 30)}..."`);

      const inputEvent = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        composed: true,
        data: coverLetterText,
        inputType: 'insertText'
      });
      
      const changeEvent = new Event("change", {
        bubbles: true,
        cancelable: true
      });
      
      // Триггерим события
      coverLetterField.dispatchEvent(inputEvent);
      coverLetterField.dispatchEvent(changeEvent);
      
      console.log("События отправлены");
      
      // НЕ снимаем фокус сразу, чтобы React успел обработать изменения
      await new Promise((res) =>
        setTimeout(() => {
          res(0);
        }, 500)
      );
      
      // Теперь можем снять фокус
      coverLetterField.blur();
      

      // Увеличенная задержка для обработки всех событий
      await new Promise((res) =>
        setTimeout(() => {
          res(0);
        }, 1500)
      );

      // Шаг 7: Находим и нажимаем кнопку отправки отклика
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

      // Шаг 8: Проверяем успешность отклика
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

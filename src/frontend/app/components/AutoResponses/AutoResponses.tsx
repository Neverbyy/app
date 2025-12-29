import React, { useCallback, useState, useEffect } from "react";
import { GeneratingResponses } from "./components/GeneratingResponses";
import { ButtonColored } from "../UI/ButtonColored";
import { ButtonOutline } from "../UI/ButtonOutline";
import Logo from "../../../assets/Logo.svg";
import Success from "../../../assets/Success.svg";
import Cancelled from "../../../assets/Cancelled.svg";
import { openExternalUrl } from "../../../services/electron";
import { getAutoApplyVacancies, type VacancyItem } from "../../../services/vacanciesService";
import "./AutoResponses.css";

export type Props = {
  onLogout: () => void;
};

type State =
  | {
      status: "loading";
    }
  | {
      status: "generating-responses";
      ids: string[];
      vacancies: VacancyItem[];
    }
  | {
      status: "finished";
    }
  | {
      status: "error";
      message: string;
    };

// Компонент экрана успешной активации автооткликов
const SuccessScreen: React.FC = () => (
  <div className="auto-responses-finished">
    <img src={Success} alt="Успех" className="auto-responses-success-image" />
    <div className="auto-responses-status-badge">
      <span>Автоотклики активированы</span>
    </div>
    <h1 className="auto-responses-title">
      Софи делает отклики в фоновом режиме
    </h1>
    <p className="auto-responses-subtitle">
      Подробности — в твоём аккаунте на сайте
    </p>
  </div>
);

const AutoResponses$: React.FC<Props> = ({ onLogout }) => {
  const [state, setState] = useState<State>({
    status: "loading",
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Загружаем список вакансий при монтировании компонента
  useEffect(() => {
    const loadVacancies = async () => {
      try {
        console.log("Загрузка списка вакансий для автооткликов...");
        const response = await getAutoApplyVacancies();
        
        console.log("Получен ответ от API:", response);
        
        if (!response.items || response.items.length === 0) {
          console.log("Список вакансий пуст");
          setState({
            status: "error",
            message: "Нет доступных вакансий для автооткликов",
          });
          return;
        }

        const vacancyIds = response.items.map((item) => item.vacancy.id);
        console.log(`Найдено вакансий: ${vacancyIds.length}`, vacancyIds);
        console.log("Детали вакансий:", response.items.map((item: VacancyItem) => ({
          id: item.vacancy.id,
          name: item.vacancy.name,
          employer: item.vacancy.employer?.name,
          cover_letter: item.cover_letter,
        })));

        setState({
          status: "generating-responses",
          ids: vacancyIds,
          vacancies: response.items, // Передаем полные данные вакансий
        });
      } catch (error) {
        console.error("Ошибка при загрузке вакансий:", error);
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Ошибка загрузки вакансий",
        });
      }
    };
    
    loadVacancies();
  }, []);

  const handleGoToSite = useCallback(async () => {
    try {
      await openExternalUrl("https://sofi-assistant.com");
    } catch (error) {
      console.error("Error opening external URL:", error);
    }
  }, []);

  const handleGoToSupport = useCallback(async () => {
    try {
      await openExternalUrl("https://t.me/SofiAssistantSupportBot");
    } catch (error) {
      console.error("Error opening support URL:", error);
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, action: () => void) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        action();
      }
    },
    []
  );

  const handleGoToSiteKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      handleKeyDown(event, handleGoToSite);
    },
    [handleGoToSite, handleKeyDown]
  );

  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleLogoutKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      handleKeyDown(event, handleLogoutClick);
    },
    [handleLogoutClick, handleKeyDown]
  );

  const handleConfirmLogout = useCallback(() => {
    setShowLogoutModal(false);
    onLogout();
  }, [onLogout]);

  const handleCancelLogout = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const handleFinish = useCallback(() => {
    setState({ status: "finished" });
  }, []);

  const shouldShowSuccessScreen =
    state.status === "generating-responses" || state.status === "finished";

  return (
    <div className="auto-responses-wrapper">
      {/* Верхний колонтитул с логотипом */}
      <header className="auto-responses-header">
        <img src={Logo} alt="Софи" className="auto-responses-logo" />
        <button
          className="auto-responses-logout-button"
          onClick={handleLogoutClick}
          onKeyDown={handleLogoutKeyDown}
          tabIndex={0}
          aria-label="Выйти"
        >
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.17363 14.6446H2.19354C1.82676 14.6446 1.5291 14.3469 1.5291 13.9801V2.01999C1.5291 1.65321 1.82679 1.35555 2.19354 1.35555H8.17363C8.54107 1.35555 8.83807 1.05855 8.83807 0.691111C8.83807 0.323674 8.54107 0.0266113 8.17363 0.0266113H2.19354C1.09454 0.0266113 0.200195 0.920986 0.200195 2.01999V13.9801C0.200195 15.0791 1.09454 15.9735 2.19354 15.9735H8.17363C8.54107 15.9735 8.83807 15.6765 8.83807 15.309C8.83807 14.9416 8.54107 14.6446 8.17363 14.6446Z" fill="#131313"/>
            <path d="M13.6026 7.52689L9.56271 3.54017C9.30224 3.28236 8.88099 3.2857 8.62318 3.54682C8.36537 3.80795 8.36802 4.22854 8.62984 4.48636L11.5169 7.33551H3.78065C3.41321 7.33551 3.11621 7.63251 3.11621 7.99995C3.11621 8.36739 3.41321 8.66442 3.78065 8.66442H11.5169L8.62984 11.5136C8.36806 11.7714 8.36606 12.192 8.62318 12.4531C8.68498 12.5158 8.75863 12.5656 8.83985 12.5996C8.92106 12.6336 9.00823 12.6511 9.09627 12.6511C9.26506 12.6511 9.43381 12.5873 9.56271 12.4597L13.6026 8.47301C13.6652 8.41116 13.715 8.3375 13.749 8.2563C13.783 8.17509 13.8005 8.08795 13.8006 7.99992C13.8006 7.82192 13.7295 7.65248 13.6026 7.52689Z" fill="#131313"/>
          </svg>
          <span>Выход</span>
        </button>
      </header>

      {/* Центральная область контента */}
      <main className="auto-responses-content">
        {/* Состояние загрузки */}
        {state.status === "loading" && (
          <div className="auto-responses-finished">
            <p className="auto-responses-subtitle">Загрузка вакансий...</p>
          </div>
        )}

        {/* Состояние ошибки */}
        {state.status === "error" && (
          <div className="auto-responses-finished">
            
            <img src={Cancelled} alt="Ошибка" className="auto-responses-success-image" />
            <div className="auto-responses-status-badge" style={{ backgroundColor: "#FFE6E6" }}>
              <span style={{ color: "#FF0004" }}>Ошибка</span>
            </div>
            <h1 className="auto-responses-title">Ой! Мы не смогли загрузиться</h1>
            <p className="auto-responses-subtitle">
              Такое бывает — можешь попробовать ещё раз или обратиться в поддержку
            </p>
            <button
              className="auto-responses-subtitle-link"
              onClick={handleGoToSupport}
              onKeyDown={(e) => handleKeyDown(e, handleGoToSupport)}
              tabIndex={0}
              style={{ 
                background: "none", 
                border: "none", 
                padding: 0,
                marginTop: "12px",
                fontSize: "var(--font-size-base)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              Перейти в поддержку
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.08876 0V1.21711H9.90807L0 11.1252L0.874803 12L10.7829 2.09192V7.91124H12V0H4.08876Z" fill="#0057FF"/>
              </svg>
            </button>
            
          </div>
        )}

        {/* Запускаем процесс генерации откликов в фоне, но не показываем его */}
        {state.status === "generating-responses" && (
          <GeneratingResponses ids={state.ids} vacancies={state.vacancies} onFinish={handleFinish} />
        )}

        {/* Всегда показываем экран успешной активации */}
        {shouldShowSuccessScreen && <SuccessScreen />}
      </main>

      {/* Нижний футер с кнопкой */}
      <footer className="auto-responses-footer">
        <ButtonColored
          label="Перейти на сайт"
          onClick={handleGoToSite}
          onKeyDown={handleGoToSiteKeyDown}
          className="auto-responses-footer-button"
        />
      </footer>

      {/* Модальное окно подтверждения выхода */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={handleCancelLogout}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="logout-modal-close"
              onClick={handleCancelLogout}
              aria-label="Закрыть"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#131313"/>
              </svg>
            </button>
            <h2 className="logout-modal-title">Ты точно хочешь выйти из аккаунта?</h2>
            <p className="logout-modal-text">
              Чтобы вернуться в аккаунт, потребуется авторизация. Без этого <strong>отклики будут приостановлены</strong>.
            </p>
            <div className="logout-modal-buttons">
              <ButtonColored
                label="Остаться с Софи"
                onClick={handleCancelLogout}
                className="logout-modal-button-stay"
              />
              <ButtonOutline
                label="Выйти из аккаунта"
                onClick={handleConfirmLogout}
                className="logout-modal-button-logout"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AutoResponses = React.memo(AutoResponses$);

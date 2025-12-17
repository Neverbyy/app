import React, { useCallback, useState } from "react";
import { GeneratingResponses } from "./components/GeneratingResponses";
import { ButtonColored } from "../UI/ButtonColored";
import { ButtonOutline } from "../UI/ButtonOutline";
import Logo from "../../../assets/Logo.svg";
import Success from "../../../assets/Success.svg";
import { openExternalUrl } from "../../../services/electron";
import "./AutoResponses.css";

export type Props = {
  onLogout: () => void;
};

type State =
  | {
      status: "generating-responses";
      ids: string[];
    }
  | {
      status: "finished";
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
  // Временно используем одну вакансию, в будущем список будет приходить с бэка
  // Запускаем процесс генерации откликов автоматически
  const [state, setState] = useState<State>({
    status: "generating-responses",
    ids: ["128827861"],
  });

  const handleGoToSite = useCallback(async () => {
    try {
      await openExternalUrl("https://sofi-assistant.com");
    } catch (error) {
      console.error("Error opening external URL:", error);
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

  const handleLogoutKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      handleKeyDown(event, onLogout);
    },
    [onLogout, handleKeyDown]
  );

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
      </header>

      {/* Центральная область контента */}
      <main className="auto-responses-content">
        {/* Запускаем процесс генерации откликов в фоне, но не показываем его */}
        {state.status === "generating-responses" && (
          <GeneratingResponses ids={state.ids} onFinish={handleFinish} />
        )}

        {/* Всегда показываем экран успешной активации */}
        {shouldShowSuccessScreen && <SuccessScreen />}
      </main>

      {/* Нижний футер с кнопками */}
      <footer className="auto-responses-footer">
        <ButtonOutline
          label="Выйти"
          onClick={onLogout}
          onKeyDown={handleLogoutKeyDown}
          className="auto-responses-footer-button auto-responses-footer-button--logout"
        />
        <ButtonColored
          label="Перейти на сайт"
          onClick={handleGoToSite}
          onKeyDown={handleGoToSiteKeyDown}
          className="auto-responses-footer-button auto-responses-footer-button--goto-site"
        />
      </footer>
    </div>
  );
};

export const AutoResponses = React.memo(AutoResponses$);

import React from "react";
import "./CloseAppModal.css";
import { ButtonColored } from "../UI/ButtonColored";
import { ButtonOutline } from "../UI/ButtonOutline";

type CloseAppModalProps = {
  isOpen: boolean;
  onKeepAutoResponses: () => void;
  onCloseApp: () => void;
};

const CloseAppModal: React.FC<CloseAppModalProps> = ({
  isOpen,
  onKeepAutoResponses,
  onCloseApp,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="close-app-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="close-app-modal-title"
    >
      <div
        className="close-app-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-app-modal-close"
          onClick={onKeepAutoResponses}
          aria-label="Закрыть"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#131313"/>
          </svg>
        </button>
        
        <div className="close-app-modal-body">
          <h2 id="close-app-modal-title" className="close-app-modal-title">
            Остановить автоотклики?
          </h2>

          <p className="close-app-modal-description">
            Если закрыть приложение Софи, <strong>автоматические отклики остановятся.</strong> Софи не сможет откликаться на вакансии, пока приложение снова не будет запущено
          </p>

          <div className="close-app-modal-actions">
            <ButtonColored
              label="Оставить автоотклики"
              onClick={onKeepAutoResponses}
              className="close-app-modal-button-keep"
            />
            <ButtonOutline
              label="Закрыть приложение"
              onClick={onCloseApp}
              className="close-app-modal-button-close"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloseAppModal;

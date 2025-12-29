import React, { useCallback } from "react";
import "./UpdateModal.css";
import { ButtonColored } from "../UI/ButtonColored";
import { ButtonOutline } from "../UI/ButtonOutline";
import { openExternalUrl } from "../../../services/electron";
import UpdateImage from "../../../assets/Update.svg";

type UpdateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  downloadUrl: string | null;
  latestVersion: string;
  releaseNotes: string | null;
  isMandatory: boolean;
  isCritical: boolean;
};

const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  downloadUrl,
  latestVersion,
  releaseNotes,
  isMandatory,
  isCritical,
}) => {
  const handleDownload = useCallback(async () => {
    if (downloadUrl) {
      await openExternalUrl(downloadUrl);
    }
  }, [downloadUrl]);

  const handleLater = useCallback(() => {
    if (!isMandatory && !isCritical) {
      onClose();
    }
  }, [isMandatory, isCritical, onClose]);

  // Определяем, можно ли закрыть модалку
  const isClosable = !isMandatory && !isCritical;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="update-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
    >
      <div
        className="update-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {isClosable && (
          <button
            className="update-modal-close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#131313"/>
            </svg>
          </button>
        )}
        
        <div className="update-modal-body">
          <div className="update-modal-left">
            <div className="update-modal-badge">
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 18H20L10 0L0 18ZM10.9091 15.4286H9.09091V13.7143H10.9091V15.4286ZM10.9091 12H9.09091V8.57143H10.9091V12Z" fill="#FF9500"/>
              </svg>
              <span>{isCritical ? "Важное обновление" : "Обновление"}</span>
            </div>

            <h2 id="update-modal-title" className="update-modal-title">
              {isCritical ? "Нужно обновить Софи" : "Доступно обновление Софи"}
            </h2>

            <p className="update-modal-description">
              {releaseNotes || (isCritical 
                ? "Эта версия Софи больше не поддерживается. Чтобы продолжить работу, скачай обновление. Обновление займёт пару минут — переустанавливать ничего не нужно"
                : "Мы добавили улучшения и небольшие фиксы. Обновление займёт пару минут — переустанавливать ничего не нужно"
              )}
            </p>

            <div className="update-modal-actions">
              <ButtonColored
                label="Скачать обновление"
                onClick={handleDownload}
                className="update-modal-button-download"
              />
              {isClosable && (
                <ButtonOutline
                  label="Позже"
                  onClick={handleLater}
                  className="update-modal-button-later"
                />
              )}
            </div>
          </div>

          <div className="update-modal-right">
            <img 
              src={UpdateImage} 
              alt="Софи" 
              className="update-modal-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;


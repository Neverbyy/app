import React from "react";
import "./UpdateModal.css";
import { ButtonColored } from "../UI/ButtonColored";
import { openExternalUrl } from "../../../services/electron";

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
  const handleDownload = async () => {
    if (downloadUrl) {
      await openExternalUrl(downloadUrl);
    }
  };

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
        <h2 id="update-modal-title" className="update-modal-title">
          Доступно обновление!
        </h2>
        <p className="update-modal-text">
          Доступна новая версия приложения: <strong>v{latestVersion}</strong>
        </p>
        {releaseNotes && (
          <div className="update-modal-release-notes">
            <h3>Что нового:</h3>
            <p>{releaseNotes}</p>
          </div>
        )}
        {(isMandatory || isCritical) && (
          <p className="update-modal-warning">
            {isCritical
              ? "Это критическое обновление. Рекомендуется обновиться как можно скорее."
              : "Это обязательное обновление. Пожалуйста, обновите приложение."}
          </p>
        )}
        <div className="update-modal-actions">
          <ButtonColored
            label="Обновить"
            onClick={handleDownload}
            className="update-modal-button"
          />
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;


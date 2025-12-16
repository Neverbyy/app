import React, { useState } from "react";
import "./EnterVacancyIds.css";

export type Props = {
    onEnter: (vacancyIds: string[])=> void;
    onLogout: () => void;
};

const EnterVacancyIds$: React.FC<Props> = (props) => {
  const [value, setValue] = useState(`
    https://kaluzhskaya-opytnaya40.hh.ru/vacancy/128362942?from=applicant_recommended&hhtmFrom=main
    `);

  const handleConfirm = () => {
    const matchedIds = Array.from(value.matchAll(/\/vacancy\/(\d+)/g))
      .map((match) => {
        if (match[1]) {
          return match[1];
        }

        return null;
      })
      .filter(Boolean);

    if (!matchedIds.length) {
      alert("Вы не ввели ссылки на вакансии");
      return;
    }

    props.onEnter(matchedIds)
  };

  const handleLogoutClick = () => {
    props.onLogout();
  };

  const handleLogoutKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      props.onLogout();
    }
  };

  return (
    <div>
      <p>Введи ссылки вакансий, и я откликнусь</p>
      <p>(в реальном приложении это будет автоматически)</p>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <button onClick={handleConfirm}>Подтвердить</button>
      <button
        className="logout-button"
        onClick={handleLogoutClick}
        onKeyDown={handleLogoutKeyDown}
        tabIndex={0}
        aria-label="Выход"
      >
        <svg
          width="14"
          height="16"
          viewBox="0 0 14 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.17363 14.6446H2.19354C1.82676 14.6446 1.5291 14.3469 1.5291 13.9801V2.01999C1.5291 1.65321 1.82679 1.35555 2.19354 1.35555H8.17363C8.54107 1.35555 8.83807 1.05855 8.83807 0.691111C8.83807 0.323674 8.54107 0.0266113 8.17363 0.0266113H2.19354C1.09454 0.0266113 0.200195 0.920986 0.200195 2.01999V13.9801C0.200195 15.0791 1.09454 15.9735 2.19354 15.9735H8.17363C8.54107 15.9735 8.83807 15.6765 8.83807 15.309C8.83807 14.9416 8.54107 14.6446 8.17363 14.6446Z"
            fill="#131313"
          />
          <path
            d="M13.6026 7.52689L9.56271 3.54017C9.30224 3.28236 8.88099 3.2857 8.62318 3.54682C8.36537 3.80795 8.36802 4.22854 8.62984 4.48636L11.5169 7.33551H3.78065C3.41321 7.33551 3.11621 7.63251 3.11621 7.99995C3.11621 8.36739 3.41321 8.66442 3.78065 8.66442H11.5169L8.62984 11.5136C8.36806 11.7714 8.36606 12.192 8.62318 12.4531C8.68498 12.5158 8.75863 12.5656 8.83985 12.5996C8.92106 12.6336 9.00823 12.6511 9.09627 12.6511C9.26506 12.6511 9.43381 12.5873 9.56271 12.4597L13.6026 8.47301C13.6652 8.41116 13.715 8.3375 13.749 8.2563C13.783 8.17509 13.8005 8.08795 13.8006 7.99992C13.8006 7.82192 13.7295 7.65248 13.6026 7.52689Z"
            fill="#131313"
          />
        </svg>
        <span className="action-text">Выход</span>
      </button>
    </div>
  );
};

export const EnterVacancyIds = React.memo(EnterVacancyIds$);

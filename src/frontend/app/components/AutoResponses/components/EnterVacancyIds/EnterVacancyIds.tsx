import React, { useState } from "react";

export type Props = {
    onEnter: (vacancyIds: string[])=> void;
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
    </div>
  );
};

export const EnterVacancyIds = React.memo(EnterVacancyIds$);

import React, { useEffect, useState } from "react";
import { ResponseProcessor } from "../ResponseProcessor";
import type { VacancyItem } from "../../../../../services/vacanciesService";

export type Props = {
  vacancies: VacancyItem[];
  onFinish: () => void;
};

const GeneratingResponses$: React.FC<Props> = (props) => {
  type VacancyWithStatus = {
    status: "todo" | "done" | "error";
    vacancyItem: VacancyItem;
  };

  type State = {
    currentIdx: number;
    vacancies: VacancyWithStatus[];
  };

  const [state, setState] = useState<State>(() => {
    return {
      currentIdx: 0,
      vacancies: props.vacancies.map((vacancyItem) => ({
        vacancyItem,
        status: "todo" as const,
      })),
    };
  });

  const renderProcessor = () => {
    const currentVacancy = state.vacancies[state.currentIdx];
    // const vacancyData = props.vacancies.find((v) => v.vacancy.id === currentVacancy.id);

    const onFinish = (isSuccess: boolean) => {
      const newStatus: VacancyWithStatus["status"] = isSuccess
        ? "done"
        : "error";
      setState((s) => {
        return {
          currentIdx: Math.min(s.currentIdx + 1, s.vacancies.length - 1),
          vacancies: s.vacancies.map((v) =>
            v.vacancyItem.vacancy.id === currentVacancy.vacancyItem.vacancy.id
              ? {
                  vacancyItem: currentVacancy.vacancyItem,
                  status: newStatus,
                }
              : v
          ),
        };
      });
    };

    return (
      <ResponseProcessor
        key={currentVacancy.vacancyItem.vacancy.id}
        vacancyId={currentVacancy.vacancyItem.vacancy.id}
        coverLetter={currentVacancy.vacancyItem.cover_letter}
        onFinish={onFinish}
      />
    );
  };

  useEffect(() => {
    if (state.vacancies.every((v) => v.status !== "todo")) {
      const timeout = setTimeout(() => {
        props.onFinish();
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [state]);

  return <>{renderProcessor()}</>;
};

export const GeneratingResponses = React.memo(GeneratingResponses$);

import React, { useEffect, useState } from "react";
import { ResponseProcessor } from "../ResponseProcessor";
import type { VacancyItem } from "../../../../../services/vacanciesService";

export type Props = {
  ids: string[];
  vacancies: VacancyItem[];
  onFinish: () => void;
};

const GeneratingResponses$: React.FC<Props> = (props) => {
  type VacancyWithStatus = {
    status: "todo" | "done" | "error";
    id: string;
  };

  type State = {
    currentIdx: number;
    vacancies: VacancyWithStatus[];
  };

  const [state, setState] = useState<State>(() => {
    return {
      currentIdx: 0,
      vacancies: props.ids.map((id) => ({
        id,
        status: "todo" as const,
      })),
    };
  });

  const renderProcessor = () => {
    const currentVacancy = state.vacancies[state.currentIdx];
    const vacancyData = props.vacancies.find((v) => v.vacancy.id === currentVacancy.id);

    const onFinish = (isSuccess: boolean) => {
      const newStatus: VacancyWithStatus["status"] = isSuccess
        ? "done"
        : "error";
      setState((s) => {
        return {
          currentIdx: Math.min(s.currentIdx + 1, s.vacancies.length - 1),
          vacancies: s.vacancies.map((v) =>
            v.id === currentVacancy.id
              ? {
                  id: currentVacancy.id,
                  status: newStatus,
                }
              : v
          ),
        };
      });
    };

    return (
      <ResponseProcessor
        key={currentVacancy.id}
        vacancyId={currentVacancy.id}
        coverLetter={vacancyData?.cover_letter}
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

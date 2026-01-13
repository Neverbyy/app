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
    // Находим следующую необработанную вакансию динамически по статусу "todo",
    // а не по индексу currentIdx. Это гарантирует обработку всех вакансий,
    // включая последнюю, и избегает проблем с пропуском вакансий при последовательной обработке.
    const nextTodoVacancy = state.vacancies.find((v) => v.status === "todo");
    
    if (!nextTodoVacancy) {
      // Все вакансии обработаны
      return null;
    }

    const onFinish = (isSuccess: boolean) => {
      const newStatus: VacancyWithStatus["status"] = isSuccess
        ? "done"
        : "error";
      setState((s) => {
        // Обновляем статус текущей вакансии
        const updatedVacancies = s.vacancies.map((v) =>
          v.vacancyItem.vacancy.id === nextTodoVacancy.vacancyItem.vacancy.id
            ? {
                vacancyItem: nextTodoVacancy.vacancyItem,
                status: newStatus,
              }
            : v
        );
        
        // Находим индекс следующей необработанной вакансии
        const nextTodoIdx = updatedVacancies.findIndex((v) => v.status === "todo");
        
        return {
          currentIdx: nextTodoIdx >= 0 ? nextTodoIdx : s.vacancies.length,
          vacancies: updatedVacancies,
        };
      });
    };

    return (
      <ResponseProcessor
        key={nextTodoVacancy.vacancyItem.vacancy.id}
        vacancyId={nextTodoVacancy.vacancyItem.vacancy.id}
        coverLetter={nextTodoVacancy.vacancyItem.cover_letter}
        resumeName={nextTodoVacancy.vacancyItem.resume_name}
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

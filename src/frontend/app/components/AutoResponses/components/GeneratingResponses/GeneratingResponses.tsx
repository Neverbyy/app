import React, { useEffect, useState } from "react";
import { ResponseProcessor } from "../ResponseProcessor";

export type Props = {
  ids: string[];
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

  return (
    <>
      <ul>
        {state.vacancies.map((v) => (
          <li key={v.id}>
            [{v.id}] [{v.status}]{" "}
          </li>
        ))}
      </ul>
      {renderProcessor()}
    </>
  );
};

export const GeneratingResponses = React.memo(GeneratingResponses$);

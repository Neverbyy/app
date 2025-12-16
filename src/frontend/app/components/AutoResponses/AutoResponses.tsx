import React, { useState } from "react";
import { EnterVacancyIds } from "./components/EnterVacancyIds";
import { GeneratingResponses } from "./components/GeneratingResponses";
import { ButtonColored } from "../UI/ButtonColored";
import "./AutoResponses.css";

export type Props = {
  onLogout: () => void;
};

const AutoResponses$: React.FC<Props> = ({ onLogout }) => {
  type State =
    | {
        status: "entering-ids";
      }
    | {
        status: "generating-responses";
        ids: string[];
      }
    | {
        status: "finished";
      };

  const [state, setState] = useState<State>({
    status: "entering-ids",
  });

  return (
    <div className="auto-responses-wrapper">
      {state.status === "entering-ids" && (
        <EnterVacancyIds
          onEnter={(ids) => {
            setState({
              status: "generating-responses",
              ids,
            });
          }}
          onLogout={onLogout}
        />
      )}

      {state.status === "generating-responses" && (
        <GeneratingResponses
          ids={state.ids}
          onFinish={() => {
            setState({ status: "finished" });
          }}
        />
      )}

      {state.status === "finished" && (
        <div className="finished-message">
          <p>Мы закончили, спасибо за внимание!</p>
          <ButtonColored
            label="Начать заново"
            onClick={() => {
              setState({
                status: "entering-ids",
              });
            }}
          />
        </div>
      )}
    </div>
  );
};

export const AutoResponses = React.memo(AutoResponses$);

import React, { useState } from "react";
import { EnterVacancyIds } from "./components/EnterVacancyIds";
import { GeneratingResponses } from "./components/GeneratingResponses";

export type Props = {};

const AutoResponses$: React.FC<Props> = (props) => {
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

  if (state.status === "entering-ids") {
    return (
      <EnterVacancyIds
        onEnter={(ids) => {
          setState({
            status: "generating-responses",
            ids,
          });
        }}
      />
    );
  }

  if (state.status === "generating-responses") {
    return (
      <GeneratingResponses
        ids={state.ids}
        onFinish={() => {
          setState({ status: "finished" });
        }}
      />
    );
  }

  return <p>Мы закончили, спасибо за внимание! <button onClick={()=> {
    setState({
        status: "entering-ids"
    })
  }}/></p>;
};

export const AutoResponses = React.memo(AutoResponses$);

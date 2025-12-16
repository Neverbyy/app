import { useEffect, useState } from "react";

import React from "react";
import { AuthChecking } from "./components/AuthChecking";
import { AuthRequesting } from "./components/AuthRequesting";
import { AutoResponses } from "./components/AutoResponses";

const App = () => {
  type State =
    | {
        status: "checking-auth";
      }
    | {
        status: "need-auth";
        isSpinnerPassed: boolean;
      }
    | {
        status: "response";
      }
    | {
        status: "error";
      };

  const [state, setState] = useState<State>({
    status: "checking-auth",
  });

  useEffect(() => {
    if (state.status !== "need-auth" || state.isSpinnerPassed) {
      return;
    }

    const timeout = setTimeout(() => {
      setState({
        status: "need-auth",
        isSpinnerPassed: true,
      });
    }, 3_000);

    return () => {
      clearTimeout(timeout);
    };
  }, [state.status]);

  const renderProccessor = () => {
    if (state.status === "checking-auth") {
      return (
        <AuthChecking
          onAuthorized={() => {
            setState({
              status: "response",
            });
          }}
          onError={() => {
            setState({ status: "error" });
          }}
          onNotAuthorized={() => {
            setState({ status: "need-auth", isSpinnerPassed: false });
          }}
        />
      );
    }

    if (state.status === "need-auth") {
      if (!state.isSpinnerPassed) {
        return;
      }

      return (
        <AuthRequesting
          onError={() => {
            setState({
              status: "error",
            });
          }}
          onAuthorized={() => {
            setState({
              status: "response",
            });
          }}
        />
      );
    }

    if (state.status === "response") {
      return <AutoResponses />;
    }
  };

  const renderText = () => {
    switch (state.status) {
      case "checking-auth":
        return <p id="text">Проверяем авторизацию </p>;
      case "need-auth":
        if (!state.isSpinnerPassed) {
          return (
            <p id="text">Нужно авторизоваться, сейчас откроем окно на HH.ru </p>
          );
        }
        return <p id="text">Авторизуйтесь в окне hh.ru </p>;
      case "error":
        return <p id="text">Упс, что-то пошло не так</p>;
    }

    return null;
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Sofi Agent</h1>
      {renderProccessor()}
      {renderText()}
    </div>
  );
};

export default App;



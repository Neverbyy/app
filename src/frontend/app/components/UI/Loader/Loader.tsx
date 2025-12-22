import React from "react";
import "./Loader.css";

export type Props = {
  text?: string;
};

export const Loader: React.FC<Props> = ({ text = "Загрузка" }) => {
  return (
    <div className="loader-wrapper">
      <div className="loader-content">
        <div className="loader-spinner" aria-label={text} role="status">
          <div className="loader-spinner-circle"></div>
        </div>
        <p className="loader-text">{text}</p>
      </div>
    </div>
  );
};

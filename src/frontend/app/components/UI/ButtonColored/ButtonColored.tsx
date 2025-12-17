import React, { useState } from "react";
import "../Button/Button.css";
import "./ButtonColored.css";

type ButtonColoredProps = {
  label: string;
  color?: string;
  isLoading?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  className?: string;
  prependIcon?: "hh" | string;
};

const ButtonColored: React.FC<ButtonColoredProps> = ({
  label,
  color = "#0057FF",
  isLoading = false,
  disabled = false,
  compact = false,
  onClick,
  onKeyDown,
  className = "",
  prependIcon,
}) => {
  const [isActive, setIsActive] = useState(false);

  const borderColor = `${color}33`;
  const activeBorderColor = `${color}4D`;

  const handleClick = () => {
    if (isLoading || disabled) return;
    onClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
    onKeyDown?.(event);
  };

  return (
    <div
      className={`button-colored ${disabled || isLoading ? "button-colored--disabled" : ""} ${compact ? "button-colored--compact" : ""} ${className}`}
      style={{ backgroundColor: color, "--border-color": borderColor, "--active-border-color": activeBorderColor } as React.CSSProperties}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onMouseLeave={() => setIsActive(false)}
      tabIndex={disabled || isLoading ? -1 : 0}
      role="button"
      aria-label={label}
    >
      <div className="button-content">
        {isLoading && (
          <div className="loader">
            <div className="loader-spinner"></div>
          </div>
        )}
        {prependIcon === "hh" && !isLoading && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 20C15.523 20 20 15.523 20 10C20 4.477 15.523 0 10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M5.68798 5.487V8.889C6.20598 8.272 6.82597 7.961 7.54597 7.961C7.91697 7.961 8.24897 8.032 8.54697 8.172C8.84597 8.312 9.06897 8.491 9.21997 8.708C9.37197 8.928 9.47398 9.168 9.52898 9.433C9.58398 9.697 9.61198 10.107 9.61198 10.664V14.301H8.00298V11.025C8.00298 10.375 7.97398 9.963 7.91298 9.788C7.85198 9.612 7.74398 9.473 7.58998 9.372C7.43498 9.267 7.24197 9.216 7.00897 9.216C6.74297 9.216 6.50297 9.283 6.29497 9.415C6.08297 9.548 5.92997 9.748 5.83297 10.014C5.73497 10.281 5.68598 10.674 5.68798 11.196L5.68597 14.302H4.07898V5.488H5.68798" fill="#DF1B12"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M12.024 5.487V8.889C12.542 8.272 13.162 7.961 13.882 7.961C14.251 7.961 14.586 8.032 14.884 8.172C15.181 8.312 15.405 8.491 15.555 8.708C15.707 8.928 15.81 9.168 15.864 9.433C15.919 9.697 15.947 10.107 15.947 10.664V14.301H14.34V11.025C14.34 10.375 14.31 9.963 14.248 9.788C14.187 9.612 14.08 9.473 13.924 9.372C13.771 9.267 13.576 9.216 13.343 9.216C13.077 9.216 12.838 9.283 12.629 9.415C12.419 9.548 12.266 9.748 12.168 10.014C12.072 10.281 12.023 10.674 12.023 11.196V14.302H10.416V5.488H12.023" fill="#DF1B12"/>
          </svg>
        )}
        <span className="button-label">{label}</span>
      </div>
    </div>
  );
};

export default ButtonColored;

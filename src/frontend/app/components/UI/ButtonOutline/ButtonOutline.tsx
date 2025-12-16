import React, { useState } from "react";
import "./ButtonOutline.css";

type ButtonOutlineProps = {
  label: string;
  type?: "primary" | "delete";
  isLoading?: boolean;
  isDisabled?: boolean;
  appendIcon?: "support" | string;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  className?: string;
};

const ButtonOutline: React.FC<ButtonOutlineProps> = ({
  label,
  type = "primary",
  isLoading = false,
  isDisabled = false,
  appendIcon,
  onClick,
  onKeyDown,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const colors = {
    primary: "#0057FF",
    delete: "#FF0004",
  };

  const borderColor = colors[type];
  const iconColor = isHovered || isPressed ? borderColor : "#222222";
  const textColor = type === "delete" ? "#E00000" : isHovered ? colors.primary : "#222222";

  const handleClick = () => {
    if (!isDisabled && !isLoading) {
      onClick?.();
    }
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
      className={`button-outline ${isDisabled || isLoading ? "is-disabled" : ""} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => {
        setIsPressed(false);
        setIsHovered(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
      tabIndex={isDisabled || isLoading ? -1 : 0}
      role="button"
      aria-label={label}
      style={{ "--border-color": borderColor, "--text-color": textColor, "--icon-color": iconColor } as React.CSSProperties}
    >
      <div className="button-content">
        <span className="button-label">{label}</span>
        {appendIcon === "support" && !isLoading && (
          <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.625 8.125C3.625 4.32812 6.70312 1.25 10.5 1.25C14.2969 1.25 17.375 4.32812 17.375 8.125V8.82875C18.4531 9.10625 19.25 10.085 19.25 11.25V13.75C19.2501 14.1142 19.1706 14.4739 19.0171 14.8042C18.8636 15.1344 18.6398 15.4271 18.3614 15.6618C18.083 15.8965 17.7567 16.0676 17.4052 16.163C17.0538 16.2585 16.6858 16.276 16.3269 16.2144C15.9025 17.016 15.2582 17.6799 14.4696 18.1279C13.681 18.576 12.7809 18.7896 11.875 18.7437C11.8338 18.7481 11.7919 18.75 11.75 18.75H10.5C10.1685 18.75 9.85054 18.6183 9.61612 18.3839C9.3817 18.1495 9.25 17.8315 9.25 17.5C9.25 17.1685 9.3817 16.8505 9.61612 16.6161C9.85054 16.3817 10.1685 16.25 10.5 16.25H11.75C12.0622 16.25 12.363 16.3668 12.5934 16.5774C12.8238 16.788 12.9671 17.0772 12.995 17.3881C13.4553 17.2695 13.8866 17.0587 14.263 16.7684C14.6393 16.4781 14.9528 16.1144 15.1844 15.6994C14.8924 15.4653 14.6568 15.1686 14.4951 14.8311C14.3334 14.4937 14.2496 14.1242 14.25 13.75V11.25C14.2501 10.6957 14.4343 10.1571 14.7736 9.71889C15.113 9.28064 15.5884 8.96753 16.125 8.82875V8.125C16.125 6.63316 15.5324 5.20242 14.4775 4.14752C13.4226 3.09263 11.9918 2.5 10.5 2.5C9.00816 2.5 7.57742 3.09263 6.52252 4.14752C5.46763 5.20242 4.875 6.63316 4.875 8.125V8.82875C5.95312 9.10625 6.75 10.085 6.75 11.25V13.75C6.75 14.413 6.48661 15.0489 6.01777 15.5178C5.54893 15.9866 4.91304 16.25 4.25 16.25C3.58696 16.25 2.95107 15.9866 2.48223 15.5178C2.01339 15.0489 1.75 14.413 1.75 13.75V11.25C1.75007 10.6957 1.93427 10.1571 2.27364 9.71889C2.61302 9.28064 3.08836 8.96753 3.625 8.82875V8.125ZM4.25 10C3.91848 10 3.60054 10.1317 3.36612 10.3661C3.1317 10.6005 3 10.9185 3 11.25V13.75C3 14.0815 3.1317 14.3995 3.36612 14.6339C3.60054 14.8683 3.91848 15 4.25 15C4.58152 15 4.89946 14.8683 5.13388 14.6339C5.3683 14.3995 5.5 14.0815 5.5 13.75V11.25C5.5 10.9185 5.3683 10.6005 5.13388 10.3661C4.89946 10.1317 4.58152 10 4.25 10ZM15.5 11.25C15.5 10.9185 15.6317 10.6005 15.8661 10.3661C16.1005 10.1317 16.4185 10 16.75 10C17.0815 10 17.3995 10.1317 17.6339 10.3661C17.8683 10.6005 18 10.9185 18 11.25V13.75C18 14.0815 17.8683 14.3995 17.6339 14.6339C17.3995 14.8683 17.0815 15 16.75 15C16.4185 15 16.1005 14.8683 15.8661 14.6339C15.6317 14.3995 15.5 14.0815 15.5 13.75V11.25Z"
              fill={iconColor}
            />
          </svg>
        )}
        {isLoading && (
          <div className="loader" style={{ borderColor: textColor, borderBottomColor: "transparent" }}></div>
        )}
      </div>
    </div>
  );
};

export default ButtonOutline;

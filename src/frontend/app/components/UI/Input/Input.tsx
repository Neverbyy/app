import React, { useState, useRef } from "react";
import "./Input.css";

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  icon?: "close" | "password" | "search";
  type?: "text" | "password" | "email";
  placeholder?: string;
  name?: string;
  autocomplete?: string;
  isError?: boolean;
  disabled?: boolean;
  readonly?: boolean;
};

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  icon,
  type = "text",
  placeholder,
  name,
  autocomplete,
  isError = false,
  disabled = false,
  readonly = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputType = type === "password" && showPassword ? "text" : type;

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const clearInput = () => {
    onChange("");
  };

  const handleIconClick = () => {
    if (icon === "password") {
      togglePasswordVisibility();
    } else if (icon === "close" && value) {
      clearInput();
    }
  };

  const showIcon =
    !isError &&
    ((icon === "password") ||
      (icon === "close" && value) ||
      icon === "search");

  return (
    <div className="input-wrapper">
      <div
        className={`input-container ${
          showIcon ? "has-icon" : ""
        } ${icon === "search" ? "input-container-search" : ""}`}
      >
        <input
          ref={inputRef}
          className={`input ${isError ? "input-error" : ""} ${
            icon === "search" ? "input-search" : ""
          } ${disabled ? "input-disabled" : ""}`}
          value={value}
          placeholder={placeholder}
          type={inputType}
          disabled={disabled}
          readOnly={readonly}
          name={name}
          autoComplete={autocomplete}
          onChange={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {showIcon && (
          <div className="icon-wrapper" onClick={handleIconClick}>
            {icon === "password" && (
              <>
                {showPassword ? (
                  <svg
                    width="16"
                    height="12"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.99998 16.25C3.45733 16.25 0.213576 10.5463 0.0787323 10.3036C0.0270977 10.2107 0 10.1062 0 9.99992C0 9.89365 0.0270977 9.78913 0.0787323 9.69625C0.213576 9.45375 3.45733 3.75 9.99998 3.75C16.5426 3.75 19.7864 9.45375 19.9212 9.69641C19.9729 9.78929 20 9.89381 20 10.0001C20 10.1063 19.9729 10.2109 19.9212 10.3038C19.7864 10.5462 16.5426 16.25 9.99998 16.25ZM1.36045 9.99906C2.10389 11.1258 5.02279 15 9.99998 15C14.993 15 17.8989 11.1289 18.6395 10.0009C17.8961 8.87422 14.9772 5 9.99998 5C5.00701 5 2.10108 8.87109 1.36045 9.99906ZM9.99998 13.75C7.93217 13.75 6.24998 12.0678 6.24998 10C6.24998 7.93219 7.93217 6.25 9.99998 6.25C12.0678 6.25 13.75 7.93219 13.75 10C13.75 12.0678 12.0678 13.75 9.99998 13.75ZM9.99998 7.5C8.62154 7.5 7.49998 8.62156 7.49998 10C7.49998 11.3784 8.62154 12.5 9.99998 12.5C11.3784 12.5 12.5 11.3784 12.5 10C12.5 8.62156 11.3784 7.5 9.99998 7.5Z"
                      fill={isFocused ? "#131313" : "#8B8B8B"}
                    />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.99998 16.25C3.45733 16.25 0.213576 10.5463 0.0787323 10.3036C0.0270977 10.2107 0 10.1062 0 9.99992C0 9.89365 0.0270977 9.78913 0.0787323 9.69625C0.213576 9.45375 3.45733 3.75 9.99998 3.75C16.5426 3.75 19.7864 9.45375 19.9212 9.69641C19.9729 9.78929 20 9.89381 20 10.0001C20 10.1063 19.9729 10.2109 19.9212 10.3038C19.7864 10.5462 16.5426 16.25 9.99998 16.25ZM1.36045 9.99906C2.10389 11.1258 5.02279 15 9.99998 15C14.993 15 17.8989 11.1289 18.6395 10.0009C17.8961 8.87422 14.9772 5 9.99998 5C5.00701 5 2.10108 8.87109 1.36045 9.99906ZM9.99998 13.75C7.93217 13.75 6.24998 12.0678 6.24998 10C6.24998 7.93219 7.93217 6.25 9.99998 6.25C12.0678 6.25 13.75 7.93219 13.75 10C13.75 12.0678 12.0678 13.75 9.99998 13.75ZM9.99998 7.5C8.62154 7.5 7.49998 8.62156 7.49998 10C7.49998 11.3784 8.62154 12.5 9.99998 12.5C11.3784 12.5 12.5 11.3784 12.5 10C12.5 8.62156 11.3784 7.5 9.99998 7.5Z"
                      fill={isFocused ? "#131313" : "#8B8B8B"}
                    />
                    <path
                      d="M2.5752 16.7171L16.7173 2.57501L17.4244 3.28212L3.2823 17.4243L2.5752 16.7171Z"
                      fill={isFocused ? "#131313" : "#8B8B8B"}
                    />
                  </svg>
                )}
              </>
            )}
            {icon === "close" && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.750065 10.1896C0.609335 10.3303 0.530273 10.5212 0.530273 10.7202C0.530273 10.9192 0.609335 11.1101 0.750065 11.2508C0.890796 11.3915 1.08167 11.4706 1.28069 11.4706C1.47971 11.4706 1.67058 11.3915 1.81132 11.2508L6.00007 7.06055L10.1896 11.2501C10.331 11.3867 10.5205 11.4623 10.7171 11.4606C10.9138 11.4588 11.1019 11.38 11.2409 11.2409C11.38 11.1019 11.4589 10.9138 11.4606 10.7171C11.4623 10.5205 11.3867 10.331 11.2501 10.1896L7.06057 6.00005L11.2501 1.81055C11.3907 1.66982 11.4697 1.47899 11.4696 1.28004C11.4695 1.08109 11.3904 0.890309 11.2497 0.749678C11.109 0.609047 10.9181 0.530081 10.7192 0.530151C10.5202 0.530222 10.3294 0.609323 10.1888 0.750053L6.00007 4.93955L1.81057 0.750053C1.66911 0.613435 1.47966 0.537839 1.28301 0.539548C1.08637 0.541257 0.898257 0.620133 0.759201 0.759189C0.620145 0.898245 0.541269 1.08635 0.53956 1.283C0.537851 1.47965 0.613447 1.6691 0.750065 1.81055L4.93957 6.00005L0.750065 10.1896Z"
                  fill={isFocused ? "#131313" : "#8B8B8B"}
                />
              </svg>
            )}
          </div>
        )}
      </div>
      {isError && !value && (
        <span className="error-text">Это поле не может быть пустым</span>
      )}
    </div>
  );
};

export default Input;

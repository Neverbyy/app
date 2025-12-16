import React, { useState, useEffect } from "react";
import { Input } from "../UI/Input";
import { ButtonColored } from "../UI/ButtonColored";
// eslint-disable-next-line import/no-unresolved
import { openExternalUrl } from "src/frontend/services/electron";
import "./LoginView.css";
// eslint-disable-next-line import/no-unresolved
import SofiImage from "src/frontend/assets/Sofi.svg";

type LoginViewProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
};

const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  isLoading = false,
  error: externalError = null,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (externalError) {
      setFormError(externalError);
    }
  }, [externalError]);

  const clearErrors = () => {
    setFormError("");
  };

  const validateForm = (): boolean => {
    if (!email) {
      setFormError("Пожалуйста, введите email");
      return false;
    }

    if (!email.includes("@")) {
      setFormError("Email должен содержать символ @");
      return false;
    }

    if (!password) {
      setFormError("Пожалуйста, введите пароль");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Пожалуйста, введите корректный email");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    clearErrors();

    if (!validateForm()) {
      return;
    }

    try {
      await onLogin(email, password);
    } catch (error) {
      console.error("Login error:", error);
      setFormError("Произошла ошибка при входе. Пожалуйста, попробуйте еще раз.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  const handleRegister = () => {
    openExternalUrl("https://sofi-assistant.com/auth");
  };

  const handleContactSupport = () => {
    openExternalUrl("https://t.me/SofiAssistantSupportBot?start");
  };

  useEffect(() => {
    if (email || password) {
      clearErrors();
    }
  }, [email, password]);

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="welcome-image">
          <span className="welcome-title">Добро пожаловать!</span>
          <div className="sofi-image-container">
            <img src={SofiImage} alt="Sofi" />
          </div>
        </div>

        <div className="welcome-form-wrapper">
          <span className="welcome-title">Вход</span>

          <div className="welcome-form">
            <Input
              value={email}
              onChange={setEmail}
              icon="close"
              type="text"
              placeholder="Введите email"
              name="email"
              autocomplete="email"
              isError={!!formError && (formError.includes("email") || formError.includes("Email") || !email)}
            />

            <Input
              value={password}
              onChange={setPassword}
              icon="password"
              type="password"
              placeholder="Введите пароль"
              name="password"
              autocomplete="current-password"
              isError={!!formError && (formError.includes("пароль") || formError.includes("Пароль") || !password)}
            />

            <ButtonColored
              label="Войти"
              className="action-button"
              isLoading={isLoading}
              onClick={handleLogin}
              onKeyDown={handleKeyDown}
            />

            {formError && (
              <div className="error-message">{formError}</div>
            )}
          </div>

          <div className="divider-container">
            <div className="divider"></div>
            <div className="text-divider">или</div>
            <div className="divider"></div>
          </div>

          <div className="text-account">
            Нет аккаунта?{" "}
            <a
              className="text-account-link"
              onClick={handleRegister}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRegister();
                }
              }}
              tabIndex={0}
              role="link"
              aria-label="Зарегистрироваться"
            >
              Зарегистрироваться
            </a>
          </div>
          <a
            className="support-link"
            onClick={handleContactSupport}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleContactSupport();
              }
            }}
            tabIndex={0}
            role="link"
            aria-label="Написать нам"
          >
            Написать нам
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

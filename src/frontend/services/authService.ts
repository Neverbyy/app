export interface LoginResponse {
  user_id: string;
  email: string;
  name: string;
  [key: string]: unknown;
}

export interface LoginError {
  detail?: string;
  [key: string]: unknown;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://stage.sofi-assistant.com/api";

const translateError = (serverError: string): string => {
  const lowerError = serverError.toLowerCase();
  const errorKeywords = ["incorrect", "invalid", "wrong", "email", "password", "пароль", "логин"];
  
  if (errorKeywords.some(keyword => lowerError.includes(keyword))) {
    return "Введен неверный логин или пароль";
  }
  
  return serverError;
};

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      credentials: "include",
    });
  } catch (fetchError) {
    // Сетевая ошибка (CORS, нет интернета и т.д.)
    console.error("Fetch error:", fetchError);
    throw new Error("Ошибка подключения к серверу. Проверьте интернет-соединение.");
  }

  // Пытаемся прочитать ответ, даже если статус не OK
  let responseData: LoginResponse | LoginError | null = null;
  try {
    const responseText = await response.text();
    if (responseText) {
      responseData = JSON.parse(responseText) as LoginResponse | LoginError;
    }
  } catch (jsonError) {
    console.error("Failed to parse response as JSON:", jsonError);
  }

  if (!response.ok) {
    const serverError = (responseData as LoginError)?.detail || "";
    const errorMessage = serverError
      ? translateError(serverError)
      : "Введен неверный логин или пароль";
    throw new Error(errorMessage);
  }

  if (!responseData) {
    throw new Error("Ошибка: получен пустой ответ от сервера");
  }

  return responseData as LoginResponse;
};

export const logout = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Logout failed:", response.status);
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Не бросаем ошибку, так как выход должен произойти в любом случае
  }
};

export const checkAuth = async (): Promise<LoginResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    return userData as LoginResponse;
  } catch (error) {
    console.error("Check auth error:", error);
    return null;
  }
};

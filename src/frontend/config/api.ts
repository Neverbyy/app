import { DEFAULT_API_URL } from "../../../config.shared";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL;

/**
 * Вспомогательная функция для создания полного URL
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

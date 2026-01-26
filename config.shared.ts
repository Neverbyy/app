export const DEFAULT_API_URL = "https://sofi-assistant.com/api";

export const getApiDomain = (apiUrl: string): string => {
  return apiUrl.replace(/\/api\/?$/, '');
};

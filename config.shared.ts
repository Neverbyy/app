export const DEFAULT_API_URL = "https://stage.sofi-assistant.com/api";

export const getApiDomain = (apiUrl: string): string => {
  return apiUrl.replace(/\/api\/?$/, '');
};

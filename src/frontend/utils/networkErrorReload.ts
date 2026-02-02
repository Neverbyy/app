/**
 * Ошибки сети при первом запуске (например, ERR_NETWORK_IO_SUSPENDED),
 * которые устраняются перезагрузкой страницы.
 */
const RECOVERABLE_PATTERNS = [
  "ERR_NETWORK_IO_SUSPENDED",
  "ERR_INTERNET_DISCONNECTED",
  "Failed to fetch",
  "NetworkError",
  "Load failed",
];

const RELOAD_KEY = "sofi-network-reload-attempted";

export const isRecoverableNetworkError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return RECOVERABLE_PATTERNS.some((p) =>
    message.toLowerCase().includes(p.toLowerCase())
  );
};

/**
 * При ошибке сети при первом запуске перезагрузка страницы помогает.
 */
export const tryReloadOnNetworkError = (error: unknown): boolean => {
  if (!isRecoverableNetworkError(error)) return false;

  try {
    if (sessionStorage.getItem(RELOAD_KEY)) return false;
    sessionStorage.setItem(RELOAD_KEY, "1");
    window.location.reload();
    return true;
  } catch {
    return false;
  }
};

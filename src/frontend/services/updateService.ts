/**
 * Сервис для проверки обновлений
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://stage.sofi-assistant.com/api";

export type CheckUpdateRequest = {
  client_name: string;
  version: string;
  platform: string;
  arch: string;
  os_version?: string;
  electron_version?: string;
  locale?: string;
};

export type CheckUpdateResponse = {
  update_available: boolean;
  latest_version: string;
  download_url: string | null;
  release_notes: string | null;
  is_mandatory: boolean;
  is_critical: boolean;
};

/**
 * Получить информацию о системе через IPC
 */
const getSystemInfo = async (): Promise<{
  platform: string;
  arch: string;
  osVersion: string;
  electronVersion: string;
  locale: string;
  appVersion: string;
}> => {
  const { ipcRenderer } = await import("./electron");
  
  return await ipcRenderer.invoke("get-system-info");
};

/**
 * Проверить наличие обновлений
 */
export const checkForUpdates = async (): Promise<CheckUpdateResponse> => {
  try {
    const systemInfo = await getSystemInfo();
    
    const requestBody: CheckUpdateRequest = {
      client_name: "sofi-agent",
      version: systemInfo.appVersion,
      platform: systemInfo.platform,
      arch: systemInfo.arch,
      os_version: systemInfo.osVersion,
      electron_version: systemInfo.electronVersion,
      locale: systemInfo.locale,
    };

    const response = await fetch(`${API_BASE_URL}/updates/check-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error("Failed to check for updates:", response.status);
      throw new Error(`Ошибка проверки обновлений: ${response.status}`);
    }

    const data = await response.json();
    return data as CheckUpdateResponse;
  } catch (error) {
    console.error("Error checking for updates:", error);
    throw error;
  }
};


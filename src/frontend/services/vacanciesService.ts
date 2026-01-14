/**
 * Сервис для работы с вакансиями
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sofi-assistant.com/api";

export type Vacancy = {
  id: string;
  name?: string;
  premium?: boolean;
  employer?: {
    name?: string;
  };
  alternate_url?: string;
  [key: string]: unknown;
};

export type VacancyItem = {
  user_id: string;
  vacancy: Vacancy;
  stored_at: string;
  reason?: string;
  cover_letter?: string;
  applied: boolean;
  favorite_vacancy?: boolean;
  position_id?: number;
};

export type AutoApplyVacanciesResponse = {
  items: VacancyItem[];
  total_count?: number;
  limit?: number;
  offset?: number;
  found_count?: number;
};

/**
 * Получить список вакансий для автооткликов
 */
export const getAutoApplyVacancies = async (): Promise<AutoApplyVacanciesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/vacancies/autoapply`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch auto-apply vacancies:", response.status);
      throw new Error(`Ошибка получения вакансий: ${response.status}`);
    }

    const data = await response.json();
    return data as AutoApplyVacanciesResponse;
  } catch (error) {
    console.error("Error fetching auto-apply vacancies:", error);
    throw error;
  }
};
/**
 * Обновить статус вакансии
 */
export const updateVacancyStatus = async (
  vacancyId: string,
  applicationStatus = "applied"
): Promise<void> => {
  try {
    const url = new URL(`${API_BASE_URL}/vacancies/autoapply/update_status`);
    url.searchParams.set("vacancy_id", vacancyId);
    url.searchParams.set("application_status", applicationStatus);

    const response = await fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update vacancy status:", response.status, errorText);
      throw new Error(`Ошибка обновления статуса вакансии: ${response.status}`);
    }
  } catch (error) {
    console.error("Error updating vacancy status:", error);
    throw error;
  }
};
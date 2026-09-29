import type {
  CorridorApi,
  ProjectOfficeApi,
  Draft,
} from "@/types/projectOffice";

const API_BASE_URL = "https://localhost:7157/api";

export const PROJECT_OFFICES_URL = `${API_BASE_URL}/Project_Offices`;
export const CORRIDORS_URL = `${API_BASE_URL}/Corridors`;

async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  console.log("API Request:", {
    url,
    method: options?.method || "GET",
    body: options?.body,
  });

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const text = await response.text();

  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  console.log("API Response:", {
    url,
    status: response.status,
    data,
  });

  if (!response.ok) {
    const errorData =
      typeof data === "object" && data !== null
        ? (data as Record<string, unknown>)
        : {};

    const message =
      typeof errorData.message === "string"
        ? errorData.message
        : typeof errorData.title === "string"
          ? errorData.title
          : typeof data === "string"
            ? data
            : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export const projectOfficeApi = {
  getCorridors: () =>
    apiRequest<CorridorApi[]>(CORRIDORS_URL),

  getProjectOffices: () =>
    apiRequest<ProjectOfficeApi[]>(PROJECT_OFFICES_URL),

  getProjectOffice: (id: number) =>
    apiRequest<ProjectOfficeApi>(
      `${PROJECT_OFFICES_URL}/${id}`
    ),

  createProjectOffice: (payload: {
    ProjectOffices: string;
    UnitCode: string;
    SAPProfitCentreCode: string;
    fkCorId: number;
  }) =>
    apiRequest<ProjectOfficeApi>(PROJECT_OFFICES_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateProjectOffice: (
    id: number,
    payload: {
      ProjectOffices: string;
      UnitCode: string;
      SAPProfitCentreCode: string;
      fkCorId: number;
    }
  ) =>
    apiRequest<ProjectOfficeApi>(
      `${PROJECT_OFFICES_URL}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    ),

  deleteProjectOffice: (id: number) =>
    apiRequest<void>(
      `${PROJECT_OFFICES_URL}/${id}`,
      {
        method: "DELETE",
      }
    ),
};
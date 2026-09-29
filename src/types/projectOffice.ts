/* -------------------------------------------------------------------------- */
/* API CONFIG                                                                 */
/* -------------------------------------------------------------------------- */

export const API_BASE_URL =
  "https://localhost:7157/api";

export const PROJECT_OFFICES_URL =
  `${API_BASE_URL}/Project_Offices`;

export const CORRIDORS_URL =
  `${API_BASE_URL}/Corridors`;

/* -------------------------------------------------------------------------- */
/* API TYPES                                                                  */
/* -------------------------------------------------------------------------- */

export type ProjectOfficeApi = {
  pkUnitCode: number;
  ProjectOffices: string | null;
  UnitCode: string | null;
  SAPProfitCentreCode: string | null;
  fkCorId: number | null;
};

export type CorridorApi = {
  pkCorId: number;
  CorridorName: string | null;
  CorCode: string | null;
};

/* -------------------------------------------------------------------------- */
/* UI TYPES                                                                   */
/* -------------------------------------------------------------------------- */

export type Office = {
  id: number;
  name: string;
  unitCode: string;
  sapCode: string;
  corridor: string;
  corridorId: number | null;
};

export type Draft = {
  name: string;
  unitCode: string;
  sapCode: string;
  corridor: string;
};

export type SortKey = keyof Office;

export type SortDirection = "asc" | "desc";

export type SortState = {
  key: SortKey;
  dir: SortDirection;
};

/* -------------------------------------------------------------------------- */
/* API HELPER                                                                 */
/* -------------------------------------------------------------------------- */

export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  console.log("API REQUEST:", url);

  const response = await fetch(url, {
    method: options.method ?? "GET",

    body: options.body,

    headers: {
      Accept: "application/json",

      ...(options.body
        ? {
            "Content-Type":
              "application/json",
          }
        : {}),

      ...(options.headers ?? {}),
    },
  });

  const responseText =
    await response.text();

  console.log(
    "API RESPONSE:",
    response.status,
    responseText
  );

  if (!response.ok) {
    let message =
      `HTTP ${response.status} ${response.statusText}`;

    if (responseText) {
      try {
        const errorData =
          JSON.parse(responseText);

        if (
          typeof errorData ===
          "string"
        ) {
          message = errorData;
        } else if (
          errorData?.message
        ) {
          message =
            errorData.message;
        } else if (
          errorData?.title
        ) {
          message =
            errorData.title;
        } else if (
          errorData?.errors
        ) {
          const messages =
            Object.values(
              errorData.errors
            )
              .flat()
              .filter(Boolean);

          if (messages.length > 0) {
            message =
              messages.join(", ");
          }
        }
      } catch {
        message = responseText;
      }
    }

    throw new Error(message);
  }

  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(
    responseText
  ) as T;
}

/* -------------------------------------------------------------------------- */
/* CORRIDOR MAPPING                                                           */
/* -------------------------------------------------------------------------- */

export const mapCorridor = (
  item: CorridorApi
) => ({
  id: item.pkCorId,

  name:
    item.CorridorName?.trim() ??
    "",

  code:
    item.CorCode?.trim() ??
    "",
});

/* -------------------------------------------------------------------------- */
/* PROJECT OFFICE MAPPING                                                     */
/* -------------------------------------------------------------------------- */

export const mapProjectOffice = (
  item: ProjectOfficeApi,
  corridorList: CorridorApi[]
): Office => {
  const corridor =
    corridorList.find(
      (c) =>
        c.pkCorId ===
        item.fkCorId
    );

  return {
    id: item.pkUnitCode,

    name:
      item.ProjectOffices?.trim() ??
      "",

    unitCode:
      item.UnitCode?.trim() ??
      "",

    sapCode:
      item.SAPProfitCentreCode?.trim() ??
      "",

    corridor:
      corridor?.CorridorName?.trim() ??
      corridor?.CorCode?.trim() ??
      "",

    corridorId:
      item.fkCorId,
  };
};

/* -------------------------------------------------------------------------- */
/* EMPTY DRAFT                                                                */
/* -------------------------------------------------------------------------- */

export const EMPTY_DRAFT: Draft = {
  name: "",
  unitCode: "",
  sapCode: "",
  corridor: "",
};

/* -------------------------------------------------------------------------- */
/* PAGE SIZE OPTIONS                                                          */
/* -------------------------------------------------------------------------- */

export const PAGE_SIZE_OPTIONS = [
  10,
  25,
  50,
  100,
];
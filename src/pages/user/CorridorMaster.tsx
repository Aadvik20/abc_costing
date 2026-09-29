
import { useEffect, useState, type ReactNode } from "react";
import {
  Code2,
  LayoutGrid,
  Plus,
  Route,
  Loader2,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DataTable, type Column } from "@/components/DataTable";

/* -------------------------------------------------------------------------- */
/* API CONFIG                                                                 */
/* -------------------------------------------------------------------------- */

const API_BASE_URL: string = "https://localhost:7157/api";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */


type CorridorApi = {
  pkCorId?: number;
  corridorName?: string | null;
  corCode?: string | null;

  // PascalCase response support
  CorridorName?: string | null;
  CorCode?: string | null;
};

type Corridor = {
  id: number;
  name: string;
  code: string;
};

type Draft = Omit<Corridor, "id">;

type DeleteResponse = {
  success: boolean;
  message: string;
};

/* -------------------------------------------------------------------------- */
/* API HELPER                                                                 */
/* -------------------------------------------------------------------------- */

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log("Calling API:", url);

  const response = await fetch(url, {
    method: options.method ?? "GET",
    body: options.body,
    headers: {
      Accept: "application/json",
      ...(options.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers ?? {}),
    },
  });

  console.log("API status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `HTTP ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  console.log("API data:", data);

  return data as T;
}

/* -------------------------------------------------------------------------- */
/* API -> UI MAPPING                                                          */
/* -------------------------------------------------------------------------- */

const mapApiToCorridor = (item: CorridorApi): Corridor => ({
  id: item.pkCorId ?? 0,

  name: (
    item.corridorName ??
    item.CorridorName ??
    ""
  ).trim(),

  code: (
    item.corCode ??
    item.CorCode ??
    ""
  ).trim(),
});

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function CorridorMaster() {
  const [rows, setRows] = useState<Corridor[]>([]);

  const [draft, setDraft] = useState<Draft>({
    name: "",
    code: "",
  });

  const [editing, setEditing] = useState<Corridor | null>(null);

  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");
  const [apiError, setApiError] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* GET ALL CORRIDORS                                                        */
  /* ------------------------------------------------------------------------ */

const loadCorridors = async () => {
  try {
    setLoading(true);
    setError("");

    const apiResponse =
      await apiRequest<CorridorApi[]>("/Corridors");

    console.log("RAW API RESPONSE:", apiResponse);

    const mappedRows = apiResponse.map(
      mapApiToCorridor
    );

    console.log("MAPPED ROWS:", mappedRows);

    setRows(mappedRows);
  } catch (error) {
    console.error(
      "GET /api/Corridors error:",
      error
    );

    setError(
      error instanceof Error
        ? error.message
        : "Unable to load corridors."
    );
  } finally {
    setLoading(false);
  }
};

  /* ------------------------------------------------------------------------ */
  /* INITIAL API CALL                                                         */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    loadCorridors();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* VALIDATION                                                               */
  /* ------------------------------------------------------------------------ */

  const validate = (data: Draft, id?: number) => {
    if (!data.name.trim()) {
      return "Enter corridor name.";
    }

    if (!data.code.trim()) {
      return "Enter corridor code.";
    }

    const duplicate = rows.some(
      (row) =>
        row.id !== id &&
        row.name.trim().toLowerCase() ===
          data.name.trim().toLowerCase() &&
        row.code.trim().toLowerCase() ===
          data.code.trim().toLowerCase()
    );

    if (duplicate) {
      return "A corridor with this name and code already exists.";
    }

    return "";
  };

  /* ------------------------------------------------------------------------ */
  /* POST - ADD                                                               */
  /* ------------------------------------------------------------------------ */

  const add = async () => {
    const validationMessage = validate(draft);

    setError(validationMessage);

    if (validationMessage) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setApiError("");

      const created = await apiRequest<CorridorApi>(
        "/Corridors",
        {
          method: "POST",
          body: JSON.stringify({
            corridorName: draft.name.trim(),
            corCode: draft.code.trim(),
          }),
        }
      );

      const newCorridor = mapApiToCorridor(created);

      setRows((previousRows) => [
        ...previousRows,
        newCorridor,
      ]);

      setDraft({
        name: "",
        code: "",
      });
    } catch (error) {
      console.error("POST /api/Corridors error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create corridor."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* GET BY ID - EDIT                                                         */
  /* ------------------------------------------------------------------------ */

  const handleEdit = async (row: Corridor) => {
    try {
      setEditError("");
      setLoadingEdit(true);

      // Open existing row first
      setEditing(row);

      // Get latest record from database
      const result = await apiRequest<CorridorApi>(
        `/Corridors/${row.id}`
      );

      setEditing(mapApiToCorridor(result));
    } catch (error) {
      console.error(
        `GET /api/Corridors/${row.id} error:`,
        error
      );

      setEditError(
        error instanceof Error
          ? error.message
          : "Unable to load corridor details."
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* PUT - UPDATE                                                             */
  /* ------------------------------------------------------------------------ */

  const save = async () => {
    if (!editing) {
      return;
    }

    const validationMessage = validate(
      editing,
      editing.id
    );

    setEditError(validationMessage);

    if (validationMessage) {
      return;
    }

    try {
      setSaving(true);
      setEditError("");

      const updated = await apiRequest<CorridorApi>(
        `/Corridors/${editing.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            pkCorId: editing.id,
            corridorName: editing.name.trim(),
            corCode: editing.code.trim(),
          }),
        }
      );

      const updatedCorridor = mapApiToCorridor(updated);

      setRows((previousRows) =>
        previousRows.map((row) =>
          row.id === editing.id
            ? updatedCorridor
            : row
        )
      );

      setEditing(null);
    } catch (error) {
      console.error(
        `PUT /api/Corridors/${editing.id} error:`,
        error
      );

      setEditError(
        error instanceof Error
          ? error.message
          : "Unable to update corridor."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* DELETE                                                                   */
  /* ------------------------------------------------------------------------ */

  const deleteCorridor = async () => {
    if (!editing) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${editing.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setEditError("");

      const result = await apiRequest<DeleteResponse>(
        `/Corridors/${editing.id}`,
        {
          method: "DELETE",
        }
      );

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to delete corridor."
        );
      }

      setRows((previousRows) =>
        previousRows.filter(
          (row) => row.id !== editing.id
        )
      );

      setEditing(null);
    } catch (error) {
      console.error(
        `DELETE /api/Corridors/${editing.id} error:`,
        error
      );

      setEditError(
        error instanceof Error
          ? error.message
          : "Unable to delete corridor."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* COLUMNS                                                                  */
  /* ------------------------------------------------------------------------ */

  const COLUMNS: Column<Corridor>[] = [
    {
      key: "id",
      label: "Ser. No.",
      value: (row) => row.id,
    },
    {
      key: "name",
      label: "Corridor Name",
      value: (row) => row.name,
      render: (row) => blankCell(row.name),
    },
    {
      key: "code",
      label: "Code",
      value: (row) => row.code,
      render: (row) => blankCell(row.code),
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* JSX                                                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_30rem_at_top_left,theme(colors.blue.100),transparent)] bg-slate-50 px-4 py-8 dark:bg-slate-950 dark:bg-none md:px-8">
      <div className="mx-auto max-w-full space-y-6">

        {/* Header */}
        <header className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
            <Route className="size-6" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
              Corridor Master
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage and configure corridor entries
            </p>
          </div>
        </header>

        {/* Add Form */}
        <section className="rounded-2xl border border-l-4 border-white/60 border-l-blue-500 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:border-l-blue-500 dark:bg-white/5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              add();
            }}
            className="flex flex-wrap items-center gap-3"
          >
            <IconField
              icon={<LayoutGrid />}
              label="Corridor name"
              value={draft.name}
              onChange={(value) =>
                setDraft((previous) => ({
                  ...previous,
                  name: value,
                }))
              }
            />

            <IconField
              icon={<Code2 />}
              label="Code"
              value={draft.code}
              onChange={(value) =>
                setDraft((previous) => ({
                  ...previous,
                  code: value,
                }))
              }
            />

            <Button
              type="submit"
              disabled={saving}
              className="h-10 bg-blue-600 px-6 shadow-md shadow-blue-600/25 hover:bg-blue-700"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}

              {saving
                ? "Saving..."
                : "Add corridor"}
            </Button>
          </form>

          {error && (
            <p
              role="alert"
              className="mt-3 text-sm font-medium text-destructive"
            >
              {error}
            </p>
          )}
        </section>

        {/* API Error */}
        {apiError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {apiError}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex min-h-40 items-center justify-center rounded-2xl border bg-white/70 dark:bg-white/5">
            <Loader2 className="mr-2 size-5 animate-spin" />

            <span className="text-sm text-muted-foreground">
              Loading corridors...
            </span>
          </div>
        ) : (
          <DataTable
            rows={rows}
            columns={COLUMNS}
            searchPlaceholder="Search corridors"
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (
            !open &&
            !saving &&
            !deleting &&
            !loadingEdit
          ) {
            setEditing(null);
            setEditError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit corridor
            </DialogTitle>

            <DialogDescription>
              Change the name or code and save.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="grid gap-4">

              {/* Loading latest data */}
              {loadingEdit && (
                <div className="flex items-center rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Loading latest corridor data...
                </div>
              )}

              {/* Corridor Name */}
              <div className="grid gap-1.5">
                <Label>
                  Corridor name
                </Label>

                <Input
                  value={editing.name}
                  disabled={
                    saving ||
                    deleting ||
                    loadingEdit
                  }
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      name: event.target.value,
                    })
                  }
                />
              </div>

              {/* Code */}
              <div className="grid gap-1.5">
                <Label>
                  Code
                </Label>

                <Input
                  value={editing.code}
                  disabled={
                    saving ||
                    deleting ||
                    loadingEdit
                  }
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      code: event.target.value,
                    })
                  }
                />
              </div>

              {editError && (
                <p
                  role="alert"
                  className="text-sm font-medium text-destructive"
                >
                  {editError}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              disabled={
                saving ||
                deleting ||
                loadingEdit
              }
              onClick={() => {
                setEditing(null);
                setEditError("");
              }}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={
                saving ||
                deleting ||
                loadingEdit
              }
              onClick={deleteCorridor}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}

              {deleting
                ? "Deleting..."
                : "Delete"}
            </Button>

            <Button
              disabled={
                saving ||
                deleting ||
                loadingEdit
              }
              onClick={save}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving && (
                <Loader2 className="size-4 animate-spin" />
              )}

              {saving
                ? "Saving..."
                : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY CELL                                                                 */
/* -------------------------------------------------------------------------- */

const blankCell = (value: string) =>
  value ? (
    value
  ) : (
    <span className="text-muted-foreground/60">
      —
    </span>
  );

/* -------------------------------------------------------------------------- */
/* ICON FIELD                                                                 */
/* -------------------------------------------------------------------------- */

function IconField({
  icon,
  label,
  value,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative w-full sm:w-64">
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground [&>svg]:size-4">
        {icon}
      </span>

      <Input
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 bg-white pl-9 dark:bg-transparent"
      />
    </div>
  );
}
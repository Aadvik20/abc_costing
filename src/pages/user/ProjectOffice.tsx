import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Hash,
  Landmark,
  Loader2,
  Pencil,
  Plus,
  Search,
  TrainFront,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  apiRequest,
  CORRIDORS_URL,
  EMPTY_DRAFT,
  mapProjectOffice,
  PAGE_SIZE_OPTIONS,
  PROJECT_OFFICES_URL,
} from "../../types/projectOffice";

import type {
  CorridorApi,
  Draft,
  Office,
  ProjectOfficeApi,
  SortKey,
  SortState,
} from "../../types/projectOffice";

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function ProjectOffice() {
  /* ------------------------------------------------------------------------ */
  /* STATE                                                                    */
  /* ------------------------------------------------------------------------ */

  const [rows, setRows] =
    useState<Office[]>([]);

  const [corridors, setCorridors] =
    useState<CorridorApi[]>([]);

  const [draft, setDraft] =
    useState<Draft>(EMPTY_DRAFT);

  const [editing, setEditing] =
    useState<Office | null>(null);

  const [error, setError] =
    useState("");

  const [apiError, setApiError] =
    useState("");

  const [query, setQuery] =
    useState("");

  const [pageSize, setPageSize] =
    useState(10);

  const [page, setPage] =
    useState(1);

  const [sort, setSort] =
    useState<SortState>({
      key: "id",
      dir: "asc",
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* LOAD CORRIDORS                                                           */
  /* ------------------------------------------------------------------------ */

  const loadCorridors =
    async (): Promise<
      CorridorApi[]
    > => {
      try {
        const data =
          await apiRequest<
            CorridorApi[]
          >(CORRIDORS_URL);

        console.log(
          "CORRIDORS DATA:",
          data
        );

        setCorridors(data);

        return data;
      } catch (error) {
        console.error(
          "GET Corridors error:",
          error
        );

        throw error;
      }
    };

  /* ------------------------------------------------------------------------ */
  /* LOAD PROJECT OFFICES                                                     */
  /* ------------------------------------------------------------------------ */

  const loadProjectOffices =
    async (
      corridorList?: CorridorApi[]
    ) => {
      try {
        setLoading(true);
        setApiError("");

        const projectOffices =
          await apiRequest<
            ProjectOfficeApi[]
          >(
            PROJECT_OFFICES_URL
          );

        console.log(
          "PROJECT OFFICES DATA:",
          projectOffices
        );

        const currentCorridors =
          corridorList ??
          corridors;

        const mapped =
          projectOffices.map(
            (item) =>
              mapProjectOffice(
                item,
                currentCorridors
              )
          );

        console.log(
          "MAPPED PROJECT OFFICES:",
          mapped
        );

        setRows(mapped);
      } catch (error) {
        console.error(
          "GET Project Offices error:",
          error
        );

        setRows([]);

        setApiError(
          error instanceof Error
            ? error.message
            : "Unable to load project offices."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* INITIAL LOAD                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const initialize =
      async () => {
        try {
          setLoading(true);

          const corridorData =
            await loadCorridors();

          await loadProjectOffices(
            corridorData
          );
        } catch (error) {
          console.error(
            "Initial page load error:",
            error
          );

          setApiError(
            error instanceof Error
              ? error.message
              : "Unable to load project offices."
          );
        } finally {
          setLoading(false);
        }
      };

    initialize();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* SEARCH + SORT                                                            */
  /* ------------------------------------------------------------------------ */

  const filtered =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      const list = q
        ? rows.filter((row) =>
            [
              row.name,
              row.unitCode,
              row.sapCode,
              row.corridor,
            ].some((value) =>
              value
                .toLowerCase()
                .includes(q)
            )
          )
        : rows;

      return [...list].sort(
        (a, b) => {
          const result =
            String(
              a[sort.key]
            ).localeCompare(
              String(
                b[sort.key]
              ),
              undefined,
              {
                numeric: true,
              }
            );

          return sort.dir ===
            "asc"
            ? result
            : -result;
        }
      );
    }, [
      rows,
      query,
      sort,
    ]);

  /* ------------------------------------------------------------------------ */
  /* PAGINATION                                                               */
  /* ------------------------------------------------------------------------ */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
          pageSize
      )
    );

  const current =
    Math.min(
      page,
      totalPages
    );

  const start =
    (current - 1) *
    pageSize;

  const visible =
    filtered.slice(
      start,
      start + pageSize
    );

  /* ------------------------------------------------------------------------ */
  /* SORT                                                                     */
  /* ------------------------------------------------------------------------ */

  const toggleSort = (
    key: SortKey
  ) => {
    setSort(
      (currentSort) =>
        currentSort.key ===
        key
          ? {
              key,
              dir:
                currentSort.dir ===
                "asc"
                  ? "desc"
                  : "asc",
            }
          : {
              key,
              dir: "asc",
            }
    );

    setPage(1);
  };

  /* ------------------------------------------------------------------------ */
  /* VALIDATION                                                               */
  /* ------------------------------------------------------------------------ */

  const validate = (
    data: Draft,
    ignoreId?: number
  ) => {
    if (!data.name.trim()) {
      return "Enter project office.";
    }

    if (!data.unitCode.trim()) {
      return "Enter unit code.";
    }

    if (!data.sapCode.trim()) {
      return "Enter SAP profit centre code.";
    }

    if (!data.corridor) {
      return "Select corridor.";
    }

    const duplicateUnit =
      rows.find(
        (row) =>
          row.id !==
            ignoreId &&
          row.unitCode
            .trim()
            .toLowerCase() ===
            data.unitCode
              .trim()
              .toLowerCase()
      );

    if (duplicateUnit) {
      return `Unit code already used by ${duplicateUnit.name}.`;
    }

    const duplicateSap =
      rows.find(
        (row) =>
          row.id !==
            ignoreId &&
          row.sapCode
            .trim()
            .toLowerCase() ===
            data.sapCode
              .trim()
              .toLowerCase()
      );

    if (duplicateSap) {
      return `SAP profit centre already used by ${duplicateSap.name}.`;
    }

    return "";
  };

  /* ------------------------------------------------------------------------ */
  /* POST - ADD PROJECT OFFICE                                                */
  /* ------------------------------------------------------------------------ */

  const addOffice =
    async () => {
      const validation =
        validate(draft);

      setError(validation);

      if (validation) {
        return;
      }

      const selectedCorridor =
        corridors.find(
          (corridor) =>
            String(
              corridor.pkCorId
            ) ===
            String(
              draft.corridor
            )
        );

      if (!selectedCorridor) {
        setError(
          "Please select a valid corridor."
        );

        return;
      }

      try {
        setSaving(true);
        setError("");
        setApiError("");

        const payload = {
          ProjectOffices:
            draft.name.trim(),

          UnitCode:
            draft.unitCode
              .trim()
              .toUpperCase(),

          SAPProfitCentreCode:
            draft.sapCode.trim(),

          fkCorId:
            selectedCorridor.pkCorId,
        };

        console.log(
          "POST PAYLOAD:",
          payload
        );

        await apiRequest<ProjectOfficeApi>(
          PROJECT_OFFICES_URL,
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );

        setDraft(
          EMPTY_DRAFT
        );

        await loadProjectOffices(
          corridors
        );

        setSort({
          key: "id",
          dir: "asc",
        });

        setPage(1);
      } catch (error) {
        console.error(
          "POST Project Office error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to add project office."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* GET BY ID - EDIT                                                         */
  /* ------------------------------------------------------------------------ */

  const handleEdit = async (
    row: Office
  ) => {
    try {
      setError("");
      setApiError("");

      const result =
        await apiRequest<ProjectOfficeApi>(
          `${PROJECT_OFFICES_URL}/${row.id}`
        );

      console.log(
        "GET PROJECT OFFICE BY ID:",
        result
      );

      const mapped =
        mapProjectOffice(
          result,
          corridors
        );

      setEditing(mapped);
    } catch (error) {
      console.error(
        "GET Project Office by ID error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load project office."
      );

      setEditing(row);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* PUT - UPDATE PROJECT OFFICE                                              */
  /* ------------------------------------------------------------------------ */

  const saveEdit =
    async () => {
      if (!editing) {
        return;
      }

      const selectedCorridor =
        corridors.find(
          (corridor) =>
            corridor.pkCorId ===
            editing.corridorId
        );

      if (!selectedCorridor) {
        setError(
          "Please select a valid corridor."
        );

        return;
      }

      const draftData: Draft = {
        name: editing.name,

        unitCode:
          editing.unitCode,

        sapCode:
          editing.sapCode,

        corridor: String(
          selectedCorridor.pkCorId
        ),
      };

      const validation =
        validate(
          draftData,
          editing.id
        );

      setError(validation);

      if (validation) {
        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload = {
          ProjectOffices:
            editing.name.trim(),

          UnitCode:
            editing.unitCode
              .trim()
              .toUpperCase(),

          SAPProfitCentreCode:
            editing.sapCode.trim(),

          fkCorId:
            selectedCorridor.pkCorId,
        };

        console.log(
          "PUT URL:",
          `${PROJECT_OFFICES_URL}/${editing.id}`
        );

        console.log(
          "PUT PAYLOAD:",
          payload
        );

        await apiRequest<ProjectOfficeApi>(
          `${PROJECT_OFFICES_URL}/${editing.id}`,
          {
            method: "PUT",
            body: JSON.stringify(
              payload
            ),
          }
        );

        setEditing(null);

        await loadProjectOffices(
          corridors
        );
      } catch (error) {
        console.error(
          "PUT Project Office error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to update project office."
        );
      } finally {
        setSaving(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* DELETE                                                                   */
  /* ------------------------------------------------------------------------ */

  const deleteOffice =
    async () => {
      if (!editing) {
        return;
      }

      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${editing.name}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeleting(true);
        setError("");

        console.log(
          "DELETE URL:",
          `${PROJECT_OFFICES_URL}/${editing.id}`
        );

        await apiRequest(
          `${PROJECT_OFFICES_URL}/${editing.id}`,
          {
            method: "DELETE",
          }
        );

        setEditing(null);

        await loadProjectOffices(
          corridors
        );
      } catch (error) {
        console.error(
          "DELETE Project Office error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to delete project office."
        );
      } finally {
        setDeleting(false);
      }
    };

  /* ------------------------------------------------------------------------ */
  /* PAGE NUMBERS                                                             */
  /* ------------------------------------------------------------------------ */

  const pageNumbers =
    useMemo(() => {
      const from =
        Math.max(
          1,
          Math.min(
            current - 2,
            totalPages - 4
          )
        );

      return Array.from(
        {
          length:
            Math.min(
              5,
              totalPages
            ),
        },
        (_, index) =>
          from + index
      );
    }, [
      current,
      totalPages,
    ]);

  /* ------------------------------------------------------------------------ */
  /* COLUMNS                                                                  */
  /* ------------------------------------------------------------------------ */

  const COLUMNS: {
    key: SortKey;
    label: string;
  }[] = [
    {
      key: "id",
      label: "Ser. No.",
    },
    {
      key: "name",
      label: "Project Office",
    },
    {
      key: "unitCode",
      label: "Unit Code",
    },
    {
      key: "sapCode",
      label: "SAP Profit Centre",
    },
    {
      key: "corridor",
      label: "Corridor",
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* JSX                                                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_30rem_at_top_left,theme(colors.blue.100),transparent)] bg-slate-50 px-4 py-8 dark:bg-slate-950 dark:bg-none md:px-8">
      <div className="mx-auto w-full space-y-6">

        {/* HEADER */}
        <header className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
            <TrainFront className="size-6" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">
              Project Office Master
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage and configure project office master entries
            </p>
          </div>
        </header>

        {/* ADD FORM */}
        <section className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              addOffice();
            }}
            className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_12rem_auto]"
          >
            <IconInput
              icon={<Building2 />}
              label="Project office"
              value={draft.name}
              onChange={(value) =>
                setDraft({
                  ...draft,
                  name: value,
                })
              }
            />

            <IconInput
              icon={<Landmark />}
              label="Unit code"
              value={
                draft.unitCode
              }
              onChange={(value) =>
                setDraft({
                  ...draft,
                  unitCode: value,
                })
              }
            />

            <IconInput
              icon={<Hash />}
              label="SAP profit centre code"
              value={
                draft.sapCode
              }
              onChange={(value) =>
                setDraft({
                  ...draft,
                  sapCode: value,
                })
              }
            />

            <Select
              value={
                draft.corridor
              }
              onValueChange={(value) =>
                setDraft({
                  ...draft,
                  corridor: value,
                })
              }
            >
              <SelectTrigger
                aria-label="Corridor"
                className="h-10 bg-white dark:bg-transparent"
              >
                <SelectValue placeholder="Select corridor" />
              </SelectTrigger>

              <SelectContent>
                {corridors.map(
                  (corridor) => (
                    <SelectItem
                      key={
                        corridor.pkCorId
                      }
                      value={String(
                        corridor.pkCorId
                      )}
                    >
                      {corridor.CorridorName?.trim() ||
                        corridor.CorCode?.trim() ||
                        `Corridor ${corridor.pkCorId}`}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Button
              type="submit"
              disabled={
                saving ||
                loading
              }
              className="h-10 bg-blue-600 px-5 shadow-md shadow-blue-600/25 hover:bg-blue-700"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}

              {saving
                ? "Saving..."
                : "Add project office"}
            </Button>
          </form>

          {error &&
            !editing && (
              <p
                role="alert"
                className="mt-3 text-sm font-medium text-destructive"
              >
                {error}
              </p>
            )}
        </section>

        {/* API ERROR */}
        {apiError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {apiError}
          </div>
        )}

        {/* TABLE CARD */}
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900">

          {/* TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Show

              <Select
                value={String(
                  pageSize
                )}
                onValueChange={(
                  value
                ) => {
                  setPageSize(
                    Number(value)
                  );

                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Rows per page"
                  className="h-9 w-[4.5rem]"
                >
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map(
                    (number) => (
                      <SelectItem
                        key={number}
                        value={String(
                          number
                        )}
                      >
                        {number}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              entries
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={query}
                onChange={(event) => {
                  setQuery(
                    event.target.value
                  );

                  setPage(1);
                }}
                placeholder="Search office, code or corridor"
                className="h-9 pl-9"
              />
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-52 items-center justify-center">
              <Loader2 className="mr-2 size-5 animate-spin" />

              <span className="text-sm text-muted-foreground">
                Loading project offices...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-blue-50/80 dark:bg-blue-950/30">
                <TableRow>
                  {COLUMNS.map(
                    (column) => {
                      const active =
                        sort.key ===
                        column.key;

                      const SortIcon =
                        !active
                          ? ArrowUpDown
                          : sort.dir ===
                            "asc"
                            ? ArrowUp
                            : ArrowDown;

                      return (
                        <TableHead
                          key={
                            column.key
                          }
                          aria-sort={
                            active
                              ? sort.dir ===
                                "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleSort(
                                column.key
                              )
                            }
                            className="group flex items-center gap-1.5 font-semibold text-blue-800 dark:text-blue-300"
                          >
                            {
                              column.label
                            }

                            <SortIcon
                              className={`size-3.5 ${
                                active
                                  ? "text-blue-600"
                                  : "opacity-40 group-hover:opacity-100"
                              }`}
                            />
                          </button>
                        </TableHead>
                      );
                    }
                  )}

                  <TableHead className="text-right font-semibold text-blue-800 dark:text-blue-300">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {visible.map(
                  (row) => (
                    <TableRow
                      key={
                        row.id
                      }
                      className="transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                    >
                      {/* ID */}
                      <TableCell className="text-muted-foreground">
                        {
                          row.id
                        }
                      </TableCell>

                      {/* PROJECT OFFICE */}
                      <TableCell className="font-semibold">
                        {
                          row.name ||
                          "—"
                        }
                      </TableCell>

                      {/* UNIT CODE */}
                      <TableCell>
                        <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold dark:bg-slate-800">
                          {
                            row.unitCode ||
                            "—"
                          }
                        </code>
                      </TableCell>

                      {/* SAP */}
                      <TableCell className="tabular-nums">
                        {
                          row.sapCode ||
                          "—"
                        }
                      </TableCell>

                      {/* CORRIDOR */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-0 ring-1"
                        >
                          {
                            row.corridor ||
                            "—"
                          }
                        </Badge>
                      </TableCell>

                      {/* ACTION */}
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleEdit(
                              row
                            )
                          }
                          className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="size-3.5" />

                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )}

                {/* EMPTY STATE */}
                {visible.length ===
                  0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-12 text-center text-muted-foreground"
                      >
                        {query
                          ? `No project offices match "${query}". Try a different search.`
                          : "No project offices found."}
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          )}

          {/* FOOTER */}
          {!loading && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-blue-50/60 px-4 py-3 dark:bg-blue-950/20">

              <p className="text-xs text-muted-foreground">
                Showing{" "}
                {filtered.length
                  ? start + 1
                  : 0}{" "}
                to{" "}
                {Math.min(
                  start +
                    pageSize,
                  filtered.length
                )}{" "}
                of{" "}
                {
                  filtered.length
                }{" "}
                entries
              </p>

              <nav
                className="flex items-center gap-1.5"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    current ===
                    1
                  }
                  onClick={() =>
                    setPage(
                      current - 1
                    )
                  }
                >
                  <ChevronLeft className="size-4" />

                  Previous
                </Button>

                {pageNumbers.map(
                  (number) => (
                    <Button
                      key={number}
                      size="sm"
                      variant={
                        number ===
                        current
                          ? "default"
                          : "outline"
                      }
                      aria-current={
                        number ===
                        current
                          ? "page"
                          : undefined
                      }
                      className={
                        number ===
                        current
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }
                      onClick={() =>
                        setPage(
                          number
                        )
                      }
                    >
                      {number}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    current ===
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      current + 1
                    )
                  }
                >
                  Next

                  <ChevronRight className="size-4" />
                </Button>
              </nav>
            </div>
          )}
        </section>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* EDIT DIALOG                                                          */}
      {/* -------------------------------------------------------------------- */}

      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit project office
            </DialogTitle>

            <DialogDescription>
              Update the details for{" "}
              {editing?.name}.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="grid gap-4">

              {/* PROJECT OFFICE */}
              <Field
                label="Project office"
                value={
                  editing.name
                }
                onChange={(value) =>
                  setEditing({
                    ...editing,
                    name: value,
                  })
                }
              />

              {/* UNIT + SAP */}
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Unit code"
                  value={
                    editing.unitCode
                  }
                  onChange={(value) =>
                    setEditing({
                      ...editing,
                      unitCode:
                        value,
                    })
                  }
                />

                <Field
                  label="SAP profit centre"
                  value={
                    editing.sapCode
                  }
                  onChange={(value) =>
                    setEditing({
                      ...editing,
                      sapCode:
                        value,
                    })
                  }
                />
              </div>

              {/* CORRIDOR */}
              <div className="grid gap-1.5">
                <Label>
                  Corridor
                </Label>

                <Select
                  value={
                    editing.corridorId !==
                      null &&
                    editing.corridorId !==
                      undefined
                      ? String(
                          editing.corridorId
                        )
                      : ""
                  }
                  onValueChange={(
                    value
                  ) => {
                    const selected =
                      corridors.find(
                        (
                          corridor
                        ) =>
                          String(
                            corridor.pkCorId
                          ) ===
                          value
                      );

                    setEditing({
                      ...editing,

                      corridorId:
                        selected
                          ?.pkCorId ??
                        null,

                      corridor:
                        selected
                          ?.CorridorName
                          ?.trim() ??
                        selected
                          ?.CorCode
                          ?.trim() ??
                        "",
                    });

                    setError("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select corridor" />
                  </SelectTrigger>

                  <SelectContent>
                    {corridors.map(
                      (
                        corridor
                      ) => (
                        <SelectItem
                          key={
                            corridor.pkCorId
                          }
                          value={String(
                            corridor.pkCorId
                          )}
                        >
                          {corridor.CorridorName?.trim() ||
                            corridor.CorCode?.trim() ||
                            `Corridor ${corridor.pkCorId}`}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* ERROR */}
              {error && (
                <p
                  role="alert"
                  className="text-sm font-medium text-destructive"
                >
                  {error}
                </p>
              )}
            </div>
          )}

          {/* DIALOG FOOTER */}
          <DialogFooter>
            {/* CANCEL */}
            <Button
              variant="outline"
              disabled={
                saving ||
                deleting
              }
              onClick={() =>
                setEditing(null)
              }
            >
              Cancel
            </Button>

            {/* DELETE */}
            <Button
              variant="destructive"
              disabled={
                saving ||
                deleting
              }
              onClick={
                deleteOffice
              }
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

            {/* SAVE */}
            <Button
              disabled={
                saving ||
                deleting
              }
              onClick={
                saveEdit
              }
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
/* ICON INPUT                                                                 */
/* -------------------------------------------------------------------------- */

function IconInput({
  icon,
  label,
  value,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:size-4">
        {icon}
      </span>

      <Input
        aria-label={label}
        placeholder={label}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-10 bg-white pl-9 dark:bg-transparent"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FIELD                                                                      */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label>
        {label}
      </Label>

      <Input
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />
    </div>
  );
}
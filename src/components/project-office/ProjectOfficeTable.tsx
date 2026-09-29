
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Pencil,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type {
  Office,
  SortDirection,
  SortKey,
} from "@/types/projectOffice";

type ProjectOfficeTableProps = {
  rows: Office[];
  loading: boolean;
  query: string;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  onEdit: (office: Office) => void;
};

type Column = {
  key: SortKey;
  label: string;
};

const COLUMNS: Column[] = [
  {
    key: "id",
    label: "ID",
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

export function ProjectOfficeTable({
  rows,
  loading,
  query,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
}: ProjectOfficeTableProps) {
  const renderSortIcon = (key: SortKey) => {
    const active = sortKey === key;

    const SortIcon = !active
      ? ArrowUpDown
      : sortDirection === "asc"
        ? ArrowUp
        : ArrowDown;

    return (
      <SortIcon
        className={`size-3.5 ${
          active
            ? "text-blue-600"
            : "opacity-40 group-hover:opacity-100"
        }`}
      />
    );
  };

  const getAriaSort = (key: SortKey) => {
    if (sortKey !== key) {
      return "none" as const;
    }

    return sortDirection === "asc"
      ? ("ascending" as const)
      : ("descending" as const);
  };

  return (
    <>
      {/* LOADING */}
      {loading ? (
        <div className="flex min-h-52 items-center justify-center">
          <div className="flex items-center">
            <svg
              className="mr-2 size-5 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>

            <span className="text-sm text-muted-foreground">
              Loading project offices...
            </span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            {/* HEADER */}
            <TableHeader className="bg-blue-50/80 dark:bg-blue-950/30">
              <TableRow>
                {COLUMNS.map((column) => (
                  <TableHead
                    key={column.key}
                    aria-sort={getAriaSort(
                      column.key
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onSort(column.key)
                      }
                      className="group flex items-center gap-1.5 font-semibold text-blue-800 dark:text-blue-300"
                    >
                      {column.label}

                      {renderSortIcon(
                        column.key
                      )}
                    </button>
                  </TableHead>
                ))}

                {/* ACTION */}
                <TableHead className="text-right font-semibold text-blue-800 dark:text-blue-300">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            {/* BODY */}
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
                >
                  {/* ID */}
                  <TableCell className="text-muted-foreground">
                    {row.id}
                  </TableCell>

                  {/* PROJECT OFFICE */}
                  <TableCell className="font-semibold">
                    {row.name || "—"}
                  </TableCell>

                  {/* UNIT CODE */}
                  <TableCell>
                    <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold dark:bg-slate-800">
                      {row.unitCode || "—"}
                    </code>
                  </TableCell>

                  {/* SAP CODE */}
                  <TableCell className="tabular-nums">
                    {row.sapCode || "—"}
                  </TableCell>

                  {/* CORRIDOR */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-0 ring-1"
                    >
                      {row.corridor || "—"}
                    </Badge>
                  </TableCell>

                  {/* ACTION */}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onEdit(row)
                      }
                      className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* EMPTY */}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    {query ? (
                      <>
                        No project offices match{" "}
                        <span className="font-medium text-foreground">
                          "{query}"
                        </span>
                        . Try a different search.
                      </>
                    ) : (
                      "No project offices found."
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
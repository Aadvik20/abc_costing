import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type ProjectOfficeToolbarProps = {
  search: string;
  pageSize: number;
  pageSizes: number[];
  onSearchChange: (value: string) => void;
  onPageSizeChange: (value: number) => void;
};

export function ProjectOfficeToolbar({
  search,
  pageSize,
  pageSizes,
  onSearchChange,
  onPageSizeChange,
}: ProjectOfficeToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search project offices..."
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Rows:
        </span>

        <select
          value={pageSize}
          onChange={(event) =>
            onPageSizeChange(Number(event.target.value))
          }
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
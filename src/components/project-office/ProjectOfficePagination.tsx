import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type ProjectOfficePaginationProps = {
  page: number;
  totalPages: number;
  pageNumbers: number[];
  totalItems: number;
  onPageChange: (page: number) => void;
};

export function ProjectOfficePagination({
  page,
  totalPages,
  pageNumbers,
  totalItems,
  onPageChange,
}: ProjectOfficePaginationProps) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {totalItems} records
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageNumbers.map((number) => (
          <Button
            key={number}
            variant={
              number === page
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => onPageChange(number)}
          >
            {number}
          </Button>
        ))}

        <Button
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
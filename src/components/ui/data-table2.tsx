import React from 'react';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { ArrowUp, ArrowDown, ArrowUpDown, ListFilter, Search, ChevronRight, ChevronLeft } from 'lucide-react';

import { Input } from './input';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Checkbox } from './checkbox';

interface TableListProps {
  data: any[];
  columns: any[];
  isInputEnd?: boolean;
  showFilter?: boolean;
  inputPlaceholder?: string;
  rightElements?: React.ReactNode;
  showSearchInput?: boolean;
  onRowClick?: (rowData: any) => void;
  rowClassName?: (row: any) => string;
}

export default function TableList2({
  data,
  columns,
  showFilter = false,
  showSearchInput = false,
  rightElements,
  inputPlaceholder = 'Search...',
  onRowClick,
  rowClassName,
}: TableListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState<string>('');

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.pktblSapDump, 

    enableSorting: true,
    enableColumnFilters: true,
    enableSortingRemoval: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const totalPages = table.getPageCount();
  const currentRangeStart = pageIndex * pageSize + 1;
  const currentRangeEnd = Math.min((pageIndex + 1) * pageSize, totalRows);

  const getPaginationButtons = () => {
    const maxVisible = 5;
    const pages: any[] = [];

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(0, pageIndex - 2);
      const end = Math.min(totalPages - 1, pageIndex + 2);

      if (start > 0) pages.push(0);
      if (start > 1) pages.push('ellipsis-start');

      for (let i = start; i <= end; i++) pages.push(i);

      if (end < totalPages - 2) pages.push('ellipsis-end');
      if (end < totalPages - 1) pages.push(totalPages - 1);
    }

    return pages;
  };

  const paginationButtons = getPaginationButtons();

  return (
    <div className="w-full space-y-4">
      {(showSearchInput || showFilter || rightElements) && (
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          {showSearchInput && (
            <Input
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              placeholder={inputPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="sm:w-72"
            />
          )}
          {rightElements}
        </div>
      )}

      <div className="overflow-auto h-[600px] rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-primary text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-center"
                    onClick={index === 0 ? undefined : header.column.getToggleSortingHandler()}
                  >
                    <div className="flex justify-center items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <ArrowUp size={14} />}
                      {header.column.getIsSorted() === 'desc' && <ArrowDown size={14} />}
                      {!header.column.getIsSorted() && header.column.getCanSort() && <ArrowUpDown size={14} />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`hover:bg-blue-50 cursor-pointer ${rowClassName?.(row) || ''}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-center"
                   
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-xs">
        <div>
          Showing {currentRangeStart}-{currentRangeEnd} of {totalRows}
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft />
          </Button>
          {paginationButtons.map((btn, i) =>
            typeof btn === 'string' ? (
              <span key={i}>…</span>
            ) : (
              <Button key={btn} size="sm" variant={btn === pageIndex ? 'default' : 'secondary'} onClick={() => table.setPageIndex(btn)}>
                {btn + 1}
              </Button>
            )
          )}
          <Button size="sm" variant="outline" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

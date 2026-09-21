import React, { useState, useEffect, useMemo } from 'react';
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
  ColumnDef,
} from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ArrowUpDown, ListFilter, Search, ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, X, Inbox, RotateCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';

export interface ReportTableProps {
  data: any[];
  columns: ColumnDef<any, any>[];
  isInputEnd?: boolean;
  showFilter?: boolean;
  showRefresh?: boolean;
  inputPlaceholder?: string;
  rightElements?: React.ReactNode;
  showSearchInput?: boolean;
  onRefresh?: () => void;
  onRowClick?: (rowData: any) => void;
  rowClassName?: (row: any) => string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  data = [],
  columns = [],
  showFilter = false,
  showRefresh = false,
  showSearchInput = false,
  rightElements,
  inputPlaceholder = 'Filter grid...',
  onRowClick,
  rowClassName,
  onRefresh,
  pageSizeOptions = [25, 50, 75, 100, 200],
  initialPageSize = 25,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // SAP Custom Universal Sorting
  const sortedData = useMemo(() => {
    if (!sortField || !sortOrder || !Array.isArray(data)) {
      return data;
    }

    return [...data].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      const isEmptyA = valA === null || valA === undefined || valA === '';
      const isEmptyB = valB === null || valB === undefined || valB === '';

      if (isEmptyA && isEmptyB) return 0;
      if (isEmptyA) return 1;
      if (isEmptyB) return -1;

      if (!isNaN(Number(valA)) && !isNaN(Number(valB))) {
        return sortOrder === 'asc' ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }

      const isDateA = !isNaN(Date.parse(valA));
      const isDateB = !isNaN(Date.parse(valB));
      if (isDateA && isDateB && typeof valA !== 'number' && typeof valB !== 'number') {
        return sortOrder === 'asc' ? new Date(valA).getTime() - new Date(valB).getTime() : new Date(valB).getTime() - new Date(valA).getTime();
      }

      const strA = String(valA);
      const strB = String(valB);
      const comparison = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
        setSorting([{ id: field, desc: true }]);
      } else if (sortOrder === 'desc') {
        setSortField(null);
        setSortOrder(null);
        setSorting([]);
      } else {
        setSortOrder('asc');
        setSorting([{ id: field, desc: false }]);
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
      setSorting([{ id: field, desc: false }]);
    }
  };

  const table = useReactTable({
    data: sortedData,
    columns,
    enableColumnFilters: true,
    enableSortingRemoval: true,
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
    initialState: {
      pagination: { pageSize: initialPageSize },
    },
  });

  const hasCheckboxColumn = columns.some((column: any) => column.id === 'select');
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const totalPages = table.getPageCount();
  const currentRangeStart = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const currentRangeEnd = Math.min((pageIndex + 1) * pageSize, totalRows);
  const [goToPage, setGoToPage] = useState<string>('1');

  useEffect(() => {
    setGoToPage(String(pageIndex + 1));
  }, [pageIndex]);

  const getPaginationButtons = () => {
    const maxVisible = 5;

    const pages: (number | string)[] = [];

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

  const renderSortIcon = (columnId: string, canSort: boolean) => {
    if (!canSort) return null;
    if (sortField !== columnId) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60 group-hover:opacity-100 shrink-0" />;
    }
    if (sortOrder === 'asc') {
      return <ArrowUp className="h-3 w-3 text-amber-300 shrink-0" strokeWidth={3} />;
    }
    if (sortOrder === 'desc') {
      return <ArrowDown className="h-3 w-3 text-amber-300 shrink-0" strokeWidth={3} />;
    }
    return <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60 shrink-0" />;
  };

  return (
    <div className="w-full font-sans text-xs ">
      {/* SAP Toolbar Header */}
      {(showSearchInput || showFilter || rightElements || showRefresh) && (
        <div className="flex flex-col sm:flex-row w-full justify-between items-stretch sm:items-center gap-2 bg-[#f0f3f6] p-2 rounded-t-md border border-slate-300 border-b-0">
          <div className="flex gap-2 items-center">
            {showFilter && (
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-white hover:bg-slate-50 border-slate-300 text-slate-700 font-medium flex items-center gap-1.5 shadow-2xs"
                >
                  <ListFilter className="w-3.5 h-3.5 text-slate-500" />
                  <span>Columns</span>
                </Button>
                <div className="absolute z-40 hidden group-hover:block top-full left-0 mt-1 w-52 bg-white border border-slate-300 rounded shadow-md text-xs">
                  <div className="p-1.5 space-y-0.5 max-h-64 overflow-y-auto">
                    {table.getAllLeafColumns().map((column) => {
                      if (column.getCanHide()) {
                        return (
                          <div key={column.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-sky-50 cursor-pointer rounded">
                            <Checkbox id={`column-toggle-${column.id}`} checked={column.getIsVisible()} onCheckedChange={() => column.toggleVisibility()} />
                            <label htmlFor={`column-toggle-${column.id}`} className="text-xs text-slate-700 cursor-pointer font-medium">
                              {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                            </label>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            )}
            {rightElements}
          </div>

          {showSearchInput && (
            <div className="flex gap-1.5 items-center">
              <div className="relative">
                <Input
                  prefix={<Search className="h-3.5 w-3.5 text-slate-400" />}
                  placeholder={inputPlaceholder}
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="h-7 w-full sm:w-64 text-xs bg-white border-slate-300 focus:border-sky-600 rounded shadow-2xs pl-8 placeholder:text-slate-400"
                />
              </div>
              {showRefresh && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => (globalFilter ? setGlobalFilter('') : onRefresh?.())}
                  className="h-7 px-2.5 text-xs bg-white border-slate-300 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1 shadow-2xs"
                >
                  {globalFilter ? (
                    <>
                      <X className="h-3.5 w-3.5 text-rose-500" />
                      <span>Clear</span>
                    </>
                  ) : (
                    <>
                      <RotateCw className="h-3.5 w-3.5 text-slate-500" />
                      <span>Refresh</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main SAP Grid Frame */}
      <div className="bg-white border border-slate-300 shadow-2xs flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse table-fixed">
            <thead className="bg-[#1d2d3e] sticky top-0 z-20 text-white font-semibold uppercase tracking-wider border-b-2 border-slate-400 select-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnDef = header.column.columnDef as any;
                    const canSort = columnDef.enableSorting ?? header.column.getCanSort();
                    const columnId = header.column.id;

                    return (
                      <th
                        key={header.id}
                        style={{
                          width: columnDef.size ? `${columnDef.size}px` : undefined,
                          minWidth: columnDef.size ? `${columnDef.size}px` : '100px',
                        }}
                        className={`group px-3 py-2 text-center whitespace-nowrap border-r border-[#2c3e50] last:border-r-0 ${
                          canSort ? 'cursor-pointer hover:bg-[#2c3e50] transition-colors' : ''
                        }`}
                        onClick={() => {
                          if (canSort) handleSort(columnId);
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="truncate">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                            {renderSortIcon(columnId, canSort)}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#f4f6f9]'
                    } hover:bg-[#e8f0fe] active:bg-[#d2e3fc] transition-colors cursor-pointer border-b border-slate-200 ${rowClassName?.(row) || ''}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{
                          width: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : undefined,
                          minWidth: cell.column.columnDef.size ? `${cell.column.columnDef.size}px` : '100px',
                        }}
                        className="px-3 py-1.5 text-slate-800 whitespace-nowrap truncate border-r border-slate-200 last:border-r-0"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={table.getVisibleLeafColumns().length || columns.length} className="text-center py-12 text-slate-500 bg-slate-50">
                    <div className="flex flex-col items-center justify-center">
                      <Inbox className="h-9 w-9 stroke-1 text-slate-400 mb-1.5" />
                      <p className="text-xs font-semibold text-slate-600">No data records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SAP Compact Pagination Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <span>
              {hasCheckboxColumn
                ? `${table.getSelectedRowModel().flatRows.length} of ${totalRows} row(s) selected`
                : `Showing ${currentRangeStart}-${currentRangeEnd} of ${totalRows} entries`}
            </span>

            <div className="flex items-center gap-1.5 border-l border-slate-300 pl-4">
              <span>Rows per page:</span>
              <select
                className="border border-slate-300 rounded px-1.5 py-0.5 text-xs bg-white text-slate-800 focus:outline-hidden focus:border-sky-600"
                value={pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap justify-end items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Go to page</span>

              <Input
                type="text"
                inputMode="numeric"
                value={goToPage}
                onChange={(e) => {
                  const value = e.target.value;

                  setGoToPage(value);

                  if (value === '') return;

                  const page = Number(value) - 1;

                  if (!isNaN(page) && page >= 0 && page < totalPages) {
                    table.setPageIndex(page);
                  }
                }}
                onBlur={() => {
                  if (goToPage === '') {
                    setGoToPage(String(pageIndex + 1));
                  }
                }}
                className="w-12 h-8 text-xs"
              />
            </div>

            <Button variant="outline" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {Array.from(new Set(getPaginationButtons())).map((button, index) => {
              if (button === 'ellipsis-start' || button === 'ellipsis-end') {
                return (
                  <span key={`ellipsis-${index}`} className="px-1 text-gray-400 text-xs">
                    ...
                  </span>
                );
              }

              return (
                <Button
                  variant="outline"
                  size="sm"
                  key={`page-${button}`}
                  className={`text-xs ${button === pageIndex ? 'bg-[#1d2d3e] text-white hover:bg-[#2c3e50]' : ''}`}
                  onClick={() => table.setPageIndex(button as number)}
                >
                  {(button as number) + 1}
                </Button>
              );
            })}

            <Button variant="outline" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTable;

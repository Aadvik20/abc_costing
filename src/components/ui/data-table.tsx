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
import { ChevronLeft, ChevronRight, ListFilter, RefreshCw, Search, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';


interface TableListProps {
  data: any[];
  columns: any[];
  isInputEnd?: boolean;
  showFilter?: boolean;
  showRefresh?: boolean;
  inputPlaceholder?: string;
  rightElements?: React.ReactNode;
  onRowClick?: (rowData: any) => void;
  onRefresh?: () => void;
  rowClassName?: (rowData: any) => string;
  purposeField?: string; // Field name that contains the purpose value
}
export default function TableList({
  data,
  columns,
  isInputEnd = false,
  showFilter = false,
  showRefresh = false,
  rightElements,
  inputPlaceholder = 'Search request by name..... ',
  rowClassName,
  onRowClick,
  onRefresh,
}: TableListProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState<string>('');

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });
  const hasCheckboxColumn = columns.some((column) => column.id === 'select');
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const totalRows = table.getFilteredRowModel().rows.length;
  const totalPages = table.getPageCount();
  const currentRangeStart = pageIndex * pageSize + 1;
  const currentRangeEnd = Math.min((pageIndex + 1) * pageSize, totalRows);

  const getPaginationButtons = () => {
    const maxVisibleButtons = 5;
    const buttons = [];

    if (totalPages <= maxVisibleButtons) {
      // If total pages are less than or equal to max visible buttons, show all
      for (let i = 0; i < totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Show the first, last, current, and surrounding pages
      const start = Math.max(0, pageIndex - 2);
      const end = Math.min(totalPages - 1, pageIndex + 2);

      if (start > 0) buttons.push(0); // Always show the first page
      if (start > 1) buttons.push('ellipsis-start'); // Show ellipsis before the range

      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }

      if (end < totalPages - 2) buttons.push('ellipsis-end'); // Show ellipsis after the range
      if (end < totalPages - 1) buttons.push(totalPages - 1); // Always show the last page
    }

    return buttons;
  };

  const paginationButtons = getPaginationButtons();

  return (
    <div className="w-full">
      <div className={`flex ${isInputEnd ? 'justify-end' : 'justify-start'} w-full`}>
        <div className="flex flex-col md:items-end mt-3 sm:flex-row w-full mb-6 sm:justify-between sm:items-center gap-2">
          {rightElements}
          {showFilter && (
            <Button variant="outline" size="icon" className="p-4">
              <ListFilter className="h-4 w-4 text-secondary-foreground" />
            </Button>
          )}

          <div className="flex gap-2">
            <Input
              prefix={
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
              }
              placeholder={inputPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full placeholder:text-gray-400 sm:w-72"
              type="text"
            />
            {showRefresh && (
              <Button onClick={() => (globalFilter ? setGlobalFilter('') : onRefresh())} className="flex items-center gap-1">
                {globalFilter ? (
                  <>
                    <X className="h-4 w-4" />
                    <span>Clear</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-md border h-[530px] overflow-x-auto overflow-y-auto">
        <Table>
          <TableHeader className="text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-3 py-2 text-white">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  // className={getCombinedRowClassName(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-1">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
        {/* Left side info */}
        <div className="text-sm flex items-center gap-4 text-muted-foreground w-full sm:w-1/3">
          <div>
            {hasCheckboxColumn
              ? `${table.getSelectedRowModel().flatRows.length} of ${totalRows} row(s) selected.`
              : `Showing ${currentRangeStart}-${currentRangeEnd} of ${totalRows}`}
          </div>
          <div className="flex items-center gap-2">
            {/* <span className="text-sm text-muted-foreground">Rows per page:</span> */}
            <select className="border rounded-md px-2 py-1 text-sm" value={pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))}>
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rows per page selector */}

        {/* Pagination buttons */}
        <div className="flex flex-wrap justify-end items-center gap-1">
          <Button variant="outline" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {Array.from(new Set(paginationButtons)).map((button, index) => {
            if (button === 'ellipsis-start' || button === 'ellipsis-end') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }

            return (
              <Button
                variant="outline"
                key={`page-${button}`}
                className={`hover:bg-primary hover:text-white transition-colors duration-300 ease-in-out ${
                  button === pageIndex ? 'bg-primary text-white' : ''
                }`}
                onClick={() => table.setPageIndex(button)}
              >
                {button + 1}
              </Button>
            );
          })}
          <Button variant="outline" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

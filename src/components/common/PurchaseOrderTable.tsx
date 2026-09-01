import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PoDetailsContent from '@/components/dailogs/PoDetailsContent';
import VendorInvoiceDetails from '@/components/dailogs/VendorInvoiceDetails';
import { formatDate, formatDecimal, formatRupees } from '@/lib/helperFunction';
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, Download, Loader2 } from 'lucide-react';

export interface PurchaseOrderRow {
  srNo?: number;
  poNo?: string;
  poOrderValue?: number;
  poType?: string;
  profitCenter?: string;
  poType2?: string;
  bankPayment?: number;
  itTds?: number;
  cgstAmount?: number;
  poDate?: string;
  invoiceDate?: string;
  invoiceNumber?: string;
  sgstAmount?: number;
  igstAmount?: number;
  cgsttds?: number;
  sgsttds?: number;
  igsttds?: number;
  ittds?: number;
  unit?: string;
  month?: string;
  year?: string;
  supplierCode?: string;
  glAccount?: string;
  clubbedFlag?: string;
  paymentDoc?: string;
  clearingDate?: string;
  [key: string]: unknown;
}

interface TableRowItemProps {
  row: PurchaseOrderRow;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (key: string) => void;
  selectedPoType: string;
  renderExpanded?: (row: PurchaseOrderRow) => React.ReactNode;
}

const TableRowItem: React.FC<TableRowItemProps> = React.memo(({ row, index, isExpanded, onToggleExpand, selectedPoType, renderExpanded }) => {
  const poNo = row.poNo || '';
  const invoiceNumber = row.invoiceNumber || '';

  const expandKey = selectedPoType === 'vendorList' ? invoiceNumber : poNo;

  const handleRowClick = () => {
    if (expandKey) {
      onToggleExpand(expandKey);
    }
  };

  return (
    <>
      <tr
        onClick={handleRowClick}
        className={`cursor-pointer transition-colors ${
          row.clubbedFlag === 'Y' ? 'bg-amber-100 hover:bg-amber-100' : isExpanded ? 'bg-blue-50/70' : 'hover:bg-gray-50'
        }`}
      >
        {selectedPoType === 'po' && (
          <td className="px-2 py-1 text-center border-r border-gray-200 select-none">
            {isExpanded ? <ChevronDown className="h-4 w-4 text-blue-600 mx-auto" /> : <ChevronRight className="h-4 w-4 text-blue-600 mx-auto" />}
          </td>
        )}
        <td className="px-2 py-1 border-r border-gray-200 text-left font-bold">{index + 1}</td>
        {selectedPoType === 'po' && (
          <>
            <td className="px-2 py-1 border-r border-gray-200 font-bold text-blue-700 tabular-nums">
              <div className="flex items-center gap-2">
                <span>{poNo || '-'}</span>

                {row.clubbedFlag === 'Y' && (
                  <div title={'This PO is part of a combined payment.'}>
                    <AlertTriangle size={18} className="text-amber-700" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </td>
            <td className="px-2 py-1 border-r border-gray-200">{formatDate(row.poDate) || '-'}</td>
            <td className="px-2 py-1 border-r border-gray-200 text-right tabular-nums">{formatRupees(row.poOrderValue)}</td>
          </>
        )}
        {['non-po', 'vendor-salary', 'vendor-adv'].includes(selectedPoType) && (
          <>
            <td className="px-2 py-1 border-r border-gray-200 font-bold text-blue-700 tabular-nums">
              <div className="flex items-center gap-2">
                <span>{row.invoiceNumber || '-'}</span>

                {row.clubbedFlag === 'Y' && (
                  <div title={'This invoice is part of a combined payment.'}>
                    <AlertTriangle size={18} className="text-amber-700" strokeWidth={2.5} />
                  </div>
                )}
              </div>
            </td>
            <td className="px-2 py-1 border-r border-gray-200 font-bold text-blue-700">{formatDate(row.invoiceDate) || '-'}</td>
          </>
        )}
        <td className="px-2 py-1 border-r border-gray-200">{row.glAccount || '-'}</td>
        <td className="px-2 py-1 border-r border-gray-200">
          <TooltipProvider delayDuration={0} skipDelayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="
                      max-w-[180px]
                      truncate
                      cursor-pointer
                      rounded-md
                      px-2 py-1
                      transition-all duration-150
                      hover:bg-primary/10
                      hover:text-primary
                      hover:ring-1
                      hover:ring-primary/20
                    "
                >
                  {row.supplierCode || '-'}
                </div>
              </TooltipTrigger>

              <TooltipContent
                side="top"
                sideOffset={5}
                className="
                    max-w-md
                    break-words
                    rounded-md
                    bg-blue-700
                    px-3 py-2
                    text-xs
                    font-medium
                    text-white
                    shadow-lg
                  "
              >
                <p>{row.supplierCode || '-'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </td>
        <td className="px-2 py-1 border-r border-gray-200" onClick={(e) => e.stopPropagation()}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[100px] truncate cursor-pointer">{row.poType || '-'}</div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md break-words">
                <p>{row.poType || '-'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </td>
        <td className="px-2 py-1 border-r border-gray-200">{row.unit || '-'}</td>
        {selectedPoType !== 'po' && (
          <>
            <td className="px-2 py-1 border-r border-gray-200">{row.paymentDoc || '-'}</td>
            <td className="px-2 py-1 border-r border-gray-200">{formatDate(row.clearingDate) || '-'}</td>
          </>
        )}
        <td className="px-2 py-1 border-r border-gray-200 text-right tabular-nums">{formatRupees(row.bankPayment)}</td>
        <td className="px-2 py-1 border-r border-gray-200 text-right tabular-nums">{formatDecimal(row.cgstAmount)}</td>
        <td className="px-2 py-1 border-r border-gray-200 text-right tabular-nums">{formatDecimal(row.cgsttds)}</td>
        <td className="px-2 py-1 border-r border-gray-200 text-right tabular-nums">{formatDecimal(row.sgstAmount)}</td>
        <td className="px-2 py-1 border-r border-gray-200 text-right tabular-nums">{formatDecimal(row.sgsttds)}</td>
        <td className="px-2 py-1 border-r border-gray-200 text-right tabular-nums">{formatDecimal(row.igstAmount)}</td>
        <td className="px-2 py-1 border-r border-gray-200 text-right tabular-nums">{formatDecimal(row.igsttds)}</td>
        <td className="px-2 py-1 text-right tabular-nums">{formatDecimal(row.ittds)}</td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-100/80">
          <td colSpan={selectedPoType === 'po' ? 17 : 14} className="p-2 border-b border-gray-300 min-w-full">
            <div className="bg-white p-2 rounded-lg shadow-inner border border-gray-200">
              {renderExpanded ? (
                renderExpanded(row)
              ) : selectedPoType === 'vendorList' ? (
                <VendorInvoiceDetails invoiceNumber={invoiceNumber} />
              ) : (
                <PoDetailsContent poNumber={poNo} unit={row.unit} />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

TableRowItem.displayName = 'TableRowItem';

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100, 200];

export interface PurchaseOrderTableProps {
  data: PurchaseOrderRow[];
  selectedPoType: string;
  exporting?: boolean;
  onExport?: () => void;
  actionHeaderLeft?: React.ReactNode;
  actionHeaderRight?: React.ReactNode;
  showActionHeader?: boolean;
  renderExpanded?: (row: PurchaseOrderRow) => React.ReactNode;
  maxHeight?: string;
  overFlow?: string;
  className?: string;
  initialPageSize?: number;
}

export const PurchaseOrderTable: React.FC<PurchaseOrderTableProps> = ({
  data,
  selectedPoType,
  exporting = false,
  onExport,
  actionHeaderLeft,
  actionHeaderRight,
  showActionHeader = true,
  renderExpanded,
  maxHeight,
  overFlow,
  className = '',
  initialPageSize = 25,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [expandedPoNumbers, setExpandedPoNumbers] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof PurchaseOrderRow | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Reset pagination, expansion, and sorting when selectedPoType changes
  useEffect(() => {
    setCurrentPage(1);
    setExpandedPoNumbers(new Set());
    setSortField(null);
    setSortOrder(null);
  }, [selectedPoType]);

  const handleSort = (field: keyof PurchaseOrderRow) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortField(null);
        setSortOrder(null);
      } else {
        setSortOrder('asc');
      }
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field: keyof PurchaseOrderRow) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />;
    }
    if (sortOrder === 'asc') {
      return <ArrowUp className="h-3.5 w-3.5 text-yellow-300 shrink-0" strokeWidth={2.5} />;
    }
    return <ArrowDown className="h-3.5 w-3.5 text-yellow-300 shrink-0" strokeWidth={2.5} />;
  };

  const getExpandKey = useCallback(
    (row: PurchaseOrderRow) => {
      return selectedPoType === 'vendorList' ? row.invoiceNumber || '' : row.poNo || '';
    },
    [selectedPoType]
  );

  const toggleRowExpansion = useCallback((key?: string) => {
    if (!key) return;
    setExpandedPoNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const expandAllRows = useCallback(
    (dataToExpand: PurchaseOrderRow[]) => {
      setExpandedPoNumbers((prev) => {
        const next = new Set(prev);
        dataToExpand.forEach((row) => {
          const key = getExpandKey(row);
          if (key) {
            next.add(key);
          }
        });
        return next;
      });
    },
    [getExpandKey]
  );

  const collapseAllRows = useCallback(
    (dataToCollapse?: PurchaseOrderRow[]) => {
      setExpandedPoNumbers((prev) => {
        if (!dataToCollapse) return new Set();
        const next = new Set(prev);
        dataToCollapse.forEach((row) => {
          const key = getExpandKey(row);
          if (key) {
            next.delete(key);
          }
        });
        return next;
      });
    },
    [getExpandKey]
  );

  const sortedData = useMemo(() => {
    if (!sortField || !sortOrder) {
      return data;
    }

    const numericFields = new Set(['poOrderValue', 'bankPayment']);
    const dateFields = new Set(['poDate', 'invoiceDate']);

    return [...data].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      const isEmptyA = valA == null || valA === '';
      const isEmptyB = valB == null || valB === '';

      if (isEmptyA && isEmptyB) return 0;
      if (isEmptyA) return 1;
      if (isEmptyB) return -1;

      if (numericFields.has(sortField as string)) {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }

      if (dateFields.has(sortField as string)) {
        const dateA = new Date(valA as string).getTime();
        const dateB = new Date(valB as string).getTime();
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }

      const strA = String(valA);
      const strB = String(valB);
      const comparison = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const startIndex = sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, sortedData.length);

  const isAllPageExpanded = useMemo(() => {
    if (!paginatedData || paginatedData.length === 0) return false;
    return paginatedData.every((row) => {
      const key = getExpandKey(row);
      return !!key && expandedPoNumbers.has(key);
    });
  }, [paginatedData, expandedPoNumbers, getExpandKey]);

  return (
    <div className="space-y-3">
      {showActionHeader && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-3 items-center flex-wrap">{actionHeaderLeft}</div>
          <div className="flex gap-3 items-center ml-auto">
            {actionHeaderRight}
            {selectedPoType === 'po' && (
              <button
                disabled={paginatedData.length === 0}
                type="button"
                aria-label={isAllPageExpanded ? 'Collapse all on page' : 'Expand all on page'}
                onClick={() => {
                  if (isAllPageExpanded) {
                    collapseAllRows(paginatedData);
                  } else {
                    expandAllRows(paginatedData);
                  }
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-semibold text-sm rounded-lg shadow-sm border border-slate-700/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAllPageExpanded ? (
                  <>
                    <ChevronDown className="h-4 w-4 text-slate-300" />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                    <span>Expand All</span>
                  </>
                )}
              </button>
            )}
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                disabled={exporting || !paginatedData.length}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-lg shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                    <span>Generating Excel...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 text-white" />
                    <span>Export Excel</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      <div className={`bg-white rounded-xl border-gray-200 shadow-sm flex flex-col ${className}`}>
        <div className={`${overFlow || ''} ${maxHeight || ''}`}>
          <table className="min-w-full text-sm border-seperate border-spacing-0">
            <thead className="bg-primary sticky top-0 z-20 text-white font-bold text-xs uppercase border-b border-gray-300">
              <tr>
                {selectedPoType === 'po' && (
                  <th
                    className="px-2 py-2 text-center border-r border-gray-200 cursor-pointer select-none hover:bg-primary-dark transition-colors"
                    title={isAllPageExpanded ? 'Collapse all on page' : 'Expand all on page'}
                    onClick={() => {
                      if (isAllPageExpanded) {
                        collapseAllRows(paginatedData);
                      } else {
                        expandAllRows(paginatedData);
                      }
                    }}
                  >
                    {isAllPageExpanded ? <ChevronDown className="h-5 w-5 text-white mx-auto" /> : <ChevronRight className="h-5 w-5 text-white mx-auto" />}
                  </th>
                )}
                <th className="w-16 px-2 py-2 text-left border-r border-gray-200">Sr. No.</th>
                {selectedPoType === 'po' && (
                  <>
                    <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[110px]">PO No</th>
                    <th
                      onClick={() => handleSort('poDate')}
                      className="px-2 py-2 text-left border-r border-gray-200 min-w-[130px] cursor-pointer select-none hover:bg-blue-700/80 transition-colors group"
                      title="Sort by PO Date"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>PO Date</span>
                        {renderSortIcon('poDate')}
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('poOrderValue')}
                      className="px-2 py-2 text-right border-r border-gray-200 min-w-[160px] cursor-pointer select-none hover:bg-blue-700/80 transition-colors group"
                      title="Sort by PO Amount"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>PO Amount</span>
                        {renderSortIcon('poOrderValue')}
                      </div>
                    </th>
                  </>
                )}
                {['non-po', 'vendor-salary', 'vendor-adv'].includes(selectedPoType) && (
                  <>
                    <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[110px]">Invoice No</th>
                    <th
                      onClick={() => handleSort('invoiceDate')}
                      className="px-2 py-2 text-left border-r border-gray-200 min-w-[140px] cursor-pointer select-none hover:bg-blue-700/80 transition-colors group"
                      title="Sort by Invoice Date"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>Invoice Date</span>
                        {renderSortIcon('invoiceDate')}
                      </div>
                    </th>
                  </>
                )}
                <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[120px]">GL Account</th>
                <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[180px]">Supplier Code</th>
                <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[120px]">PO Type</th>
                <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[120px]">Unit</th>
                {selectedPoType !== 'po' && (
                  <>
                    <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[140px]">Payment Doc No</th>
                    <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[140px]">Clearing Date</th>
                  </>
                )}
                <th
                  onClick={() => handleSort('bankPayment')}
                  className="px-2 py-2 text-right border-r border-gray-200 min-w-[150px] cursor-pointer select-none hover:bg-blue-700/80 transition-colors group"
                  title="Sort by Bank Payment"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Bank Payment</span>
                    {renderSortIcon('bankPayment')}
                  </div>
                </th>
                <th className="px-2 py-2 text-right border-r border-gray-200 min-w-[100px]">CGST</th>
                <th className="px-2 py-2 text-right border-r border-gray-200 min-w-[100px]">CGST TDS</th>
                <th className="px-2 py-2 text-right border-r border-gray-200 min-w-[100px]">SGST</th>
                <th className="px-2 py-2 text-right border-r border-gray-200 min-w-[100px]">SGST TDS</th>
                <th className="px-2 py-2 text-right border-r border-gray-200 min-w-[100px]">IGST</th>
                <th className="px-2 py-2 text-right border-r border-gray-200 min-w-[110px]">IGST TDS</th>
                <th className="px-2 py-2 text-right min-w-[110px]">IT TDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium text-gray-900">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={selectedPoType === 'po' ? 17 : 14} className="p-8 text-center text-gray-500">
                    <p className="font-medium">No matching records found.</p>
                    <p className="text-sm mt-1">Please select a date range to search for records.</p>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => {
                  const expandKey = getExpandKey(row);
                  const isExpanded = !!expandKey && expandedPoNumbers.has(expandKey);
                  const globalIndex = (currentPage - 1) * pageSize + index;
                  return (
                    <TableRowItem
                      key={`${expandKey}-${index}`}
                      row={row}
                      index={globalIndex}
                      isExpanded={isExpanded}
                      onToggleExpand={toggleRowExpansion}
                      selectedPoType={selectedPoType}
                      renderExpanded={renderExpanded}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium text-gray-700">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="p-1.5 border border-gray-300 rounded-md bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              Showing <span className="font-bold">{startIndex}</span> to <span className="font-bold">{endIndex}</span> of{' '}
              <span className="font-bold">{sortedData.length}</span> entries
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm transition"
            >
              Previous
            </button>
            <span className="px-2 text-xs sm:text-sm font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderTable;

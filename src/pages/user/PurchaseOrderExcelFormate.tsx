import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Loader from '@/components/ui/loader';
import PoDetailsContent from '@/components/dailogs/PoDetailsContent';
import { formatDate, formatDecimal, formatRupees } from '@/lib/helperFunction';
import { ChevronDown, ChevronRight, Download, Loader2 } from 'lucide-react';
import TransferAxiosInstance from '@/services/TransferAxiosInstance';
import { useSearchParams } from 'react-router';
import { exportPaginatedPoExcel } from '@/components/admin/exportPoExcel';

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
  sgstAmount?: number;
  igstAmount?: number;
  cgsttds?: number;
  sgsttds?: number;
  igsttds?: number;
  ittds?: number;
  unit?: string;
  month?: string;
  year?: string;
  [key: string]: unknown;
}

interface TableRowItemProps {
  row: PurchaseOrderRow;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (poNo: string) => void;
}

const TableRowItem: React.FC<TableRowItemProps> = React.memo(({ row, index, isExpanded, onToggleExpand }) => {
  const poNo = row.poNo || '';
  const handleRowClick = () => {
    if (poNo) {
      onToggleExpand(poNo);
    }
  };

  return (
    <>
      <tr onClick={handleRowClick} className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/70' : 'hover:bg-gray-50'}`}>
        <td className="px-3 py-3 text-center border-r border-gray-200 select-none">
          {isExpanded ? <ChevronDown className="h-4 w-4 text-blue-600 mx-auto" /> : <ChevronRight className="h-4 w-4 text-blue-600 mx-auto" />}
        </td>
        <td className="px-3 py-3 border-r border-gray-200 text-left font-bold">{index + 1}</td>
        <td className="px-4 py-3 border-r border-gray-200 font-bold text-blue-700">{poNo || '-'}</td>
        <td className="px-4 py-3 border-r border-gray-200 font-bold text-blue-700">{formatDate(row.poDate) || '-'}</td>
        <td className="px-4 py-3 border-r border-gray-200 text-right">{formatRupees(row.poOrderValue)}</td>
        <td className="px-4 py-3 border-r border-gray-200" onClick={(e) => e.stopPropagation()}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[160px] truncate cursor-pointer">{row.poType || '-'}</div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md break-words">
                <p>{row.poType || '-'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </td>
        <td className="px-2 py-3 border-r border-gray-200">{row.unit || '-'}</td>
        <td className="px-4 py-3 border-r border-gray-200 text-right">{formatRupees(row.bankPayment)}</td>
        <td className="px-4 py-3 border-r border-gray-200 text-right">{formatDecimal(row.cgstAmount)}</td>
        <td className="px-4 py-3 border-r border-gray-200 text-right">{formatDecimal(row.cgsttds)}</td>
        <td className="px-4 py-3 border-r border-gray-200 text-right">{formatDecimal(row.sgstAmount)}</td>
        <td className="px-4 py-3 border-r border-gray-200 text-right">{formatDecimal(row.sgsttds)}</td>
        <td className="px-4 py-3 border-r border-gray-200 text-right">{formatDecimal(row.igstAmount)}</td>
        <td className="px-4 py-3 border-r border-gray-200 text-right">{formatDecimal(row.igsttds)}</td>
        <td className="px-4 py-3 text-right">{formatDecimal(row.ittds)}</td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-100/80">
          <td colSpan={14} className="p-4 border-b border-gray-300">
            <div className="bg-white p-4 rounded-lg shadow-inner border border-gray-200">
              <PoDetailsContent poNumber={poNo} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

TableRowItem.displayName = 'TableRowItem';

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100, 200];

const PurchaseOrderExcelFormate: React.FC = () => {
  const [data, setData] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [expandedPoNumbers, setExpandedPoNumbers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [units, setUnits] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string>(searchParams.get('fromDate') || '');
  const [toDate, setToDate] = useState<string>(searchParams.get('toDate') || '');
  const [dateError, setDateError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [exporting, setExporting] = useState(false);

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromDate(value);
    if (toDate && value && new Date(value) > new Date(toDate)) {
      setDateError('"From Date" cannot be greater than "To Date".');
    } else {
      setDateError(null);
    }
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToDate(value);
    if (fromDate && value && new Date(fromDate) > new Date(value)) {
      setDateError('"To Date" cannot be earlier than "From Date".');
    } else {
      setDateError(null);
    }
  };
  const fetchPurchaseOrders = async () => {
    if (!fromDate && !toDate) return;
    const params = new URLSearchParams(searchParams);

    if (fromDate) {
      params.set('fromDate', fromDate);
    } else {
      params.delete('fromDate');
    }

    if (toDate) {
      params.set('toDate', toDate);
    } else {
      params.delete('toDate');
    }

    setSearchParams(params);
    try {
      setLoading(true);
      let url = '/SapPo';

      if (fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }
      const res = await TransferAxiosInstance.get(url);
      setData(res.data.data ?? []);
      setUnits(res.data.units ?? []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch Purchase Order data.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const toggleRowExpansion = useCallback((poNo?: string) => {
    if (!poNo) return;
    setExpandedPoNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(poNo)) {
        next.delete(poNo);
      } else {
        next.add(poNo);
      }
      return next;
    });
  }, []);
  const expandAllRows = useCallback((dataToExpand: PurchaseOrderRow[]) => {
    setExpandedPoNumbers((prev) => {
      const next = new Set(prev);
      dataToExpand.forEach((row) => {
        if (row.poNo) {
          next.add(row.poNo);
        }
      });
      return next;
    });
  }, []);
  const handleExportPage = async () => {
    setExporting(true);
    try {
      await exportPaginatedPoExcel(paginatedData, fromDate, toDate);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };
  const collapseAllRows = useCallback((dataToCollapse?: PurchaseOrderRow[]) => {
    setExpandedPoNumbers((prev) => {
      if (!dataToCollapse) return new Set(); // Clears everything
      const next = new Set(prev);
      dataToCollapse.forEach((row) => {
        if (row.poNo) {
          next.delete(row.poNo);
        }
      });
      return next;
    });
  }, []);
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (selectedUnit && row.unit !== selectedUnit) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return Object.values(row).some((val) => {
          if (val == null) {
            return false;
          }
          if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
            return val.toString().toLowerCase().includes(query);
          }
          return false;
        });
      }
      return true;
    });
  }, [data, selectedUnit, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUnit, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSelectedUnit('');
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setDateError(null);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  const startIndex = filteredData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredData.length);
  const isAllPageExpanded = useMemo(() => {
    if (!paginatedData || paginatedData.length === 0) return false;
    return paginatedData.every((row) => row.poNo && expandedPoNumbers.has(row.poNo));
  }, [paginatedData, expandedPoNumbers]);
  return (
    <div className="p-4 sm:p-6 space-y-5 bg-gray-50 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Purchase Order Excel Format</h1>
      <div className="p-4 sm:p-5 bg-white rounded-xl shadow-sm border border-gray-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-3">
            <label htmlFor="unit-select" className="block text-xs font-semibold text-gray-700 mb-1">
              Unit <span className="text-gray-400 font-normal">(Instant Filter)</span>
            </label>
            <select
              id="unit-select"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
            >
              <option value="">All Units</option>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label htmlFor="search-query" className="block text-xs font-semibold text-gray-700 mb-1">
              Search Query
            </label>
            <div className="relative">
              <input
                id="search-query"
                type="text"
                placeholder="PO, Profit Center..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
              />
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="from-date" className="block text-xs font-semibold text-gray-700 mb-1">
              From Date
            </label>
            <input
              min="2026-07-01"
              id="from-date"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={handleFromDateChange}
              className={`w-full h-10 px-2.5 border rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:outline-none transition ${
                dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
          <div className="lg:col-span-2">
            <label htmlFor="to-date" className="block text-xs font-semibold text-gray-700 mb-1">
              To Date
            </label>
            <input
              id="to-date"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={handleToDateChange}
              className={`w-full h-10 px-2.5 border rounded-lg text-sm font-medium text-gray-800 focus:ring-2 focus:outline-none transition ${
                dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
          <div className="lg:col-span-2 flex items-center gap-1.5 sm:col-span-2">
            <button
              type="button"
              onClick={fetchPurchaseOrders}
              disabled={Boolean(dateError)}
              className="flex-1 h-10 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-sm rounded-lg shadow-sm transition duration-150 flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              title="Clear all filters"
              className="h-10 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-lg border border-gray-300 transition duration-150 whitespace-nowrap"
            >
              Clear
            </button>
          </div>
        </div>
        {dateError && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 pt-0.5">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {dateError}
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-3">
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
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-semibold text-sm rounded-lg shadow-sm border border-slate-700/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
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
        <button
          type="button"
          onClick={handleExportPage}
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
      </div>

      {loading && <Loader />}
      {!loading && error && <div className="p-8 text-center text-red-600 font-bold bg-white rounded-xl border border-gray-200 shadow-sm">{error}</div>}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-primary text-white sticky top-0 z-10 font-bold text-xs uppercase border-b border-gray-300">
                <tr>
                  <th
                    className="w-10 px-3 py-3 text-center border-r border-gray-200 cursor-pointer select-none hover:bg-primary-dark transition-colors"
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
                  <th className="w-16 px-3 py-3 text-left border-r border-gray-200">Sr. No.</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200 min-w-[120px]">PO No</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200 min-w-[140px]">PO Date</th>
                  <th className="px-4 py-3 text-right border-r border-gray-200 min-w-[160px]">PO Amount</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200 min-w-[100px]">
                    <div className="flex flex-col">
                      <span>PO Type</span>
                      <span className="text-[10px] lowercase text-white font-normal">(capex, opex, deposit work)</span>
                    </div>
                  </th>
                  <th className="px-2 py-3 text-left border-r border-gray-200 min-w-[140px]">Unit</th>
                  <th className="px-4 py-3 text-right border-r border-gray-200 min-w-[160px]">Bank Payment</th>
                  <th className="px-4 py-3 text-right border-r border-gray-200 min-w-[100px]">CGST</th>
                  <th className="px-4 py-3 text-right border-r border-gray-200 min-w-[100px]">CGST TDS</th>
                  <th className="px-4 py-3 text-right border-r border-gray-200 min-w-[100px]">SGST</th>
                  <th className="px-4 py-3 text-right border-r border-gray-200 min-w-[100px]">SGST TDS</th>
                  <th className="px-4 py-3 text-right border-r border-gray-200 min-w-[100px]">IGST</th>
                  <th className="px-4 py-3 text-right border-r border-gray-200 min-w-[110px]">IGST TDS</th>
                  <th className="px-4 py-3 text-right min-w-[110px]">IT TDS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-semibold text-gray-800">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="p-8 text-center text-gray-500">
                      <p className="font-medium">No matching records found.</p>
                      <p className="text-sm mt-1">Please select a date range to search for records.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => {
                    const poNo = row.poNo || '';
                    const isExpanded = expandedPoNumbers.has(poNo);
                    const globalIndex = (currentPage - 1) * pageSize + index;
                    return <TableRowItem key={poNo + index} row={row} index={globalIndex} isExpanded={isExpanded} onToggleExpand={toggleRowExpansion} />;
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
                <span className="font-bold">{filteredData.length}</span> entries
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
      )}
    </div>
  );
};

export default PurchaseOrderExcelFormate;

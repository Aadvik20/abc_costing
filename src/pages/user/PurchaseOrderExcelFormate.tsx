import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Loader from '@/components/ui/loader';
import PoDetailsContent from '@/components/dailogs/PoDetailsContent';
import { formatDate, formatDecimal, formatRupees } from '@/lib/helperFunction';
import { ChevronDown, ChevronRight } from 'lucide-react';
import TransferAxiosInstance from '@/services/TransferAxiosInstance';

export interface PurchaseOrderRow {
  srNo?: number;
  poNo?: string;
  poOrderValue?: number;
  poType1?: string;
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
                <div className="max-w-[180px] truncate cursor-pointer">{row.poType1 || '-'}</div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md break-words">
                <p>{row.poType1 || '-'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </td>
        <td className="px-4 py-3 border-r border-gray-200">{row.unit || '-'}</td>
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [expandedPoNumbers, setExpandedPoNumbers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [units, setUnits] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
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
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      setLoading(true);

      try {
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
    fetchPurchaseOrders();
  }, [fromDate, toDate]);

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

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-gray-50 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Purchase Order Excel Format</h1>
      <div className="p-4 sm:p-5 bg-white rounded-xl shadow-sm border border-gray-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <span className="block text-sm font-semibold text-gray-800 mb-1">Select Unit</span>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Units</option>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="block text-sm font-semibold text-gray-800 mb-1">From Date</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={handleFromDateChange}
              className={`w-full p-2 border rounded-lg text-sm font-medium focus:ring-2 focus:outline-none ${
                dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>
          <div>
            <span className="block text-sm font-semibold text-gray-800 mb-1">To Date</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={handleToDateChange}
              className={`w-full p-2 border rounded-lg text-sm font-medium focus:ring-2 focus:outline-none ${
                dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>
          <div>
            <span className="block text-sm font-semibold text-gray-800 mb-1">Search</span>
            <input
              type="text"
              placeholder="Search PO, Profit Center, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              onClick={handleResetFilters}
              className="w-full sm:w-auto h-[38px] px-4 py-2 text-xs sm:text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition whitespace-nowrap"
            >
              Clear Filters
            </button>
          </div>
        </div>
        {dateError && <div className="text-xs font-semibold text-red-600 pt-1">{dateError}</div>}
      </div>
      {loading && <Loader />}
      {!loading && error && <div className="p-8 text-center text-red-600 font-bold bg-white rounded-xl border border-gray-200 shadow-sm">{error}</div>}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-primary text-white sticky top-0 z-10 font-bold text-xs uppercase border-b border-gray-300">
                <tr>
                  <th className="w-10 px-3 py-3 text-center border-r border-gray-200"></th>
                  <th className="w-16 px-3 py-3 text-left border-r border-gray-200">Sr. No.</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200 min-w-[120px]">PO No</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200 min-w-[140px]">PO Date</th>
                  <th className="px-4 py-3 text-right border-r border-gray-200 min-w-[160px]">PO Amount</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200 min-w-[180px]">
                    <div className="flex flex-col">
                      <span>PO Type</span>
                      <span className="text-[10px] lowercase text-white font-normal">(capex, opex, deposit work)</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left border-r border-gray-200 min-w-[160px]">Unit</th>
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
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => {
                    const poNo = row.poNo || '';
                    const isExpanded = expandedPoNumbers.has(poNo);
                    const globalIndex = (currentPage - 1) * pageSize + index;
                    return (
                      <TableRowItem key={poNo+index} row={row} index={globalIndex} isExpanded={isExpanded} onToggleExpand={toggleRowExpansion} />
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

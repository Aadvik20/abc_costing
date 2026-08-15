import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Loader from '@/components/ui/loader';
import PoDetailsContent from '@/components/dailogs/PoDetailsContent';
import { formatDate, formatDecimal, formatRupees } from '@/lib/helperFunction';
import { ChevronDown, ChevronRight, Download, FileStack, Layers, Loader2, Wallet } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { exportAllPaymentDataToExcel } from '@/components/admin/exportPoExcel';
import axiosInstance from '@/services/axiosInstance';

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
  [key: string]: unknown;
}

interface TableRowItemProps {
  row: PurchaseOrderRow;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (poNo: string) => void;
  selectedPoType: string;
}

const TableRowItem: React.FC<TableRowItemProps> = React.memo(({ row, index, isExpanded, onToggleExpand, selectedPoType }) => {
  const poNo = row.poNo || '';
  const handleRowClick = () => {
    if (poNo) {
      onToggleExpand(poNo);
    }
  };

  return (
    <>
      <tr onClick={handleRowClick} className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50/70' : 'hover:bg-gray-50'}`}>
        {selectedPoType !== 'non-po' && selectedPoType !== 'vendorList' && (
          <td className="px-2 py-1 text-center border-r border-gray-200 select-none">
            {isExpanded ? <ChevronDown className="h-4 w-4 text-blue-600 mx-auto" /> : <ChevronRight className="h-4 w-4 text-blue-600 mx-auto" />}
          </td>
        )}
        <td className="px-2 py-1 border-r border-gray-200 text-left font-bold">{index + 1}</td>
        {selectedPoType !== 'non-po' && selectedPoType !== 'vendorList' && (
          <>
            <td className="px-2 py-1 border-r border-gray-200 font-bold text-blue-700 tabular-nums">{poNo || '-'}</td>
            <td className="px-2 py-1 border-r border-gray-200">{formatDate(row.poDate) || '-'}</td>
            <td className="px-2 py-1 border-r border-gray-200 text-right tabular-nums">{formatRupees(row.poOrderValue)}</td>
          </>
        )}
        {['non-po', 'vendorList'].includes(selectedPoType) && (
          <>
            <td className="px-2 py-1 border-r border-gray-200 font-bold text-blue-700 tabular-nums">{row.invoiceNumber || '-'}</td>
            <td className="px-2 py-1 border-r border-gray-200 font-bold text-blue-700">{formatDate(row.invoiceDate) || '-'}</td>
          </>
        )}
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
          <td colSpan={14} className="p-2 border-b border-gray-300 min-w-full">
            <div className="bg-white p-2 rounded-lg shadow-inner border border-gray-200">
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

const PurchaseOrderV2: React.FC = () => {
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
  const [clubbedPo, setClubbedPo] = useState<PurchaseOrderRow[]>([]);
  const [nonPo, setNonPo] = useState<PurchaseOrderRow[]>([]);
  const [vendorList, setVendorList] = useState<PurchaseOrderRow[]>([]);
  const [selectedPoType, setSelectedPoType] = useState<'non-clubbed' | 'clubbed' | 'non-po' | 'vendorList' | ''>('');
  const [selectedView, setSelectedView] = useState<'view1' | 'view2'>('view1');

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
      const res = await axiosInstance.get(url);
      setData(res.data.data ?? []);
      setUnits(res.data.units ?? []);
      setClubbedPo(res.data.clubbedPo ?? []);
      setNonPo(res?.data.sapNonPo ?? []);
      setVendorList(res?.data.sapVendorList ?? []);
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
      await exportAllPaymentDataToExcel(fromDate, toDate);
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

  useEffect(() => {
    setCurrentPage(1);
    setExpandedPoNumbers(new Set());
  }, [selectedUnit, searchQuery, selectedPoType]);

  const applyFilters = useCallback(
    (rows: PurchaseOrderRow[]) => {
      return rows.filter((row) => {
        // Unit filter
        if (selectedUnit && row.unit !== selectedUnit) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();

          const matchesSearch = Object.values(row).some((val) => {
            if (val == null) return false;

            if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
              return val.toString().toLowerCase().includes(query);
            }

            return false;
          });

          if (!matchesSearch) {
            return false;
          }
        }

        return true;
      });
    },
    [selectedUnit, searchQuery]
  );

  const filteredData = useMemo(() => {
    return applyFilters(data);
  }, [data, applyFilters]);

  const filteredClubbedPo = useMemo(() => {
    return applyFilters(clubbedPo);
  }, [clubbedPo, applyFilters]);

  const filteredNonPo = useMemo(() => {
    return applyFilters(nonPo);
  }, [nonPo, applyFilters]);

  const filteredVendorData = useMemo(() => {
    return applyFilters(vendorList);
  }, [vendorList, applyFilters]);

  const nonClubbedBankPayment = useMemo(() => {
    return filteredData.reduce((total, row) => total + (Number(row.bankPayment) || 0), 0);
  }, [filteredData]);

  const clubbedBankPayment = useMemo(() => {
    return filteredClubbedPo.reduce((total, row) => total + (Number(row.bankPayment) || 0), 0);
  }, [filteredClubbedPo]);

  const nonPoBankPayment = useMemo(() => {
    return filteredNonPo.reduce((total, row) => total + (Number(row.bankPayment) || 0), 0);
  }, [filteredNonPo]);

  const vendorBankPayment = useMemo(() => {
    return filteredVendorData.reduce((total, row) => total + (Number(row.bankPayment) || 0), 0);
  }, [filteredVendorData]);

  const totalBankPayment = useMemo(() => {
    return nonClubbedBankPayment + clubbedBankPayment + nonPoBankPayment + vendorBankPayment;
  }, [nonClubbedBankPayment, clubbedBankPayment, nonPoBankPayment, vendorBankPayment]);

  const displayData = useMemo(() => {
    if (!selectedPoType) {
      return [];
    }

    if (selectedPoType === 'clubbed') {
      return filteredClubbedPo;
    }

    if (selectedPoType === 'non-po') {
      return filteredNonPo;
    }
    if (selectedPoType === 'vendorList') {
      return filteredVendorData;
    }

    return filteredData;
  }, [selectedPoType, filteredData, filteredClubbedPo, filteredNonPo, filteredVendorData]);

  const totalPages = Math.ceil(displayData.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayData.slice(start, start + pageSize);
  }, [displayData, currentPage, pageSize]);

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

  const startIndex = displayData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endIndex = Math.min(currentPage * pageSize, displayData.length);
  const isAllPageExpanded = useMemo(() => {
    if (!paginatedData || paginatedData.length === 0) return false;
    return paginatedData.every((row) => row.poNo && expandedPoNumbers.has(row.poNo));
  }, [paginatedData, expandedPoNumbers]);
  return (
    <div className="p-4 space-y-4">
      {loading && <Loader />}
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Payment Details</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        {data.length > 0 && (
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
        )}
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
            max={toDate || undefined || new Date().toISOString().split('T')[0]}
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
            max={new Date().toISOString().split('T')[0]}
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

      {data.length === 0 ? (
        <div className="flex items-center justify-center">
          <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M8 7V3m8 4V3m-9 8h10M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                />
              </svg>
            </div>

            <h3 className="text-base font-bold text-slate-800">Please select a date range to view records</h3>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-sm">
              {/* View 1 */}
              <button
                type="button"
                onClick={() => {
                  setSelectedView('view1');
                  setSelectedPoType('');
                  setCurrentPage(1);
                  setExpandedPoNumbers(new Set());
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedView === 'view1'
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                View 1
              </button>

              {/* View 2 */}
              <button
                type="button"
                onClick={() => {
                  setSelectedView('view2');
                  setSelectedPoType('');
                  setCurrentPage(1);
                  setExpandedPoNumbers(new Set());
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedView === 'view2'
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                View 2
              </button>
            </div>
          </div>
          {selectedView === 'view1' ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5 mb-5">
              {/* Non-Clubbed PO Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPoType('non-clubbed');
                  setCurrentPage(1);
                  setExpandedPoNumbers(new Set());
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 focus:outline-none ${
                  selectedPoType === 'non-clubbed'
                    ? 'border-emerald-500/80 bg-gradient-to-b from-emerald-50/60 to-white shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                    : 'border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 hover:-translate-y-0.5 hover:border-emerald-500/80 hover:shadow-md'
                }`}
              >
                {/* Top Accent Line */}
                <div
                  className={`absolute left-0 top-0 h-1 w-full transition-colors duration-300 ${
                    selectedPoType === 'non-clubbed' ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-emerald-500/80'
                  }`}
                />

                <div className="relative z-10 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
                          selectedPoType === 'non-clubbed' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                        }`}
                      >
                        <FileStack size={18} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for Non-Clubbed POs</span>
                    </div>
                  </div>

                  <div className="text-right mt-5">
                    <p className="text-3xl font-black tracking-tight text-slate-900">{formatRupees(nonClubbedBankPayment)}</p>
                  </div>
                </div>
              </button>

              {/* Clubbed PO Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPoType('clubbed');
                  setCurrentPage(1);
                  setExpandedPoNumbers(new Set());
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 focus:outline-none ${
                  selectedPoType === 'clubbed'
                    ? 'border-blue-500/80 bg-gradient-to-b from-blue-50/60 to-white shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 hover:-translate-y-0.5 hover:border-blue-500/80 hover:shadow-md'
                }`}
              >
                {/* Top Accent Line */}
                <div
                  className={`absolute left-0 top-0 h-1 w-full transition-colors duration-300 ${
                    selectedPoType === 'clubbed' ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-500/80'
                  }`}
                />

                <div className="relative z-10 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
                          selectedPoType === 'clubbed' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                        }`}
                      >
                        <Layers size={18} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for Clubbed POs</span>
                    </div>
                  </div>

                  <div className="text-right mt-5">
                    <p className="text-3xl font-black tracking-tight text-slate-900">{formatRupees(clubbedBankPayment)}</p>
                  </div>
                </div>
              </button>

              {/* non PO Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPoType('non-po');
                  setCurrentPage(1);
                  setExpandedPoNumbers(new Set());
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 focus:outline-none ${
                  selectedPoType === 'non-po'
                    ? 'border-amber-500/80 bg-gradient-to-b from-amber-50/60 to-white shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20'
                    : 'border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 hover:-translate-y-0.5 hover:border-amber-500/80 hover:shadow-md'
                }`}
              >
                {/* Top Accent Line */}
                <div
                  className={`absolute left-0 top-0 h-1 w-full transition-colors duration-300 ${
                    selectedPoType === 'non-po' ? 'bg-amber-500' : 'bg-transparent group-hover:bg-amber-500/80'
                  }`}
                />

                <div className="relative z-10 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
                          selectedPoType === 'non-po' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-600 ring-1 ring-amber-100'
                        }`}
                      >
                        <Layers size={18} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for Non POs</span>
                    </div>
                  </div>

                  <div className="text-right mt-5">
                    <p className="text-3xl font-black tracking-tight text-slate-900">{formatRupees(nonPoBankPayment)}</p>
                  </div>
                </div>
              </button>

              {/* vendor Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPoType('vendorList');
                  setCurrentPage(1);
                  setExpandedPoNumbers(new Set());
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 focus:outline-none ${
                  selectedPoType === 'vendorList'
                    ? 'border-red-500/80 bg-gradient-to-b from-red-50/60 to-white shadow-lg shadow-red-500/10 ring-2 ring-red-500/20'
                    : 'border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 hover:-translate-y-0.5 hover:border-red-500/80 hover:shadow-md'
                }`}
              >
                {/* Top Accent Line */}
                <div
                  className={`absolute left-0 top-0 h-1 w-full transition-colors duration-300 ${
                    selectedPoType === 'vendorList' ? 'bg-red-500' : 'bg-transparent group-hover:bg-red-500/80'
                  }`}
                />

                <div className="relative z-10 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
                          selectedPoType === 'vendorList' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-600 ring-1 ring-amber-100'
                        }`}
                      >
                        <Layers size={18} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for Vendors</span>
                    </div>
                  </div>

                  <div className="text-right mt-5">
                    <p className="text-3xl font-black tracking-tight text-slate-900">{formatRupees(vendorBankPayment)}</p>
                  </div>
                </div>
              </button>

              {/* Grand Total Card */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 p-3  shadow-sm transition-all duration-300 hover:border-violet-300 hover:shadow-md">
                {/* Top Accent Line */}
                <div className="absolute left-0 top-0 h-1 w-full bg-violet-500" />

                <div className="relative z-10 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                        <Wallet size={18} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released</span>
                    </div>
                  </div>

                  <div className="text-right mt-5">
                    <p className="text-3xl font-black tracking-tight text-slate-900">{formatRupees(totalBankPayment)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-5">
              {/* Non-Clubbed */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPoType(selectedPoType === 'non-clubbed' ? '' : 'non-clubbed');
                  setCurrentPage(1);
                  setExpandedPoNumbers(new Set());
                }}
                className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                  selectedPoType === 'non-clubbed'
                    ? 'rounded-b-none border-emerald-500/80 bg-gradient-to-r from-emerald-50/70 to-white shadow-lg ring-2 ring-emerald-500/20'
                    : 'border-slate-200/80 bg-gradient-to-r from-white to-slate-50/50 hover:border-emerald-500/80 hover:shadow-md'
                }`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${
                    selectedPoType === 'non-clubbed' ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-emerald-500/80'
                  }`}
                />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${selectedPoType === 'non-clubbed' ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`}
                    />
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selectedPoType === 'non-clubbed' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      <FileStack size={19} />
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for Non-Clubbed POs</p>

                      <p className="mt-0.5 text-xs text-slate-400">{filteredData.length} PO(s)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-2xl tabular-nums font-black text-slate-900">{formatRupees(nonClubbedBankPayment)}</p>
                  </div>
                </div>
              </button>

              {/* Clubbed */}
              <button
                type="button"
                disabled={filteredClubbedPo.length === 0}
                onClick={() => {
                  setSelectedPoType(selectedPoType === 'clubbed' ? '' : 'clubbed');
                  setCurrentPage(1);
                  setExpandedPoNumbers(new Set());
                }}
                className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                  selectedPoType === 'clubbed'
                    ? 'rounded-b-none border-blue-500/80 bg-gradient-to-r from-blue-50/70 to-white shadow-lg ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 bg-gradient-to-r from-white to-slate-50/50 hover:border-blue-500/80 hover:shadow-md'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${selectedPoType === 'clubbed' ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-500/80'}`}
                />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${selectedPoType === 'clubbed' ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}
                    />
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selectedPoType === 'clubbed' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <Layers size={19} />
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for Clubbed POs</p>

                      <p className="mt-0.5 text-xs text-slate-400">{filteredClubbedPo.length} PO(s)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-2xl tabular-nums font-black text-slate-900">{formatRupees(clubbedBankPayment)}</p>
                  </div>
                </div>
              </button>

              {/* Non PO */}
              <button
                type="button"
                disabled={filteredNonPo.length === 0}
                onClick={() => {
                  setSelectedPoType(selectedPoType === 'non-po' ? '' : 'non-po');
                  setCurrentPage(1);
                  setExpandedPoNumbers(new Set());
                }}
                className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                  selectedPoType === 'non-po'
                    ? 'rounded-b-none border-amber-500/80 bg-gradient-to-r from-amber-50/70 to-white shadow-lg ring-2 ring-amber-500/20'
                    : 'border-slate-200/80 bg-gradient-to-r from-white to-slate-50/50 hover:border-amber-500/80 hover:shadow-md'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${selectedPoType === 'non-po' ? 'bg-amber-500' : 'bg-transparent group-hover:bg-amber-500/80'}`}
                />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${selectedPoType === 'non-po' ? 'rotate-180 text-amber-600' : 'text-slate-400'}`}
                    />
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selectedPoType === 'non-po' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      <Layers size={19} />
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for Non POs</p>

                      <p className="mt-0.5 text-xs text-slate-400">{filteredNonPo.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-2xl tabular-nums font-black text-slate-900">{formatRupees(nonPoBankPayment)}</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={filteredVendorData.length === 0}
                onClick={() => {
                  setSelectedPoType(selectedPoType === 'vendorList' ? '' : 'vendorList');
                  setCurrentPage(1);
                  setExpandedPoNumbers(new Set());
                }}
                className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                  selectedPoType === 'vendorList'
                    ? 'rounded-b-none border-red-500/80 bg-gradient-to-r from-red-50/70 to-white shadow-lg ring-2 ring-red-500/20'
                    : 'border-slate-200/80 bg-gradient-to-r from-white to-slate-50/50 hover:border-red-500/80 hover:shadow-md'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${selectedPoType === 'vendorList' ? 'bg-red-500' : 'bg-transparent group-hover:bg-red-500/80'}`}
                />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${selectedPoType === 'vendorList' ? 'rotate-180 text-red-600' : 'text-slate-400'}`}
                    />
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selectedPoType === 'vendorList' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      <Layers size={19} />
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for Vendors</p>

                      <p className="mt-0.5 text-xs text-slate-400">{filteredVendorData.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-2xl tabular-nums font-black text-slate-900">{formatRupees(vendorBankPayment)}</p>
                  </div>
                </div>
              </button>

              {/* Grand Total - NOT CLICKABLE */}
              <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-violet-50/40 via-white to-slate-50/50 p-4 shadow-sm">
                <div className="absolute left-0 top-0 h-full w-1 bg-violet-500" />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Wallet size={19} />
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released</p>

                      <p className="mt-0.5 text-xs text-slate-400">Non-Clubbed + Clubbed + Non PO + Vendor</p>
                    </div>
                  </div>

                  <p className="text-2xl tabular-nums font-black text-slate-900">{formatRupees(totalBankPayment)}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {selectedPoType && (
        <>
          <div className="flex items-center justify-end gap-3">
            <div className="flex gap-3">
              {selectedPoType !== 'non-po' && selectedPoType !== 'vendorList' && (
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
              )}
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
          </div>
          {!loading && error && <div className="p-8 text-center text-red-600 font-bold bg-white rounded-xl border border-gray-200 shadow-sm">{error}</div>}
          {!loading && !error && (
            <div className="bg-white rounded-xl border-gray-200 shadow-sm flex flex-col">
              <div className="overflow-x-auto max-h-[70vh]">
                {/* TOTALS SUMMARY TABLE */}
                <table className="min-w-full text-sm border-seperate border-spacing-0">
                  <thead className="bg-primary sticky top-0 z-20 text-white font-bold text-xs uppercase border-b border-gray-300">
                    <tr>
                      {selectedPoType !== 'non-po' && selectedPoType !== 'vendorList' && (
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
                      {selectedPoType !== 'non-po' && selectedPoType !== 'vendorList' && (
                        <>
                          <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[110px]">PO No</th>
                          <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[130px]">PO Date</th>
                          <th className="px-2 py-2 text-right border-r border-gray-200 min-w-[160px]">PO Amount</th>
                        </>
                      )}
                      {['non-po', 'vendorList'].includes(selectedPoType) && (
                        <>
                          <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[110px]">Invoice No</th>
                          <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[140px]">Invoice Date</th>
                        </>
                      )}
                      <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[180px]">Supplier Code</th>
                      <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[120px]">PO Type</th>
                      <th className="px-2 py-2 text-left border-r border-gray-200 min-w-[120px]">Unit</th>
                      <th className="px-2 py-2 text-right border-r border-gray-200 min-w-[150px]">Bank Payment</th>
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
                        return (
                          <TableRowItem
                            key={poNo + index}
                            row={row}
                            index={globalIndex}
                            isExpanded={isExpanded}
                            onToggleExpand={toggleRowExpansion}
                            selectedPoType={selectedPoType}
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
                    <span className="font-bold">{displayData.length}</span> entries
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
        </>
      )}
    </div>
  );
};

export default PurchaseOrderV2;

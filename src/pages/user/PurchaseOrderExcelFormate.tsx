import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Loader from '@/components/ui/loader';
import { formatRupees } from '@/lib/helperFunction';
import { useSearchParams } from 'react-router';
import { exportAllPaymentDataToExcel } from '@/components/admin/exportPoExcel';
import axiosInstance from '@/services/axiosInstance';
import Select from 'react-select';
import PurchaseOrderTable, { PurchaseOrderRow } from '@/components/common/PurchaseOrderTable';

export type { PurchaseOrderRow };

const PurchaseOrderExcelFormate: React.FC = () => {
  const [data, setData] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [units, setUnits] = useState<string[]>([]);
  const [glAccounts, setGlAccounts] = useState<string[]>([]);
  const [selectedGl, setSelectedGl] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>(searchParams.get('fromDate') || '');
  const [toDate, setToDate] = useState<string>(searchParams.get('toDate') || '');
  const [dateError, setDateError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [nonPo, setNonPo] = useState<PurchaseOrderRow[]>([]);
  const [vendorSalary, setVendorSalary] = useState<PurchaseOrderRow[]>([]);
  const [vendorAdv, setVendorAdv] = useState<PurchaseOrderRow[]>([]);
  const [selectedPoType, setSelectedPoType] = useState<'po' | 'non-po' | 'vendor-salary' | 'vendor-adv'>('po');

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
      setGlAccounts(res.data.glAccounts ?? []);
      setNonPo(res?.data.sapNonPo ?? []);
      setVendorSalary(res?.data.sapVendorListSalary ?? []);
      setVendorAdv(res?.data.sapVendorListAdvanced ?? []);
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

  const handleExportPage = async () => {
    if (!selectedPoType || !displayData.length) return;

    setExporting(true);
    try {
      await exportAllPaymentDataToExcel(fromDate, toDate);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const applyFilters = useCallback(
    (rows: PurchaseOrderRow[]) => {
      return rows.filter((row) => {
        // Unit filter
        if (selectedUnit && row.unit !== selectedUnit) {
          return false;
        }

        // gl filter
        if (selectedGl && row.expenseGLAccount !== selectedGl) {
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
    [selectedUnit, searchQuery, selectedGl]
  );

  const filteredData = useMemo(() => {
    return applyFilters(data);
  }, [data, applyFilters]);

  const filteredNonPo = useMemo(() => {
    return applyFilters(nonPo);
  }, [nonPo, applyFilters]);

  const filteredVendorSalary = useMemo(() => {
    return applyFilters(vendorSalary);
  }, [vendorSalary, applyFilters]);

  const filteredVendorAdv = useMemo(() => {
    return applyFilters(vendorAdv);
  }, [vendorAdv, applyFilters]);

  const displayData = useMemo(() => {
    if (selectedPoType === 'non-po') {
      return filteredNonPo;
    }
    if (selectedPoType === 'vendor-salary') {
      return filteredVendorSalary;
    }
    if (selectedPoType === 'vendor-adv') {
      return filteredVendorAdv;
    }
    return filteredData;
  }, [selectedPoType, filteredData, filteredNonPo, filteredVendorSalary, filteredVendorAdv]);

  const totals = useMemo(() => {
    return displayData.reduce(
      (acc, row) => {
        acc.poOrderValue += Number(row.poOrderValue) || 0;
        acc.bankPayment += Number(row.bankPayment) || 0;
        acc.cgstAmount += Number(row.cgstAmount) || 0;
        acc.cgsttds += Number(row.cgsttds) || 0;
        acc.sgstAmount += Number(row.sgstAmount) || 0;
        acc.sgsttds += Number(row.sgsttds) || 0;
        acc.igstAmount += Number(row.igstAmount) || 0;
        acc.igsttds += Number(row.igsttds) || 0;
        acc.ittds += Number(row.ittds) || 0;
        return acc;
      },
      {
        poOrderValue: 0,
        bankPayment: 0,
        cgstAmount: 0,
        cgsttds: 0,
        sgstAmount: 0,
        sgsttds: 0,
        igstAmount: 0,
        igsttds: 0,
        ittds: 0,
      }
    );
  }, [displayData]);

  const handleResetFilters = () => {
    setSelectedUnit('');
    setSelectedGl('');
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setDateError(null);
  };

  const actionHeaderLeft = (
    <>
      <div className="inline-flex items-center rounded-xl bg-slate-200/60 p-1 border border-slate-300/80 shadow-inner">
        {/* ================= PO ================= */}
        <button
          type="button"
          onClick={() => {
            setSelectedPoType('po');
          }}
          className={`group relative inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
            selectedPoType === 'po'
              ? 'bg-white text-emerald-900 shadow-sm ring-1 ring-emerald-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
          }`}
        >
          {selectedPoType === 'po' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
          <span>PO</span>
          <span
            className={`min-w-[20px] h-4 px-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-extrabold transition-colors ${
              selectedPoType === 'po' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300/80 text-slate-700 group-hover:bg-slate-400/50'
            }`}
          >
            {filteredData.length}
          </span>
        </button>

        {/* ================= NON PO ================= */}
        <button
          type="button"
          onClick={() => {
            setSelectedPoType('non-po');
          }}
          disabled={filteredNonPo.length === 0}
          className={`group relative inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
            selectedPoType === 'non-po'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-1 ring-amber-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {selectedPoType === 'non-po' && <span className="h-1.5 w-1.5 rounded-full bg-amber-100 animate-pulse" />}
          <span>Non PO</span>
          <span
            className={`min-w-[20px] h-4 px-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-extrabold transition-colors ${
              selectedPoType === 'non-po' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800 group-hover:bg-amber-200/80'
            }`}
          >
            {filteredNonPo.length}
          </span>
        </button>

        {/* ================= vendor salary ================= */}
        <button
          type="button"
          onClick={() => {
            setSelectedPoType('vendor-salary');
          }}
          disabled={filteredVendorSalary.length === 0}
          className={`group relative inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
            selectedPoType === 'vendor-salary'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {selectedPoType === 'vendor-salary' && <span className="h-1.5 w-1.5 rounded-full bg-blue-100 animate-pulse" />}
          <span>Employee Vendor Salary</span>
          <span
            className={`min-w-[20px] h-4 px-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-extrabold transition-colors ${
              selectedPoType === 'vendor-salary' ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-800 group-hover:bg-blue-200/80'
            }`}
          >
            {filteredVendorSalary.length}
          </span>
        </button>

        {/* ================= vendor adv ================= */}
        <button
          type="button"
          onClick={() => {
            setSelectedPoType('vendor-adv');
          }}
          disabled={filteredVendorAdv.length === 0}
          className={`group relative inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
            selectedPoType === 'vendor-adv'
              ? 'bg-red-500 text-white shadow-md shadow-red-500/25 ring-1 ring-red-500/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {selectedPoType === 'vendor-adv' && <span className="h-1.5 w-1.5 rounded-full bg-red-100 animate-pulse" />}
          <span>Employee Vendor Advances</span>
          <span
            className={`min-w-[20px] h-4 px-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-extrabold transition-colors ${
              selectedPoType === 'vendor-adv' ? 'bg-white/25 text-white' : 'bg-red-100 text-red-800 group-hover:bg-red-200/80'
            }`}
          >
            {filteredVendorAdv.length}
          </span>
        </button>
      </div>
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 px-3 py-1.5 rounded-lg shadow-2xs">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">Total Bank Payment:</span>
        <span className="text-sm font-extrabold text-emerald-700 tabular-nums">{formatRupees(totals.bankPayment)}</span>
      </div>
    </>
  );

  return (
    <div className="p-4 space-y-4 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Payment Details</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        {units.length > 0 && (
          <div className="lg:col-span-2">
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
        {glAccounts.length > 0 && (
          <div className="lg:col-span-2">
            <label htmlFor="gl-select" className="block text-xs font-semibold text-gray-700 mb-1">
              GL Account <span className="text-gray-400 font-normal">(Instant Filter)</span>
            </label>

            <Select
              inputId="gl-select"
              value={selectedGl ? { value: selectedGl, label: selectedGl } : null}
              onChange={(option) => setSelectedGl(option?.value || '')}
              options={[
                { value: '', label: 'All GL' },
                ...glAccounts.map((gl) => ({
                  value: gl,
                  label: gl,
                })),
              ]}
              placeholder="All GL"
              isSearchable
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                  boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#9ca3af',
                  },
                }),
                valueContainer: (base) => ({
                  ...base,
                  height: '40px',
                  padding: '0 12px',
                }),
                input: (base) => ({
                  ...base,
                  margin: 0,
                  padding: 0,
                  fontSize: '14px',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#1f2937',
                  fontWeight: 500,
                }),
                placeholder: (base) => ({
                  ...base,
                  color: '#1f2937',
                  fontWeight: 500,
                }),
                indicatorsContainer: (base) => ({
                  ...base,
                  height: '40px',
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  padding: '0 10px',
                  color: '#6b7280',
                }),
                indicatorSeparator: () => ({
                  display: 'none',
                }),
                menu: (base) => ({
                  ...base,
                  marginTop: '4px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                  overflow: 'hidden',
                  zIndex: 9999,
                  width: '100%',
                }),
                menuList: (base) => ({
                  ...base,
                  padding: '4px 0',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#9ca3af transparent',
                }),
                option: (base, state) => ({
                  ...base,
                  padding: '8px 12px',
                  minHeight: '36px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: state.isSelected ? '#ffffff' : '#374151',
                  backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#dbeafe' : '#ffffff',
                  cursor: 'pointer',
                  '&:active': {
                    backgroundColor: '#1d4ed8',
                  },
                }),
              }}
            />
          </div>
        )}
        <div className="lg:col-span-2">
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

      {loading && <Loader />}
      {!loading && error && <div className="p-8 text-center text-red-600 font-bold bg-white rounded-xl border border-gray-200 shadow-sm">{error}</div>}
      {!loading && !error && (
        <PurchaseOrderTable
          data={displayData}
          selectedPoType={selectedPoType}
          exporting={exporting}
          onExport={handleExportPage}
          actionHeaderLeft={actionHeaderLeft}
        />
      )}
    </div>
  );
};

export default PurchaseOrderExcelFormate;

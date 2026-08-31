import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Loader from '@/components/ui/loader';
import { formatRupees } from '@/lib/helperFunction';
import { ChevronDown, FileStack, Layers, Wallet } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { exportAllPaymentDataToExcel } from '@/components/admin/exportPoExcel';
import axiosInstance from '@/services/axiosInstance';
import Select from 'react-select';
import PurchaseOrderTable, { PurchaseOrderRow } from '@/components/common/PurchaseOrderTable';

export type { PurchaseOrderRow };

const PurchaseOrderV2: React.FC = () => {
  const [data, setData] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [units, setUnits] = useState<string[]>([]);
  const [glAccounts, setGlAccounts] = useState<string[]>([]);
  const [selectedGl, setSelectedGl] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string>(searchParams.get('fromDate') || '');
  const [toDate, setToDate] = useState<string>(searchParams.get('toDate') || '');
  const [dateError, setDateError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [nonPo, setNonPo] = useState<PurchaseOrderRow[]>([]);
  const [vendorSalary, setVendorSalary] = useState<PurchaseOrderRow[]>([]);
  const [vendorAdv, setVendorAdv] = useState<PurchaseOrderRow[]>([]);
  const [selectedPoType, setSelectedPoType] = useState<'po' | 'non-po' | 'vendor-salary' | 'vendor-adv' | ''>('');
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
        if (selectedGl.length > 0 && (!row.glAccount || !selectedGl.includes(row.glAccount))) {
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

  const poBankPayment = useMemo(() => {
    return filteredData.reduce((total, row) => total + (Number(row.bankPayment) || 0), 0);
  }, [filteredData]);

  const nonPoBankPayment = useMemo(() => {
    return filteredNonPo.reduce((total, row) => total + (Number(row.bankPayment) || 0), 0);
  }, [filteredNonPo]);

  const vendorSalaryBankPayment = useMemo(() => {
    return filteredVendorSalary.reduce((total, row) => total + (Number(row.bankPayment) || 0), 0);
  }, [filteredVendorSalary]);

  const vendorAdvBankPayment = useMemo(() => {
    return filteredVendorAdv.reduce((total, row) => total + (Number(row.bankPayment) || 0), 0);
  }, [filteredVendorAdv]);

  const totalBankPayment = useMemo(() => {
    return poBankPayment + nonPoBankPayment + vendorSalaryBankPayment + vendorAdvBankPayment;
  }, [poBankPayment, nonPoBankPayment, vendorAdvBankPayment, vendorSalaryBankPayment]);

  const displayData = useMemo(() => {
    if (!selectedPoType) {
      return [];
    }

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
  }, [selectedPoType, filteredData, filteredNonPo, filteredVendorAdv, filteredVendorSalary]);

  const handleResetFilters = () => {
    setSelectedUnit('');
    setSelectedGl([]);
    setSearchQuery('');
    setFromDate('');
    setToDate('');
    setDateError(null);
  };

  return (
    <div className="p-4 space-y-4 min-h-screen">
      {loading && <Loader />}
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
              isMulti
              closeMenuOnSelect={false}
              isClearable
              value={selectedGl.map((gl) => ({ value: gl, label: gl }))}
              onChange={(selected) => {
                const values = selected ? (selected as { value: string; label: string }[]).map((opt) => opt.value) : [];
                setSelectedGl(values);
              }}
              options={glAccounts.map((gl) => ({
                value: gl,
                label: gl,
              }))}
              placeholder="All GL Accounts"
              isSearchable
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '40px',
                  maxHeight: '76px',
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
                  padding: '4px 8px',
                  gap: '2px',
                  maxHeight: '68px',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#9ca3af transparent',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignContent: 'flex-start',
                }),

                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#eff6ff',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe',
                  margin: '2px',
                  flexShrink: 0,
                }),

                multiValueLabel: (base) => ({
                  ...base,
                  color: '#1d4ed8',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '1px 4px',
                }),

                multiValueRemove: (base) => ({
                  ...base,
                  color: '#1d4ed8',
                  borderRadius: '0 5px 5px 0',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#dbeafe',
                    color: '#1e3a8a',
                  },
                }),

                input: (base) => ({
                  ...base,
                  margin: 0,
                  padding: 0,
                  fontSize: '14px',
                }),

                placeholder: (base) => ({
                  ...base,
                  color: '#6b7280',
                  fontWeight: 500,
                }),

                indicatorsContainer: (base) => ({
                  ...base,
                }),

                dropdownIndicator: (base) => ({
                  ...base,
                  padding: '0 8px',
                  color: '#6b7280',
                }),

                clearIndicator: (base) => ({
                  ...base,
                  padding: '0 6px',
                  color: '#6b7280',
                  cursor: 'pointer',
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
              {/* PO Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPoType('po');
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 focus:outline-none ${
                  selectedPoType === 'po'
                    ? 'border-emerald-500/80 bg-gradient-to-b from-emerald-50/60 to-white shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                    : 'border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 hover:-translate-y-0.5 hover:border-emerald-500/80 hover:shadow-md'
                }`}
              >
                {/* Top Accent Line */}
                <div
                  className={`absolute left-0 top-0 h-1 w-full transition-colors duration-300 ${
                    selectedPoType === 'po' ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-emerald-500/80'
                  }`}
                />

                <div className="relative z-10 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
                          selectedPoType === 'po' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                        }`}
                      >
                        <FileStack size={18} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">PO</span>
                      <span className="inline-flex min-w-[22px] h-[22px] items-center justify-center rounded-full bg-emerald-100 px-1.5 text-[11px] font-bold text-emerald-600 ring-1 ring-emerald-200">
                        {filteredData.length}
                      </span>
                    </div>
                  </div>

                  <div className="text-right mt-5">
                    <p className="text-3xl font-black tracking-tight text-slate-900">{formatRupees(poBankPayment)}</p>
                  </div>
                </div>
              </button>

              {/* non PO Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPoType('non-po');
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
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">NON PO</span>
                      <span className="inline-flex min-w-[22px] h-[22px] items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-bold text-amber-600 ring-1 ring-amber-200">
                        {filteredNonPo.length}
                      </span>
                    </div>
                  </div>

                  <div className="text-right mt-5">
                    <p className="text-3xl font-black tracking-tight text-slate-900">{formatRupees(nonPoBankPayment)}</p>
                  </div>
                </div>
              </button>

              {/* vendor salary Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPoType('vendor-salary');
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 focus:outline-none ${
                  selectedPoType === 'vendor-salary'
                    ? 'border-blue-500/80 bg-gradient-to-b from-blue-50/60 to-white shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 hover:-translate-y-0.5 hover:border-blue-500/80 hover:shadow-md'
                }`}
              >
                {/* Top Accent Line */}
                <div
                  className={`absolute left-0 top-0 h-1 w-full transition-colors duration-300 ${
                    selectedPoType === 'vendor-salary' ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-500/80'
                  }`}
                />

                <div className="relative z-10 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
                          selectedPoType === 'vendor-salary' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-600 ring-1 ring-amber-100'
                        }`}
                      >
                        <Layers size={18} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Employee Vendor Salary</span>
                      <span className="inline-flex min-w-[22px] h-[22px] items-center justify-center rounded-full bg-blue-100 px-1.5 text-[11px] font-bold text-blue-600 ring-1 ring-blue-200">
                        {filteredVendorSalary.length}
                      </span>
                    </div>
                  </div>

                  <div className="text-right mt-5">
                    <p className="text-3xl font-black tracking-tight text-slate-900">{formatRupees(vendorSalaryBankPayment)}</p>
                  </div>
                </div>
              </button>

              {/* vendor adv Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPoType('vendor-adv');
                }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left transition-all duration-300 focus:outline-none ${
                  selectedPoType === 'vendor-adv'
                    ? 'border-red-500/80 bg-gradient-to-b from-red-50/60 to-white shadow-lg shadow-red-500/10 ring-2 ring-red-500/20'
                    : 'border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 hover:-translate-y-0.5 hover:border-red-500/80 hover:shadow-md'
                }`}
              >
                {/* Top Accent Line */}
                <div
                  className={`absolute left-0 top-0 h-1 w-full transition-colors duration-300 ${
                    selectedPoType === 'vendor-adv' ? 'bg-red-500' : 'bg-transparent group-hover:bg-red-500/80'
                  }`}
                />

                <div className="relative z-10 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
                          selectedPoType === 'vendor-adv' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-600 ring-1 ring-amber-100'
                        }`}
                      >
                        <Layers size={18} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Employee Vendor Advances</span>
                      <span className="inline-flex min-w-[22px] h-[22px] items-center justify-center rounded-full bg-red-100 px-1.5 text-[11px] font-bold text-red-600 ring-1 ring-red-200">
                        {filteredVendorAdv.length}
                      </span>
                    </div>
                  </div>

                  <div className="text-right mt-5">
                    <p className="text-3xl font-black tracking-tight text-slate-900">{formatRupees(vendorAdvBankPayment)}</p>
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
              {/* po */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPoType(selectedPoType === 'po' ? '' : 'po');
                }}
                className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                  selectedPoType === 'po'
                    ? 'rounded-b-none border-emerald-500/80 bg-gradient-to-r from-emerald-50/70 to-white shadow-lg ring-2 ring-emerald-500/20'
                    : 'border-slate-200/80 bg-gradient-to-r from-white to-slate-50/50 hover:border-emerald-500/80 hover:shadow-md'
                }`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${selectedPoType === 'po' ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-emerald-500/80'}`}
                />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${selectedPoType === 'po' ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`}
                    />
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selectedPoType === 'po' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      <FileStack size={19} />
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for PO</p>

                      <p className="mt-0.5 text-xs text-slate-400">{filteredData.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-2xl tabular-nums font-black text-slate-900">{formatRupees(poBankPayment)}</p>
                  </div>
                </div>
              </button>

              {/* Non PO */}
              <button
                type="button"
                disabled={filteredNonPo.length === 0}
                onClick={() => {
                  setSelectedPoType(selectedPoType === 'non-po' ? '' : 'non-po');
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
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for Non PO</p>

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
                disabled={filteredVendorSalary.length === 0}
                onClick={() => {
                  setSelectedPoType(selectedPoType === 'vendor-salary' ? '' : 'vendor-salary');
                }}
                className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                  selectedPoType === 'vendor-salary'
                    ? 'rounded-b-none border-blue-500/80 bg-gradient-to-r from-blue-50/70 to-white shadow-lg ring-2 ring-blue-500/20'
                    : 'border-slate-200/80 bg-gradient-to-r from-white to-slate-50/50 hover:border-blue-500/80 hover:shadow-md'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${selectedPoType === 'vendor-salary' ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-500/80'}`}
                />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${selectedPoType === 'vendor-salary' ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}
                    />
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selectedPoType === 'vendor-salary' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <Layers size={19} />
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for Employee Vendor Salary</p>

                      <p className="mt-0.5 text-xs text-slate-400">{filteredVendorSalary.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-2xl tabular-nums font-black text-slate-900">{formatRupees(vendorSalaryBankPayment)}</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                disabled={filteredVendorAdv.length === 0}
                onClick={() => {
                  setSelectedPoType(selectedPoType === 'vendor-adv' ? '' : 'vendor-adv');
                }}
                className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                  selectedPoType === 'vendor-adv'
                    ? 'rounded-b-none border-red-500/80 bg-gradient-to-r from-red-50/70 to-white shadow-lg ring-2 ring-red-500/20'
                    : 'border-slate-200/80 bg-gradient-to-r from-white to-slate-50/50 hover:border-red-500/80 hover:shadow-md'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-1 ${selectedPoType === 'vendor-adv' ? 'bg-red-500' : 'bg-transparent group-hover:bg-red-500/80'}`}
                />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${selectedPoType === 'vendor-adv' ? 'rotate-180 text-red-600' : 'text-slate-400'}`}
                    />
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selectedPoType === 'vendor-adv' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      <Layers size={19} />
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Total Payment Released for Employee Vendor Advances</p>

                      <p className="mt-0.5 text-xs text-slate-400">{filteredVendorAdv.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-2xl tabular-nums font-black text-slate-900">{formatRupees(vendorAdvBankPayment)}</p>
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

                      <p className="mt-0.5 text-xs text-slate-400">PO + Non PO + Employee Vendor Salary + Employee Vendor Advances</p>
                    </div>
                  </div>

                  <p className="text-2xl tabular-nums font-black text-slate-900">{formatRupees(totalBankPayment)}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {selectedPoType && !error && (
        <PurchaseOrderTable
          data={displayData}
          selectedPoType={selectedPoType}
          exporting={exporting}
          onExport={handleExportPage}
          maxHeight="max-h-[70vh]"
          overFlow="overflow-x-auto"
        />
      )}
      {!loading && error && <div className="p-8 text-center text-red-600 font-bold bg-white rounded-xl border border-gray-200 shadow-sm">{error}</div>}
    </div>
  );
};

export default PurchaseOrderV2;

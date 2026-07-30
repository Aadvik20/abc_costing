import React, { useState, useEffect, useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TableList from '@/components/ui/data-table';
import axios from 'axios';
import Loader from '@/components/ui/loader';
import { PoDetailsDialog } from '@/components/dailogs/PoDetailsDialog';
export interface PurchaseOrderRow {
  srNo?: number;
  poNo?: string;
  poAmount?: number;
  poType1?: string;
  profitCenter?: string;
  poType2?: string;
  bankPayment?: number;
  itTds?: number;
  cgst?: number;
  scgst?: number;
  igst?: number;
  cgstTds?: number;
  sgstTds?: number;
  igstTds?: number;
  unit?: string;
  month?: string;
  year?: string;
  showSortIcon?: boolean;
  enableSorting?: boolean;
  [key: string]: unknown;
}

const formatRupees = (val?: number | string | null): string => {
  if (val === null || val === undefined || val === '') return '-';
  const num = typeof val === 'number' ? val : Number.parseFloat(String(val).replace(/,/g, ''));
  if (Number.isNaN(num)) return '-';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDecimal = (val?: number | string | null): string => {
  if (val === null || val === undefined || val === '') return '-';
  const num = typeof val === 'number' ? val : Number.parseFloat(String(val).replace(/,/g, ''));
  if (Number.isNaN(num)) return '-';

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const PurchaseOrderExcelFormate: React.FC = () => {
  const [data, setData] = useState<PurchaseOrderRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [units, setUnits] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [dateError, setDateError] = useState<string | null>(null);
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
        const res = await axios.get('https://uattransferapi.dfccil.com/api/SapPo');
        setData(res.data.data ?? []);
        setUnits(res?.data?.units);
        setError(null);
      } catch (err) {
        setError('Failed to fetch Purchase Order data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'srNo',
        header: 'Sr. No.',
        size: 65,
        cell: ({ row }) => <div className="font-semibold">{row.index + 1}</div>,
      },
      {
        accessorKey: 'poNo',
        header: 'PO No',
        size: 120,
        showSortIcon: true,
        enableSorting: true,
        cell: ({ row }) => <div className="px-4 py-2 font-semibold">{row.original.poNo || '-'}</div>,
      },
      {
        accessorKey: 'poOrderValue',
        header: 'PO amount',
        size: 200,
        showSortIcon: true,
        enableSorting: true,
        cell: ({ row }) => <div className="px-4 py-2 font-semibold  text-right">{formatRupees(row?.original?.poOrderValue)}</div>,
      },
      {
        accessorKey: 'poType1',
        header: (
          <div className="flex justify-between flex-col">
            <span>PO type</span>
            <span className='text-[9px]'>(capex,opex,deposit work)</span>
          </div>
        ),
        size: 180,
        enableSorting: false,
        showSortIcon: false,
        cell: ({ row }) => {
          const val = row?.original?.poType1 || '-';
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="max-w-[220px] truncate font-semibold cursor-pointer px-4">{val}</div>
                </TooltipTrigger>
                <TooltipContent className="max-w-md break-words">
                  <p>{val}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        showSortIcon: true,
        enableSorting: true,
        size: 160,
        cell: ({ row }) => <div className="px-4 py-2 font-semibold">{row.original.unit || '-'}</div>,
      },

      {
        accessorKey: 'bankPayment',
        showSortIcon: true,
        enableSorting: true,
        header: 'Bank Payment',
        size: 180,
        cell: ({ row }) => <div className="px-4 py-2 font-semibold  text-right">{formatRupees(row?.original?.bankPayment)}</div>,
      },

      {
        accessorKey: 'cgstAmount',

        showSortIcon: false,
        enableSorting: false,
        header: 'CGST',
        size: 110,
        cell: ({ row }) => <div className="px-4 py-2 font-semibold  text-right">{formatDecimal(row?.original?.cgstAmount)}</div>,
      },
      {
        accessorKey: 'cgsttds',
        header: 'CGST TDS',
        showSortIcon: false,
        enableSorting: false,
        size: 110,
        cell: ({ row }) => <div className="px-4 py-2 font-semibold  text-right">{formatDecimal(row?.original?.cgsttds)}</div>,
      },
      {
        accessorKey: 'sgstAmount',
        showSortIcon: false,
        enableSorting: false,
        header: 'SGST',
        size: 110,
        cell: ({ row }) => <div className="px-4 py-2 font-semibold  text-right">{formatDecimal(row?.original?.sgstAmount)}</div>,
      },
      {
        accessorKey: 'sgsttds',
        header: 'SGST TDS',
        size: 110,
        showSortIcon: false,
        enableSorting: false,
        cell: ({ row }) => <div className="px-4 py-2 font-semibold  text-right">{formatDecimal(row?.original?.sgsttds)}</div>,
      },
      {
        accessorKey: 'igstAmount',
        showSortIcon: false,
        enableSorting: false,
        header: 'IGST',
        size: 110,
        cell: ({ row }) => <div className="px-4 py-2 font-semibold  text-right">{formatDecimal(row?.original?.igstAmount)}</div>,
      },

      {
        accessorKey: 'igsttds',
        header: 'IGST TDS',
        size: 140,
        showSortIcon: false,
        enableSorting: false,
        cell: ({ row }) => <div className="px-4 py-2 font-semibold  text-right">{formatDecimal(row?.original?.igsttds)}</div>,
      },
      {
        accessorKey: 'ittds',
        showSortIcon: false,
        enableSorting: false,
        header: 'IT TDS',
        size: 150,
        cell: ({ row }) => <div className="px-4 py-2 font-semibold  text-right">{formatDecimal(row?.original?.ittds)}</div>,
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (selectedUnit && row.unit !== selectedUnit) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return Object.values(row).some((val) =>
          String(val ?? '')
            .toLowerCase()
            .includes(query)
        );
      }
      return true;
    });
  }, [data, selectedUnit, searchQuery]);

  const handleResetFilters = () => {
    setSelectedUnit('');
    setSearchQuery('');
  };
  console.log(selectedRow, 'selectedRow');
  return (
    <div className="p-6 max-w-[100vw] space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Purchase Order Excel Format</h1>
      <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Select Unit</label>
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

          {/* From Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined} // Prevents picking dates beyond 'To Date' in native browser picker
              onChange={handleFromDateChange}
              className={`w-full p-2 border rounded-lg text-sm font-medium focus:ring-2 focus:outline-none ${
                dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined} // Prevents picking dates before 'From Date' in native browser picker
              onChange={handleToDateChange}
              className={`w-full p-2 border rounded-lg text-sm font-medium focus:ring-2 focus:outline-none ${
                dateError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
          </div>

          {/* Validation Error Message */}
          {dateError && <div className="col-span-full text-xs font-semibold text-red-600 mt-1">{dateError}</div>}

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search PO, Profit Center, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleResetFilters} className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition">
            Clear Filters
          </button>
        </div>
      </div>
      {loading && <Loader />}
      {!loading && error && <div className="p-8 text-center text-red-600 font-bold bg-white rounded-xl border border-gray-200 shadow-sm">{error}</div>}
      {!loading && !error && (
        <TableList
          onRowClick={(e) => {
            setSelectedRow(e);
            setIsOpen(true);
          }}
          columns={columns}
          data={filteredData}
        />
      )}
      <PoDetailsDialog poNumber={selectedRow?.poNo} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default PurchaseOrderExcelFormate;

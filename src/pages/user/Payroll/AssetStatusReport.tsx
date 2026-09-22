import ReportTable from '@/components/common/ReportTable';
import Loader from '@/components/ui/loader';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import { FilterX } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

const AssetStatusReport = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchdata = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/Reports/separated-employees');
      setData(res.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchdata();
  }, []);

  const { unitOptions } = useMemo(() => {
    if (!Array.isArray(data)) {
      return {
        unitOptions: [],
      };
    }

    const units = [...new Set(data.map((item) => item.profitCentre).filter(Boolean))];

    return {
      unitOptions: units,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter((item) => {
      const matchUnit = selectedUnit === 'all' || item.profitCentre === selectedUnit;
      return matchUnit;
    });
  }, [data, selectedUnit]);

  const rightElements = (
    <div className="flex items-center gap-2">
      <select
        value={selectedUnit}
        onChange={(e) => setSelectedUnit(e.target.value)}
        className="h-[30px] w-[180px] px-2 text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
      >
        <option value="all">All Profit Center</option>
        {unitOptions.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>

      {/* Reset Button */}
      {selectedUnit !== 'all' && (
        <button
          onClick={() => {
            setSelectedUnit('all');
          }}
          className="flex items-center gap-1 h-[30px] px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-900 rounded transition-colors"
          title="Reset all filters"
        >
          <FilterX className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );

  const columns = useMemo(
    () => [
      {
        id: 'srNo',
        header: 'Sr. No.',
        size: 75,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold text-center">{row.index + 1}</div>,
      },
      {
        accessorKey: 'profitCentre',
        header: 'Profit Center',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.profitCentre || '-'}</span>,
      },
      {
        accessorKey: 'unitName',
        header: 'Unit Name',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.unitName || '-'}</div>,
      },
      {
        accessorKey: 'employeeCode',
        header: 'Employee Code',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.employeeCode || '-'}</div>,
      },
      {
        accessorKey: 'nameOfEmployee',
        header: 'Employee Name',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.nameOfEmployee || '-'}</div>,
      },
      {
        accessorKey: 'assetsPurchased',
        header: 'Assets Purchased',
        size: 160,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.assetsPurchased || '-'}</div>,
      },
      {
        accessorKey: 'dateOfPurchase',
        header: 'Date of Purchase',
        size: 170,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{formatDate(row?.original?.dateOfPurchase || '-')}</div>,
      },
      {
        accessorKey: 'costOfAssets',
        header: 'Cost of Assets',
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.costOfAssets)}</div>,
      },
      {
        accessorKey: 'wdvOfAssetsOnDateOfCessation',
        header: 'WDV of assets on date of cessation',
        size: 290,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row?.original?.wdvOfAssetsOnDateOfCessation || '-'}</div>,
      },
      {
        accessorKey: 'statusOfAssets',
        header: 'Status of Assets ',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.statusOfAssets || '-'}</div>,
      },
    ],
    []
  );

  return (
    <div>
      {loading && <Loader />}
      <ReportTable data={filteredData} columns={columns} showSearchInput={true} rightElements={rightElements} />;
    </div>
  );
};

export default AssetStatusReport;

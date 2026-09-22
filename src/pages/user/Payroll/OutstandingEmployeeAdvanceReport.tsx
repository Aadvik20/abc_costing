import ReportTable from '@/components/common/ReportTable';
import Loader from '@/components/ui/loader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import { FilterX } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

const OutstandingEmployeeAdvanceReport = () => {
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchdata = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/Reports/outstanding-employees');
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

  const { unitOptions, categoryOptions, periodOprions } = useMemo(() => {
    if (!Array.isArray(data)) {
      return {
        unitOptions: [],
        categoryOptions: [],
        periodOprions: [],
      };
    }

    const units = [...new Set(data.map((item) => item.profitCenter).filter(Boolean))];

    const category = [...new Set(data.map((item) => item.category).filter(Boolean))];

    const period = [...new Set(data.map((item) => item.periodOfOutstanding).filter(Boolean))];

    return {
      unitOptions: units,
      categoryOptions: category,
      periodOprions: period,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter((item) => {
      const matchUnit = selectedUnit === 'all' || item.profitCenter === selectedUnit;
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      // const matchPeriod = selectedPeriod === 'all' || item.periodOfOutstanding === selectedPeriod;
      return matchUnit && matchCategory;
    });
  }, [data, selectedUnit, selectedCategory]);

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

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="h-[30px] w-[180px] px-2 text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
      >
        <option value="all">All Category</option>
        {categoryOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* <select
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value)}
        className="h-[30px] w-[180px] px-2 text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
      >
        <option value="all">All Period of Outstanding</option>
        {periodOprions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select> */}

      {/* Reset Button */}
      {(selectedUnit !== 'all' || selectedCategory !== 'all' || selectedPeriod !== 'all') && (
        <button
          onClick={() => {
            setSelectedUnit('all');
            setSelectedCategory('all');
            setSelectedPeriod('all');
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
        accessorKey: 'category',
        header: 'Category',
        size: 160,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.category || '-'}</div>,
      },
      {
        accessorKey: 'profitCenter',
        header: 'Profit Center',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.profitCenter || '-'}</span>,
      },
      {
        accessorKey: 'unit',
        header: 'Unit Name',
        size: 170,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.unit || '-'}</div>,
      },
      // {
      //   accessorKey: 'glAccount',
      //   header: 'SAP GL Account',
      //   size: 150,
      //   enableSorting: false,
      //   cell: ({ row }: any) => <div className="font-semibold">{row?.original?.glAccount || '-'}</div>,
      // },
      // {
      //   accessorKey: 'glDescription',
      //   header: 'GL Description',
      //   size: 180,
      //   enableSorting: false,
      //   cell: ({ row }: any) => <div className="font-semibold">{row.original.glDescription || '-'}</div>,
      // },
      {
        accessorKey: 'sapGl',
        header: 'GL Account',
        size: 220,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="w-[220px]">
            <div className="font-semibold tabular-nums">{row.original.sapGl || '-'}</div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-1 text-xs text-slate-500 truncate cursor-pointer max-w-[250px]">{row.original.descGl}</div>
                </TooltipTrigger>

                <TooltipContent className="max-w-md break-words">
                  <p>{row.original.descGl}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
      {
        accessorKey: 'employeeCode',
        header: 'Employee Code',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.employeeCode || '-'}</div>,
      },
      {
        accessorKey: 'empName',
        header: 'Employee Name',
        size: 220,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.empName || '-'}</div>,
      },
      {
        accessorKey: 'outstandingAdvanceAmount',
        header: 'Outstanding Advance Amount',
        size: 270,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.outstandingAdvanceAmount)}</div>,
      },
      {
        accessorKey: 'periodOfOutstanding',
        header: 'Period of Outstanding',
        size: 220,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row?.original?.periodOfOutstanding || '-'}</div>,
      },
      // {
      //   accessorKey: 'reason',
      //   header: 'Remarks',
      //   size: 120,
      //   enableSorting: false,
      //   cell: ({ row }: any) => <div className="font-semibold">{row.original.reason || '-'}</div>,
      // },
    ],
    []
  );
  return (
    <div>
      {loading && <Loader />}
      <ReportTable data={filteredData} columns={columns} showSearchInput={true} rightElements={rightElements} />
    </div>
  );
};

export default OutstandingEmployeeAdvanceReport;

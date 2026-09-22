import ReportTable from '@/components/common/ReportTable';
import Loader from '@/components/ui/loader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import React, { useEffect, useMemo, useState } from 'react';

const OutstandingEmployeeAdvanceReport = () => {
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
      {
        accessorKey: 'reason',
        header: 'Remarks',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.reason || '-'}</div>,
      },
    ],
    []
  );
  return (
    <div>
      {loading && <Loader />}
      <ReportTable data={data} columns={columns} showSearchInput={true} />
    </div>
  );
};

export default OutstandingEmployeeAdvanceReport;

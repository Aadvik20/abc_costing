import { useAppDispatch, useAppSelector } from '@/app/hooks';
import ReportTable from '@/components/common/ReportTable';
import Loader from '@/components/ui/loader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchPoData } from '@/features/user/PoSlice';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import React, { useEffect, useMemo, useState } from 'react';

const NonMovementBalances = () => {
  //   const dispatch = useAppDispatch();
  const [data, setData] = useState([]);
  //   const { po, loading } = useAppSelector((state) => state.poSlice);

  //   useEffect(() => {
  //     if (!po || po?.length === 0) {
  //       dispatch(fetchPoData());
  //     }
  //   }, [dispatch, po]);

  const columns = useMemo(
    () => [
      {
        id: 'srNo',
        header: 'Sr. No.',
        size: 65,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold text-center">{row.index + 1}</div>,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.category || '-'}</div>,
      },
      {
        accessorKey: 'profitCenter',
        header: 'Profit Center',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.profitCenter || '-'}</span>,
      },
      {
        accessorKey: 'unitName',
        header: 'Unit Name',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.unitName || '-'}</div>,
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
        accessorKey: 'glaccount',
        header: 'GL Account',
        size: 220,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="w-[220px]">
            <div className="font-semibold tabular-nums">{row.original.glaccount || '-'}</div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-1 text-xs text-slate-500 truncate cursor-pointer max-w-[250px]">{row.original.glDescription}</div>
                </TooltipTrigger>

                <TooltipContent className="max-w-md break-words">
                  <p>{row.original.glDescription}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
      {
        accessorKey: 'vendorCode',
        header: 'Vendor/Customer Code',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.vendorCode || '-'}</div>,
      },
      {
        accessorKey: 'vendorName',
        header: 'Vendor/Customer Name',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.vendorName || '-'}</div>,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.amount)}</div>,
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.reason || '-'}</div>,
      },
    ],
    []
  );

  return (
    <div className="p-4 space-y-4">
      {/* {loading && <Loader />} */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Non Movement Balance Report</h1>
      </div>
      <ReportTable data={data} columns={columns} showSearchInput={true} />
    </div>
  );
};

export default NonMovementBalances;

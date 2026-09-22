import { useAppDispatch, useAppSelector } from '@/app/hooks';
import ReportTable from '@/components/common/ReportTable';
import Loader from '@/components/ui/loader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchPendingInventory } from '@/features/user/GrirItemsSlice';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import React, { useEffect, useMemo } from 'react';

const GrirLineItems = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.pendingInventorySlice);

  useEffect(() => {
    if (!data || data?.length === 0) {
      dispatch(fetchPendingInventory());
    }
  }, [dispatch, data]);

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
        accessorKey: 'profitCenter',
        header: 'Profit Center',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.profitCenter || '-'}</span>,
      },
      {
        accessorKey: 'assignment',
        header: 'Assignment',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row?.original?.assignment || '-'}</div>,
      },
      {
        accessorKey: 'poNumber',
        header: 'SAP PO No.',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.poNumber || '-'}</span>,
      },
      {
        accessorKey: 'documentNumber',
        header: 'Document No.',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.documentNumber || '-'}</span>,
      },
      {
        accessorKey: 'documentType',
        header: 'Document Type',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.documentType || '-'}</div>,
      },
      {
        accessorKey: 'documentDate',
        header: 'Document Date',
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{formatDate(row?.original?.documentDate || '-')}</div>,
      },
      {
        accessorKey: 'postingKey',
        header: 'Posting Key',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.postingKey || '-'}</div>,
      },
      {
        accessorKey: 'amountInLocalCurrency',
        header: 'Amount',
        size: 130,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.amountInLocalCurrency)}</div>,
      },
      {
        accessorKey: 'clearingDocument',
        header: 'Clearing Document',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row?.original?.clearingDocument || '-'}</div>,
      },
      {
        accessorKey: 'postingDate',
        header: 'Posting Date',
        size: 140,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{formatDate(row?.original?.postingDate || '-')}</div>,
      },
      {
        accessorKey: 'glAccount',
        header: 'GL Account',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row?.original?.glAccount || '-'}</div>,
      },
      {
        accessorKey: 'supplierCode',
        header: 'Supplier Code',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.supplierCode || '-'}</div>,
      },
      {
        accessorKey: 'supplierName',
        header: 'Supplier Name',
        size: 220,
        enableSorting: false,
        cell: ({ row }) => (
          <TooltipProvider delayDuration={0} skipDelayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[220px] truncate font-semibold cursor-pointer">{row?.original?.supplierName || '-'}</div>
              </TooltipTrigger>

              <TooltipContent className="max-w-md break-words">
                <p>{row?.original?.supplierName || '-'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        accessorKey: 'glUsed',
        header: 'GL Used',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row?.original?.glUsed || '-'}</div>,
      },
      {
        accessorKey: 'pendingForMoreThen3Months',
        header: 'Pending for more then 3 months',
        size: 280,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.pendingForMoreThen3Months || '-'}</div>,
      },
    ],
    []
  );

  return (
    <div className="p-4 space-y-4">
      {loading && <Loader />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Pending GR/IR Line Items</h1>
      </div>
      <ReportTable data={data} columns={columns} showSearchInput={true} />
    </div>
  );
};

export default GrirLineItems;

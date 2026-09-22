import { useAppDispatch, useAppSelector } from '@/app/hooks';
import ReportTable from '@/components/common/ReportTable';
import Loader from '@/components/ui/loader';
import { fetchOpenItem } from '@/features/user/OpenItemsSlice';
import { fetchPoData } from '@/features/user/PoSlice';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import React, { useEffect, useMemo, useState } from 'react';

const OpenItem = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.openItemSlice);

  useEffect(() => {
    if (!data || data?.length === 0) {
      dispatch(fetchOpenItem());
    }
  }, [dispatch, data]);

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
        accessorKey: 'profitCentre',
        header: 'Profit Center',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.profitCentre || '-'}</span>,
      },
      {
        accessorKey: 'fiscalYear',
        header: 'Fiscal Year',
        size: 120,
        enableSorting: true,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.fiscalYear || '-'}</span>,
      },
      {
        accessorKey: 'referenceNarration',
        header: 'Reference/Narration',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.referenceNarration || '-'}</div>,
      },
      {
        accessorKey: 'postingDate',
        header: 'Posting Date',
        size: 140,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{formatDate(row?.original?.postingDate || '-')}</div>,
      },
      {
        accessorKey: 'documentNumber',
        header: 'Document No.',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.documentNumber || '-'}</span>,
      },
    ],
    []
  );

  return (
    <div className="p-4 space-y-4">
      {loading && <Loader />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Open Item Clearance Report</h1>
      </div>
      <ReportTable data={data} columns={columns} showSearchInput={true} />
    </div>
  );
};

export default OpenItem;

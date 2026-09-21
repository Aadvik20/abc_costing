import { useAppDispatch, useAppSelector } from '@/app/hooks';
import ReportTable from '@/components/common/ReportTable';
import Loader from '@/components/ui/loader';
import { fetchPoData } from '@/features/user/PoSlice';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import React, { useEffect, useMemo, useState } from 'react';

const OpenItem = () => {
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
        accessorKey: 'profitCenter',
        header: 'Profit Center',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.profitCenter || '-'}</span>,
      },
      {
        accessorKey: 'fiscalYear',
        header: 'Fiscal Year',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.fiscalYear || '-'}</span>,
      },
      {
        accessorKey: 'Reference',
        header: 'Reference/Narration',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.Reference || '-'}</div>,
      },
      {
        accessorKey: 'postingDate',
        header: 'Posting Date',
        size: 140,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold">{formatDate(row?.original?.postingDate || '-')}</div>,
      },
      {
        accessorKey: 'docNo',
        header: 'Document No.',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.docNo || '-'}</span>,
      },
    ],
    []
  );

  return (
    <div className="p-4 space-y-4">
      {/* {loading && <Loader />} */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Open Item Clearance Report</h1>
      </div>
      <ReportTable data={data} columns={columns} showSearchInput={true} />
    </div>
  );
};

export default OpenItem;

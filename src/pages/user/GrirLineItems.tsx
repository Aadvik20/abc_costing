import { useAppDispatch, useAppSelector } from '@/app/hooks';
import ReportTable from '@/components/common/ReportTable';
import Loader from '@/components/ui/loader';
import { fetchPoData } from '@/features/user/PoSlice';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import React, { useEffect, useMemo, useState } from 'react';

const GrirLineItems = () => {
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
        size: 75,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold text-center">{row.index + 1}</div>,
      },
      {
        accessorKey: 'profitCenter',
        header: 'Profit Center',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.profitCenter || '-'}</span>,
      },
      {
        accessorKey: 'assignment',
        header: 'Assignment',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.assignment || '-'}</div>,
      },
      {
        accessorKey: 'poNo',
        header: 'SAP PO No.',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.poNo || '-'}</span>,
      },
      {
        accessorKey: 'docNo',
        header: 'Document No.',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.docNo || '-'}</span>,
      },
      {
        accessorKey: 'docType',
        header: 'Document Type',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.docType || '-'}</div>,
      },
      {
        accessorKey: 'docDate',
        header: 'Document Date',
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold">{formatDate(row?.original?.docDate || '-')}</div>,
      },
      {
        accessorKey: 'postingKey',
        header: 'Posting Key',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.postingKey || '-'}</div>,
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        size: 130,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.amount)}</div>,
      },
      {
        accessorKey: 'clearingDoc',
        header: 'Clearing Document',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.clearingDoc || '-'}</div>,
      },
      {
        accessorKey: 'postingDate',
        header: 'Posting Date',
        size: 140,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold">{formatDate(row?.original?.postingDate || '-')}</div>,
      },
      {
        accessorKey: 'glAccount',
        header: 'GL Account',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.glAccount || '-'}</div>,
      },
      {
        accessorKey: 'supplierCode',
        header: 'Supplier Code',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.supplierCode || '-'}</div>,
      },
      {
        accessorKey: 'supplierName',
        header: 'Supplier Name',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.supplierName || '-'}</div>,
      },
      {
        accessorKey: 'glAccount',
        header: 'GL Used',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.glAccount || '-'}</div>,
      },
      {
        accessorKey: 'pending',
        header: 'Pending for more then 3 months',
        size: 280,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.pending || '-'}</div>,
      },
    ],
    []
  );

  return (
    <div className="p-4 space-y-4">
      {/* {loading && <Loader />} */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Pending GR/IR Line Items</h1>
      </div>
      <ReportTable data={data} columns={columns} showSearchInput={true} />
    </div>
  );
};

export default GrirLineItems;

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import ReportTable from '@/components/common/ReportTable';
import Loader from '@/components/ui/loader';
import { fetchMsmeVendor } from '@/features/user/MsmeVendorSlice';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import React, { useEffect, useMemo } from 'react';

const MsmeVendorReport = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.msmeVendorSlice);

  useEffect(() => {
    if (!data || data?.length === 0) {
      dispatch(fetchMsmeVendor());
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
        accessorKey: 'profitCentre',
        header: 'Profit Center',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row?.original?.profitCentre || '-'}</div>,
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        size: 110,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.unit || '-'}</div>,
      },
      {
        accessorKey: 'vendorCode',
        header: 'Vendor Code',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row?.original?.vendorCode || '-'}</div>,
      },
      {
        accessorKey: 'vendorName',
        header: 'Vendor Name',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold ">{row?.original?.vendorName || '-'}</div>,
      },
      {
        accessorKey: 'pan',
        header: 'PAN',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums ">{row?.original?.pan || '-'}</div>,
      },
      {
        accessorKey: 'categoryOfMsme',
        header: 'Category of MSME',
        size: 170,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.categoryOfMsme || '-'}</div>,
      },
      {
        accessorKey: 'outstandingBalance',
        header: 'Outstanding Balance',
        size: 220,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.outstandingBalance)}</div>,
      },
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice Number',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.invoiceNumber || '-'}</div>,
      },
      {
        accessorKey: 'invoiceDate',
        header: 'Invoice Date',
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{formatDate(row?.original?.invoiceDate || '-')}</div>,
      },
      {
        accessorKey: 'dueDateForPayment',
        header: 'Due Date for Payment',
        size: 220,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{formatDate(row?.original?.dueDateForPayment || '-')}</div>,
      },
      {
        accessorKey: 'noOfDaysOutstanding',
        header: 'No. of days outstanding',
        size: 220,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.noOfDaysOutstanding || '-'}</div>,
      },
    ],
    []
  );
  return (
    <div>
      {loading && <Loader />}
      <ReportTable columns={columns} data={data} />
    </div>
  );
};

export default MsmeVendorReport;

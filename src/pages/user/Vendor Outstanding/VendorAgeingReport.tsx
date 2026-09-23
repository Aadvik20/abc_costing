import { useAppDispatch, useAppSelector } from '@/app/hooks';
import ReportTable from '@/components/common/ReportTable';
import Loader from '@/components/ui/loader';
import { fetchVendorAgeing } from '@/features/user/VendorAgeingSlice';
import { formatRupees } from '@/lib/helperFunction';
import React, { useEffect, useMemo, useState } from 'react';

const VendorAgeingReport = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((state) => state.vendorAgeingSlice);

  useEffect(() => {
    if (!data || data?.length === 0) {
      dispatch(fetchVendorAgeing());
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
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.unit || '-'}</div>,
      },
      {
        accessorKey: 'vendorCode',
        header: 'Vendor Code',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.vendorCode || '-'}</div>,
      },
      {
        accessorKey: 'vendorName',
        header: 'Vendor Name',
        size: 220,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums ">{row?.original?.vendorName || '-'}</div>,
      },
      {
        accessorKey: 'outstandingBalance',
        header: 'Outstanding Balance',
        size: 220,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold text-right tabular-nums">{formatRupees(row.original.outstandingBalance)}</div>,
      },
      {
        accessorKey: 'lessThan1Year',
        header: 'Less than 1 Year',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.lessThan1Year || '-'}</div>,
      },
      {
        accessorKey: 'oneToTwoYears',
        header: '1-2 Year',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.oneToTwoYears || '-'}</div>,
      },
      {
        accessorKey: 'twoToThreeYears',
        header: '2-3 Year',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.twoToThreeYears || '-'}</div>,
      },
      {
        accessorKey: 'moreThan3Years',
        header: 'More than 3 Year',
        size: 160,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.moreThan3Years || '-'}</div>,
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

export default VendorAgeingReport;

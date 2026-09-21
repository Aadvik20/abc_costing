import ReportTable from '@/components/common/ReportTable';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import React, { useMemo, useState } from 'react';

const AssetStatusReport = () => {
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
        accessorKey: 'unitName',
        header: 'Unit Name',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.unitName || '-'}</div>,
      },
      {
        accessorKey: 'vendorCode',
        header: 'Employee Code',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.vendorCode || '-'}</div>,
      },
      {
        accessorKey: 'vendorName',
        header: 'Employee Name',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.vendorName || '-'}</div>,
      },
      {
        accessorKey: 'vendorName',
        header: 'Assets Purchased',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.vendorName || '-'}</div>,
      },
      {
        accessorKey: 'postingDate',
        header: 'Date of Purchase',
        size: 165,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold">{formatDate(row?.original?.postingDate || '-')}</div>,
      },
      {
        accessorKey: 'amount',
        header: 'Cost of Assets',
        size: 140,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.amount)}</div>,
      },
      {
        accessorKey: 'postingDate',
        header: 'WDV of assets on date of cessation',
        size: 280,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold">{formatDate(row?.original?.postingDate || '-')}</div>,
      },
      {
        accessorKey: 'reason',
        header: 'Status of Assets ',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.reason || '-'}</div>,
      },
    ],
    []
  );

  return <ReportTable data={data} columns={columns} showSearchInput={true} />;
};

export default AssetStatusReport;

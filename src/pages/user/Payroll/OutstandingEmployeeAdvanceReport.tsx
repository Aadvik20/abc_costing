import ReportTable from '@/components/common/ReportTable';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import React, { useMemo, useState } from 'react';

const OutstandingEmployeeAdvanceReport = () => {
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
        accessorKey: 'category',
        header: 'Category',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.category || '-'}</div>,
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
        accessorKey: 'glAccount',
        header: 'SAP GL Account',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.glAccount || '-'}</div>,
      },
      {
        accessorKey: 'glDescription',
        header: 'GL Description',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.glDescription || '-'}</div>,
      },
      {
        accessorKey: 'vendorCode',
        header: 'Employee Code',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.vendorCode || '-'}</div>,
      },
      {
        accessorKey: 'vendorName',
        header: 'Employee Name',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.vendorName || '-'}</div>,
      },
      {
        accessorKey: 'amount',
        header: 'Outstanding Advance Amount',
        size: 270,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.amount)}</div>,
      },
      {
        accessorKey: 'postingDate',
        header: 'Period of Outstanding',
        size: 220,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold">{formatDate(row?.original?.postingDate || '-')}</div>,
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

  return <ReportTable data={data} columns={columns} showSearchInput={true} />;
};

export default OutstandingEmployeeAdvanceReport;

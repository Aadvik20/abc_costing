import ReportTable from '@/components/common/ReportTable';
import { formatRupees } from '@/lib/helperFunction';
import React, { useMemo, useState } from 'react';

const WageTypeGLReport = () => {
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
        accessorKey: 'desp',
        header: 'Description of Wage Type',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.desp || '-'}</span>,
      },
      {
        accessorKey: 'wageType',
        header: 'Wage Type',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.wageType || '-'}</span>,
      },
      {
        accessorKey: 'gl',
        header: 'GL Description',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.gl || '-'}</div>,
      },
      {
        accessorKey: 'mappedGl',
        header: 'GL',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.mappedGl || '-'}</div>,
      },
      {
        accessorKey: 'poOrderValue',
        header: 'Balance as per Payroll/HCM',
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.poOrderValue)}</div>,
      },
      {
        accessorKey: 'bankPaymentReleased',
        header: 'Balance as per FICO',
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.bankPaymentReleased)}</div>,
      },
    ],
    []
  );

  return <ReportTable data={data} columns={columns} showSearchInput={true} />;
};

export default WageTypeGLReport;

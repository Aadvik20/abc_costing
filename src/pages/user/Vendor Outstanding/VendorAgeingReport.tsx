import ReportTable from '@/components/common/ReportTable';
import { formatRupees } from '@/lib/helperFunction';
import React, { useMemo, useState } from 'react';

const VendorAgeingReport = () => {
  const [data, setData] = useState([]);
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
        accessorKey: 'capexOpex',
        header: 'Profit Center',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.capexOpex || '-'}</div>,
      },
      {
        accessorKey: 'capexOpex',
        header: 'Unit',
        size: 110,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.capexOpex || '-'}</div>,
      },
      {
        accessorKey: 'capexOpex',
        header: 'Vendor Code',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.capexOpex || '-'}</div>,
      },
      {
        accessorKey: 'contractNo',
        header: 'Vendor Name',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold ">{row?.original?.contractNo || '-'}</div>,
      },
      {
        accessorKey: 'poNo',
        header: 'Outstanding Balance',
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => <span className="font-semibold">{formatRupees(row.original.poNo)}</span>,
      },
      {
        accessorKey: 'glaccount',
        header: 'Less than 1 Year',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.glaccount || '-'}</div>,
      },
      {
        accessorKey: 'glaccount',
        header: '1-2 Year',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.glaccount || '-'}</div>,
      },
      {
        accessorKey: 'glaccount',
        header: '2-3 Year',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.glaccount || '-'}</div>,
      },
      {
        accessorKey: 'glaccount',
        header: 'More than 3 Year',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.glaccount || '-'}</div>,
      },
    ],
    []
  );
  return <ReportTable columns={columns} data={data} />;
};

export default VendorAgeingReport;

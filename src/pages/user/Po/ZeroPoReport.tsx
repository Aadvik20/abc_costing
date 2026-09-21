import ReportTable from '@/components/common/ReportTable';
import React, { useMemo, useState } from 'react';

const ZeroPoReport = () => {
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
        header: 'Purchasing Documents',
        size: 200,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.capexOpex || '-'}</div>,
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
        header: 'Plant Location',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.capexOpex || '-'}</div>,
      },
      {
        accessorKey: 'contractNo',
        header: 'Contract NO.',
        size: 250,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold ">{row?.original?.contractNo || '-'}</div>,
      },
      {
        accessorKey: 'contractNo',
        header: 'Contract Description',
        size: 220,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold ">{row?.original?.contractNo || '-'}</div>,
      },
      {
        accessorKey: 'poNo',
        header: 'Nature of Contract',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.poNo || '-'}</span>,
      },
      {
        accessorKey: 'poNo',
        header: 'Name of Vendor',
        size: 160,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.poNo || '-'}</span>,
      },
      {
        accessorKey: 'glaccount',
        header: 'GL Account',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.glaccount || '-'}</div>,
      },
      {
        accessorKey: 'glaccount',
        header: 'GL Description',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.glaccount || '-'}</div>,
      },
    ],
    []
  );
  return <ReportTable columns={columns} data={data} />;
};

export default ZeroPoReport;

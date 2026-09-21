import ReportTable from '@/components/common/ReportTable';
import { formatRupees } from '@/lib/helperFunction';
import React, { useMemo, useState } from 'react';

const NegativePoReport = () => {
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
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.capexOpex || '-'}</div>,
      },
      {
        accessorKey: 'capexOpex',
        header: 'Plant Location',
        size: 160,
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
        size: 250,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold ">{row?.original?.contractNo || '-'}</div>,
      },
      {
        accessorKey: 'poNo',
        header: 'Name of Vendor',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.poNo || '-'}</span>,
      },
      {
        accessorKey: 'poOrderValue',
        header: 'PO Order Value',
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.poOrderValue)}</div>,
      },
      {
        accessorKey: 'bankPaymentReleased',
        header: 'Cummulative GR/SES Value',
        size: 250,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.bankPaymentReleased)}</div>,
      },
      {
        accessorKey: 'pendingLiabilities',
        header: 'Still to be delivered',
        size: 220,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.bankPaymentReleased)}</div>,
      },
    ],
    []
  );
  return <ReportTable columns={columns} data={data} />;
};

export default NegativePoReport;

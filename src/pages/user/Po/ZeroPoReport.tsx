import ReportTable from '@/components/common/ReportTable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React, { useMemo } from 'react';

interface ZeroPoReportProps {
  data: any[];
}

const ZeroPoReport: React.FC<ZeroPoReportProps> = ({ data }) => {
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
        accessorKey: 'capexOpx',
        header: 'Purchasing Documents',
        size: 200,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.capexOpx || '-'}</div>,
      },
      {
        accessorKey: 'capexOpex',
        header: 'Profit Center',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.capexOpex || '-'}</div>,
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.unit || '-'}</div>,
      },
      {
        accessorKey: 'capexOpe',
        header: 'Plant Location',
        size: 140,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.capexOpe || '-'}</div>,
      },
      {
        accessorKey: 'contractNo',
        header: 'Contract NO.',
        size: 220,
        cell: ({ row }) => (
          <TooltipProvider delayDuration={0} skipDelayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[220px] truncate font-semibold cursor-pointer">{row?.original?.contractNo || '-'}</div>
              </TooltipTrigger>

              <TooltipContent className="max-w-md break-words">
                <p>{row?.original?.contractNo || '-'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        accessorKey: 'contractN',
        header: 'Contract Description',
        size: 220,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold ">{row?.original?.contractN || '-'}</div>,
      },
      {
        accessorKey: 'poN',
        header: 'Nature of Contract',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.poN || '-'}</span>,
      },
      {
        accessorKey: 'poNw',
        header: 'Name of Vendor',
        size: 160,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.poNw || '-'}</span>,
      },
      {
        accessorKey: 'glaccount',
        header: 'GL Account',
        size: 220,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="w-[220px]">
            <div className="font-semibold tabular-nums">{row.original.glaccount || '-'}</div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mt-1 text-xs text-slate-500 truncate cursor-pointer max-w-[250px]">{row.original.glDescription}</div>
                </TooltipTrigger>

                <TooltipContent className="max-w-md break-words">
                  <p>{row.original.glDescription}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
      },
    ],
    []
  );
  return <ReportTable columns={columns} data={data} />;
};

export default ZeroPoReport;

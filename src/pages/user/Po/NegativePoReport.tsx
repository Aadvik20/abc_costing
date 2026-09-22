import ReportTable from '@/components/common/ReportTable';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatRupees } from '@/lib/helperFunction';
import { FilterX } from 'lucide-react';
import React, { useMemo, useState } from 'react';
interface NegativePoReportProps {
  data: any[];
}

const NegativePoReport: React.FC<NegativePoReportProps> = ({ data }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const { unitOptions } = useMemo(() => {
    if (!Array.isArray(data)) {
      return {
        unitOptions: [],
      };
    }

    const units = [...new Set(data.map((item) => item.unit).filter(Boolean))];

    return {
      unitOptions: units,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter((item) => {
      const matchUnit = selectedUnit === 'all' || item.unit === selectedUnit;
      return matchUnit;
    });
  }, [data, selectedUnit]);

  const rightElements = (
    <div className="flex items-center gap-2">
      <select
        value={selectedUnit}
        onChange={(e) => setSelectedUnit(e.target.value)}
        className="h-[30px] w-[180px] px-2 text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
      >
        <option value="all">All Units</option>
        {unitOptions.map((unit) => (
          <option key={unit} value={unit}>
            {unit}
          </option>
        ))}
      </select>

      {/* Reset Button */}
      {selectedUnit !== 'all' && (
        <button
          onClick={() => {
            setSelectedUnit('all');
          }}
          className="flex items-center gap-1 h-[30px] px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-900 rounded transition-colors"
          title="Reset all filters"
        >
          <FilterX className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
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
        accessorKey: 'poNo',
        header: 'Purchasing Documents',
        size: 200,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row?.original?.poNo || '-'}</div>,
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.unit || '-'}</div>,
      },
      {
        accessorKey: 'contractno',
        header: 'Contract NO.',
        size: 220,
        enableSorting: false,
        cell: ({ row }) => (
          <TooltipProvider delayDuration={0} skipDelayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[220px] truncate font-semibold cursor-pointer">{row?.original?.contractno || '-'}</div>
              </TooltipTrigger>

              <TooltipContent className="max-w-md break-words">
                <p>{row?.original?.contractno || '-'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        accessorKey: 'contractN',
        header: 'Contract Description',
        size: 190,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold ">{row?.original?.contractN || '-'}</div>,
      },
      {
        accessorKey: 'suppliercode',
        header: 'Name of Vendor',
        size: 250,
        enableSorting: false,
        cell: ({ row }) => (
          <TooltipProvider delayDuration={0} skipDelayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[250px] truncate font-semibold cursor-pointer">{row?.original?.suppliercode || '-'}</div>
              </TooltipTrigger>

              <TooltipContent className="max-w-md break-words">
                <p>{row?.original?.suppliercode || '-'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        accessorKey: 'poordervalue',
        header: 'PO Order Value',
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.poordervalue)}</div>,
      },
      {
        accessorKey: 'deliveredvalue',
        header: 'Cummulative GR/SES Value',
        size: 250,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.deliveredvalue)}</div>,
      },
      {
        accessorKey: 'balancetobeinvoice',
        header: 'Still to be delivered',
        size: 220,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.balancetobeinvoice)}</div>,
      },
    ],
    []
  );
  return <ReportTable columns={columns} data={filteredData} showSearchInput={true} rightElements={rightElements} />;
};

export default NegativePoReport;

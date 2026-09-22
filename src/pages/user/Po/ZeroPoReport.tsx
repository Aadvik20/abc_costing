import ReportTable from '@/components/common/ReportTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FilterX, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface ZeroPoReportProps {
  data: any[];
}

const ZeroPoReport: React.FC<ZeroPoReportProps> = ({ data }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedCapexOpex, setSelectedCapexOpex] = useState<string>('all');
  const { unitOptions, capexOpexOptions } = useMemo(() => {
    if (!Array.isArray(data)) {
      return {
        unitOptions: [],
        capexOpexOptions: [],
      };
    }

    const units = [...new Set(data.map((item) => item.unit).filter(Boolean))];

    const capexOpex = [...new Set(data.map((item) => item.capexopex).filter(Boolean))];

    return {
      unitOptions: units,
      capexOpexOptions: capexOpex,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter((item) => {
      const matchUnit = selectedUnit === 'all' || item.unit === selectedUnit;
      const matchCapexOpex = selectedCapexOpex === 'all' || item.capexopex === selectedCapexOpex;
      return matchUnit && matchCapexOpex;
    });
  }, [data, selectedUnit, selectedCapexOpex]);

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

      <select
        value={selectedCapexOpex}
        onChange={(e) => setSelectedCapexOpex(e.target.value)}
        className="h-[30px] w-[180px] px-2 text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
      >
        <option value="all">All Nature of Contract</option>
        {capexOpexOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {/* Reset Button */}
      {(selectedUnit !== 'all' || selectedCapexOpex !== 'all') && (
        <button
          onClick={() => {
            setSelectedUnit('all');
            setSelectedCapexOpex('all');
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
        size: 130,
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
        size: 220,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold ">{row?.original?.contractN || '-'}</div>,
      },
      {
        accessorKey: 'capexopex',
        header: 'Nature of Contract',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold">{row.original.capexopex || '-'}</span>,
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
  return <ReportTable columns={columns} data={filteredData} showSearchInput={true} rightElements={rightElements} />;
};

export default ZeroPoReport;

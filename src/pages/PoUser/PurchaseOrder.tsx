import React, { useEffect, useState } from 'react';
import { useMemo } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPoData } from '@/features/ManagePoSlice';
import toast from 'react-hot-toast';
import TableList from '@/components/ui/data-table';
import Loader from '@/components/ui/loader';
import { PurchaseOrderModal } from '@/components/dailogs/PurchaseOrderModal';
import { ApproveHistoryModal } from '@/components/dailogs/ApproveHistoryModal';
import { formatDate, formatDecimal, formatRupees } from '@/lib/helperFunction';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PurchaseOrder = () => {
  const [supplier, setSupplier] = useState([]);

  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCapex, setSelectedCapex] = useState('');

  const [selectedRow, setSelectedRow] = React.useState(null);
  const [showModal, setShowModal] = useState(false);
  const [shoeModal2, setShowModal2] = useState(false);

  const dispatch = useAppDispatch();
  const { po, loading } = useAppSelector((state) => state.poSlice);
  const { units } = useAppSelector((state) => state.user);
  const { departments } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!po.length) {
      dispatch(fetchPoData());
    }
  }, [dispatch, po?.length]);

  useEffect(() => {
    if (units.length === 1) {
      setSelectedUnit(units[0].value);
      setSelectedDepartment('');
      setSelectedSupplier('');
      setSelectedCapex('');
    }
  }, [units]);

  useEffect(() => {
    if (po?.length) {
      setSupplier([...new Set(po.map((r) => r.supplierCode).filter(Boolean))]);
      // setCapex([...new Set(po.map((r) => r.capexOpex).filter(Boolean))]);
    }
  }, [po]);

  const capex = useMemo(() => {
    return [...new Set((po || []).map((r) => r.capexOpex).filter(Boolean))];
  }, [po]);

  const onSave = async (payload) => {
    try {
      const response = await axiosInstance.post('/User/Demand', payload);
      if (response.data.success) {
        toast.success('Demand Raised Successfully');
        setShowModal(false);
        dispatch(fetchPoData());
      } else {
        toast.error(response.data.errorMessage);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.errorMessage || 'Something went wrong');
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'srNo',
        header: 'Sr. No.',
        size: 65,
        cell: ({ row }) => <div className="font-semibold">{row.index + 1}</div>,
      },
      {
        accessorKey: 'supplierCode',
        header: 'Supplier Code',
        size: 220,
        showSortIcon: false,
        enableSorting: false,
        cell: ({ row }) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[220px] truncate font-semibold cursor-pointer">{row?.original?.supplierCode || '-'}</div>
              </TooltipTrigger>

              <TooltipContent className="max-w-md break-words">
                <p>{row?.original?.supplierCode || '-'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        accessorKey: 'contractNo',
        header: 'Contract NO.',
        size: 220,
        showSortIcon: false,
        enableSorting: false,
        cell: ({ row }) => (
          <TooltipProvider>
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
        accessorKey: 'poNo',
        header: 'PO NO.',
        size: 150,
        cell: ({ row }) => <div className="px-2 py-2 font-semibold">{row.original.poNo || '-'}</div>,
      },
      {
        accessorKey: 'podate',
        header: 'PO Date',
        size: 120,
        cell: ({ row }) => <div className="px-2 py-2 font-semibold">{formatDate(row.original.podate) || '-'}</div>,
      },
      {
        accessorKey: 'capexOpex',
        header: 'Capex/Opex',
        showSortIcon: false,
        enableSorting: false,
        size: 100,
        cell: ({ row }) => <div className="px-2 py-2 font-semibold">{row.original.capexOpex || '-'}</div>,
      },
      {
        accessorKey: 'poOrderValue',
        header: 'PO Order Value',
        showSortIcon: false,
        enableSorting: false,
        size: 150,
        cell: ({ row }) => <div className="px-2 py-2 font-semibold text-right">{formatRupees(row?.original?.poOrderValue)}</div>,
      },
      {
        accessorKey: 'deliveredValue',
        header: 'Delivered Value',
        showSortIcon: false,
        enableSorting: false,
        size: 150,
        cell: ({ row }) => <div className="px-2 py-2 font-semibold text-right">{formatRupees(row?.original?.deliveredValue)}</div>,
      },
      {
        accessorKey: 'balanceToBeInvoice',
        header: 'Balance to be invoiced',
        showSortIcon: false,
        enableSorting: false,
        size: 180,
        cell: ({ row }) => <div className="px-2 py-2 font-semibold text-right">{formatRupees(row?.original?.balanceToBeInvoice)}</div>,
      },
      {
        accessorKey: 'bankPayment',
        header: 'Bank Payment',
        showSortIcon: false,
        enableSorting: false,
        size: 150,
        cell: ({ row }) => <div className="px-2 py-2 font-semibold text-right">{formatRupees(row?.original?.bankPayment)}</div>,
      },
      {
        accessorKey: 'cgst',
        header: 'CGST',
        showSortIcon: false,
        enableSorting: false,
        size: 150,
        cell: ({ row }) => <div className="px-2 py-2 font-semibold text-right">{formatDecimal(row?.original?.cgst)}</div>,
      },
      {
        accessorKey: 'sgst',
        header: 'SGST',
        showSortIcon: false,
        enableSorting: false,
        size: 150,
        cell: ({ row }) => <div className="px-2 py-2 font-semibold text-right">{formatDecimal(row?.original?.sgst)}</div>,
      },
      {
        accessorKey: 'igst',
        header: 'IGST',
        showSortIcon: false,
        enableSorting: false,
        size: 150,
        cell: ({ row }) => <div className="px-2 font-semibold text-right">{formatDecimal(row?.original?.igst)}</div>,
      },
      {
        accessorKey: 'tds',
        header: 'TDS',
        showSortIcon: false,
        enableSorting: false,
        size: 150,
        cell: ({ row }) => <div className="px-2 font-semibold text-right">{formatDecimal(row?.original?.tds)}</div>,
      },
      {
        accessorKey: 'glaccount',
        header: 'GL Account',
        showSortIcon: false,
        enableSorting: false,
        size: 150,
        cell: ({ row }) => <div className="px-2 font-semibold">{row?.original?.glaccount || '-'}</div>,
      },
    ],
    []
  );
  const tableData = useMemo(() => {
    let data = po || [];

    const selectedUnitLabel = units.find((u) => u.value === selectedUnit)?.label;

    if (selectedUnitLabel) {
      data = data.filter((r) => r.unit === selectedUnitLabel);
    }

    // if (selectedDepartment) {
    //   const selectedDeptLabel = departments.find((d) => d.value === Number(selectedDepartment))?.label;
    //   data = data.filter((r) => r.department === selectedDeptLabel);
    // }

    // if (selectedSupplier) {
    //   data = data.filter((r) => r.supplierCode === selectedSupplier);
    // }

    if (selectedCapex) {
      data = data.filter((r) => r.capexOpex === selectedCapex);
    }

    return data;
  }, [po, selectedUnit, selectedDepartment, selectedSupplier, units, departments, selectedCapex]);

  const filteredSuppliers = useMemo(() => {
    const selectedUnitLabel = units.find((u) => u.value === selectedUnit)?.label;
    const selectedDeptLabel = departments.find((d) => d.value === Number(selectedDepartment))?.label;

    if (!selectedDepartment) return supplier;

    return [
      ...new Set(
        po
          .filter((r) => r.unit === selectedUnitLabel && r.department === selectedDeptLabel)
          .map((r) => r.supplierCode)
          .filter(Boolean)
      ),
    ];
  }, [selectedUnit, selectedDepartment, po, units, departments]);

  const filteredCapex = useMemo(() => {
    const selectedUnitLabel = units.find((u) => u.value === selectedUnit)?.label;
    const selectedDeptLabel = departments.find((d) => d.value === Number(selectedDepartment))?.label;

    if (!selectedDepartment) return capex;

    return [
      ...new Set(
        po
          .filter((r) => r.unit === selectedUnitLabel && r.department === selectedDeptLabel)
          .map((r) => r.capexOpex)
          .filter(Boolean)
      ),
    ];
  }, [selectedUnit, selectedDepartment, po, units, departments]);

  const totals = useMemo(() => {
    return tableData.reduce(
      (acc, curr) => {
        acc.poOrderValue += Number(curr.poOrderValue || 0);
        acc.deliveredValue += Number(curr.deliveredValue || 0);
        acc.balanceToBeInvoice += Number(curr.balanceToBeInvoice || 0);
        return acc;
      },
      {
        poOrderValue: 0,
        deliveredValue: 0,
        balanceToBeInvoice: 0,
      }
    );
  }, [tableData]);

  return (
    <div className="p-4 md:p-6">
      {loading && <Loader />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Order Record</h1>
          <p className="text-gray-600 mt-1">Manage purchase order records</p>
        </div>
      </div>
      <div className="mt-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
          {/* Total PO Card */}
          {/* <div className="group relative overflow-hidden rounded-2xl border border-white bg-white/50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col">
            <div className="absolute -right-4 -top-4 text-blue-500/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <FileStack size={100} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100">
                  <FileStack size={20} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Total PO Order Value</span>
              </div>

              <p className="text-2xl text-right font-black tracking-tight text-slate-900 mb-3">{formatRupees(totals.poOrderValue)}</p>
            </div>

            <div className="relative z-10 border-slate-100">
              <p className="text-[11px] font-medium italic leading-relaxed text-slate-600 break-words">{formatRupeesInWords(totals.poOrderValue)}</p>
            </div>
          </div> */}

          {/* Delivered Card */}
          {/* <div className="group relative overflow-hidden rounded-2xl border border-white bg-white/50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col">
            <div className="absolute -right-4 -top-4 text-emerald-500/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <Truck size={100} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                  <Truck size={20} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Total Delivered Value</span>
              </div>

              <p className="text-2xl text-right font-black tracking-tight text-slate-900 mb-3">{formatRupees(totals.deliveredValue)}</p>
            </div>

            <div className="relative z-10 border-slate-100">
              <p className="text-[11px] font-medium italic leading-relaxed text-slate-600 break-words">{formatRupeesInWords(totals.deliveredValue)}</p>
            </div>
          </div> */}

          {/* Balance Card */}
          {/* <div className="group relative overflow-hidden rounded-2xl border border-white bg-white/50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col">
            <div className="absolute -right-4 -top-4 text-orange-500/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <Wallet size={100} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-100">
                  <Wallet size={20} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Total Balance Value</span>
              </div>

              <p className="text-2xl text-right font-black tracking-tight text-slate-900 mb-3">{formatRupees(totals.balanceToBeInvoice)}</p>
            </div>
            <div className="relative z-10 border-slate-100">
              <p className="text-[11px] font-medium italic leading-relaxed text-slate-600 break-words">{formatRupeesInWords(totals.balanceToBeInvoice)}</p>
            </div>
          </div> */}
        </div>
      </div>

      <div className="flex justify-between items-center gap-2">
        <div className="w-[220px]">
          <select
            value={selectedUnit}
            onChange={(e) => {
              setSelectedUnit(e.target.value);
              setSelectedDepartment('');
              setSelectedSupplier('');
            }}
            className=" w-[200px] px-3 py-2 border-2 rounded outline:none"
          >
            <option value="">All Units</option>
            {units.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* <select
                      value={selectedDepartment}
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value);
                        setSelectedSupplier('');
                      }}
                      disabled={!selectedUnit}
                      className=" w-[200px] px-3 py-2 border-2 rounded outline:none"
                    >
                      <option value="">All Departments</option>
                      {departments.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select> */}
        {/* 
                    <select
                      value={selectedSupplier}
                      onChange={(e) => {
                        setSelectedSupplier(e.target.value);
                      }}
                      disabled={!selectedDepartment}
                      className=" w-[200px] px-3 py-2 border-2 rounded outline:none"
                    >
                      <option value="">All Supplier</option>
                      {filteredSuppliers.map((s, i) => (
                        <option key={i} value={s}>
                          {s}
                        </option>
                      ))}
                    </select> */}

        {/* Capex */}
        {/* <select
                      value={selectedCapex}
                      onChange={(e) => {
                        setSelectedCapex(e.target.value);
                      }}
                      className="w-[200px] px-3 py-2 border-2 rounded outline-none"
                    >
                      <option value="">Capex/Opex</option>
                      {filteredCapex.map((c, i) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </select> */}

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCapex('')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedCapex === '' ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            All
          </button>

          {filteredCapex.map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCapex(curr)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                selectedCapex === curr ? 'bg-orange-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      <div>
        <TableList
          data={tableData}
          columns={columns}
          showRefresh={true}
          onRefresh={() => {
            dispatch(fetchPoData());
          }}
        />
      </div>

      <PurchaseOrderModal open={showModal} onOpenChange={setShowModal} initialData={selectedRow} onSave={onSave} />

      <ApproveHistoryModal open={shoeModal2} onOpenChange={setShowModal2} initialData={selectedRow} />
    </div>
  );
};

export default PurchaseOrder;

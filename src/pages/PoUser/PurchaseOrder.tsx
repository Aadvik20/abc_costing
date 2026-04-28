import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPoData, removePoByPktblSapDump } from '@/features/ManagePoSlice';
import toast from 'react-hot-toast';
import TableList from '@/components/ui/data-table';
import Loader from '@/components/ui/loader';
import { PurchaseOrderModal } from '@/components/dailogs/PurchaseOrderModal';
import { ApproveHistoryModal } from '@/components/dailogs/ApproveHistoryModal';
import { FileStack, History, RefreshCw, Truck, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupees, formatRupeesInWords } from '@/lib/helperFunction';

const PurchaseOrder = () => {
  // const [units, setUnits] = useState([]);
  // const [departments, setDepartments] = useState([]);
  const [supplier, setSupplier] = useState([]);

  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');

  const [selectedRow, setSelectedRow] = React.useState(null);
  const [showModal, setShowModal] = useState(false);
  const [shoeModal2, setShowModal2] = useState(false);

  const dispatch = useAppDispatch();
  const { po, loading } = useAppSelector((state) => state.poSlice);
  const { units } = useAppSelector((state) => state.user);
  const { departments } = useAppSelector((state) => state.user);

  const allowedUnits = new Set(units.map((u) => u.label));
  const allowedDepts = new Set(departments.map((d) => d.label));

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
    }
  }, [units]);

  useEffect(() => {
    if (po?.length) {
      // setUnits([...new Set(po.map((r) => r.unit).filter(Boolean))]);
      // setDepartments([...new Set(po.map((r) => r.department).filter(Boolean))]);
      setSupplier([...new Set(po.map((r) => r.supplierCode).filter(Boolean))]);
    }
  }, [po]);

  const onSave = async (payload) => {
    try {
      const response = await axiosInstance.post('/User/Demand', payload);
      if (response.data.success) {
        toast.success('Demand Raised Successfully');
        setShowModal(false);
        dispatch(fetchPoData());

        // dispatch(removePoByPktblSapDump(Number(sapDump)));
      } else {
        toast.error(response.data.errorMessage);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.errorMessage || 'Something went wrong');
    }
  };

  const columns = useMemo(
    () => [
      // {
      //   accessorKey: 'unit',
      //   header: 'Unit',
      //   cell: ({ row }) => <div className="px-2 font-semibold">{row.original.unit || '-'}</div>,
      // },
      // {
      //   accessorKey: 'department',
      //   header: 'Department',
      //   cell: ({ row }) => <div className="px-2 font-semibold">{row.original.department || '-'}</div>,
      // },
      {
        accessorKey: 'supplierCode',
        header: 'Supplier Code',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.supplierCode || '-'}</div>,
      },
      {
        accessorKey: 'poNo',
        header: 'PO NO.',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.poNo || '-'}</div>,
      },
      {
        accessorKey: 'capexOpex',
        header: 'Capex/Opex',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.capexOpex || '-'}</div>,
      },
      {
        accessorKey: 'bankPayment',
        header: 'Bank Payment',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.bankPayment || '-'}</div>,
      },
      {
        accessorKey: 'cgst',
        header: 'CGST',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.cgst || '-'}</div>,
      },
      {
        accessorKey: 'sgst',
        header: 'SGST',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.sgst || '-'}</div>,
      },
      {
        accessorKey: 'igst',
        header: 'ISGT',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.igst || '-'}</div>,
      },
      {
        accessorKey: 'tds',
        header: 'TDS',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.tds || '-'}</div>,
      },
      {
        accessorKey: 'gl',
        header: 'GL Account',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.gl || '-'}</div>,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className="px-2 gap-4 flex font-semibold">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRow(row.original);
                setShowModal(true);
              }}
            >
              Raise Demand
            </Button>

            <Button
              onClick={() => {
                setSelectedRow(row.original);
                setShowModal2(true);
              }}
            >
              <History />
            </Button>
          </div>
        ),
      },
    ],
    []
  );
  const tableData = useMemo(() => {
    let data = po || [];

    // data = data.filter((r) => allowedUnits.has(r.unit) && allowedDepts.has(r.department));
      data = data.filter((r) => allowedUnits.has(r.unit));

    const selectedUnitLabel = units.find((u) => u.value === selectedUnit)?.label;

    if (selectedUnitLabel) {
      data = data.filter((r) => r.unit === selectedUnitLabel);
    }

    if (selectedDepartment) {
      const selectedDeptLabel = departments.find((d) => d.value === Number(selectedDepartment))?.label;
      data = data.filter((r) => r.department === selectedDeptLabel);
    }

    if (selectedSupplier) {
      data = data.filter((r) => r.supplierCode === selectedSupplier);
    }

    return data;
  }, [po, selectedUnit, selectedDepartment, selectedSupplier, units, departments]);

  // const filteredDepartments = useMemo(() => {
  //   if (!selectedUnit) return departments;

  //   return departments.filter((d) => d.unitId === selectedUnit);
  // }, [selectedUnit, departments]);

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
    <div className="p-4 md:p-8">
      {loading && <Loader />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Order Record</h1>
          <p className="text-gray-600 mt-1">Manage purchase order records</p>
        </div>
      </div>
      <div className="mt-3">
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 min-h-[110px] flex flex-col justify-between">
            <div className="flex items-center py-1 justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total PO Order Value</span>
            </div>
            <p className="text-2xl font-semibold text-right text-blue-600 mt-1">{formatRupees(totals.poOrderValue)}</p>
            <p className="text-xs text-slate-400 italic leading-snug mt-1">{formatRupeesInWords(totals.poOrderValue)}</p>
          </div>


          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 min-h-[110px] flex flex-col justify-between">
            <div className="flex items-center py-1 justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total DELEVIRED Value</span>
            </div>
            <p className="text-2xl font-semibold text-right text-blue-600 mt-1">{formatRupees(totals.deliveredValue)}</p>
            <p className="text-xs text-slate-400 italic leading-snug mt-1">{formatRupeesInWords(totals.deliveredValue)}</p>
          </div>


          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 min-h-[110px] flex flex-col justify-between">
            <div className="flex items-center py-1 justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total BALANCE Value</span>
            </div>
            <p className="text-2xl font-semibold text-right text-blue-600 mt-1">{formatRupees(totals.balanceToBeInvoice)}</p>
            <p className="text-xs text-slate-400 italic leading-snug mt-1">{formatRupeesInWords(totals.balanceToBeInvoice)}</p>
          </div>
        </div> */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
          {/* Total PO Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white bg-white/50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col">
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
          </div>

          {/* Delivered Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white bg-white/50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col">
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
          </div>

          {/* Balance Card */}
          <div className="group relative overflow-hidden rounded-2xl border border-white bg-white/50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 flex flex-col">
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
          </div>
        </div>
      </div>
      <Card className="border-0 shadow-lg">
        <CardContent>
          <div className="mt-5">
            <TableList
              data={tableData}
              columns={columns}
              showRefresh={true}
              onRefresh={() => {
                dispatch(fetchPoData());
              }}
              // onRowClick={(row) => {
              //   setSelectedRow(row);
              //   setShowModal(true);
              // }}
              rightElements={
                <>
                  <div className="flex items-center gap-2">
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

                    <select
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
                    </select>

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
                    </select>

                    {/* <Button
                      onClick={() => {
                        setSelectedUnit('');
                        setSelectedDepartment('');
                        setSelectedSupplier('');
                      }}
                    >
                      Reset
                    </Button> */}
                  </div>
                </>
              }
            />
          </div>
        </CardContent>
      </Card>
      <PurchaseOrderModal open={showModal} onOpenChange={setShowModal} initialData={selectedRow} onSave={onSave} />

      <ApproveHistoryModal open={shoeModal2} onOpenChange={setShowModal2} initialData={selectedRow} />
    </div>
  );
};

export default PurchaseOrder;

// import React, { useEffect, useState, useMemo } from 'react';
// import { useAppDispatch, useAppSelector } from '@/app/hooks';
// import { fetchPoData } from '@/features/ManagePoSlice';
// import axiosInstance from '@/services/axiosInstance';
// import toast from 'react-hot-toast';
// import { History, Search, Filter, RotateCw, FileStack, Truck, Wallet, ArrowUpRight } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import TableList from '@/components/ui/data-table';
// import Loader from '@/components/ui/loader';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { PurchaseOrderModal } from '@/components/dailogs/PurchaseOrderModal';
// import { ApproveHistoryModal } from '@/components/dailogs/ApproveHistoryModal';
// import { formatRupees, formatRupeesInWords } from '@/lib/helperFunction';
// import { Separator } from '@/components/ui/separator';

// const PurchaseOrder = () => {
//   const [selectedUnit, setSelectedUnit] = useState('');
//   const [selectedDepartment, setSelectedDepartment] = useState('');
//   const [selectedSupplier, setSelectedSupplier] = useState('');
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [showModal2, setShowModal2] = useState(false);
//   const [suppliers, setSupplier] = useState([]);

//   const dispatch = useAppDispatch();
//   const { po, loading } = useAppSelector((state) => state.poSlice);
//   const { units, departments } = useAppSelector((state) => state.user);

//   const allowedUnits = new Set(units.map((u) => u.label));
//   const allowedDepts = new Set(departments.map((d) => d.label));

//   useEffect(() => {
//     if (!po.length) dispatch(fetchPoData());
//   }, [dispatch, po?.length]);

//   useEffect(() => {
//     if (units.length === 1) setSelectedUnit(units[0].value);
//   }, [units]);

//   useEffect(() => {
//     if (po?.length) {
//       setSupplier([...new Set(po.map((r) => r.supplierCode).filter(Boolean))]);
//     }
//   }, [po]);

//   const onSave = async (payload) => {
//     try {
//       const response = await axiosInstance.post('/User/Demand', payload);
//       if (response.data.success) {
//         toast.success('Demand Raised Successfully');
//         setShowModal(false);
//         dispatch(fetchPoData());
//       } else {
//         toast.error(response.data.errorMessage);
//       }
//     } catch (err: any) {
//       toast.error(err.response?.data?.errorMessage || 'Something went wrong');
//     }
//   };

//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: 'supplierCode',
//         header: 'Supplier Details',
//         cell: ({ row }) => (
//           <div className="flex flex-col">
//             <span className="font-bold text-slate-900">{row.original.supplierCode}</span>
//             <span className="text-[10px] text-slate-500 uppercase font-medium tracking-tight">Code</span>
//           </div>
//         ),
//       },
//       {
//         accessorKey: 'poNo',
//         header: 'PO Reference',
//         cell: ({ row }) => (
//           <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold text-xs">
//             <FileStack size={12} /> {row.original.poNo || '-'}
//           </div>
//         ),
//       },
//       {
//         accessorKey: 'capexOpex',
//         header: 'Category',
//         cell: ({ row }) => (
//           <span
//             className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
//               row.original.capexOpex === 'Capex' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-purple-50 border-purple-200 text-purple-700'
//             }`}
//           >
//             {row.original.capexOpex}
//           </span>
//         ),
//       },
//       {
//         accessorKey: 'gl',
//         header: 'GL Account',
//         cell: ({ row }) => <div className="font-mono text-xs font-semibold text-slate-600">{row.original.gl || '-'}</div>,
//       },
//       {
//         accessorKey: 'action',
//         header: 'Actions',
//         cell: ({ row }) => (
//           <div className="flex items-center gap-2">
//             <Button
//               size="sm"
//               className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8"
//               onClick={() => {
//                 setSelectedRow(row.original);
//                 setShowModal(true);
//               }}
//             >
//               Raise Demand
//             </Button>
//             <Button
//               variant="outline"
//               size="icon"
//               className="h-8 w-8 text-slate-500"
//               onClick={() => {
//                 setSelectedRow(row.original);
//                 setShowModal2(true);
//               }}
//             >
//               <History size={16} />
//             </Button>
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   const tableData = useMemo(() => {
//     let data = po || [];
//     data = data.filter((r) => allowedUnits.has(r.unit) && allowedDepts.has(r.department));
//     const selectedUnitLabel = units.find((u) => u.value === selectedUnit)?.label;
//     if (selectedUnitLabel) data = data.filter((r) => r.unit === selectedUnitLabel);
//     if (selectedDepartment) {
//       const selectedDeptLabel = departments.find((d) => d.value === Number(selectedDepartment))?.label;
//       data = data.filter((r) => r.department === selectedDeptLabel);
//     }
//     if (selectedSupplier) data = data.filter((r) => r.supplierCode === selectedSupplier);
//     return data;
//   }, [po, selectedUnit, selectedDepartment, selectedSupplier, units, departments]);

//   const totals = useMemo(() => {
//     return tableData.reduce(
//       (acc, curr) => {
//         acc.poOrderValue += Number(curr.poOrderValue || 0);
//         acc.deliveredValue += Number(curr.deliveredValue || 0);
//         acc.balance += Number(curr.balanceToBeInvoice || 0);
//         return acc;
//       },
//       { poOrderValue: 0, deliveredValue: 0, balance: 0 }
//     );
//   }, [tableData]);

//   return (
//     <div className="p-6 bg-slate-50 min-h-screen">
//       {loading && <Loader />}

//       {/* Header Section */}
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
//         <div>
//           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Purchase Orders</h1>
//           <p className="text-slate-500 font-medium">Monitoring and managing procurement lifecycles</p>
//         </div>
//         <Button variant="outline" className="bg-white border-slate-200 shadow-sm font-bold gap-2" onClick={() => dispatch(fetchPoData())}>
//           <RotateCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Data
//         </Button>
//       </div>

//       {/* Stats Section */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <SummaryCard title="Total Order Value" amount={totals.poOrderValue} icon={<FileStack className="text-blue-600" />} color="blue" />
//         <SummaryCard title="Delivered Value" amount={totals.deliveredValue} icon={<Truck className="text-emerald-600" />} color="emerald" />
//         <SummaryCard title="Balance to Invoice" amount={totals.balance} icon={<Wallet className="text-orange-600" />} color="orange" />
//       </div>

//       {/* Table & Filters Card */}
//       <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden bg-white rounded-2xl">
//         <CardHeader className="border-b border-slate-50 bg-slate-50/30 py-4">
//           <div className="flex flex-wrap items-center justify-between gap-4">
//             <div className="flex items-center gap-2">
//               <Filter size={18} className="text-slate-400" />
//               <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Filter Records</CardTitle>
//             </div>

//             <div className="flex flex-wrap gap-3">
//               <select
//                 value={selectedUnit}
//                 onChange={(e) => {
//                   setSelectedUnit(e.target.value);
//                   setSelectedDepartment('');
//                   setSelectedSupplier('');
//                 }}
//                 className="h-10 w-[180px] rounded-xl border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm outline-none ring-blue-500 focus:ring-2 transition-all"
//               >
//                 <option value="">All Units</option>
//                 {units.map((u) => (
//                   <option key={u.value} value={u.value}>
//                     {u.label}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={selectedDepartment}
//                 onChange={(e) => {
//                   setSelectedDepartment(e.target.value);
//                   setSelectedSupplier('');
//                 }}
//                 disabled={!selectedUnit}
//                 className="h-10 w-[180px] rounded-xl border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm outline-none ring-blue-500 focus:ring-2 disabled:opacity-50 transition-all"
//               >
//                 <option value="">All Departments</option>
//                 {departments.map((d) => (
//                   <option key={d.value} value={d.value}>
//                     {d.label}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 value={selectedSupplier}
//                 onChange={(e) => setSelectedSupplier(e.target.value)}
//                 disabled={!selectedDepartment}
//                 className="h-10 w-[180px] rounded-xl border-slate-200 bg-white px-3 text-sm font-semibold shadow-sm outline-none ring-blue-500 focus:ring-2 disabled:opacity-50 transition-all"
//               >
//                 <option value="">All Suppliers</option>
//                 {suppliers.map((s, i) => (
//                   <option key={i} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent className="p-0">
//           <div className="p-4">
//             <TableList
//               data={tableData}
//               columns={columns}
//               showRefresh={false} // Handled in page header
//             />
//           </div>
//         </CardContent>
//       </Card>

//       <PurchaseOrderModal open={showModal} onOpenChange={setShowModal} initialData={selectedRow} onSave={onSave} />
//       <ApproveHistoryModal open={showModal2} onOpenChange={setShowModal2} initialData={selectedRow} />
//     </div>
//   );
// };

// const SummaryCard = ({ title, amount, icon, color }) => {
//   const colorMap = {
//     blue: 'border-l-blue-500 bg-blue-50/30',
//     emerald: 'border-l-emerald-500 bg-emerald-50/30',
//     orange: 'border-l-orange-500 bg-orange-50/30',
//   };

//   return (
//     <Card className={`border-none border-l-4 shadow-sm ${colorMap[color]} transition-all hover:translate-y-[-2px]`}>
//       <CardContent className="p-5">
//         <div className="flex justify-between items-start mb-2">
//           <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
//           <ArrowUpRight size={16} className="text-slate-300" />
//         </div>
//         <div>
//           <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">{title}</p>
//           <p className="text-2xl font-black text-slate-900 tracking-tight leading-none">{formatRupees(amount)}</p>
//           <Separator className="my-3 opacity-50" />
//           <p className="text-[10px] text-slate-500 font-medium italic line-clamp-1">{formatRupeesInWords(amount)}</p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default PurchaseOrder;

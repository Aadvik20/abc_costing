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
import { History, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupees, formatRupeesInWords } from '@/lib/helperFunction';

const PurchaseOrderV2 = () => {
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
        accessorKey: 'gl',
        header: 'GL No.',
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

    data = data.filter((r) => allowedUnits.has(r.unit) && allowedDepts.has(r.department));

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Total PO */}
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 min-h-[110px] flex flex-col justify-between">
            <div className="flex items-center py-1 justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total PO Order Value</span>
            </div>
            <p className="text-2xl font-semibold text-right text-blue-600 mt-1">{formatRupees(totals.poOrderValue)}</p>
            <p className="text-xs text-slate-400 italic leading-snug mt-1">{formatRupeesInWords(totals.poOrderValue)}</p>
          </div>

          {/* Delivered */}
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 min-h-[110px] flex flex-col justify-between">
            <div className="flex items-center py-1 justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total DELEVIRED Value</span>
            </div>
            <p className="text-2xl font-semibold text-right text-blue-600 mt-1">{formatRupees(totals.deliveredValue)}</p>
            <p className="text-xs text-slate-400 italic leading-snug mt-1">{formatRupeesInWords(totals.deliveredValue)}</p>
          </div>

          {/* Balance */}
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-all duration-200 min-h-[110px] flex flex-col justify-between">
            <div className="flex items-center py-1 justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total BALANCE Value</span>
            </div>
            <p className="text-2xl font-semibold text-right text-blue-600 mt-1">{formatRupees(totals.balanceToBeInvoice)}</p>
            <p className="text-xs text-slate-400 italic leading-snug mt-1">{formatRupeesInWords(totals.balanceToBeInvoice)}</p>
          </div>
        </div>
      </div>
      <div></div>
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

export default PurchaseOrderV2;

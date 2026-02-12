import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPoData } from '@/features/ManagePoSlice';
import toast from 'react-hot-toast';
import TableList from '@/components/ui/data-table';
import { formatRupeeInput, formatRupees, formatRupeesInWords } from '@/lib/helperFunction';
import Loader from '@/components/ui/loader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const PurchaseOrder = () => {
  const [anticipatedAmount, setAnticipatedAmount] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const [units, setUnits] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [capex, setCapex] = useState([]);

  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCapex, setSelectedCapex] = useState('');

  const dispatch = useAppDispatch();
  const { po, loading } = useAppSelector((state) => state.poSlice);

  useEffect(() => {
    if (!po.length) {
      dispatch(fetchPoData());
    }
  }, [dispatch, po?.length]);

  useEffect(() => {
    if (po?.length) {
      setUnits([...new Set(po.map((r) => r.unit).filter(Boolean))]);
      setDepartments([...new Set(po.map((r) => r.department).filter(Boolean))]);
      setCapex([...new Set(po.map((r) => r.capexOpex).filter(Boolean))]);
    }
  }, [po]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'poNo',
        header: 'PO NO.',
        cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.poNo || '-'}</div>,
      },
      {
        accessorKey: '',
        header: 'PO Date',
        cell: ({ row }) => <div className="px-2 py-3 font-semibold">{}</div>,
      },
      {
        accessorKey: 'supplierCode',
        header: 'Supplier Code',
        cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.supplierCode.toUpperCase() || '-'}</div>,
      },
      {
        accessorKey: 'contractDesp',
        header: 'Contract Description',
        cell: ({ row }) => <div className="px-2 py-3 font-semibold">{}</div>,
      },
      {
        accessorKey: 'capexOpex',
        header: 'Capex Opex',
        cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.original.capexOpex.toUpperCase() || '-'}</div>,
      },
      {
        accessorKey: 'poOrderValue',
        header: 'PO Order Value',
        cell: ({ row }) => <div className="px-2 py-3 text-right font-semibold">{formatRupees(row.original.poOrderValue) || '-'}</div>,
      },
      {
        accessorKey: 'deliveredValue',
        header: 'Delivered Value',
        cell: ({ row }) => <div className="px-2 py-3 text-right font-semibold">{formatRupees(row.original.deliveredValue) || '-'}</div>,
      },
      {
        accessorKey: 'balanceToBeInvoice',
        header: 'Balance To Be Invoice',
        cell: ({ row }) => <div className="px-2 py-3 text-right font-semibold">{formatRupees(row.original.balanceToBeInvoice) || '-'}</div>,
      },
    ],
    []
  );

  const onSave = async (amount: number) => {
    try {
      const sapdumpIds = tableData.map((row) => row.pktblSapDump);

      const payload = {
        employeeMasterAutoId: 0,
        employeeCode: 'NA',
        sapdumpId: sapdumpIds,
        demandAmount: amount,
        remark: 'NA',
      };
      const response = await axiosInstance.post('/User/Demand', payload);
      if (response.data.success) {
        toast.success('Anticipated demand raised successfully');
      } else {
        toast.error(response.data.errorMessage);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.errorMessage || 'Something went wrong');
    }
  };

  const tableData = useMemo(() => {
    if (!selectedUnit) return [];

    let data = po || [];

    if (selectedUnit) {
      data = data.filter((r) => r.unit === selectedUnit);
    }

    if (selectedDepartment) {
      data = data.filter((r) => r.department === selectedDepartment);
    }

    if (selectedCapex) {
      data = data.filter((r) => r.capexOpex === selectedCapex);
    }

    return data;
  }, [po, selectedUnit, selectedDepartment, selectedCapex]);

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

  const filteredDepartments = useMemo(() => {
    if (!selectedUnit) return departments;

    return [
      ...new Set(
        po
          .filter((r) => r.unit === selectedUnit)
          .map((r) => r.department)
          .filter(Boolean)
      ),
    ];
  }, [selectedUnit, po]);

  const filteredCapex = useMemo(() => {
    if (!selectedDepartment) return capex;

    return [
      ...new Set(
        po
          .filter((r) => r.unit === selectedUnit && r.department === selectedDepartment)
          .map((r) => r.capexOpex)
          .filter(Boolean)
      ),
    ];
  }, [selectedUnit, selectedDepartment, po]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedUnit) {
      setError('Please select a Unit first');
      return;
    }

    if (!selectedDepartment) {
      setError('Please select a Department first');
      return;
    }
    const value = e.target.value.replace(/[^0-9]/g, '');

    if (value === '') {
      setAnticipatedAmount('');
      setError('');
      return;
    }

    const num = Number(value);

    if (num > totals.balanceToBeInvoice) {
      setError(`Amount exceeds available balance (${formatRupees(totals.balanceToBeInvoice)})`);
    } else {
      setError('');
    }

    setAnticipatedAmount(value);
  };

  return (
    <div className="p-4 md:p-8">
      {loading && <Loader />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Order Record</h1>
          <p className="text-gray-600 mt-1">Manage purchase order records.</p>
        </div>
      </div>
      <div className="mt-3">
        {/* {selectedUnit && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500">Viewing data for:</span>

            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">{selectedUnit}</span>

            {selectedDepartment && <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">{selectedDepartment}</span>}
          </div>
        )} */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

          {/* Demand */}
          <div className="rounded-xl border bg-purple-50 border-purple-200 px-4 py-3 shadow-sm min-h-[120px] flex flex-col justify-between">
            <label className="text-sm font-semibold text-gray-700">Raise Anticipated Demand</label>

            {/* Amount Input */}
            <div className="mt-2 w-full">
              <div className="mb-2">
                <Input
                  className="text-right font-medium h-9"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter Amount"
                  value={formatRupeeInput(anticipatedAmount)}
                  onChange={handleAmountChange}
                />
              </div>

              {/* Upload Button */}
              <div className="w-full sm:w-auto">
                <input
                  id="demandFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full border border-gray-300 rounded-m text-sm text-gray-600 file:bg-blue-500 file:text-white file:border-0 file:px-3 file:py-1.5 file:mr-3 file:rounded hover:file:bg-blue-700 cursor-pointer"
                  onChange={(e) => {
                    setSelectedFile(e.target.files?.[0]);
                  }}
                />
              </div>
            </div>
            <div className="min-h-[20px] mt-1 mb-1">{error && <p className="text-sm text-amber-600 truncate">{error}</p>}</div>

            {/* Raise Demand Button */}
            <div className="w-full sm:w-auto flex flex-col items-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto cursor-pointer"
                    disabled={!anticipatedAmount || !selectedUnit || !selectedDepartment || !selectedFile}
                  >
                    Raise Demand
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="text-xl font-semibold">Confirm</DialogTitle>

                    <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                      Are you sure you want to raise an anticipated demand of{' '}
                      <span className="font-semibold text-blue-600">{formatRupees(Number(anticipatedAmount))}</span> for the{' '}
                      <span className="font-medium">{selectedDepartment}</span> department in the <span className="font-medium">{selectedUnit}</span> unit?
                      Please verify the details before confirming.
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter className="mt-3 gap-2 sm:justify-end">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>

                    <DialogClose asChild>
                      <Button
                        disabled={!anticipatedAmount}
                        onClick={() => {
                          onSave(Number(anticipatedAmount));
                          setAnticipatedAmount('');
                          setError('');
                        }}
                      >
                        Confirm
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        <div>
          <Card className="border-0 shadow-lg">
            <CardContent>
              <TableList
                data={tableData}
                columns={columns}
                showRefresh={true}
                emptyMessage={!selectedUnit ? 'Please select a Unit to view Purchase Orders' : 'No Purchase Orders found for selected filters'}
                onRefresh={() => {
                  dispatch(fetchPoData());
                }}
                rightElements={
                  <div className="flex flex-wrap items-end gap-2">
                    {/* Unit */}
                    <div className="flex flex-col gap-1">
                      <label className="text-md font-medium text-gray-700">Select Unit</label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => {
                          setSelectedUnit(e.target.value);
                          setSelectedDepartment('');
                          setError('');
                        }}
                        className="w-[200px] px-3 py-2 border-2 rounded outline-none"
                      >
                        <option value="">Select Unit</option>
                        {units.map((u, i) => (
                          <option key={i} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Department */}
                    <div className="flex flex-col gap-1">
                      <label className="text-md font-medium text-gray-700">Select Department</label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => {
                          setSelectedDepartment(e.target.value);
                          setError('');
                        }}
                        disabled={!selectedUnit}
                        className="w-[200px] px-3 py-2 border-2 rounded outline-none"
                      >
                        <option value="">Select Department</option>
                        {filteredDepartments.map((d, i) => (
                          <option key={i} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Capex */}
                    <div className="flex flex-col gap-1">
                      <label className="text-md font-medium text-gray-700">Select Capex/Opex</label>
                      <select
                        value={selectedCapex}
                        onChange={(e) => {
                          setSelectedCapex(e.target.value);
                          setError('');
                        }}
                        disabled={!selectedDepartment}
                        className="w-[200px] px-3 py-2 border-2 rounded outline-none"
                      >
                        <option value="">Select Capex/Opex</option>
                        {filteredCapex.map((c, i) => (
                          <option key={i} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Reset */}
                    <div className="flex flex-col gap-1">
                      <Button
                        onClick={() => {
                          setSelectedUnit('');
                          setSelectedDepartment('');
                          setAnticipatedAmount('');
                          setError('');
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                }
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrder;

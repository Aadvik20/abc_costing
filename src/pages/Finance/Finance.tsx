import React, { useEffect, useState } from 'react';
import { fetchFinanceData } from '@/features/FinanceSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useMemo } from 'react';
import TableList from '@/components/ui/data-table';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { formatRupees } from '@/lib/helperFunction';
import Loader from '@/components/ui/loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const Finance = () => {
  const [selectedUnitDept, setSelectedUnitDept] = useState({
    balance: { unit: '', department: '' },
    zeroBalance: { unit: '', department: '' },
  });

  const [units, setUnits] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [activeTab, setActiveTab] = useState<'balance' | 'zeroBalance'>('balance');

  const dispatch = useAppDispatch();
  const { finance, loading } = useAppSelector((state) => state.FinanceSlice);

  useEffect(() => {
    if (!finance.length) {
      dispatch(fetchFinanceData());
    }
  }, [dispatch, finance.length]);

  useEffect(() => {
    if (finance?.length) {
      setUnits([...new Set(finance.map((r) => r.unit).filter(Boolean))]);
      setDepartments([...new Set(finance.map((r) => r.department).filter(Boolean))]);
    }
  }, [finance]);

  const onSave = async (demandId: number, reason: string, amount: number) => {
    try {
      const payload = {
        employeeMasterAutoId: 0,
        employeeCode: 'NA',
        demandId: demandId,
        approvedAmount: amount,
        reason: reason || '',
      };
      const response = await axiosInstance.post('/Finance', payload);
      if (response.data.success) {
        toast.success('Value Submitted successfully');
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
        accessorKey: 'poNo',
        header: 'PO NO.',
        cell: ({ row }) => <div className="px-2 py-2 font-semibold">{row.original.poNo || '-'}</div>,
      },
      {
        accessorKey: 'supplierCode',
        header: 'Supplier Code',
        cell: ({ row }) => <div className="px-2 py-2 font-semibold">{row.original.supplierCode.toUpperCase() || '-'}</div>,
      },
      {
        accessorKey: 'capexOpex',
        header: 'Capex Opex',
        cell: ({ row }) => <div className="px-2 py-2 font-semibold">{row.original.capexOpex.toUpperCase() || '-'}</div>,
      },
      {
        accessorKey: 'poOrderValue',
        header: 'PO Order Value',
        cell: ({ row }) => <div className="px-2 py-2 text-right font-semibold">{formatRupees(row.original.poOrderValue) || '-'}</div>,
      },
      {
        accessorKey: 'deliveredValue',
        header: 'Delivered Value',
        cell: ({ row }) => <div className="px-2 py-2 text-right font-semibold">{formatRupees(row.original.deliveredValue) || '-'}</div>,
      },
      {
        accessorKey: 'balanceToBeInvoice',
        header: 'Balance To Be Invoice',
        cell: ({ row }) => <div className="px-2 py-2 text-right font-semibold">{formatRupees(row.original.balanceToBeInvoice) || '-'}</div>,
      },
      {
        accessorKey: 'demandAmount',
        header: 'Demanded Amount',
        cell: ({ row }) => <div className="px-2 py-2 text-right font-semibold">{formatRupees(row.original.demandAmount) || '-'}</div>,
      },
      {
        accessorKey: 'pendingAmount',
        header: 'Pending Amount',
        cell: ({ row }) => <div className="px-2 py-2 text-right font-semibold">{formatRupees(row.original.pendingAmount) || '-'}</div>,
      },
      // {
      //   accessorKey: 'approvedAmount',
      //   header: 'Approved Amount',
      //   cell: ({ row }) => <div className="px-2">{row.original.approvedAmount || '-'}</div>,
      // },
      // {
      //   accessorKey: 'action',
      //   header: 'Action',
      //   cell: ({ row }) => <FinanceActionInput demandId={row.original.pkDemandId} pendingAmount={row.original.pendingAmount} onSave={onSave} />,
      // },
    ],
    []
  );

  const tableData = useMemo(() => {
    if (!selectedUnitDept[activeTab].unit) return [];

    let data = finance || [];

    const currentSelectedUnitDept = selectedUnitDept[activeTab];

    if (activeTab === 'balance') {
      data = data.filter((r) => Number(r.balanceToBeInvoice) > 0);
    } else {
      data = data.filter((r) => Number(r.balanceToBeInvoice) <= 0);
    }

    data = data.filter((r) => Number(r.pendingAmount) > 0);

    if (currentSelectedUnitDept.unit) {
      data = data.filter((r) => r.unit === currentSelectedUnitDept.unit);
    }

    if (currentSelectedUnitDept.department) {
      data = data.filter((r) => r.department === currentSelectedUnitDept.department);
    }
    return data;
  }, [finance, activeTab, selectedUnitDept]);

  const filteredUnits = useMemo(() => {
    let data = finance || [];

    if (activeTab === 'balance') {
      data = data.filter((r) => Number(r.balanceToBeInvoice) > 0);
    } else {
      data = data.filter((r) => Number(r.balanceToBeInvoice) <= 0);
    }

    return [...new Set(data.map((r) => r.unit).filter(Boolean))];
  }, [finance, activeTab]);

  const filteredDepartments = useMemo(() => {
    if (!selectedUnitDept[activeTab].unit) return departments;

    return [
      ...new Set(
        finance
          .filter((r) => r.unit === selectedUnitDept[activeTab].unit)
          .map((r) => r.department)
          .filter(Boolean)
      ),
    ];
  }, [selectedUnitDept[activeTab].unit, finance]);

  return (
    <div className="p-4 md:p-8">
      {loading && <Loader />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Record</h1>
          <p className="text-gray-600 mt-1">Manage finance records.</p>
        </div>
      </div>
      <div className="mt-6">
        <Tabs defaultValue="balance">
          {/* Tabs Header */}
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger
              value="balance"
              className="bg-gray-100"
              onClick={() => {
                setActiveTab('balance');
              }}
            >
              Balance Pending
            </TabsTrigger>
            <TabsTrigger
              value="zeroBalance"
              className="bg-gray-100"
              onClick={() => {
                setActiveTab('zeroBalance');
              }}
            >
              Fully Invoiced
            </TabsTrigger>
          </TabsList>

          <Card className="border-0 shadow-lg">
            <CardContent>
              {/* Pending Tab */}
              <TabsContent value="balance">
                <TableList
                  data={tableData}
                  columns={columns}
                  showRefresh={true}
                  emptyMessage={
                    !selectedUnitDept[activeTab].unit ? 'Please select a Unit to view records' : 'No records found for selected filters'
                  }
                  onRefresh={() => dispatch(fetchFinanceData())}
                  rightElements={
                    <>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedUnitDept[activeTab].unit}
                          onChange={(e) => 
                            setSelectedUnitDept((prev) => ({
                              ...prev,
                              [activeTab]: {
                                ...prev[activeTab],
                                unit: e.target.value,
                                department : '',
                              },
                            }))
                          }
                          className=" w-[200px] px-3 py-2 border-2 rounded outline:none"
                        >
                          <option value="All Units">Select Unit</option>
                          {filteredUnits.map((u, i) => (
                            <option key={i} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedUnitDept[activeTab].department}
                          disabled={!selectedUnitDept[activeTab].unit}
                          onChange={(e) =>
                            setSelectedUnitDept((prev) => ({
                              ...prev,
                              [activeTab]: {
                                ...prev[activeTab],
                                department: e.target.value,
                              },
                            }))
                          }
                          className=" w-[200px] px-3 py-2 border-2 rounded outline:none"
                        >
                          <option value="">Select Department</option>
                          {filteredDepartments.map((d, i) => (
                            <option key={i} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>

                        <Button
                          onClick={() =>
                            setSelectedUnitDept((prev) => ({
                              ...prev,
                              [activeTab]: { unit: '', department: '' },
                            }))
                          }
                        >
                          Reset
                        </Button>
                      </div>
                    </>
                  }
                />
              </TabsContent>
              {/* Completed Tab */}
              <TabsContent value="zeroBalance">
                <TableList
                  data={tableData}
                  columns={columns}
                  showRefresh={true}
                  emptyMessage={
                    !selectedUnitDept[activeTab].unit ? 'Please select a Unit to view records' : 'No records found for selected filters'
                  }
                  onRefresh={() => dispatch(fetchFinanceData())}
                  rightElements={
                    <>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedUnitDept[activeTab].unit}
                          onChange={(e) =>
                            setSelectedUnitDept((prev) => ({
                              ...prev,
                              [activeTab]: {
                                ...prev[activeTab],
                                unit: e.target.value,
                                department : '',
                              },
                            }))
                          }
                          className=" w-[200px] px-3 py-2 border-2 rounded outline:none"
                        >
                          <option value="All Units">Select Unit</option>
                          {filteredUnits.map((u, i) => (
                            <option key={i} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedUnitDept[activeTab].department}
                          disabled={!selectedUnitDept[activeTab].unit}
                          onChange={(e) =>
                            setSelectedUnitDept((prev) => ({
                              ...prev,
                              [activeTab]: {
                                ...prev[activeTab],
                                department: e.target.value,
                              },
                            }))
                          }
                          className=" w-[200px] px-3 py-2 border-2 rounded outline:none"
                        >
                          <option value="">Select Department</option>
                          {filteredDepartments.map((d, i) => (
                            <option key={i} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>

                        <Button
                          onClick={() =>
                            setSelectedUnitDept((prev) => ({
                              ...prev,
                              [activeTab]: { unit: '', department: '' },
                            }))
                          }
                        >
                          Reset
                        </Button>
                      </div>
                    </>
                  }
                />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default Finance;

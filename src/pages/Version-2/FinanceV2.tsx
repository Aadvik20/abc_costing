import React, { useEffect, useState } from 'react';
import { fetchFinanceData } from '@/features/FinanceSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useMemo } from 'react';
import TableList from '@/components/ui/data-table';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { FinanceModal } from '@/components/dailogs/FinanceModal';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';
import { formatRupees } from '@/lib/helperFunction';

const Finance2 = () => {
  const [selectedUnit, setSelectedUnit] = useState('All Units');

  const [units, setUnits] = useState([]);

  const [selectedRow, setSelectedRow] = React.useState(null);
  const [showModal, setShowModal] = useState(false);

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
    }
  }, [finance]);

  const onSave = async (payload) => {
    try {
      const response = await axiosInstance.post('/Finance', payload);
      if (response.data.success) {
        toast.success('Demand Approved Successfully');
        setShowModal(false);
        dispatch(fetchFinanceData());
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
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.department || '-'}</div>,
      },
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
        header: 'Capex Opex',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.capexOpex || '-'}</div>,
      },
        {
        accessorKey: 'demandAmount',
        header: 'Demanded Amount',
        cell: ({ row }) => <div className="px-2 font-semibold text-right">{formatRupees(row.original.demandAmount || '-')}</div>,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className="px-2 font-semibold">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRow(row.original);
                setShowModal(true);
              }}
            >
              See Demand
            </Button>
          </div>
        ),
      },
    ],
    []
  );
  const tableData = useMemo(() => {
    let data = finance || [];

    data = data.filter((r) => Number(r.pendingAmount) > 0);

    if (selectedUnit === 'All Units') {
      return data;
    }

    if (selectedUnit) {
      data = data.filter((r) => r.unit === selectedUnit);
    }
    return data;
  }, [finance, selectedUnit]);

  return (
    <div className="p-4 md:p-8">
      {loading && <Loader />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Record</h1>
          <p className="text-gray-600 mt-1">Manage finance records</p>
        </div>
      </div>
      <Card className="shadow-lg border-0">
        <CardContent>
          <div className="mt-5">
            <TableList
              data={tableData}
              columns={columns}
              showRefresh={true}
              onRefresh={() => {
                dispatch(fetchFinanceData());
              }}
              rightElements={
                <>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedUnit}
                      onChange={(e) => {
                        setSelectedUnit(e.target.value);
                      }}
                      className=" w-[200px] px-3 py-2 border-2 rounded outline:none"
                    >
                      <option value="All Units">All Units</option>
                      {units.map((u, i) => (
                        <option key={i} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>

                    <Button
                      onClick={() => {
                        setSelectedUnit('');
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </>
              }
            />
          </div>
        </CardContent>
      </Card>
      <FinanceModal open={showModal} onOpenChange={setShowModal} initialData={selectedRow} onSave={onSave} />
    </div>
  );
};

export default Finance2;

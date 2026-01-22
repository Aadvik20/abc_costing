import React, { useEffect, useState } from 'react';
import { fetchFinanceData } from '@/features/FinanceSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useMemo } from 'react';
import TableList from '@/components/ui/data-table';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import FinanceActionInput from '@/components/Action Input/FinanceActionInput';
import { formatRupees } from '@/lib/helperFunction';
import Loader from '@/components/ui/loader';

const Finance = () => {
  const [selectedUnit, setSelectedUnit] = useState('');

  const [units, setUnits] = useState([]);

  const dispatch = useAppDispatch();
  const { finance , loading } = useAppSelector((state) => state.FinanceSlice);

  useEffect(() => {
    if(!finance.length){
    dispatch(fetchFinanceData());
    }
  }, [dispatch , finance.length]);

  useEffect(() => {
    if (finance?.length) {
      setUnits([...new Set(finance.map((r) => r.unit).filter(Boolean))]);
    }
  }, [finance]);

  const onSave = async (demandId: number, reason: string, amount: number) => {
    try {
      const payload = {
        employeeMasterAutoId: 0,
        employeeCode: 'NA',
        demandId: demandId,
        approvedAmount: amount,
        reason: reason || "",
      };
      console.log(payload);
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
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.poNo || '-'}</div>,
      },
      {
        accessorKey: 'supplierCode',
        header: 'Supplier Code',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.supplierCode || '-'}</div>,
      },
      {
        accessorKey: 'contractNo',
        header: 'Contract No',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.contractNo || '-'}</div>,
      },
      {
        accessorKey: 'capexOpex',
        header: 'Capex Opex',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.capexOpex || '-'}</div>,
      },
      {
        accessorKey: 'createdBy',
        header: 'Created By',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.createdBy || '-'}</div>,
      },
      {
        accessorKey: 'unit',
        header: 'Unit',
        cell: ({ row }) => <div className="px-2">{row.original.unit || '-'}</div>,
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => <div className="px-2">{row.original.department || '-'}</div>,
      },
      {
        accessorKey: 'poOrderValue',
        header: 'PO Order Value',
        cell: ({ row }) => <div className="px-2 text-right">{formatRupees(row.original.poOrderValue) || '-'}</div>,
      },
      {
        accessorKey: 'deliveredValue',
        header: 'Delivered Value',
        cell: ({ row }) => <div className="px-2 text-right">{formatRupees(row.original.deliveredValue) || '-'}</div>
      
      },
      {
        accessorKey: 'balanceToBeInvoice',
        header: 'Balance To Be Invoice',
        cell: ({ row }) => <div className="px-2 text-right">{formatRupees(row.original.balanceToBeInvoice) || '-'}</div>
      },
      {
        accessorKey: 'demandAmount',
        header: 'Demanded Amount',
        cell: ({ row }) =><div className="px-2 text-right">{formatRupees(row.original.demandAmount) || '-'}</div>

      },
      {
        accessorKey: 'pendingAmount',
        header: 'Pending Amount',
        cell: ({ row }) =><div className="px-2 text-right">{formatRupees(row.original.pendingAmount) || '-'}</div>
      },
      // {
      //   accessorKey: 'approvedAmount',
      //   header: 'Approved Amount',
      //   cell: ({ row }) => <div className="px-2">{row.original.approvedAmount || '-'}</div>,
      // },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <FinanceActionInput demandId={row.original.pkDemandId} pendingAmount={row.original.pendingAmount} onSave={onSave} />,
      },
    ],[]);
  const tableData = useMemo(() => {
    let data = finance || [];

    if (selectedUnit) {
      data = data.filter((r) => r.unit === selectedUnit);
    }
    return data;
  }, [finance, selectedUnit]);

  return (
    <div className="p-4 md:p-8">
      {loading&&<Loader/>}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Record</h1>
          <p className="text-gray-600 mt-1"> Finance records</p>
        </div>
      </div>
      <div className="mt-6 min-h-screen">
        <TableList
          data={tableData}
          columns={columns}
          rightElements={
            <>
              <div className="flex items-center gap-2">
                <select
                  value={selectedUnit}
                  onChange={(e) => {
                    setSelectedUnit(e.target.value);
                  }}
                  className=" w-[200px] p-3 border-2 rounded outline:none"
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
    </div>
  );
};

export default Finance;

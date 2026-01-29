import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPoData, removePoByPktblSapDump } from '@/features/ManagePoSlice';
import toast from 'react-hot-toast';
import TableList from '@/components/ui/data-table';
import DemandInput from '@/components/Action Input/DemandInput';
import { formatRupees } from '@/lib/helperFunction';
import Loader  from '@/components/ui/loader';

const ManagePo = () => {
  const [units, setUnits] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [supplier, setSupplier] = useState([]);
  // const [capex, setCapex] = useState([]);

  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  // const [selectedCapex, setSelectedCapex] = useState('');

  const dispatch = useAppDispatch();
  const { po, loading } = useAppSelector((state) => state.poSlice);
  // if (loading) {
  //   return <div className="p-8 text-center">Loading PO data...</div>;
  // }
  useEffect(() => {
    if (!po.length) {
      dispatch(fetchPoData());
    }
  }, [dispatch, po?.length]);

  useEffect(() => {
    if (po?.length) {
      setUnits([...new Set(po.map((r) => r.unit).filter(Boolean))]);
      setDepartments([...new Set(po.map((r) => r.department).filter(Boolean))]);
      setSupplier([...new Set(po.map((r) => r.supplierCode).filter(Boolean))]);
      // setCapex([...new Set(po.map((r) => r.capexOpex).filter(Boolean))]);
    }
  }, [po]);

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
        accessorKey: 'unit',
        header: 'Unit',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.unit || '-'}</div>,
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => <div className="px-2 font-semibold">{row.original.department || '-'}</div>,
      },
      {
        accessorKey: 'poOrderValue',
        header: 'PO Order Value',
        cell: ({ row }) => <div className="px-2 text-right font-semibold">{formatRupees(row.original.poOrderValue) || '-'}</div>,
      },
      // {
      //   accessorKey: 'CURRENCY',
      //   header: 'Currency',
      //   cell: ({ row }) => <div className="px-2">{row.original.CURRENCY || '-'}</div>,
      // },
      {
        accessorKey: 'deliveredValue',
        header: 'Delivered Value',
        cell: ({ row }) => <div className="px-2 text-right font-semibold">{formatRupees(row.original.deliveredValue) || '-'}</div>,
      },
      {
        accessorKey: 'balanceToBeInvoice',
        header: 'Balance To Be Invoice',
        cell: ({ row }) => <div className="px-2 text-right font-semibold">{formatRupees(row.original.balanceToBeInvoice) || '-'}</div>,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => <DemandInput sapDump={row.original.pktblSapDump} onSave={onSave} />,
      },
    ],
    []
  );

  const onSave = async (sapDump: string, amount: number) => {
    try {
      const payload = {
        employeeMasterAutoId: 0,
        employeeCode: 'NA',
        sapdumpId: sapDump,
        demandAmount: amount,
        remark: 'NA',
      };
      console.log(payload);
      const response = await axiosInstance.post('/User/Demand', payload);
      if (response.data.success) {
        toast.success('Value Submitted successfully');
        dispatch(removePoByPktblSapDump(Number(sapDump)));
      } else {
        toast.error(response.data.errorMessage);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.errorMessage || 'Something went wrong');
    }
  };

  const tableData = useMemo(() => {
    let data = po || [];

    if (selectedUnit) {
      data = data.filter((r) => r.unit === selectedUnit);
    }

    if (selectedDepartment) {
      data = data.filter((r) => r.department === selectedDepartment);
    }

    if (selectedSupplier) {
      data = data.filter((r) => r.supplierCode === selectedSupplier);
    }

    // if (selectedCapex) {
    //   data = data.filter((r) => r.capexOpex === selectedCapex);
    // }

    return data;
  }, [po, selectedUnit, selectedDepartment, selectedSupplier]);

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

  const filteredSuppliers = useMemo(() => {
    if (!selectedDepartment) return supplier;

    return [
      ...new Set(
        po
          .filter((r) => r.unit === selectedUnit && r.department === selectedDepartment)
          .map((r) => r.supplierCode)
          .filter(Boolean)
      ),
    ];
  }, [selectedUnit, selectedDepartment, po]);

  return (
    <div className="p-4 md:p-8">
      {loading&&<Loader/>}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Order Record</h1>
          <p className="text-gray-600 mt-1">Manage purchase order records</p>
        </div>
      </div>
      <div className="mt-6">
        <TableList
          data={tableData}
          columns={columns}
          showRefresh
          rightElements={
            <>
              <div className="flex items-center gap-2">
                <select
                  value={selectedUnit}
                  onChange={(e) => {
                    setSelectedUnit(e.target.value);
                    setSelectedDepartment(null);
                    setSelectedSupplier(null);
                  }}
                  className=" w-[200px] p-3 border-2 rounded outline:none"
                >
                  <option value="">All Units</option>
                  {units.map((u, i) => (
                    <option key={i} value={u}>
                      {u}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedSupplier(null);
                  }}
                  disabled={!selectedUnit}
                  className=" w-[200px] p-3 border-2 rounded outline:none"
                >
                  <option value="">All Departments</option>
                  {filteredDepartments.map((d, i) => (
                    <option key={i} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSupplier}
                  onChange={(e) => {
                    setSelectedSupplier(e.target.value);
                  }}
                  disabled={!selectedDepartment}
                  className=" w-[200px] p-3 border-2 rounded outline:none"
                >
                  <option value="">All Supplier</option>
                  {filteredSuppliers.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                

                {/* <Select onValueChange={setSelectedCapex}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Capex" />
                    </SelectTrigger>
                    <SelectContent>
                      {capex.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select> */}

                <Button
                  onClick={() => {
                    setSelectedUnit('');
                    setSelectedDepartment('');
                    setSelectedSupplier('');
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

export default ManagePo;

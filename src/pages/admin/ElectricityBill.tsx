import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import AdminTable from '@/components/admin/AdminTable';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import { ElectricityBillModal } from '@/components/dailogs/ElectricityBillModal';
import axiosInstance from '@/services/axiosInstance';
import { fetchQuarterEmployeeBillMap } from '@/features/quarter/quarterEmployeeBillMapSlice';
import toast from 'react-hot-toast';

const ElectricityBill = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [selectedRow, setSelectedRow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openButton, setOpenButton] = useState(false);
  const dispatch = useAppDispatch();

  const { data: allocations, loading: dataLoading, error } = useAppSelector((state) => state.quarterEmployeeBillMap);
  console.log(allocations, 'allocations');

  useEffect(() => {
    if (!allocations.length) {
      dispatch(fetchQuarterEmployeeBillMap({}));
    }
  }, [allocations.length]);

  const columns = [
    {
      accessorKey: 'employeeDetails.employeeCode',
      header: 'Employee Code',
      cell: ({ row }) => <div className="px-2 w-[120px]">{row?.original?.employeeDetails?.employeeCode}</div>,
    },
    {
      accessorKey: 'employeeDetails.userName',
      header: 'Employee Name',
      cell: ({ row }) => <div className="w-[140px] px-2">{row?.original?.employeeDetails?.userName}</div>,
    },

    {
      accessorKey: 'employeeDetails.post',
      header: 'Designation',
      cell: ({ row }) => <div className="px-2">{row?.original?.employeeDetails?.post}</div>,
    },
    {
      accessorKey: 'employeeDetails.department',
      header: 'Department',
      cell: ({ row }) => <div className="px-2">{row?.original?.employeeDetails?.department}</div>,
    },
    {
      accessorKey: 'employeeDetails.positionGrade',
      header: 'Position Grade',
      cell: ({ row }) => <div className=" max-w-[240px] px-2 truncate">{row?.original?.employeeDetails?.positionGrade}</div>,
    },

    {
      accessorKey: 'employeeDetails.location',
      header: 'Location',
      cell: ({ row }) => <div className="px-2">{row?.original?.employeeDetails?.location}</div>,
    },

    {
      accessorKey: 'quarterDetails.qNumber',
      header: 'Quarter No',
      cell: ({ row }) => <div className="px-2">{row?.original?.quarterDetails?.qNumber}</div>,
    },

    {
      accessorKey: 'areaWithRent.rentPerMonth',
      header: 'Rent',
      cell: ({ row }) => (
        <div className="px-2">
          <span className="text-sm font-semibold text-green-600">₹{row?.original?.areaWithRent?.rentPerMonth || '-'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'electricityBillDetails.oldReading',
      header: 'Old Readings',
      cell: ({ row }) => <div className="px-2">{row?.original?.quarterDetails?.oldReading}</div>,
    },
    {
      accessorKey: 'electricityBillDetails.currentMeterReading',
      header: 'Current Reading',
      cell: ({ row }) => <div className="px-2">{row?.original?.electricityBillDetails[0]?.currentMeterReading}</div>,
    },

    {
      accessorKey: 'quarterDetails.consumption',
      header: 'Consumption',
      cell: ({ row }) => {
        const consumption = row?.original?.quarterDetails?.currentReading - row?.original?.quarterDetails?.oldReading;
        return <div className="px-2">{consumption}</div>;
      },
    },
    {
      accessorKey: 'billAmount',
      header: 'Bill Amount',
      cell: ({ row }) => {
        const billAmount = row?.original?.quarterDetails?.currentReading;
        return (
          <div className="px-2">
            <span className="text-sm font-semibold text-green-600">₹{billAmount}</span>
          </div>
        );
      },
    },

    {
      accessorKey: 'totalRent',
      header: 'Total Rent',
      cell: ({ row }) => {
        const totalRent = row?.original?.rent + row?.original?.ratePerUnit * (row?.original?.currentReading - row?.original?.oldReading);
        return (
          <div className="px-2">
            <span className="text-sm font-semibold text-green-600">₹{totalRent}</span>
          </div>
        );
      },
    },
  ];
  const addEletricBill = async (payload) => {
    try {
      const response = await axiosInstance.post('/QuarterManage/add-electricity-bill-to-quarter', payload);
      console.log(response.data);
      toast.success('Bill added successfully');
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Electricity Bill</h1>
          <p className="text-gray-600 mt-1">Manage electricity bill for all units</p>
        </div>
      </div>
      <div className="mt-6">
        <div>
          <AdminTable
            data={allocations}
            columns={columns}
            inputPlaceholder="Search"
            rightElements={
              <>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setIsOpen(true);
                      setMode('add');
                    }}
                  >
                    Add Reading
                  </Button>
                  <div className="px-2">
                    <Button type="button" variant="destructive" className="" onClick={() => setOpenButton(true)}>
                      Generate Report
                    </Button>
                    {openButton && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenButton(false)} />
                        <div className="absolute mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
                          <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100">
                            <FileText className="h-4 w-4 text-red-600" />
                            Generate Pdf
                          </button>

                          <button className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100">
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            Generate Excel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <input type="month" className="border rounded-md px-3 py-2 text-sm" />
                </div>
              </>
            }
          />
        </div>
      </div>
      <ElectricityBillModal
        employeeOption={allocations}
        open={isOpen}
        onOpenChange={setIsOpen}
        onSave={addEletricBill}
        initialData={selectedRow}
        loading={loading}
        mode={mode}
      />
    </div>
  );
};

export default ElectricityBill;

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Edit, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QMapEmpModal } from '@/components/dailogs/QMapEmpModal';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/services/axiosInstance';
import { fetchQuarterDetails } from '@/features/quarter/quarterDetailsSlice';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/app/hooks';
import { AppDispatch, RootState } from '@/app/store';
import { fetchEmployeeList } from '@/features/quarter/employeeListSlice';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import { fetchQuarterEmployeeMapping } from '@/features/quarter/quarterEmployeeMapSlice';
import { formatDate, formatDateTime } from '@/lib/helperFunction';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TableList from '@/components/ui/data-table';
import AdminTable from '@/components/admin/AdminTable';

const EmployeeQuarterAllocation = () => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = React.useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const userDetails = useAppSelector((state: RootState) => state.user);
  const { quarterDetails, loading: quarteDetailsLoading } = useAppSelector((state: RootState) => state.quarterDetails);
  const { employees, loading } = useAppSelector((state: RootState) => state.employeeList);
  const { data: allocations, loading: employeeLoading } = useAppSelector((state: RootState) => state.quarterEmployeeMapList);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchQuarterEmployeeMapping({}));
    if (userDetails?.Unit) {
      dispatch(fetchEmployeeList({ location: userDetails?.Unit }));
    }
  }, [dispatch, userDetails]);

  const onSave = async (payload) => {
    setSaving(true);
    try {
      const response = await axiosInstance.post('/QuarterManage/quarter-map-employee', payload);
      if (response.data.statusCode === 200) {
        toast.success('Quarter type added successfully.');
        dispatch(fetchQuarterEmployeeMapping({}));
        setShowModal(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setSaving(false);
    }
  };
  const filteredAllocations = useMemo(() => {
    return allocations.map((ele) => ({
      ...ele,
      madifyByNameAndDate: ele.modifyDate ? `${ele.modifyByName}-${ele.modifyBy} on ${formatDateTime(ele.modifyDate)}` : '',
      createdByNameAndDate: ele.createDate ? `${ele.createdByName}-${ele.createBy} on ${formatDateTime(ele.createDate)}` : '',
    }));
  }, [allocations.length]);

  const handleDelete = async (data, id) => {
    setSaving(true);
    try {
      const response = await axiosInstance.put(`/QuarterManage/dealocate-quarter-map-employee/${id}`, {
        pkQMapEmpId: data?.pkQMapEmpId,
        employeeCode: data?.employeeDetails?.employeeCode,
      });
      if (response.data.statusCode === 200) {
        toast.success('Quarter type deleted successfully.');
        dispatch(fetchQuarterEmployeeMapping({}));
        setShowModal(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };
  const columns = [
    {
      accessorKey: 'quarterDetails.quarterType',
      header: 'Quarter Type',
      cell: ({ row }) => <div className="px-2 font-semibold">{row.original.quarterDetails.quarterType}</div>,
    },
    {
      accessorKey: 'quarterDetails.qNumber',
      header: 'Quarter No.',
      cell: ({ row }) => <div className="px-2 font-semibold">{row.original.quarterDetails.qNumber}</div>,
    },
    {
      accessorKey: 'areaWithRent.area',
      header: 'Area',
      cell: ({ row }) => <div className="px-2 font-semibold">{row.original.areaWithRent.area}</div>,
    },
    {
      accessorKey: 'areaWithRent.rentPerMonth',
      header: 'Rent',
      cell: ({ row }) => <div className="px-2 font-semibold">{row.original.areaWithRent.rentPerMonth}</div>,
    },

    {
      accessorKey: 'employeeDetails.userName',
      header: 'Employee Name',
      cell: ({ row }) => <div className="px-2 font-semibold">{row.original.employeeDetails.userName}</div>,
    },
    {
      accessorKey: 'employeeDetails.employeeCode',
      header: 'Employee Code',
      cell: ({ row }) => <div className="px-2 ">{row.original.employeeDetails.employeeCode}</div>,
    },
    {
      accessorKey: 'employeeDetails.post',
      header: 'Post',
      cell: ({ row }) => <div className="px-2">{row.original.employeeDetails.post}</div>,
    },

    {
      accessorKey: 'employeeDetails.department',
      header: 'Department',
      cell: ({ row }) => <div className="px-2">{row.original.employeeDetails.department}</div>,
    },
    {
      accessorKey: 'employeeDetails.location',
      header: 'Location',
      cell: ({ row }) => <div className="px-2">{row.original.employeeDetails.location}</div>,
    },

    {
      accessorKey: 'allotmentDate',
      header: 'Allotment Date',
      cell: ({ row }) => <div className="px-2">{row.original.allotmentDate ? formatDate(row.original.allotmentDate) : '-'}</div>,
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className="px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedRow(row.original);
                setMode('edit');
                setShowModal(true);
              }}
              className="rounded-lg border p-1 text-gray-600 hover:bg-gray-100"
              title="Edit Allocation"
            >
              <Edit className="w-4 h-4" />
            </button>
            <ConfirmDialog
              triggerClassName={'bg-red-500 px-1 h-6'}
              triggerLabel=""
              onConfirm={() => {
                handleDelete(row.original, row.original.pkQMapEmpId);
              }}
              icon={<Trash2 size={16} />}
              description="Are you sure to delete this quarter details map? This action can not be undone."
              title="Deleting quarter details map"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="mx-auto space-y-6">
        {(employeeLoading || loading || quarteDetailsLoading || saving) && <Loader />}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Quarter Allocation</h1>
            <p className="text-gray-600 mt-1">Track and manage quarter assignments to employees</p>
          </div>
        </div>
        <div className="">
          <AdminTable
            inputPlaceholder={'Search....'}
            data={filteredAllocations}
            columns={columns}
            rightElements={
              <>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      dispatch(fetchQuarterEmployeeMapping({}));
                    }}
                  >
                    <RefreshCw />
                  </Button>
                  <Button
                    onClick={() => {
                      setShowModal(true);
                      setSelectedRow(null);
                      dispatch(fetchQuarterDetails());
                      
                    }}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Allocation
                  </Button>
                </div>
              </>
            }
          />
        </div>
      </div>
      <QMapEmpModal
        open={showModal}
        onOpenChange={setShowModal}
        mode={mode}
        initialData={selectedRow}
        onSave={onSave}
        saving={saving}
        quarterDetailsOptions={quarterDetails.filter((ele) => ele.isVacant)}
        employeeOptions={employees}
      />
    </div>
  );
};

export default EmployeeQuarterAllocation;

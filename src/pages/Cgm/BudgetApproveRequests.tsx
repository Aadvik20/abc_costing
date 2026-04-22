import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { formatRupees, monthOptions } from '@/lib/helperFunction';
import toast from 'react-hot-toast';
import { status } from '@/constant/status';
import Loader from '@/components/ui/loader';
import { Eye } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import TableList from '@/components/ui/data-table2';
import BudgetDetailsCgmDialog from '@/components/dailogs/BudgetDeatailsCgmDialog';
import { showCustomToast } from '@/components/common/showCustomToast';

const BudgetApproveRequests = () => {
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'reverted'>('pending');
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState([]);
  const { units } = useAppSelector((state: RootState) => state.user);
  const { departments } = useAppSelector((state: RootState) => state.user);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const fetchRequests = async (currentTab: string) => {
    try {
      setLoading(true);
      let statusList = '';

      if (currentTab === 'pending') {
        statusList = `${status.Pending_CGM.value}`;
      } else if (currentTab === 'approved') {
        statusList = `${status.Approved.value},${status.Pending_Finance.value}`;
      } else if (currentTab === 'reverted') {
        statusList = `${status.Reverted_By_CGM.value}`;
      }

      const response = await axiosInstance.get(`/UnitAmountRequest/list-by-status?statusList=${statusList}`);
      if (response.data.statusCode === 200) {
        setRequest(response.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(statusTab);
  }, [statusTab]);

  const filteredRequests = useMemo(() => {
    if (!request.length) return [];

    return request.filter((req) => {
      const unitMatch = !units.length || units.some((u: any) => Number(u.value) === req.unitId);

      const deptMatch = !departments?.length || departments.some((d: any) => Number(d.value) === req.departmentId);

      return unitMatch && deptMatch;
    });
  }, [request, units, departments]);

  const handleApprove = async (row: any, targetStatus: string, remarks?: string) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('RequestId', String(row.id));
      formData.append('TargetStatus', String(targetStatus));
      formData.append('Remarks', remarks || '');

      formData.append('BudgetAmount', String(Number(row.budgetAmount || 0)));
      formData.append('ActualAmount', String(Number(row.actualAmount || 0)));
      formData.append('GeneralLedger', row.gl || '');

      formData.append('Frequency', row.frequency || 'Monthly');
      formData.append('Year', String(row.year));
      formData.append('Month', String(row.month));
      formData.append('Quarter', String(row.quarter || 0));

      formData.append('DemandDetails', row.demandDetails || '');

      row.componentsDetails?.forEach((comp: any, index: number) => {
        formData.append(`ComponentDetails[${index}].brDetailsId`, String(comp.brDetailsId || 0));

        formData.append(`ComponentDetails[${index}].componentDescription`, comp.componentDescription || '');

        formData.append(`ComponentDetails[${index}].mUnit`, comp.munit || '');

        formData.append(`ComponentDetails[${index}].qty`, String(Number(comp.qty || 0)));

        formData.append(`ComponentDetails[${index}].rateOfUnit`, String(Number(comp.rateOfUnit || 0)));

        formData.append(`ComponentDetails[${index}].amount`, String(Number(comp.amount || 0)));

        formData.append(`ComponentDetails[${index}].totalAmount`, String(Number(comp.amount || 0)));
      });

      if (row.file) {
        formData.append('File', row.file);
      }

      const res = await axiosInstance.post('/UnitAmountRequest/action', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res?.data?.statusCode === 200) {
        showCustomToast({
          title: 'Success',
          type: 'success',
          message: targetStatus.includes('Finance') ? 'Approved successfully' : 'Reverted successfully',
        });

        fetchRequests(statusTab);
        setOpenDialog(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Operation Failed');
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      { header: 'Unit', cell: ({ row }: any) => <div className="px-2 font-semibold">{row.original.unitName.toUpperCase()}</div> },
      { header: 'Department', cell: ({ row }: any) => <div className="px-2 font-semibold">{row.original.departmentName}</div> },
      // {
      //   header: 'Month / Year',
      //   cell: ({ row }: any) => {
      //     const monthObj = monthOptions.find((m) => m.value === row.original.month);
      //     return (
      //       <div className="px-2 font-semibold">
      //         {monthObj?.label} / {row.original.year}
      //       </div>
      //     );
      //   },
      // },
      { header: 'Actual Amount', cell: ({ row }: any) => <div className="px-2 font-semibold text-right">{formatRupees(row.original.actualAmount)}</div> },
      { header: 'Budget Amount', cell: ({ row }: any) => <div className="px-2 font-semibold text-right">{formatRupees(row.original.budgetAmount)}</div> },
      {
        header: 'Status',
        cell: ({ row }: any) => (
          <span
            className={`px-2 rounded ${
              row.original.status === 3
                ? 'bg-green-100 text-green-700'
                : row.original.status === 4 || row.original.status === 5
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {row.original.statusName}
          </span>
        ),
      },
      {
        header: 'Action',
        cell: ({ row }: any) => (
          <button
            onClick={() => {
              setSelectedRow(row.original);
              setOpenDialog(true);
            }}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      {loading && <Loader />}
      {/* Page Header */}
      <div className="mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Budget Approval</h1>
            <p className="text-gray-500 mt-1">Review and process unit budget demand requests.</p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
        <div className="flex gap-2 mb-6 border-b pb-4">
          {(['pending', 'approved', 'reverted'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                statusTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="p-2">
          <TableList data={filteredRequests} columns={columns} />
        </div>
      </div>
      <BudgetDetailsCgmDialog open={openDialog} onClose={setOpenDialog} data={selectedRow} handleApprove={handleApprove} />
    </div>
  );
};

export default BudgetApproveRequests;

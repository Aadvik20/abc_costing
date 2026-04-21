import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { formatRupees, monthOptions } from '@/lib/helperFunction';
import { status } from '@/constant/status';
import Loader from '../../components/ui/loader';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import { Eye } from 'lucide-react';
import TableList2 from '@/components/ui/data-table2';
import BudgetDetailsDialog from '@/components/dailogs/BudgetSubmitRequestDialog';
import UserRevertedDialog from '@/components/dailogs/UserRevertedDialog';

const BudgetRequestList = () => {
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'reverted'>('pending');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const { units, departments } = useAppSelector((state: RootState) => state.user);

  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRevertedDialog, setOpenRevertedDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const fetchRequests = async (currentTab: string) => {
    try {
      setLoading(true);
      setEditingRowId(null);
      setDraft(null);

      let statusList = '';
      if (currentTab === 'pending') {
        statusList = `${status.Pending_CGM.value},${status.Pending_Finance.value}`;
      } else if (currentTab === 'approved') {
        statusList = `${status.Approved.value}`;
      } else if (currentTab === 'reverted') {
        statusList = `${status.Reverted_By_CGM.value},${status.Reverted_By_Finance.value}`;
      }

      const response = await axiosInstance.get(`/UnitAmountRequest/list-by-status`, {
        params: { statusList },
      });

      if (response.data.statusCode === 200) {
        setRequests(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(statusTab);
  }, [statusTab]);

  const filteredRequests = useMemo(() => {
    if (!requests?.length) return [];
    return requests.filter((req) => {
      const unitMatch = !units?.length || units.some((u: any) => Number(u.value) === req.unitId);
      const deptMatch = !departments?.length || departments.some((d: any) => Number(d.value) === req.departmentId);
      return unitMatch && deptMatch;
    });
  }, [requests, units, departments]);

  const columns = useMemo(
    () => [
      { header: 'Unit', cell: ({ row }: any) => <div className="px-2 font-semibold">{row.original.unitName}</div> },
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
      // { header: 'GL No.', cell: ({ row }: any) => <div className="px-2 font-semibold">{row.original.gl}</div> },
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

              if (row.original.status === 4 || row.original.status === 5) {
                setOpenDialog(false);
                setOpenRevertedDialog(true);
              } else {
                setOpenRevertedDialog(false);
                setOpenDialog(true);
              }
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
    <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
      {loading && <Loader />}

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
      <TableList2 data={filteredRequests} columns={columns} />
      <BudgetDetailsDialog open={openDialog} onClose={setOpenDialog} data={selectedRow} />
      <UserRevertedDialog open={openRevertedDialog} onClose={setOpenRevertedDialog} data={selectedRow} onSuccess={() => fetchRequests(statusTab)} />
    </div>
  );
};

export default BudgetRequestList;

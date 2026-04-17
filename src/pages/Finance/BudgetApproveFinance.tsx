import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { formatRupees, monthOptions } from '@/lib/helperFunction';
import ExpandableTableList from '@/components/ui/expand-table';
import toast from 'react-hot-toast';
import { status } from '@/constant/status';
import Loader from '@/components/ui/loader';
import { CheckCircle, XCircle, Clock, FileText, ExternalLink, RefreshCcw } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';

const BudgetApproveFinance = () => {
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'reverted'>('pending');
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState([]);
  const { units } = useAppSelector((state: RootState) => state.user);
  const { departments } = useAppSelector((state: RootState) => state.user);

  const fetchRequests = async (currentTab: string) => {
    try {
      setLoading(true);
      let statusList = '';

      if (currentTab === 'pending') {
        statusList = `${status.Pending_Finance.value}`;
      } else if (currentTab === 'approved') {
        statusList = `${status.Approved.value}`;
      } else if (currentTab === 'reverted') {
        statusList = `${status.Reverted_By_Finance.value}`;
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
      formData.append('Amount', String(row.amount));
      formData.append('Frequency', String(row.frequency));
      formData.append('Year', String(row.year));
      formData.append('Month', String(row.month));
      formData.append('Remarks', remarks || '');
      formData.append('Quarter', '');
      formData.append('DemandDetails', row.demandDetails || '');
      if (row.file) formData.append('File', row.file);

      const res = await axiosInstance.post('/UnitAmountRequest/action', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res?.data?.statusCode === 200) {
        toast.success(targetStatus.includes('Approved') ? 'Approved successfully' : 'Reverted successfully');
        fetchRequests(statusTab);
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
      {
        header: 'Unit',
        cell: ({ row }: any) => (
          <div className="px-2 py-2">
            <p className="font-medium text-gray-900">{row.original.unitName}</p>
          </div>
        ),
      },
      {
        header: 'Department',
        cell: ({ row }: any) => (
          <div className="px-2 py-2">
            <p className="font-medium text-gray-900">{row.original.departmentName}</p>
          </div>
        ),
      },
      {
        header: 'Month / Year',
        cell: ({ row }: any) => {
          const monthObj = monthOptions.find((m) => m.value === row.original.month);
          return (
            <div className="px-2 py-2 ">
              <p className="font-medium text-gray-900">
                {monthObj?.label} / {row.original.year}{' '}
              </p>
            </div>
          );
        },
      },
      {
        header: 'Demanded Amount',
        cell: ({ row }: any) => <div className="px-2 py-2 font-bold text-right text-gray-900">{formatRupees(row.original.amount)}</div>,
      },
      //   {
      //     header: 'Current Status',
      //     cell: ({ row }: any) => {
      //       const isApproved = row.original.status === status.Approved.value || row.original.status === status.Pending_Finance.value;
      //       const isReverted = row.original.statusName?.toLowerCase().includes('revert');

      //       return (
      //         <div className="px-2 py-2">
      //           <span
      //             className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      //           ${isApproved ? 'bg-green-100 text-green-800' : isReverted ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}
      //           >
      //             {row.original.statusName}
      //           </span>
      //         </div>
      //       );
      //     },
      //   },
    ],
    []
  );

  const renderExpandedContent = (row: any) => {
    const isPending = row.status === status.Pending_Finance.value;
    const hasLongDescription = row.demandDetails && row.demandDetails.length > 400;

    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2 mb-4 mx-2 shadow-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: File and Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">Document</h4>
              {row.fileName || row.file ? (
                <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{row.fileName || row.file?.name}</p>
                  </div>
                  {row.fileUrl && (
                    <a href={row.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No document attached</p>
              )}
            </div>
          </div>
          {/* Right: Actions */}
          <div className="flex flex-col justify-end">
            {isPending && (
              <div className="flex justify-end gap-3">
                <ConfirmDialog
                  triggerClassName="bg-green-600 hover:bg-emerald-700 text-white py-3 rounded-lg text-sm font-bold transition-all hover:shadow-lg disabled:opacity-50"
                  triggerLabel="Approve"
                  title="Approve Request"
                  description="Are you sure you want to approve?"
                  onConfirm={() => handleApprove(row, status.Approved.label)}
                />
                <ConfirmDialog
                  triggerClassName="bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg text-sm font-bold transition-all hover:shadow-lg disabled:opacity-50"
                  triggerLabel="Revert to user"
                  title="Revert Request"
                  description="Please provide reason for revert"
                  actionLabel="Revert"
                  withRemarks
                  remarksRequired
                  onConfirm={(remarks) => handleApprove(row, status.Reverted_By_Finance.label, remarks)}
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <section>
            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-widest mb-3">Description</h4>
            <div className="relative group">
              <div
                className="prose prose-sm max-w-none p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 overflow-y-auto max-h-[350px] leading-relaxed"
                style={{ scrollbarWidth: 'thin' }}
              >
                <div dangerouslySetInnerHTML={{ __html: row.demandDetails || 'No description provided.' }} />
              </div>
              {/* Visual fade effect for long text */}
              {hasLongDescription && (
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none rounded-b-lg" />
              )}
            </div>
          </section>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      {loading && <Loader />}
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8">
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
          <ExpandableTableList data={filteredRequests} columns={columns} renderExpanded={(row) => renderExpandedContent(row)} />
        </div>
      </div>
    </div>
  );
};

export default BudgetApproveFinance;

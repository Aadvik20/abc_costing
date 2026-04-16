import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { formatRupees, monthOptions } from '@/lib/helperFunction';
import ReactQuill from 'react-quill';
import ExpandableTableList from '../ui/expand-table';
import { status } from '@/constant/status';
import Loader from '../ui/loader';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import debounce from 'lodash/debounce';

const EditableAmount = ({ initialValue, onSave }: { initialValue: any; onSave: (val: string) => void }) => {
  const [localValue, setLocalValue] = useState(initialValue);

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  return (
    <input
      type="number"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => onSave(localValue)}
      className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
    />
  );
};

const LocalQuillEditor = ({ initialValue, onChange }: { initialValue: string; onChange: (val: string) => void }) => {
  const [localValue, setLocalValue] = useState(initialValue);

  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const debouncedUpdate = useRef(
    debounce((content: string) => {
      onChange(content);
    }, 500)
  ).current;

  const handleLocalChange = (content: string) => {
    setLocalValue(content);
    debouncedUpdate(content);
  };

  return <ReactQuill theme="snow" value={localValue} onChange={handleLocalChange} />;
};

const BudgetRequestList = () => {
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'reverted'>('pending');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const { units, departments } = useAppSelector((state: RootState) => state.user);

  const fetchRequests = async (currentTab: string) => {
    try {
      setLoading(true);
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
      console.error('Fetch error:', error);
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

  const updateRowField = useCallback((id: number, updatedFields: object) => {
    setRequests((prev) => prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item)));
  }, []);

  const handleSave = async (row: any, targetStatus: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('RequestId', String(row.id));
      formData.append('TargetStatus', String(targetStatus));
      formData.append('Amount', String(row.amount));
      formData.append('Frequency', String(row.frequency));
      formData.append('Year', String(row.year));
      formData.append('Month', String(row.month));
      formData.append('Remarks', '');
      formData.append('Quarter', '');
      formData.append('DemandDetails', row.demandDetails);

      if (row.file) formData.append('File', row.file);

      const res = await axiosInstance.post('/UnitAmountRequest/action', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res?.data?.statusCode === 200) {
        toast.success('Changes Saved');
        fetchRequests(statusTab);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Request Failed');
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      { header: 'Unit', cell: ({ row }: any) => <div className="px-2 py-2">{row.original.unitName}</div> },
      { header: 'Department', cell: ({ row }: any) => <div className="px-2 py-2">{row.original.departmentName}</div> },
      {
        header: 'Month / Year',
        cell: ({ row }: any) => {
          const monthObj = monthOptions.find((m) => m.value === row.original.month);
          return (
            <div className="px-2 py-2">
              {monthObj?.label} / {row.original.year}
            </div>
          );
        },
      },
      { header: 'Amount', cell: ({ row }: any) => <div className="px-2 py-2 font-semibold text-right">{formatRupees(row.original.amount)}</div> },
      {
        header: 'Status',
        cell: ({ row }: any) => (
          <span
            className={`px-2 py-1 text-xs rounded ${
              row.original.status === 3
                ? 'bg-green-100 text-green-700'
                : row.original.status === 4
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {row.original.statusName}
          </span>
        ),
      },
    ],
    []
  );

  const renderExpandedContent = (row: any) => {
    const isEditable = row.status === 4 || row.status === 5;
    const hasLongDescription = row.demandDetails && row.demandDetails.length > 400;

    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2 mb-4 mx-2 shadow-inner">
        {isEditable && row.remarks && (
          <div>
            <p className="text-sm font-semibold mb-1 text-red-600">Reverted Remarks</p>
            <div className="border rounded p-3 bg-white text-sm">{row.remarks}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
          {isEditable && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-800 tracking-wider">Amount</label>
              <EditableAmount initialValue={row.amount} onSave={(val) => updateRowField(row.id, { amount: val })} />
            </div>
          )}

          <div className="flex flex-col gap-2 lg:col-span-2">
            <h4 className="text-sm font-bold text-gray-800 tracking-wider">Document</h4>
            {row.file || row.fileName ? (
              <div className="flex items-center justify-between p-2 border rounded-md bg-white">
                <span className="text-sm truncate max-w-[200px]">{row.file?.name || row.fileName}</span>
                <div className="flex items-center gap-3">
                  {row.fileUrl && !row.file && (
                    <a href={row.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 text-xs underline font-medium">
                      View
                    </a>
                  )}
                  {isEditable && (
                    <button
                      onClick={() => updateRowField(row.id, { file: null, fileName: null, fileUrl: null })}
                      className="text-red-500 text-xs hover:font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ) : (
              isEditable && (
                <div className="bg-white border p-1 rounded">
                  <input
                    type="file"
                    className="text-sm w-full"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) updateRowField(row.id, { file });
                    }}
                  />
                </div>
              )
            )}
          </div>
        </div>

        <div>
          {isEditable ? (
            <div className="bg-white mt-3">
              <p className="text-sm font-bold text-gray-800 tracking-wider mb-3">Description</p>
              <LocalQuillEditor initialValue={row.demandDetails || ''} onChange={(val) => updateRowField(row.id, { demandDetails: val })} />
            </div>
          ) : (
            <div className="mt-6">
              <h4 className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-widest mb-3">Description</h4>
              <div className="relative group">
                <div className="prose prose-sm max-w-none p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 overflow-y-auto max-h-[350px] leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: row.demandDetails || 'No description provided.' }} />
                </div>
                {hasLongDescription && (
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none rounded-b-lg" />
                )}
              </div>
            </div>
          )}
        </div>

        {isEditable && (
          <div className="flex justify-end pt-2 mt-4">
            <button
              onClick={() => handleSave(row, status.Pending_CGM.value.toString())}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
            >
              Update and Resubmit
            </button>
          </div>
        )}
      </div>
    );
  };

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
      <ExpandableTableList data={filteredRequests} columns={columns} renderExpanded={(row) => renderExpandedContent(row)} />
    </div>
  );
};

export default BudgetRequestList;

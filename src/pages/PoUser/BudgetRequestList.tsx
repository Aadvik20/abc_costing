import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { formatRupees, monthOptions } from '@/lib/helperFunction';
import ReactQuill from 'react-quill';
import ExpandableTableList from '../../components/ui/expand-table';
import { status } from '@/constant/status';
import Loader from '../../components/ui/loader';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import { ExternalLink, Eye, FileText, MessageSquareWarning, Trash2, Upload } from 'lucide-react';
import TableList from '@/components/ui/data-table';
import TableList2 from '@/components/ui/data-table2';
import BudgetDetailsDialog from '@/components/dailogs/BudgetSubmitRequestDialog';

// const EditableAmount = ({ value, onChange }: { value: number | string; onChange: (val: string) => void }) => {
//   const [localValue, setLocalValue] = useState(value?.toString() || '');

//   useEffect(() => {
//     setLocalValue(value?.toString() || '');
//   }, [value]);

//   return (
//     <input
//       type="number"
//       value={localValue}
//       onChange={(e) => setLocalValue(e.target.value)}
//       onBlur={() => onChange(localValue)}
//       className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
//     />
//   );
// };

// const LocalQuillEditor = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
//   const [localValue, setLocalValue] = useState(value || '');

//   useEffect(() => {
//     if (value !== localValue) {
//       setLocalValue(value || '');
//     }
//   }, [value]);

//   const handleChange = (content: string) => {
//     setLocalValue(content);
//     onChange(content);
//   };

//   return <ReactQuill theme="snow" value={localValue} onChange={handleChange} />;
// };

const BudgetRequestList = () => {
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'reverted'>('pending');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const { units, departments } = useAppSelector((state: RootState) => state.user);

  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);
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

  const handleUpdateField = useCallback((row: any, updatedFields: object) => {
    setEditingRowId(row.id);
    setDraft((prev: any) => {
      const base = prev && prev.id === row.id ? prev : { ...row };
      return { ...base, ...updatedFields };
    });
  }, []);

  const handleSave = async () => {
    if (!draft || !editingRowId || draft.id !== editingRowId) {
      toast.error('No changes detected to save.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('RequestId', String(draft.id));
      formData.append('TargetStatus', status.Pending_CGM.value.toString());
      formData.append('Amount', String(draft.amount));
      formData.append('Frequency', String(draft.frequency || ''));
      formData.append('Year', String(draft.year));
      formData.append('Month', String(draft.month));
      formData.append('Remarks', '');
      formData.append('Quarter', '');
      formData.append('DemandDetails', draft.demandDetails || '');
      formData.append('File', draft.file);

      const res = await axiosInstance.post('/UnitAmountRequest/action', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res?.data?.statusCode === 200) {
        toast.success('Changes Saved Successfully');
        setEditingRowId(null);
        setDraft(null);
        fetchRequests(statusTab);
      }
    } catch (error) {
      toast.error('Request Failed');
    } finally {
      setLoading(false);
    }
  };

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

  const isEditable = (row: any) => row.status === 4 || row.status === 5;

  // const renderExpandedContent = (row: any) => {
  //   const isCurrentlyEditing = editingRowId === row.id;
  //   const currentData = isCurrentlyEditing && draft ? draft : row;
  //   const editable = isEditable(row);

  //   return (
  //     <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-2 mb-4 mx-2 shadow-inner">
  //       {editable && currentData.remarks && (
  //         <div className="mb-4">
  //           <div className="flex items-center gap-1.5 mb-2 text-red-600">
  //             <MessageSquareWarning className="w-4 h-4" />
  //             <span className="text-xs font-bold uppercase tracking-wider">Reverted Remarks</span>
  //           </div>
  //           <div className="relative overflow-hidden rounded-lg border border-red-100 bg-red-50/50 p-4 shadow-sm">
  //             <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
  //             <p className="text-sm leading-relaxed text-red-900 font-medium italic">"{currentData.remarks}"</p>
  //           </div>
  //         </div>
  //       )}

  //       {currentData.fileName && currentData.fileUrl && (
  //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  //           <div className="flex flex-col gap-2 lg:col-span-2">
  //             <h4 className="text-sm font-bold text-gray-800 tracking-wider uppercase">Document</h4>

  //             {currentData.file || currentData.fileUrl || currentData.fileName ? (
  //               <div className="flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm group">
  //                 <div className="p-2 bg-blue-50 rounded-lg">
  //                   <FileText className="w-6 h-6 text-blue-500" />
  //                 </div>
  //                 <div className="flex-1 min-w-0">
  //                   <p className="text-sm font-medium text-gray-900 truncate">{currentData.file?.name || currentData.fileName || 'Document Attached'}</p>
  //                 </div>
  //                 <div className="flex items-center gap-1">
  //                   {currentData.fileUrl && (
  //                     <a
  //                       href={currentData.fileUrl}
  //                       target="_blank"
  //                       rel="noreferrer"
  //                       className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
  //                     >
  //                       <ExternalLink className="w-4 h-4" />
  //                     </a>
  //                   )}
  //                   {editable && (
  //                     <button
  //                       onClick={() => handleUpdateField(row, { file: null, fileName: null, fileUrl: null })}
  //                       className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
  //                     >
  //                       <Trash2 className="w-4 h-4" />
  //                     </button>
  //                   )}
  //                 </div>
  //               </div>
  //             ) : (
  //               editable && (
  //                 <div className="relative group">
  //                   <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-blue-400 cursor-pointer transition-all">
  //                     <div className="flex items-center gap-2">
  //                       <Upload className="w-4 h-4 text-gray-500" />
  //                       <span className="text-sm text-gray-500">Click to upload document</span>
  //                     </div>
  //                     <input
  //                       type="file"
  //                       className="hidden"
  //                       onChange={(e) => {
  //                         const file = e.target.files?.[0];
  //                         if (file) handleUpdateField(row, { file });
  //                       }}
  //                     />
  //                   </label>
  //                 </div>
  //               )
  //             )}
  //           </div>

  //           {editable && (
  //             <div className="flex flex-col gap-2">
  //               <label className="text-sm font-bold text-gray-800 tracking-wider">Amount</label>
  //               <EditableAmount value={currentData.amount} onChange={(val) => handleUpdateField(row, { amount: val })} />
  //             </div>
  //           )}
  //         </div>
  //       )}

  //       <div className="mt-6">
  //         {editable ? (
  //           <div className="bg-white p-3 border rounded-lg">
  //             <p className="text-sm font-bold text-gray-800 tracking-wider mb-3">Project Description</p>
  //             <div className="max-h-[300px] overflow-y-auto">
  //               <LocalQuillEditor value={currentData.demandDetails || ''} onChange={(val) => handleUpdateField(row, { demandDetails: val })} />
  //             </div>
  //           </div>
  //         ) : (
  //           <div>
  //             <h4 className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-widest mb-3">Description</h4>
  //             <div className="prose prose-sm max-w-none p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 overflow-y-auto max-h-[350px]">
  //               {row.demandDetails || 'No description provided.'}
  //             </div>
  //           </div>
  //         )}
  //       </div>

  //       {editable && isCurrentlyEditing && (
  //         <div className="flex justify-end pt-2 mt-4">
  //           <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium shadow-sm transition-all">
  //             Update and Resubmit
  //           </button>
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

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
      <BudgetDetailsDialog open={openDialog} onClose={setOpenDialog} data={selectedRow}/>
    </div>
  );
};

export default BudgetRequestList;

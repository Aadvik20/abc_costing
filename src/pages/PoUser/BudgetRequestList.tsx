// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import axiosInstance from '@/services/axiosInstance';
// import { formatRupees, monthOptions } from '@/lib/helperFunction';
// import { status } from '@/constant/status';
// import Loader from '../../components/ui/loader';
// import toast from 'react-hot-toast';
// import { useAppSelector } from '@/app/hooks';
// import { RootState } from '@/app/store';
// import { Eye } from 'lucide-react';
// import TableList2 from '@/components/ui/data-table2';
// import BudgetDetailsDialog from '@/components/dailogs/BudgetSubmitRequestDialog';
// import UserRevertedDialog from '@/components/dailogs/UserRevertedDialog';

// const BudgetRequestList = () => {
//   const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'reverted'>('pending');
//   const [loading, setLoading] = useState(false);
//   const [requests, setRequests] = useState<any[]>([]);
//   const { units, departments } = useAppSelector((state: RootState) => state.user);

//   const [editingRowId, setEditingRowId] = useState<number | null>(null);
//   const [draft, setDraft] = useState<any>(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [openRevertedDialog, setOpenRevertedDialog] = useState(false);
//   const [selectedRow, setSelectedRow] = useState<any>(null);

//   const fetchRequests = async (currentTab: string) => {
//     try {
//       setLoading(true);
//       setEditingRowId(null);
//       setDraft(null);

//       let statusList = '';
//       if (currentTab === 'pending') {
//         statusList = `${status.Pending_CGM.value},${status.Pending_Finance.value}`;
//       } else if (currentTab === 'approved') {
//         statusList = `${status.Approved.value}`;
//       } else if (currentTab === 'reverted') {
//         statusList = `${status.Reverted_By_CGM.value},${status.Reverted_By_Finance.value}`;
//       }

//       const response = await axiosInstance.get(`/UnitAmountRequest/list-by-status`, {
//         params: { statusList },
//       });

//       if (response.data.statusCode === 200) {
//         setRequests(response.data.data);
//       }
//     } catch (error) {
//       toast.error('Failed to fetch requests');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRequests(statusTab);
//   }, [statusTab]);

//   const filteredRequests = useMemo(() => {
//     if (!requests?.length) return [];
//     return requests.filter((req) => {
//       const unitMatch = !units?.length || units.some((u: any) => Number(u.value) === req.unitId);
//       const deptMatch = !departments?.length || departments.some((d: any) => Number(d.value) === req.departmentId);
//       return unitMatch && deptMatch;
//     });
//   }, [requests, units, departments]);

//   const columns = useMemo(
//     () => [
//       { header: 'Unit', cell: ({ row }: any) => <div className="px-2 font-semibold">{row.original.unitName.toUpperCase()}</div> },
//       { header: 'Department', cell: ({ row }: any) => <div className="px-2 font-semibold">{row.original.departmentName}</div> },
//       // {
//       //   header: 'Month / Year',
//       //   cell: ({ row }: any) => {
//       //     const monthObj = monthOptions.find((m) => m.value === row.original.month);
//       //     return (
//       //       <div className="px-2 font-semibold">
//       //         {monthObj?.label} / {row.original.year}
//       //       </div>
//       //     );
//       //   },
//       // },
//       { header: 'Actual Amount', cell: ({ row }: any) => <div className="px-2 font-semibold text-right">{formatRupees(row.original.actualAmount)}</div> },
//       { header: 'Budget Amount', cell: ({ row }: any) => <div className="px-2 font-semibold text-right">{formatRupees(row.original.budgetAmount)}</div> },
//       // { header: 'GL No.', cell: ({ row }: any) => <div className="px-2 font-semibold">{row.original.gl}</div> },
//       {
//         header: 'Status',
//         cell: ({ row }: any) => (
//           <span
//             className={`px-2 rounded ${
//               row.original.status === 3
//                 ? 'bg-green-100 text-green-700'
//                 : row.original.status === 4 || row.original.status === 5
//                   ? 'bg-red-100 text-red-700'
//                   : 'bg-yellow-100 text-yellow-700'
//             }`}
//           >
//             {row.original.statusName}
//           </span>
//         ),
//       },
//       {
//         header: 'Action',
//         cell: ({ row }: any) => (
//           <button
//             onClick={() => {
//               setSelectedRow(row.original);

//               if (row.original.status === 4 || row.original.status === 5) {
//                 setOpenDialog(false);
//                 setOpenRevertedDialog(true);
//               } else {
//                 setOpenRevertedDialog(false);
//                 setOpenDialog(true);
//               }
//             }}
//             className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
//             title="View Details"
//           >
//             <Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
//           </button>
//         ),
//       },
//     ],
//     []
//   );

//   return (
//     <div className="p-6 bg-white rounded-xl shadow border border-gray-100">
//       {loading && <Loader />}

//       <div className="flex gap-2 mb-6 border-b pb-4">
//         {(['pending', 'approved', 'reverted'] as const).map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setStatusTab(tab)}
//             className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
//               statusTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>
//       <TableList2 data={filteredRequests} columns={columns} />
//       <BudgetDetailsDialog open={openDialog} onClose={setOpenDialog} data={selectedRow} />
//       <UserRevertedDialog open={openRevertedDialog} onClose={setOpenRevertedDialog} data={selectedRow} onSuccess={() => fetchRequests(statusTab)} />
//     </div>
//   );
// };

// export default BudgetRequestList;
import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { formatRupees, monthOptions, yearOptions } from '@/lib/helperFunction';
import { status } from '@/constant/status';
import Loader from '../../components/ui/loader';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import { Clock, FileCheck, Filter, RotateCcw } from 'lucide-react';
import Select from 'react-select';
import BudgetDetailsDialog from '@/components/dailogs/BudgetSubmitRequestDialog';
import UserRevertedDialog from '@/components/dailogs/UserRevertedDialog';

const BudgetRequestList = () => {
  const [statusTab, setStatusTab] = useState<'pending' | 'approved' | 'reverted'>('pending');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const { units, departments } = useAppSelector((state: RootState) => state.user);

  const [openDialog, setOpenDialog] = useState(false);
  const [openRevertedDialog, setOpenRevertedDialog] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<any[]>([]);
  const [stage, setStage] = useState({
    value: 'Budget Estimate',
    label: 'Budget Estimate',
  });

  const stageOptions = [
    { value: 'Budget Estimate', label: 'Budget Estimate' },
    { value: 'Revised Estimate', label: 'Revised Estimate' },
  ];
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState({
    value: currentYear,
    label: currentYear.toString(),
  });

  const fetchRequests = async (currentTab: string) => {
    try {
      setLoading(true);
      let statusList = '';
      if (currentTab === 'pending') {
        statusList = `${status.Pending_CGM.value},${status.Pending_Finance.value},${status.Pending_HOD.value}`;
      } else if (currentTab === 'approved') {
        statusList = `${status.Approved.value}`;
      } else if (currentTab === 'reverted') {
        statusList = `${status.Reverted_By_CGM.value},${status.Reverted_By_Finance.value},${status.Reverted_By_HOD.value}`;
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

  // 1. Filter by User access and Date filters
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const unitMatch = !units?.length || units.some((u: any) => Number(u.value) === req.unitId);
      const deptMatch = !departments?.length || departments.some((d: any) => Number(d.value) === req.departmentId);

      const matchStage = !stage || req.stage === stage.value;
      const matchYear = !year || req.year === year.value;

      return unitMatch && deptMatch && matchStage && matchYear;
    });
  }, [requests, units, departments, stage, year]);

  // 2. Transform flat list into Matrix (Units x Departments)
  const transformedData = useMemo(() => {
    if (!filteredRequests?.length) return { units: [], departments: [], matrix: {} };

    const distinctUnits = [...new Set(filteredRequests.map((d) => d.unitName))];
    const distinctDepts = [...new Set(filteredRequests.map((d) => d.departmentName))];
    const matrix: any = {};

    distinctUnits.forEach((unitName) => {
      matrix[unitName] = {};
      distinctDepts.forEach((deptName) => {
        const matches = filteredRequests.filter((d) => d.unitName === unitName && d.departmentName === deptName);
        const total = matches.reduce((sum, item) => sum + (item.budgetAmount || 0), 0);
        matrix[unitName][deptName] = total;
      });
    });

    return { units: distinctUnits, departments: distinctDepts, matrix };
  }, [filteredRequests]);

  const getRowTotal = (unitName: string) => {
    return transformedData.departments.reduce((sum, dept) => sum + (transformedData.matrix[unitName][dept] || 0), 0);
  };

  const handleCellClick = (unitName: string, deptName: string) => {
    const filtered = filteredRequests.filter((r) => r.unitName === unitName && r.departmentName === deptName);
    if (filtered.length === 0) return;

    setSelectedRequests(filtered);

    // Functionality preserved: If reverted, open RevertedDialog, else open BudgetDetails
    const firstReq = filtered[0];
    if (firstReq.status === 4 || firstReq.status === 5 || firstReq.status === 7) {
      setOpenRevertedDialog(true);
    } else {
      setOpenDialog(true);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {loading && <Loader />}
      {/* Tabs & Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setStatusTab('pending')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              statusTab === 'pending' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock size={18} /> Pending
          </button>
          <button
            onClick={() => setStatusTab('approved')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              statusTab === 'approved' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileCheck size={18} /> Approved
          </button>
          <button
            onClick={() => setStatusTab('reverted')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              statusTab === 'reverted' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <RotateCcw size={18} /> Reverted
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="min-w-[140px]">
            <Select
              styles={{
                control: (base) => ({
                  ...base,
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '2px',
                  backgroundColor: '#fff',
                }),
              }}
              options={stageOptions}
              value={stage}
              onChange={(val) => setStage(val)}
            />
          </div>
          <div className="min-w-[110px]">
            <Select
              styles={{ control: (base) => ({ ...base, border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2px', backgroundColor: '#fff' }) }}
              options={yearOptions}
              value={year}
              onChange={(val) => setYear(val)}
            />
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <Filter className="text-slate-300" size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No requests found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your filters or checking a different tab.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="sticky left-0 px-6 py-5 text-left font-bold uppercase tracking-wider">Location</th>
                  {transformedData.departments.map((dept, idx) => (
                    <th key={idx} className="px-6 py-5 text-center font-bold uppercase tracking-wider">
                      {dept}
                    </th>
                  ))}
                  <th className="px-6 py-5 text-center uppercase tracking-wider">Total</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {transformedData.units.map((unitName, index) => (
                  <tr key={index} className="group hover:bg-slate-50/30 transition-all duration-200">
                    {/* Unit Name Column */}
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-700 bg-slate-50/30 group-hover:bg-white transition-colors sticky left-0 border-r border-slate-100">
                      {unitName.toUpperCase()}
                    </td>
                    {transformedData.departments.map((deptName, idx) => {
                      const cellValue = transformedData.matrix[unitName][deptName];
                      return (
                        <td
                          key={idx}
                          className={`px-4 py-4 text-right tabular-nums cursor-pointer relative transition-all duration-200 group/cell
                            ${cellValue > 0 ? 'hover:bg-blue-50/80' : 'hover:bg-slate-50'}`}
                          onClick={() => handleCellClick(unitName, deptName)}
                        >
                          <div className="flex flex-col items-end">
                            <span
                              className={`font-semibold transition-colors duration-200 
                                ${cellValue > 0 ? 'text-slate-900 group-hover/cell:text-blue-600' : 'text-slate-300'}`}
                            >
                              {formatRupees(cellValue)}
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    {/* Total Column */}
                    <td className="px-6 py-4 text-right font-black tabular-nums text-blue-700 bg-blue-50/30 border-l border-blue-50/50">
                      <div className="bg-blue-100/50 px-3 py-1.5 rounded-xl inline-block border border-blue-200 shadow-sm transition-transform group-hover:scale-105">
                        {formatRupees(getRowTotal(unitName))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BudgetDetailsDialog open={openDialog} onClose={() => setOpenDialog(false)} data={selectedRequests} />

      <UserRevertedDialog open={openRevertedDialog} onClose={setOpenRevertedDialog} data={selectedRequests} onSuccess={() => fetchRequests(statusTab)} />
    </div>
  );
};

export default BudgetRequestList;

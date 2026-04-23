import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { formatRupees, monthOptions, yearOptions } from '@/lib/helperFunction';
import toast from 'react-hot-toast';
import { status } from '@/constant/status';
import Loader from '@/components/ui/loader';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import BudgetApproveDialog from '@/components/dailogs/BudgetApproveDialog';
import { showCustomToast } from '@/components/common/showCustomToast';
import Select from 'react-select';
import { Clock, FileCheck, Filter } from 'lucide-react';

const BudgetApproveFinance = () => {
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState([]);
  const [financedialogOpen, setFinanceDialogOpen] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<any[]>([]);
  const { units, departments } = useAppSelector((state: RootState) => state.user);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [month, setMonth] = useState(monthOptions[new Date().getMonth()]);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState({
    value: currentYear,
    label: currentYear.toString(),
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const statusList = activeTab === 'pending' ? status.Pending_Finance.value : status.Approved.value;
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
    fetchRequests();
  }, [activeTab]);

  const filteredRequest = useMemo(() => {
    return request.filter((r) => {
      const matchStatus = activeTab === 'pending' ? r.status === status.Pending_Finance.value : r.status === status.Approved.value;
      const matchMonth = !month || r.month === month.value;
      const matchYear = !year || r.year === year.value;
      return matchStatus && matchMonth && matchYear;
    });
  }, [request, activeTab, month, year]);

  const transformedData = useMemo(() => {
    if (!filteredRequest?.length) return { units: [], departments: [], matrix: {} };
    const units = [...new Set(filteredRequest.map((d) => d.unitName))];
    const departments = [...new Set(filteredRequest.map((d) => d.departmentName))];
    const matrix: any = {};
    units.forEach((unit) => {
      matrix[unit] = {};
      departments.forEach((dept) => {
        const matches = filteredRequest.filter((d) => d.unitName === unit && d.departmentName === dept);
        const total = matches.reduce((sum, item) => sum + (item.budgetAmount || 0), 0);
        matrix[unit][dept] = total;
      });
    });
    return { units, departments, matrix };
  }, [filteredRequest]);

  const getRowTotal = (unit: string) => {
    return transformedData.departments.reduce((sum, dept) => sum + (transformedData.matrix[unit][dept] || 0), 0);
  };

  const handleCellClick = (unit: string, dept: string) => {
    const filtered = filteredRequest.filter((r) => r.unitName === unit && r.departmentName === dept);
    setSelectedRequests(filtered);
    setFinanceDialogOpen(true);
  };

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

      if (row.file) formData.append('File', row.file);

      const res = await axiosInstance.post('/UnitAmountRequest/action', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res?.data?.statusCode === 200) {
        showCustomToast({
          title: 'Success',
          type: 'success',
          message: targetStatus.includes('Approved') ? 'Approved successfully' : 'Reverted successfully',
        });
        fetchRequests();
        setFinanceDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Operation Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {loading && <Loader />}

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Budget Approval</h1>
        <p className="text-slate-500 font-medium">Review and process unit budget demand requests.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'pending' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock size={18} /> Pending
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'approved' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileCheck size={18} /> Approved
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="min-w-[140px]">
            <Select
              styles={{
                control: (base) => ({ ...base, border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2px', backgroundColor: '#fff' }),
              }}
              options={monthOptions}
              value={month}
              onChange={(val) => setMonth(val)}
            />
          </div>
          <div className="min-w-[110px]">
            <Select
              styles={{
                control: (base) => ({ ...base, border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2px', backgroundColor: '#fff' }),
              }}
              options={yearOptions}
              value={year}
              onChange={(val) => setYear(val)}
            />
          </div>
        </div>
      </div>

      {filteredRequest.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <Filter className="text-slate-300" size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No requests found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your month or year filters.</p>
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
                {transformedData.units.map((unit, index) => (
                  <tr key={index} className="group hover:bg-slate-50/30 transition-all duration-200">
                    {/* Unit Name Column */}
                    <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-700 bg-slate-50/30 group-hover:bg-white transition-colors">
                      {unit.toUpperCase()}
                    </td>
                    {transformedData.departments.map((dept, idx) => {
                      const cellValue = transformedData.matrix[unit][dept];
                      return (
                        <td
                          key={idx}
                          className={`px-4 py-4 text-right tabular-nums cursor-pointer relative transition-all duration-200 group/cell
              ${cellValue > 0 ? 'hover:bg-blue-50/80' : 'hover:bg-slate-50'}`}
                          onClick={() => handleCellClick(unit, dept)}
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
                        {formatRupees(getRowTotal(unit))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BudgetApproveDialog open={financedialogOpen} onClose={() => setFinanceDialogOpen(false)} data={selectedRequests} onApprove={handleApprove} />
    </div>
  );
};

export default BudgetApproveFinance;

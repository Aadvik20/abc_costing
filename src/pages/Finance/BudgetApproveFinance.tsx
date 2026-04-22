import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/services/axiosInstance';
import { formatRupees } from '@/lib/helperFunction';
import toast from 'react-hot-toast';
import { status } from '@/constant/status';
import Loader from '@/components/ui/loader';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import BudgetApproveDialog from '@/components/dailogs/BudgetApproveDialog';
import { showCustomToast } from '@/components/common/showCustomToast';

const BudgetApproveFinance = () => {
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState([]);
  const [financedialogOpen, setFinanceDialogOpen] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<any[]>([]);
  const { units } = useAppSelector((state: RootState) => state.user);
  const { departments } = useAppSelector((state: RootState) => state.user);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      let statusList = `${status.Pending_Finance.value},${status.Approved.value}`;

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
  }, []);

  const transformedData = useMemo(() => {
    if (!request?.length) return { units: [], departments: [], matrix: {} };

    const units = [...new Set(request.map((d) => d.unitName))];
    const departments = [...new Set(request.map((d) => d.departmentName))];

    const matrix: any = {};

    units.forEach((unit) => {
      matrix[unit] = {};

      departments.forEach((dept) => {
        const matches = request.filter((d) => d.unitName === unit && d.departmentName === dept);

        const total = matches.reduce((sum, item) => sum + (item.budgetAmount || 0), 0);

        matrix[unit][dept] = total;
      });
    });

    return { units, departments, matrix };
  }, [request]);

  const getRowTotal = (unit: string) => {
    return transformedData.departments.reduce((sum, dept) => sum + (transformedData.matrix[unit][dept] || 0), 0);
  };

  // const getColumnTotal = (dept: string) => {
  //   return transformedData.units.reduce((sum, unit) => sum + (transformedData.matrix[unit][dept] || 0), 0);
  // };

  const handleCellClick = (unit: string, dept: string, amount: number) => {
    // const filtered = request.filter((r: any) => r.unitName === unit && r.departmentName === dept && r.budgetAmount === amount);
    const filtered = request.filter((r) => r.unitName === unit && r.departmentName === dept);

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
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full border-collapse bg-white text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-900">Location</th>

              {transformedData.departments.map((dept, idx) => (
                <th key={idx} className="px-4 py-4 text-right font-semibold text-gray-900">
                  {dept}
                </th>
              ))}

              <th className="px-6 py-4 text-right font-bold text-gray-900 bg-gray-100/50">Total</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {transformedData.units.map((unit, index) => (
              <tr key={index} className="transition-colors hover:bg-blue-50/30">
                {/* Unit Name */}
                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-700">{unit.toUpperCase()}</td>

                {/* Money Cells */}
                {transformedData.departments.map((dept, idx) => (
                  <td
                    key={idx}
                    className="px-4 py-4 text-right tabular-nums cursor-pointer transition-colors hover:bg-blue-50"
                    onClick={() => handleCellClick(unit, dept, transformedData.matrix[unit][dept])}
                  >
                    <span className="text-gray-600">{formatRupees(transformedData.matrix[unit][dept])}</span>
                  </td>
                ))}

                {/* Row Total */}
                <td className="px-6 py-4 text-right font-bold tabular-nums text-blue-700 bg-gray-50/50 cursor-pointer hover:bg-blue-100">
                  {formatRupees(getRowTotal(unit))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BudgetApproveDialog open={financedialogOpen} onClose={() => setFinanceDialogOpen(false)} data={selectedRequests} onApprove={handleApprove} />
    </div>
  );
};

export default BudgetApproveFinance;

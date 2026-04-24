import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calculator, Info, Trash2, Plus, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import axiosInstance from '@/services/axiosInstance';
import { status } from '@/constant/status';
import { formatDecimal, formatRupees } from '@/lib/helperFunction';
import Loader from '../ui/loader';
import { showCustomToast } from '../common/showCustomToast';

const UserRevertedDialog = ({ open, onClose, data, onSuccess }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log(data);

  const mapData = (data) => {
    return {
      actualAmount: formatDecimal(data.actualAmount) || '',
      budgetAmount: formatDecimal(data.budgetAmount) || '',
      demandDetails: data.demandDetails || '',
      gl: data.gl || null,
      year: data.year,
      revertedRemarks: data.remarks || 'No remarks provided.',
      components: data.componentsDetails?.map((c) => ({
        brDetailsId: c.brdetailsId,
        category: c.categoryName,
        categoryId: c.categoryId,
        subCategory: c.subCategoryName,
        subCategoryId: c.subCategoryId,
        unit: c.munit || '',
        qty: String(formatDecimal(c.qty) || ''),
        rate: String(formatDecimal(c.rateOfUnit) || ''),
        total: c.amount || 0,
      })) || [{ component: '', unit: '', qty: '', rate: '', total: 0 }],
    };
  };

  useEffect(() => {
    if (data) {
      setForm(mapData(Array.isArray(data) ? data[0] : data));
    }
  }, [data]);

  const recalculate = (components, budget) => {
    const budgetValue = Number(budget || 0);

    let updated = components.map((c) => {
      if (c.component === 'Others') return c;

      const qty = Number(c.qty || 0);
      const rate = Number(c.rate || 0);

      const total = qty * rate;

      return {
        ...c,
        total: Number(total.toFixed(2)),
      };
    });

    // ✅ Step 1: First row = full budget if empty
    if (updated.length > 0) {
      const first = updated[0];

      const hasQtyOrRate = Number(first.qty || 0) > 0 || Number(first.rate || 0) > 0;

      if (!hasQtyOrRate) {
        updated[0] = {
          ...first,
          total: Number(budgetValue.toFixed(2)),
        };
      }
    }

    // ✅ Step 2: Handle Others row
    const othersIndex = updated.findIndex((c) => c.component === 'Others');

    if (othersIndex !== -1) {
      const used = updated.reduce((sum, c, idx) => {
        if (idx === othersIndex) return sum;
        return sum + (c.total || 0);
      }, 0);

      const remaining = Math.max(budgetValue - used, 0);

      updated[othersIndex] = {
        ...updated[othersIndex],
        total: Number(remaining.toFixed(2)),
      };
    }

    return updated;
  };

  const handleDecimalChange = (field, value) => {
    const num = value === '' ? '' : Number(value);

    let updatedForm = {
      ...form,
      [field]: num,
    };

    if (field === 'budgetAmount') {
      updatedForm.components = recalculate(form.components, num);
    }

    setForm(updatedForm);
  };

  const handleDecimalBlur = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: formatDecimal(prev[field]),
    }));
  };

  const handleComponentChange = (index, field, value) => {
    let updated = [...form.components];

    updated[index] = {
      ...updated[index],
      [field]: field === 'qty' || field === 'rate' ? (value === '' ? '' : Number(value)) : value, // 👈 string fields untouched
    };

    if (field === 'qty' || field === 'rate') {
      updated = recalculate(updated, form.budgetAmount);
    }

    setForm({ ...form, components: updated });
  };

  const handleComponentBlur = (index, field) => {
    let updated = [...form.components];

    if (updated[index][field] === '') return; // 👈 IMPORTANT

    updated[index][field] = formatDecimal(updated[index][field]);

    setForm({ ...form, components: updated });
  };

  const addComponent = () => {
    if (form.components.some((c) => !c.component)) {
      showCustomToast({
        title: 'Warning',
        type: 'warning',
        message: 'Please fill existing row first',
      });
      return;
    }

    let updated = form.components.filter((c) => c.component !== 'Others');

    const used = updated.reduce((sum, c) => sum + (c.total || 0), 0);
    const budget = Number(form.budgetAmount || 0);
    const remaining = Math.max(budget - used, 0);

    updated.push({
      component: 'Others',
      unit: '',
      qty: '',
      rate: '',
      total: Number(remaining.toFixed(2)),
    });

    setForm({
      ...form,
      components: updated,
    });
  };

  const deleteComponent = (index) => {
    if (form.components.length === 1) return;
    const updated = form.components.filter((_, i) => i !== index);
    setForm({ ...form, components: recalculate(updated, form.budgetAmount) });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append('RequestId', String(data.id));
      formData.append('TargetStatus', status.Pending_CGM.value.toString());
      formData.append('Remarks', '');
      formData.append('GeneralLedger', form.gl);
      formData.append('Frequency', form.frequency);
      formData.append('Year', String(form.year));
      formData.append('Month', String(form.month));
      formData.append('Quarter', String(form.quarter || 0));
      formData.append('ActualAmount', form.actualAmount);
      formData.append('BudgetAmount', form.budgetAmount);
      formData.append('DemandDetails', form.demandDetails);

      form.components.forEach((c, i) => {
        formData.append(`ComponentDetails[${i}].BrDetailsId`, c.brDetailsId || 0);
        formData.append(`ComponentDetails[${i}].ComponentDescription`, c.component);
        formData.append(`ComponentDetails[${i}].MUnit`, c.unit);
        formData.append(`ComponentDetails[${i}].Qty`, c.qty);
        formData.append(`ComponentDetails[${i}].RateOfUnit`, c.rate);
        formData.append(`ComponentDetails[${i}].Amount`, c.total);
      });

      const res = await axiosInstance.post('/UnitAmountRequest/action', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res?.data?.statusCode === 200) {
        showCustomToast({
          title: 'Success',
          type: 'success',
          message: 'Updated & Resubmitted',
        });
        onClose(false);
        onSuccess?.();
      }
    } catch (err) {
      showCustomToast({
        title: 'Failed',
        type: 'error',
        message: 'Request Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!data || !form) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 border-none shadow-2xl bg-slate-50">
        {loading && <Loader />}
        {/* Header */}
        <DialogHeader className="p-6 bg-white border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Calculator className="w-5 h-5 text-blue-600" />
            Review & Resubmit Request
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-amber-800 text-sm uppercase tracking-wider">Reverted Remarks</span>
            </div>
            <p className="text-amber-900 text-sm italic">"{form.revertedRemarks}"</p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-3 gap-6 bg-white p-4 rounded-xl border">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Actual Amount (₹)</label>
              <Input
                type="number"
                className="bg-slate-50 border text-right"
                value={form.actualAmount}
                onChange={(e) => handleDecimalChange('actualAmount', e.target.value)}
                onBlur={() => handleDecimalBlur('actualAmount')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Budget Amount (₹)</label>
              <Input
                type="number"
                className="bg-slate-50 border text-right"
                value={form.budgetAmount}
                onChange={(e) => handleDecimalChange('budgetAmount', e.target.value)}
                onBlur={() => handleDecimalBlur('budgetAmount')}
              />
            </div>

            {data.gl != 'null' && data.gl !== '' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">GL No.</label>
                <Input className="bg-slate-50 border" value={form.gl} onChange={(e) => setForm({ ...form, gl: e.target.value })} />
              </div>
            )}

            <div className="col-span-3 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Demand Details</label>
              <Textarea
                className="min-h-[80px] bg-slate-50 border"
                placeholder="Enter details here..."
                value={form.demandDetails}
                onChange={(e) => setForm({ ...form, demandDetails: e.target.value })}
              />
            </div>
          </div>

          {/* Components Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Info className="w-4 h-4" /> Component Breakdown
              </h3>
              <Button size="sm" variant="outline" className="h-8 gap-1 text-blue-600 border-blue-200" onClick={addComponent}>
                <Plus size={14} /> Add Row
              </Button>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="p-3 text-left font-semibold text-slate-600">Category</th>
                    <th className="p-3 text-left font-semibold text-slate-600">Sub Category</th>
                    <th className="p-3 text-left font-semibold text-slate-600 w-20">Unit</th>
                    <th className="p-3 text-left font-semibold text-slate-600 w-24">Qty</th>
                    <th className="p-3 text-left font-semibold text-slate-600 w-28">Rate (₹)</th>
                    <th className="p-3 text-left font-semibold text-slate-600 w-28">Total (₹)</th>
                    <th className="p-3 text-center font-semibold text-slate-600 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {form.components.map((comp, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2">
                        <Input
                          className="border focus-visible:ring-1"
                          value={comp.component}
                          onChange={(e) => handleComponentChange(i, 'component', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <Input className="border focus-visible:ring-1" value={comp.unit} onChange={(e) => handleComponentChange(i, 'unit', e.target.value)} />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          className="border focus-visible:ring-1 text-right"
                          value={comp.qty}
                          onChange={(e) => handleComponentChange(i, 'qty', e.target.value)}
                          onBlur={() => handleComponentBlur(i, 'qty')}
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          className="border focus-visible:ring-1 text-right"
                          value={comp.rate}
                          onChange={(e) => handleComponentChange(i, 'rate', e.target.value)}
                          onBlur={() => handleComponentBlur(i, 'rate')}
                        />
                      </td>
                      <td className="p-2 font-medium text-slate-700 text-right">{formatRupees(comp.total)}</td>
                      <td className="p-2 text-center">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteComponent(i)}
                          disabled={form.components.length === 1}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onClose(false)} className="px-6">
            Close
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-200">
            Update & Resubmit Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserRevertedDialog;

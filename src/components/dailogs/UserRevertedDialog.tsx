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
import { components } from 'react-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UserRevertedDialog = ({ open, onClose, data, onSuccess }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const totalRequests = data.length;
  const filteredRequest = totalRequests > 1 ? [data[activeTab]] : data;
  const currentRequest = totalRequests > 1 ? data[activeTab] : data[0];
  console.log(currentRequest);
  const mapData = (data) => {
    return {
      actualAmount: formatDecimal(data?.actualAmount) || '',
      budgetAmount: formatDecimal(data?.budgetAmount) || '',
      demandDetails: data?.demandDetails || '',
      gl: data?.gl || null,
      year: data?.year,
      revertedRemarks: data?.remarks || 'No remarks provided.',
      components: data?.componentsDetails?.map((c) => ({
        brDetailsId: c.brdetailsId,
        category: {
          label: c.categoryName,
          value: c.categoryId,
        },
        subCategory: {
          label: c.subCategoryName,
          value: c.subCategoryId,
        },
        subCategories: [],
        unit: c.munit || '',
        qty: String(formatDecimal(c.qty) || ''),
        rate: String(formatDecimal(c.rateOfUnit) || ''),
        total: c.amount || 0,
      })) || [{ category: '', subCategory: '', unit: '', qty: '', rate: '', total: 0 }],
    };
  };

  // useEffect(() => {
  //   if (data) {
  //     setForm(mapData(Array.isArray(data) ? data[0] : data));
  //   }
  // }, [data]);

  useEffect(() => {
    if (currentRequest) {
      setForm(mapData(currentRequest));
    }
  }, [currentRequest]);

  const fetchCategories = async (departmentId) => {
    const response = await axiosInstance.get(`/UnitAmountRequest/get-budget-categories?departmentId=${departmentId}`);

    const categoryOptions = response.data.data.map((c) => ({
      label: c.categoryName,
      value: c.categoryId,
    }));

    setCategories(categoryOptions);
  };

  useEffect(() => {
    if (open && currentRequest?.departmentId) {
      fetchCategories(currentRequest.departmentId);
    }
  }, [open]);

  const fetchSubCategories = async (categoryId, index) => {
    const res = await axiosInstance.get(`/UnitAmountRequest/get-subcategories?categoryId=${categoryId}`);

    const subOptions = res.data.data.map((s) => ({
      label: s.subCategoryName,
      value: s.subCategoryId,
      unit: s.unitOfMeasure,
    }));

    setForm((prev) => {
      const updated = [...prev.components];

      const existing = updated[index].subCategory;

      updated[index] = {
        ...updated[index],
        subCategories: subOptions,

        subCategory: existing ? subOptions.find((s) => String(s.value) === String(existing.value)) || existing : null,
      };

      return { ...prev, components: updated };
    });
  };

  // useEffect(() => {
  //   if (!form) return;

  //   form.components.forEach((comp, i) => {
  //     if (comp.category?.value) {
  //       fetchSubCategories(comp.category.value, i);
  //     }
  //   });
  // }, [form?.components]);

  useEffect(() => {
    if (!data) return;

    const mapped = mapData(currentRequest);
    setForm(mapped);

    mapped.components.forEach((comp, i) => {
      if (comp.category?.value) {
        fetchSubCategories(comp.category.value, i);
      }
    });
  }, [currentRequest]);

  const handleCategoryChange = (index, val) => {
    let updated = [...form.components];

    updated[index] = {
      ...updated[index],
      category: val,
      subCategory: null,
      subCategories: [],
      unit: '',
    };

    setForm((prev) => ({
      ...prev,
      components: updated,
    }));

    if (val?.value) {
      fetchSubCategories(val.value, index);
    }
  };

  const handleSubCategoryChange = (index, val) => {
    let updated = [...form.components];

    updated[index].subCategory = val;
    updated[index].unit = val?.unit || '';

    setForm((prev) => ({
      ...prev,
      components: updated,
    }));
  };

  const recalculate = (components, budget) => {
    const budgetValue = Number(budget || 0);

    // 1. Map through and calculate fixed totals (Qty * Rate)
    let updated = components.map((c) => {
      const qty = Number(c.qty || 0);
      const rate = Number(c.rate || 0);
      return {
        ...c,
        total: Number((qty * rate).toFixed(2)),
      };
    });

    // 2. Apply "Remainder" logic
    if (updated.length === 1) {
      const first = updated[0];
      // If first row has no math yet, it equals the full budget
      if (Number(first.qty || 0) === 0 && Number(first.rate || 0) === 0) {
        updated[0].total = Number(budgetValue.toFixed(2));
      }
    } else {
      // If multiple rows, the last row (if empty) should absorb the remaining balance
      const lastIndex = updated.length - 1;
      const lastComp = updated[lastIndex];

      if (Number(lastComp.qty || 0) === 0 && Number(lastComp.rate || 0) === 0) {
        const otherRowsTotal = updated.filter((_, idx) => idx !== lastIndex).reduce((sum, c) => sum + c.total, 0);

        updated[lastIndex].total = Math.max(0, Number((budgetValue - otherRowsTotal).toFixed(2)));
      }
    }

    return updated;
  };

  const isBudgetFullyUsed = () => {
    const budget = Number(form.budgetAmount || 0);

    const used = form.components.reduce((sum, c) => sum + Number(c.total || 0), 0);

    return used >= budget;
  };

  const handleDecimalChange = (field, value) => {
    const num = value === '' ? '' : Number(value);

    setForm((prev) => {
      let updated = {
        ...prev,
        [field]: num,
      };

      if (field === 'budgetAmount') {
        updated.components = recalculate(prev.components, num);
      }

      return updated;
    });
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
      [field]: value,
    };

    if (field === 'qty' || field === 'rate') {
      updated = recalculate(updated, form.budgetAmount);
    }

    setForm((prev) => ({
      ...prev,
      components: updated,
    }));
  };

  const handleComponentBlur = (index, field) => {
    let updated = [...form.components];

    if (updated[index][field] === '') return;

    updated[index][field] = formatDecimal(updated[index][field]);

    setForm((prev) => ({
      ...prev,
      components: updated,
    }));
  };

  const addComponent = () => {
    if (form.components.some((c) => !c.category || !c.subCategory)) {
      showCustomToast({
        title: 'Warning',
        type: 'warning',
        message: 'Please fill existing row first',
      });
      return;
    }

    let updated = [...form.components];

    const used = updated.reduce((sum, c) => sum + (c.total || 0), 0);
    const budget = Number(form.budgetAmount || 0);
    const remaining = Math.max(budget - used, 0);

    updated.push({
      category: null,
      subCategory: null,
      subCategories: [],
      unit: '',
      qty: '',
      rate: '',
      total: Number(remaining.toFixed(2)),
    });

    setForm((prev) => ({
      ...prev,
      components: updated,
    }));
  };

  const deleteComponent = (index) => {
    if (form.components.length === 1) return;
    const updated = form.components.filter((_, i) => i !== index);
    setForm({ ...form, components: recalculate(updated, form.budgetAmount) });
  };

  const validateForm = () => {
    if (!form.budgetAmount || Number(form.budgetAmount) <= 0) {
      showCustomToast({
        title: 'Warning',
        type: 'warning',
        message: 'Budget amount must be greater than 0',
      });
      return false;
    }

    for (let i = 0; i < form.components.length; i++) {
      const c = form.components[i];

      if (!c.category) {
        showCustomToast({
          title: 'Warning',
          type: 'warning',
          message: `Row ${i + 1}: Category required`,
        });
        return false;
      }

      if (!c.subCategory) {
        showCustomToast({
          title: 'Warning',
          type: 'warning',
          message: `Row ${i + 1}: SubCategory required`,
        });
        return false;
      }

      if (!c.unit) {
        showCustomToast({
          title: 'Warning',
          type: 'warning',
          message: `Row ${i + 1}: Unit required`,
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const formData = new FormData();

      let targetStatus = status.Pending_CGM.value;

      if (currentRequest.status === 7) {
        targetStatus = status.Pending_HOD?.value;
      }

      formData.append('RequestId', String(currentRequest.id));
      formData.append('TargetStatus', targetStatus.toString());
      formData.append('RequestType', currentRequest.budgetType);
      formData.append('Remarks', '');
      formData.append('GeneralLedger', form.gl);
      formData.append('Year', String(form.year));
      formData.append('ActualAmount', form.actualAmount);
      formData.append('BudgetAmount', form.budgetAmount);
      formData.append('DemandDetails', form.demandDetails);

      form.components.forEach((c, i) => {
        formData.append(`ComponentDetails[${i}].brDetailsId`, c.brDetailsId || 0);
        formData.append(`ComponentDetails[${i}].categoryId`, c.category?.value);
        formData.append(`ComponentDetails[${i}].subCategoryId`, c.subCategory?.value);
        formData.append(`ComponentDetails[${i}].mUnit`, c.unit);
        formData.append(`ComponentDetails[${i}].qty`, c.qty);
        formData.append(`ComponentDetails[${i}].rateOfUnit`, c.rate);
        formData.append(`ComponentDetails[${i}].calculatedAmount`, c.total);
        formData.append(`ComponentDetails[${i}].finalAmount`, c.total);
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

  if (!currentRequest || !form) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 border-none shadow-2xl bg-slate-50">
        {loading && <Loader />}
        {/* Header */}
        <DialogHeader className="p-6 bg-white border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Calculator className="w-5 h-5 text-blue-600" />
            Review & Resubmit Request
          </DialogTitle>
        </DialogHeader>

        {totalRequests > 1 && (
          <div className="px-8 bg-white">
            <div className="flex gap-2 bg-gray-100/50 rounded-lg p-1 w-fit">
              {data.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
          ${activeTab === index ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Project {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 overflow-y-auto space-y-4">
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

            {currentRequest.gl != 'null' && currentRequest.gl !== '' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">GL No.</label>
                <Input className="bg-slate-50 border" value={form.gl} onChange={(e) => setForm({ ...form, gl: e.target.value })} />
              </div>
            )}

            <div className="col-span-3 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Project Description</label>
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
              <Button size="sm" variant="outline" className="h-8 gap-1 text-blue-600 border-blue-200" onClick={addComponent} disabled={isBudgetFullyUsed()}>
                <Plus size={14} /> Add Component
              </Button>
            </div>

            <div className="bg-white border rounded-xl shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="p-3 text-left font-semibold text-slate-600">Category</th>
                    <th className="p-3 text-left font-semibold text-slate-600">Sub Category</th>
                    <th className="p-3 text-left font-semibold text-slate-600">Unit</th>
                    <th className="p-3 text-left font-semibold text-slate-600 w-24">Qty</th>
                    <th className="p-3 text-left font-semibold text-slate-600 w-24">Rate (₹)</th>
                    <th className="p-3 text-left font-semibold text-slate-600 w-28">Total (₹)</th>
                    <th className="p-3 text-center font-semibold text-slate-600 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {form.components.map((comp, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-2">
                        <div className="relative">
                          <select
                            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 hover:border-slate-400 transition-all"
                            value={comp.category?.value || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const selected = categories.find((c) => String(c.value) === val);

                              handleCategoryChange(i, selected);
                            }}
                          >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="p-2">
                        <div className="relative">
                          <select
                            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 hover:border-slate-400 transition-all disabled:bg-slate-100"
                            value={comp.subCategory?.value || ''}
                            disabled={!comp.category}
                            onChange={(e) => {
                              const val = e.target.value;

                              const selected = comp.subCategories?.find((s) => String(s.value) === val);

                              if (selected) {
                                handleSubCategoryChange(i, selected);
                              }
                            }}
                          >
                            <option value="">Select Sub Category</option>
                            {comp.subCategories?.map((sub) => (
                              <option key={sub.value} value={sub.value}>
                                {sub.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="p-2">
                        <Input className="border focus-visible:ring-1" value={comp.unit} readOnly />
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

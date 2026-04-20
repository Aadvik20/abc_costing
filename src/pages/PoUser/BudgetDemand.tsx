import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useMemo } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { RootState } from '@/app/store';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import { formatDecimal, formatRupees, monthOptions, yearOptions } from '@/lib/helperFunction';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import BudgetRequestList from '@/pages/PoUser/BudgetRequestList';

const BudgetDemand = () => {
  const [loading, setLoading] = useState(false);
  const { units } = useAppSelector((state: RootState) => state.user);
  const { departments } = useAppSelector((state: RootState) => state.user);
  const [draft, setDraft] = useState([]);
  const [errors, setErrors] = useState<any>({});
  const [month, setMonth] = useState(monthOptions[new Date().getMonth()]);
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState({
    value: currentYear,
    label: currentYear.toString(),
  });
  const [unit, setUnit] = useState(null);
  const defaultComponents = [
    { component: '', unit: '', qty: '', rate: '', total: 0 },
    { component: 'Others', unit: '', qty: '', rate: '', total: 0 },
  ];

  const [rows, setRows] = useState([
    {
      requestId: 0,
      department: null,
      description: '',
      actualAmount: '',
      budgetAmount: '',
      gl: '',
      file: null,
      components: defaultComponents,
    },
  ]);

  const unitOptions = useMemo(
    () =>
      (units || []).map((unit: any) => ({
        value: String(unit.value),
        label: unit.label,
      })),
    [units]
  );

  const departmentOptions = useMemo(
    () =>
      (departments || []).map((d: any) => ({
        value: d.value,
        label: d.label,
      })),
    [departments]
  );

  useEffect(() => {
    if (units.length === 1 && !unit) {
      setUnit(units[0].value);
    }
  }, [units, unit]);

  const getFilteredDepartments = (currentIndex: number) => {
  const selectedDepartments = rows
    .map((r, i) => (i !== currentIndex ? r.department?.value : null))
    .filter(Boolean);

  return departmentOptions.filter(
    (d) => !selectedDepartments.includes(d.value)
  );
};

  // const validateForm = () => {
  //   let newErrors: any = {};

  //   if (!unit) newErrors.unit = 'Unit required';
  //   if (!month) newErrors.month = 'Month required';
  //   if (!year) newErrors.year = 'Year required';

  //   const rowErrors = rows.map((row) => {
  //     let err: any = {};

  //     if (!row.department) err.department = 'Required';
  //     if (!row.description || row.description.trim() === '') err.description = 'Required';

  //     if (!row.actualAmount) err.actualAmount = 'Required';
  //     if (!row.budgetAmount) err.budgetAmount = 'Required';

  //     if (Number(row.actualAmount) < 0) err.actualAmount = 'Invalid';
  //     if (Number(row.budgetAmount) <= 0) err.budgetAmount = 'Invalid';

  //     // if (!row.gl) err.gl = 'Required';

  //     // const compErrors = row.components.map((c) => {
  //     //   let cErr: any = {};

  //     //   if (!c.component) cErr.component = 'Required';
  //     //   if (!c.unit) cErr.unit = 'Required';

  //     //   if (!c.qty || Number(c.qty) <= 0) cErr.qty = 'Invalid';
  //     //   if (!c.rate || Number(c.rate) <= 0) cErr.rate = 'Invalid';

  //     //   return cErr;
  //     // });

  //     // err.components = compErrors;

  //     return err;
  //   });

  //   newErrors.rows = rowErrors;

  //   setErrors(newErrors);

  //   const hasErrors = newErrors.unit || newErrors.month || newErrors.year || rowErrors.some((r) => Object.keys(r).length > 1);

  //   if (hasErrors) {
  //     toast.error('Please fill all required fields properly ⚠️');
  //     return false;
  //   }

  //   return true;
  // };

  const validateForm = () => {
    let newErrors: any = {};

    if (!unit) {
      toast.error('Unit is required');
      return false;
    }

    if (!month) {
      toast.error('Month is required');
      return false;
    }

    if (!year) {
      toast.error('Year is required');
      return false;
    }

    const rowErrors = rows.map((row, index) => {
      let err: any = {};

      if (!row.department) {
        err.department = 'Department required';
        toast.error(`Row ${index + 1}: Department is required`);
        throw new Error('stop');
      }

      if (!row.description || row.description.trim() === '') {
        err.description = 'Description required';
        toast.error(`Row ${index + 1}: Description is required`);
        throw new Error('stop');
      }

      if (!row.actualAmount) {
        err.actualAmount = 'Actual amount required';
        toast.error(`Row ${index + 1}: Actual amount is required`);
        throw new Error('stop');
      }

      if (Number(row.actualAmount) < 0) {
        err.actualAmount = 'Invalid';
        toast.error(`Row ${index + 1}: Actual amount cannot be negative`);
        throw new Error('stop');
      }

      if (!row.budgetAmount) {
        err.budgetAmount = 'Budget amount required';
        toast.error(`Row ${index + 1}: Budget amount is required`);
        throw new Error('stop');
      }

      if (Number(row.budgetAmount) <= 0) {
        err.budgetAmount = 'Invalid';
        toast.error(`Row ${index + 1}: Budget must be greater than 0`);
        throw new Error('stop');
      }

      return err;
    });

    newErrors.rows = rowErrors;

    setErrors(newErrors);

    return true;
  };

  const resetForm = () => {
    setUnit(null);

    setMonth(monthOptions[new Date().getMonth()]);

    const currentYear = new Date().getFullYear();

    setYear({
      value: currentYear,
      label: currentYear.toString(),
    });

    setRows([
      {
        requestId: 0,
        department: null,
        description: '',
        actualAmount: '',
        budgetAmount: '',
        gl: '',
        file: null,
        components: [
          { component: '', unit: '', qty: '', rate: '', total: 0 },
          { component: 'Others', unit: '', qty: '', rate: '', total: 0 },
        ],
      },
    ]);

    setErrors({});
  };

  const handleChange = (rowIndex: number, field: string, value: any) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;

        const updatedRow = { ...row, [field]: value };

        return recalculateRow(updatedRow);
      })
    );
  };

  const handleComponentChange = (rowIndex, compIndex, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;

        let updatedComponents = row.components.map((c, j) => (j === compIndex ? { ...c, [field]: value } : c));

        return recalculateRow({ ...row, components: updatedComponents });
      })
    );
  };

  const recalculateRow = (row) => {
    let updatedComponents = row.components.map((c) => {
      const total = (Number(c.qty) || 0) * (Number(c.rate) || 0);
      return {
        ...c,
        total: Number(total.toFixed(2)),
      };
    });

    const othersIndex = updatedComponents.findIndex((c) => c.component === 'Others');

    const sumWithoutOthers = updatedComponents.reduce((sum, c, idx) => {
      if (idx === othersIndex) return sum;
      return sum + (c.total || 0);
    }, 0);

    const budget = Number(row.budgetAmount || 0);

    const othersValue = Math.max(budget - sumWithoutOthers, 0);

    if (othersIndex !== -1) {
      updatedComponents[othersIndex].total = Number(othersValue.toFixed(2));
    }

    return { ...row, components: updatedComponents };
  };

  const isRowEmpty = (row) => {
    return !row.department && !row.description && !row.actualAmount && !row.budgetAmount && !row.gl;
  };

  const addRow = () => {
    const hasEmpty = rows.some((row) => isRowEmpty(row));

    if (hasEmpty) {
      toast.error('Please fill existing row first ⚠️');
      return;
    }

    setRows([
      ...rows,
      {
        requestId: 0,
        department: null,
        description: '',
        actualAmount: '',
        budgetAmount: '',
        gl: '',
        file: null,
        components: JSON.parse(JSON.stringify(defaultComponents)),
      },
    ]);
  };

  const deleteRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const isComponentEmpty = (comp) => {
    return !comp.component;
  };

  const addComponentRow = (rowIndex) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;

        const hasEmpty = row.components.some((c) => isComponentEmpty(c));

        if (hasEmpty) {
          toast.error('Please fill existing row first ⚠️');
          return row;
        }

        const newRow = {
          component: '',
          unit: '',
          qty: '',
          rate: '',
          total: 0,
        };

        const updated = [...row.components];

        updated.splice(updated.length - 1, 0, newRow);

        return { ...row, components: updated };
      })
    );
  };

  const deleteComponentRow = (rowIndex, compIndex) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;

        if (row.components.length <= 2) return row;

        const updated = row.components.filter((_, idx) => idx !== compIndex);

        return recalculateRow({ ...row, components: updated });
      })
    );
  };

  const getDraft = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/UnitAmountRequest/Draft');

      if (response.data.statusCode === 200) {
        setDraft(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDraft();
  }, []);

  useEffect(() => {
    if (!draft || draft.length === 0) return;

    const first = draft[0];

    // 🔹 TOP LEVEL
    setUnit(String(first.unitId));

    setMonth(monthOptions.find((m) => m.value === first.month));

    setYear({
      value: first.year,
      label: String(first.year),
    });

    const mappedRows = draft.map((item: any) => {
      let components =
        item.componentDetails?.map((comp: any) => ({
          component: comp.componentDescription || '',
          unit: comp.mUnit || '',
          qty: comp.qty ? String(comp.qty) : '',
          rate: comp.rateOfUnit ? String(comp.rateOfUnit) : '',
          total: comp.totalAmount || 0,
        })) || [];

      const hasOthers = components.some((c) => c.component === 'Others');

      if (!hasOthers) {
        components.push({
          component: 'Others',
          unit: '',
          qty: '',
          rate: '',
          total: 0,
        });
      }

      return {
        requestId: item.id,

        department: departmentOptions.find((d) => String(d.value) === String(item.departmentId)) || null,

        description: item.demandDetails || '',

        actualAmount: item.actualAmount ? String(item.actualAmount) : '',

        budgetAmount: item.budgetAmount ? String(item.budgetAmount) : '',

        gl: item.generalLedger || '',

        components,

        file: null,
        existingFileName: item.fileName,
        existingFileUrl: item.fileUrl,
      };
    });

    setRows(mappedRows);
  }, [draft, departmentOptions]);

  const handleSubmit = async (isDraft: boolean) => {
    try {
      setLoading(true);

      const formData = new FormData();

      rows.forEach((row, index) => {
        formData.append(`requests[${index}].requestId`, String(row.requestId || 0));
        formData.append(`requests[${index}].unitId`, String(unit));
        formData.append(`requests[${index}].departmentId`, String(row.department?.value || 0));
        formData.append(`requests[${index}].actualAmount`, String(Number(row.actualAmount || 0)));
        formData.append(`requests[${index}].budgetAmount`, String(Number(row.budgetAmount || 0)));
        formData.append(`requests[${index}].generalLedger`, row.gl || '');
        formData.append(`requests[${index}].frequency`, 'Monthly');
        formData.append(`requests[${index}].year`, String(year.value));
        formData.append(`requests[${index}].month`, String(month.value));
        formData.append(`requests[${index}].quarter`, '0');
        formData.append(`requests[${index}].demandDetails`, row.description || '');
        formData.append(`requests[${index}].isDraft`, String(isDraft));

        row.components.forEach((comp, cIndex) => {
          formData.append(`requests[${index}].componentDetails[${cIndex}].brDetailsId`, '0');

          formData.append(`requests[${index}].componentDetails[${cIndex}].componentDescription`, comp.component || '');

          formData.append(`requests[${index}].componentDetails[${cIndex}].mUnit`, comp.unit || '');

          formData.append(`requests[${index}].componentDetails[${cIndex}].qty`, String(Number(comp.qty || 0)));

          formData.append(`requests[${index}].componentDetails[${cIndex}].rateOfUnit`, String(Number(comp.rate || 0)));

          formData.append(`requests[${index}].componentDetails[${cIndex}].amount`, String(Number(comp.total || 0)));

          formData.append(`requests[${index}].componentDetails[${cIndex}].totalAmount`, String(Number(comp.total || 0)));
        });

        if (row.file) {
          formData.append(`requests[${index}].file`, row.file);
        }
      });

      const res = await axiosInstance.post('/UnitAmountRequest/raise-bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res?.data?.statusCode === 200) {
        toast.success(isDraft ? 'Draft saved successfully' : 'Demand submitted successfully');

        if (!isDraft) resetForm();
        if (isDraft) getDraft();
      }

      if (res?.data?.statusCode === 409) {
        toast.error('Request already exists for selected unit and department for the current month');
      }
    } catch (error) {
      console.error(error);
      toast.error('Request Failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-4 md:p-8">
      {loading && <Loader />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demand Budget</h1>
          <p className="text-gray-600 mt-1">Raise and track budget requests for departments within your unit</p>
        </div>
      </div>
      <div className="flex gap-4 pb-2 mt-5">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-t-md ${activeTab === 'create' ? 'bg-blue-800 text-white' : 'bg-gray-200'}`}
        >
          Raise New
        </button>

        <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-t-md ${activeTab === 'list' ? 'bg-blue-800 text-white' : 'bg-gray-200'}`}>
          Submitted Requests
        </button>
      </div>
      {activeTab === 'create' && (
        <div className="p-6 bg-white rounded-xl shadow">
          {/* Top Section */}
          <div className="flex justify-between sticky bottom-0 z-10 bg-white  gap-2">
            <div className="flex flex-wrap items-end gap-3 mb-5">
              {/* Unit */}
              <div className="w-[220px]">
                <Select
                  options={unitOptions}
                  value={unitOptions.find((u) => u.value === unit) || null}
                  onChange={(val) => setUnit(val?.value)}
                  placeholder="Select Unit"
                />
              </div>

              {/* Month */}
              <div className="w-[120px]">
                <Select options={monthOptions} value={month} onChange={(val) => setMonth(val)} placeholder="Month" />
              </div>

              {/* Year */}
              <div className="w-[120px]">
                <Select options={yearOptions} value={year} onChange={(val) => setYear(val)} placeholder="Year" />
              </div>
            </div>

            {/* Add Row Button */}
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  if (!validateForm()) return;
                  handleSubmit(true);
                }}
                className="bg-yellow-500 hover:bg-yellow-500 text-white"
              >
                Save as Draft
              </Button>
              <ConfirmDialog
                triggerClassName="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue"
                description="Are you sure you want to raise this demand?"
                actionLabel="Confirm"
                triggerLabel="Submit"
                beforeOpen={() => validateForm()}
                onConfirm={() => handleSubmit(false)}
              />
              <Button onClick={addRow} className="bg-green-600 text-white">
                + Add Row
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="max-h-[60vh] overflow-y-auto border rounded-xl">
            {/* HEADER */}
            <div className="grid grid-cols-[60px_200px_1fr_150px_150px_150px_80px] bg-gray-100 px-4 py-3 font-semibold text-sm">
              <div>Sr No.</div>
              <div className="text-center">Department</div>
              <div className="text-center">Project Description</div>
              <div>Actual (₹)</div>
              <div>Budget (₹)</div>
              <div>GL</div>
              <div>Action</div>
            </div>

            {rows.map((row, index) => (
              <div key={index} className="border-t bg-white">
                {/* MAIN ROW */}
                <div className="grid grid-cols-[60px_200px_1fr_150px_150px_150px_80px] px-4 py-4 gap-3 items-start">
                  <div>{index + 1}</div>

                  <Select options={getFilteredDepartments(index)} value={row.department} onChange={(val) => handleChange(index, 'department', val)} />

                  <textarea
                    value={row.description}
                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                    className="border rounded px-2 py-1"
                    placeholder="Description"
                  />

                  <Input
                    type="number"
                    className="text-right"
                    placeholder="Actual Amount"
                    value={row.actualAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      handleChange(index, 'actualAmount', val);
                    }}
                    onBlur={(e) => {
                      handleChange(index, 'actualAmount', formatDecimal(e.target.value));
                    }}
                  />

                  <Input
                    type="number"
                    placeholder="Budget Amount"
                    className="text-right"
                    value={row.budgetAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      handleChange(index, 'budgetAmount', val);
                    }}
                    onBlur={(e) => {
                      handleChange(index, 'budgetAmount', formatDecimal(e.target.value));
                    }}
                  />

                  <Input value={row.gl} placeholder="GL No." onChange={(e) => handleChange(index, 'gl', e.target.value)} />

                  <Button variant="destructive" size="icon" onClick={() => deleteRow(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>

                {/* SUB TABLE */}
                <div className="px-6 pb-4">
                  <div className="border rounded-lg mt-2">
                    <div className="grid grid-cols-[1fr_150px_150px_150px_150px_80px] bg-gray-100 px-3 py-2 text-xs font-semibold">
                      <div className="text-center">Component</div>
                      <div>Measurement Unit</div>
                      <div className="text-center">Qty</div>
                      <div className="text-center">Rate Per Unit (₹)</div>
                      <div className="text-center">Total (₹)</div>
                      <div className="text-center">Action</div>
                    </div>

                    {row.components.map((comp, cIndex) => (
                      <div key={cIndex} className="grid grid-cols-[1fr_150px_150px_150px_150px_80px] px-3 py-2 gap-2 border-t">
                        {/* Component */}
                        <Input
                          value={comp.component}
                          placeholder="Component"
                          onChange={(e) => handleComponentChange(index, cIndex, 'component', e.target.value)}
                        />

                        {/* Unit */}
                        <Input value={comp.unit} placeholder="Unit" onChange={(e) => handleComponentChange(index, cIndex, 'unit', e.target.value)} />

                        {/* Qty */}
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={comp.qty}
                          className="text-right"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            handleComponentChange(index, cIndex, 'qty', val);
                          }}
                          onBlur={(e) => {
                            handleComponentChange(index, cIndex, 'qty', formatDecimal(e.target.value));
                          }}
                        />

                        {/* Rate */}
                        <Input
                          placeholder="Rate"
                          type="number"
                          value={comp.rate}
                          className="text-right"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            handleComponentChange(index, cIndex, 'rate', val);
                          }}
                          onBlur={(e) => {
                            handleComponentChange(index, cIndex, 'rate', formatDecimal(e.target.value));
                          }}
                        />

                        {/* Total */}
                        <Input value={formatRupees(comp.total)} readOnly className="bg-gray-50 font-semibold text-right" />

                        {/* DELETE BUTTON */}
                        <div className="flex justify-center">
                          {comp.component !== 'Others' && (
                            <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => deleteComponentRow(index, cIndex)}>
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="p-2 flex justify-end border-t">
                      <Button size="sm" variant="outline" onClick={() => addComponentRow(index)}>
                        + Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab == 'list' && <BudgetRequestList />}
    </div>
  );
};

export default BudgetDemand;

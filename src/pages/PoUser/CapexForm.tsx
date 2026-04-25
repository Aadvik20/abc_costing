import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useMemo } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info, Trash2 } from 'lucide-react';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { formatDecimal, formatRupees, yearOptions } from '@/lib/helperFunction';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { showCustomToast } from '@/components/common/showCustomToast';
import { components } from 'react-select';

const Capexform = ({ setLoading }) => {
  const { units } = useAppSelector((state: RootState) => state.user);
  const { departments } = useAppSelector((state: RootState) => state.user);
  const [draft, setDraft] = useState([]);
  const [errors, setErrors] = useState<any>({});
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState({
    value: currentYear,
    label: currentYear.toString(),
  });
  const [unit, setUnit] = useState(null);
  const defaultComponents = [{ category: null, subCategory: null, subCategories: [], unit: '', qty: '', rate: '', total: 0 }];
  const [stage, setStage] = useState(null);
  const stageOptions = [
    { value: 'BE', label: 'BE' },
    { value: 'RE', label: 'RE' },
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
      hasAddedComponent: false,
      categories: [],
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
    const selectedDepartments = rows.map((r, i) => (i !== currentIndex ? r.department?.value : null)).filter(Boolean);

    return departmentOptions.filter((d) => !selectedDepartments.includes(d.value));
  };

  const validateForm = () => {
    let newErrors: any = {};

    if (!unit) {
      showCustomToast({
        title: 'Warning',
        type: 'warning',
        message: 'Unit is required',
      });
      return false;
    }

    if (!stage) {
      showCustomToast({
        title: 'Warning',
        type: 'warning',
        message: 'Stage is required',
      });
      return false;
    }

    if (!year) {
      showCustomToast({
        title: 'Warning',
        type: 'warning',
        message: 'Year is required',
      });
      return false;
    }

    const rowErrors = rows.map((row, index) => {
      let err: any = {};

      if (!row.department) {
        err.department = 'Department required';
        showCustomToast({
          title: 'Warning',
          type: 'warning',
          message: `Row ${index + 1}: Department is required`,
        });
        throw new Error('stop');
      }

      if (!row.description || row.description.trim() === '') {
        err.description = 'Description required';
        showCustomToast({
          title: 'Warning',
          type: 'warning',
          message: `Row ${index + 1}: Description is required`,
        });
        throw new Error('stop');
      }

      if (!row.actualAmount) {
        err.actualAmount = 'Actual amount required';
        showCustomToast({
          title: 'Warning',
          type: 'warning',
          message: `Row ${index + 1}: Actual amount is required`,
        });
        throw new Error('stop');
      }

      if (Number(row.actualAmount) < 0) {
        err.actualAmount = 'Invalid';
        showCustomToast({
          title: 'Warning',
          type: 'warning',
          message: `Row ${index + 1}: Actual amount cannot be negative`,
        });
        throw new Error('stop');
      }

      if (!row.budgetAmount) {
        err.budgetAmount = 'Budget amount required';
        showCustomToast({
          title: 'Warning',
          type: 'warning',
          message: `Row ${index + 1}: Budget amount is required`,
        });
        throw new Error('stop');
      }

      if (Number(row.budgetAmount) <= 0) {
        err.budgetAmount = 'Invalid';
        showCustomToast({
          title: 'Warning',
          type: 'warning',
          message: `Row ${index + 1}: Budget must be greater than 0`,
        });
        throw new Error('stop');
      }

      row.components.forEach((comp, cIndex) => {
        if (!comp.category) {
          showCustomToast({
            title: 'Warning',
            type: 'warning',
            message: `Row ${index + 1}, Component ${cIndex + 1}: Category required`,
          });
          throw new Error('stop');
        }

        if (!comp.subCategory) {
          showCustomToast({
            title: 'Warning',
            type: 'warning',
            message: `Row ${index + 1}, Component ${cIndex + 1}: SubCategory required`,
          });
          throw new Error('stop');
        }

        if (!comp.unit) {
          showCustomToast({
            title: 'Warning',
            type: 'warning',
            message: `Row ${index + 1}, Component ${cIndex + 1}: Unit required`,
          });
          throw new Error('stop');
        }
      });

      return err;
    });

    newErrors.rows = rowErrors;

    setErrors(newErrors);

    return true;
  };

  const resetForm = () => {
    setUnit(null);

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
          { category: null, subCategory: null, subCategories: [], unit: '', qty: '', rate: '', total: 0 },
          // { component: 'Others', unit: '', qty: '', rate: '', total: 0 },
        ],
        hasAddedComponent: false,
        categories: [],
      },
    ]);

    setErrors({});
  };

  const fetchCategories = async (departmentId: string, rowIndex: number) => {
    try {
      const response = await axiosInstance.get(`/UnitAmountRequest/get-budget-categories?departmentId=${departmentId}`);

      if (response.data.statusCode === 200) {
        const categoryOptions = response.data.data.map((c: any) => ({
          label: c.categoryName,
          value: c.categoryId,
        }));
        setRows((prev) =>
          prev.map((row, i) => {
            if (i !== rowIndex) return row;
            return { ...row, categories: categoryOptions };
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSubCategories = async (categoryId, rowIndex, compIndex) => {
    try {
      const res = await axiosInstance.get(`/UnitAmountRequest/get-subcategories?categoryId=${categoryId}`);

      if (res.data.statusCode === 200) {
        const subOptions = res.data.data.map((s: any) => ({
          label: s.subCategoryName,
          value: s.subCategoryId,
          unit: s.unitOfMeasure,
          description: s.description,
        }));

        setRows((prev) =>
          prev.map((row, i) => {
            if (i !== rowIndex) return row;

            const updatedComponents = row.components.map((c, j) => {
              if (j !== compIndex) return c;

              return {
                ...c,
                subCategories: subOptions,
                subCategory: null,
              };
            });

            return { ...row, components: updatedComponents };
          })
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  const CustomOption = (props) => {
    return (
      <components.Option {...props}>
        <div title={props.data.description}>{props.data.label}</div>
      </components.Option>
    );
  };

  const CustomSingleValue = (props) => {
    const { data } = props;

    return (
      <components.SingleValue {...props}>
        <div className="flex items-center gap-2">
          <span>{data.label}</span>

          {data.description && (
            <div className="relative group">
              <Info size={14} className="text-gray-500 cursor-pointer" />

              {/* FIXED TOOLTIP */}
              <div className="fixed hidden group-hover:block bg-white border text-xs p-2 rounded z-[9999] w-fit">{data.description}</div>
            </div>
          )}
        </div>
      </components.SingleValue>
    );
  };

  const handleChange = async (rowIndex: number, field: string, value: any) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;

        const updatedRow = { ...row, [field]: value };

        return recalculateRow(updatedRow);
      })
    );

    if (field === 'department' && value?.value) {
      await fetchCategories(value.value, rowIndex);
    }
  };

  const handleComponentChange = (rowIndex, compIndex, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;

        let updatedComponents = row.components.map((c, j) => {
          if (j !== compIndex) return c;

          let updated = { ...c, [field]: value };

          return updated;
        });

        if (field === 'qty' || field === 'rate') {
          return recalculateRow({ ...row, components: updatedComponents });
        }

        return { ...row, components: updatedComponents };
      })
    );
  };

  const recalculateRow = (row) => {
    const budget = Number(row.budgetAmount || 0);

    let updatedComponents = row.components.map((c) => {
      const qty = Number(c.qty || 0);
      const rate = Number(c.rate || 0);
      const total = qty * rate;

      return {
        ...c,
        total: Number(total.toFixed(2)),
      };
    });

    const totalUsedByItems = updatedComponents.reduce((sum, c) => sum + (Number(c.total) || 0), 0);

    if (updatedComponents.length === 1) {
      const first = updatedComponents[0];
      if (Number(first.qty || 0) === 0 && Number(first.rate || 0) === 0) {
        updatedComponents[0].total = Number(budget.toFixed(2));
      }
    } else {
      const lastIndex = updatedComponents.length - 1;
      const lastComp = updatedComponents[lastIndex];

      if (Number(lastComp.qty || 0) === 0 && Number(lastComp.rate || 0) === 0) {
        const otherRowsTotal = updatedComponents.filter((_, idx) => idx !== lastIndex).reduce((sum, c) => sum + c.total, 0);

        updatedComponents[lastIndex].total = Math.max(0, Number((budget - otherRowsTotal).toFixed(2)));
      }
    }

    return { ...row, components: updatedComponents };
  };
  const isRowEmpty = (row) => {
    return !row.department && !row.description && !row.actualAmount && !row.budgetAmount && !row.gl;
  };

  const addRow = () => {
    const hasEmpty = rows.some((row) => isRowEmpty(row));

    if (hasEmpty) {
      showCustomToast({
        title: 'Warning',
        type: 'warning',
        message: 'Please fill existing row first',
      });
      return;
    }

    // if (hasValidData()) {
    //   saveDraft();
    // }

    setRows((prev) => [
      ...prev,
      {
        requestId: 0,
        department: null,
        description: '',
        actualAmount: '',
        budgetAmount: '',
        gl: '',
        file: null,
        components: JSON.parse(JSON.stringify(defaultComponents)),
        hasAddedComponent: false,
        categories: [],
      },
    ]);
  };

  const deleteRow = (index: number) => {
    setRows((prev) => {
      const row = prev[index];

      if (row.requestId && row.requestId !== 0) {
        handleDeleteDraft([row.requestId]);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const isfullComponentEmpty = (comp) => {
    return !comp.categories && !comp.subCategories && !comp.unit && !comp.qty && !comp.total;
  };

  const addComponentRow = (rowIndex) => {
    const row = rows[rowIndex];

    if (isOverBudget(row)) {
      showCustomToast({
        title: 'Warning',
        type: 'warning',
        message: 'Total exceeds budget amount',
      });
      return;
    }

    if (hasValidData()) {
      saveDraft();
    }

    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;

        let updated = [...row.components];

        const used = updated.reduce((sum, c) => sum + (c.total || 0), 0);
        const budget = Number(row.budgetAmount || 0);
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

        return { ...row, components: updated };
      })
    );
  };

  const deleteComponentRow = (rowIndex, compIndex) => {
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row;

        if (row.components.length == 1) return row;

        const updated = row.components.filter((_, idx) => idx !== compIndex);

        return recalculateRow({ ...row, components: updated });
      })
    );
  };

  const isOverBudget = (row) => {
    const budget = Number(row.budgetAmount || 0);

    const totalUsed = row.components.reduce((sum, c) => {
      return sum + (Number(c.total) || 0);
    }, 0);

    return totalUsed >= budget;
  };

  const getDraft = async () => {
    try {
      // setLoading(true);
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

    setUnit(String(first.unitId));

    setYear({
      value: first.year,
      label: String(first.year),
    });

    const mappedRows = draft.map((item: any) => {
      let components =
        item.componentDetails?.map((comp: any) => ({
          component: comp.componentDescription || '',
          unit: comp.munit || '',
          qty: comp.qty ? formatDecimal(String(comp.qty)) : '',
          rate: comp.rateOfUnit ? formatDecimal(String(comp.rateOfUnit)) : '',
          total: Number(Number(comp.amount || 0).toFixed(2)),
        })) || [];

      const row = {
        requestId: item.id,
        department: departmentOptions.find((d) => String(d.value) === String(item.departmentId)) || null,
        description: item.demandDetails || '',
        actualAmount: item.actualAmount ? formatDecimal(String(item.actualAmount)) : '',
        budgetAmount: item.budgetAmount ? formatDecimal(String(item.budgetAmount)) : '',
        gl: item.gl || '',
        components,
        hasAddedComponent: false,
        file: null,
        existingFileName: item.fileName,
        existingFileUrl: item.fileUrl,
      };

      return recalculateRow(row);
    });

    setRows(mappedRows);
  }, [draft, departmentOptions]);

  const saveDraft = async () => {
    const hasData = rows.some((row) => !isRowEmpty(row) || row.components.some((c) => !isfullComponentEmpty(c)));

    if (!hasData) return;

    await handleSubmit(true, { silent: true });
    await syncDraftIds();
  };

  const syncDraftIds = async () => {
    try {
      const res = await axiosInstance.get('/UnitAmountRequest/Draft');

      if (res.data.statusCode === 200) {
        const drafts = res.data.data;

        setRows((prev) =>
          prev.map((row) => {
            if (row.requestId && row.requestId !== 0) return row;

            const match = drafts.find(
              (d) => d.departmentId === row.department?.value && d.demandDetails === row.description && Number(d.budgetAmount) === Number(row.budgetAmount)
            );

            if (match) {
              return {
                ...row,
                requestId: match.id,
              };
            }

            return row;
          })
        );
      }
    } catch (err) {
      console.error('Sync failed', err);
    }
  };

  const submitFinal = async () => {
    if (!validateForm()) return;
    await handleSubmit(false, { silent: false });
  };

  const handleSubmit = async (isDraft: boolean, options = { silent: false }) => {
    try {
      if (!options.silent) setLoading(true);

      const formData = new FormData();

      rows.forEach((row, index) => {
        formData.append(`requests[${index}].requestId`, String(row.requestId || 0));
        formData.append(`requests[${index}].unitId`, String(unit));
        formData.append(`requests[${index}].departmentId`, String(row.department?.value || 0));
        formData.append(`requests[${index}].requestType`, 'CAPEX');
        formData.append(`requests[${index}].actualAmount`, String(Number(row.actualAmount || 0)));
        formData.append(`requests[${index}].budgetAmount`, String(Number(row.budgetAmount || 0)));
        formData.append(`requests[${index}].generalLedger`, row.gl || '');
        formData.append(`requests[${index}].year`, String(year.value));
        formData.append(`requests[${index}].stage`, stage.value);
        formData.append(`requests[${index}].demandDetails`, row.description || '');
        formData.append(`requests[${index}].isDraft`, String(isDraft));

        row.components.forEach((comp, cIndex) => {
          formData.append(`requests[${index}].componentDetails[${cIndex}].brDetailsId`, '0');
          formData.append(`requests[${index}].componentDetails[${cIndex}].categoryId`, String(comp.category?.value || 0));
          formData.append(`requests[${index}].componentDetails[${cIndex}].subCategoryId`, String(comp.subCategory?.value || 0));
          formData.append(`requests[${index}].componentDetails[${cIndex}].mUnit`, comp.unit || '');
          formData.append(`requests[${index}].componentDetails[${cIndex}].qty`, String(Number(comp.qty || 0)));
          formData.append(`requests[${index}].componentDetails[${cIndex}].rateOfUnit`, String(Number(comp.rate || 0)));
          formData.append(`requests[${index}].componentDetails[${cIndex}].calculatedAmount`, String(Number(comp.total || 0)));
          formData.append(`requests[${index}].componentDetails[${cIndex}].finalAmount`, String(Number(comp.total || 0)));
        });
      });

      const res = await axiosInstance.post('/UnitAmountRequest/raise-bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res?.data?.statusCode === 200) {
        if (!options.silent) {
          showCustomToast({
            title: 'Success',
            type: 'success',
            message: isDraft ? 'Draft saved' : 'Submitted successfully',
          });
        }

        if (!isDraft) {
          resetForm();
        }
      }
      if (res?.data?.statusCode === 400) {
        showCustomToast({
          title: 'Warning',
          type: 'warning',
          message: res?.data?.message,
        });
      }
      if (res?.data?.statusCode === 409) {
        showCustomToast({
          title: 'Warning',
          type: 'warning',
          message: res?.data?.message,
        });
      }
    } catch (error) {
      console.error(error);
      showCustomToast({
        title: 'Failed',
        type: 'error',
        message: 'Request Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (ids: number[]) => {
    const validIds = ids.filter((id) => id && id !== 0);

    if (validIds.length === 0) return;

    try {
      const res = await axiosInstance.delete('/UnitAmountRequest/delete-drafts', {
        data: { requestIds: validIds },
      });

      if (res?.data?.statusCode === 200) {
        // getDraft();
      }
    } catch (error) {
      console.error(error);
      toast.error('Delete failed');
    }
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (hasValidData()) {
  //       saveDraft();
  //     }
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, []);

  const hasValidData = () => {
    if (!unit) return false;

    return rows.some((row) => row.department || row.description?.trim() || Number(row.actualAmount) > 0 || Number(row.budgetAmount) > 0);
  };
  return (
    <>
      {/* Top Section */}
      <div className="flex justify-between sticky top-0 z-20 bg-slate-50 gap-2 shadow-sm  flex-wrap items-center p-3 rounded-xl border border-slate-200 mb-4">
        <div className="flex flex-wrap items-end gap-3">
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
          <Select options={stageOptions} value={stage} onChange={(val) => setStage(val)} placeholder="Select Stage" />

          {/* Year */}
          <div className="w-[120px]">
            <Select options={yearOptions} value={year} onChange={(val) => setYear(val)} placeholder="Year" />
          </div>
        </div>

        {/* Add Row Button */}
        <div className="flex justify-end gap-2">
          {/* <Button
                onClick={() => {
                  handleDeleteAllDrafts();
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete All Drafts
              </Button>
              <Button
                onClick={() => {
                  if (!validateForm()) return;
                  handleSubmit(true);
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Save as Draft
              </Button> */}
          <ConfirmDialog
            triggerClassName="px-8 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-lg hover:shadow-blue-200/50 transition-all active:scale-95"
            description="Are you sure you want to raise this demand?"
            actionLabel="Confirm"
            triggerLabel="Submit"
            beforeOpen={() => validateForm()}
            onConfirm={() => submitFinal()}
          />
        </div>
      </div>
      {/* Table */}
      <div className="border rounded-xl overflow-x-auto">
        <div className="mx-auto min-w-[1100px]">
          {/* HEADER */}
          <div className="rounded-xl grid grid-cols-[60px_0.7fr_3fr_0.5fr_0.5fr_0.5fr_60px] gap-3 bg-gradient-to-r from-indigo-600 to-violet-700 text-white px-4 py-3 font-semibold text-sm">
            <div>Sr No.</div>
            <div className="text-center">Department</div>
            <div className="text-center">Project Description</div>
            <div className="text-center">Actual (₹)</div>
            <div className="text-center">Budget (₹)</div>
            <div className="text-center">GL</div>
            <div>Action</div>
          </div>

          {rows.map((row, index) => (
            <div key={index} className="border">
              {/* MAIN ROW */}
              <div className="grid grid-cols-[60px_0.7fr_3fr_0.5fr_0.5fr_0.5fr_60px] px-4 py-4 gap-3 items-start">
                <div>{index + 1}</div>

                <Select
                  options={getFilteredDepartments(index)}
                  value={row.department}
                  onChange={(val) => handleChange(index, 'department', val)}
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      maxHeight: 170,
                      overflow: 'hidden',
                    }),
                  }}
                />

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

                <Button variant="destructive" size="icon" onClick={() => deleteRow(index)} disabled={rows.length === 1}>
                  <Trash2 size={16} />
                </Button>
              </div>

              {/* SUB TABLE */}
              <div className="px-6 pb-4 max-w-[1050px]">
                <div className="border rounded-lg mt-2 overflow-x-auto">
                  <div className="grid grid-cols-[2fr_2fr_1.2fr_0.8fr_1fr_1.2fr_0.5fr] bg-indigo-50 border-b border-indigo-100 gap-2 px-3 py-2 text-xs font-bold text-indigo-800">
                    <div className="text-center">Category</div>
                    <div className="text-center">Sub Category</div>
                    <div className="text-center">Unit</div>
                    <div className="text-center">Qty</div>
                    <div className="text-right">Rate Per Unit (₹)</div>
                    <div className="text-center">Total (₹)</div>
                    <div className="text-center">Action</div>
                  </div>

                  {row.components.map((comp, cIndex) => (
                    <div key={cIndex} className="grid grid-cols-[2fr_2fr_1.2fr_0.8fr_1fr_1.2fr_0.5fr] px-3 py-2 gap-2 border-t">
                      {/* Component */}
                      <Select
                        options={row.categories || []}
                        value={comp.category}
                        onChange={(val) => {
                          handleComponentChange(index, cIndex, 'category', val);
                          handleComponentChange(index, cIndex, 'subCategory', null);
                          handleComponentChange(index, cIndex, 'unit', '');
                          handleComponentChange(index, cIndex, 'subCategories', []);

                          if (val?.value) {
                            fetchSubCategories(val.value, index, cIndex);
                          }
                        }}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />

                      <Select
                        options={comp.subCategories || []}
                        value={comp.subCategory}
                        components={{
                          Option: CustomOption,
                          SingleValue: CustomSingleValue,
                        }}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                        onChange={(val) => {
                          handleComponentChange(index, cIndex, 'subCategory', val);
                          handleComponentChange(index, cIndex, 'unit', val?.unit || '');
                        }}
                      />

                      {/* Unit */}
                      <Input value={comp.unit} placeholder="Unit" readOnly />

                      {/* Qty */}
                      <Input
                        type="number"
                        placeholder="Qty"
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
                        {/* {comp.component !== 'Others' && ( */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => deleteComponentRow(index, cIndex)}
                          disabled={row.components.length === 1}
                        >
                          <Trash2 size={16} />
                        </Button>
                        {/* )} */}
                      </div>
                    </div>
                  ))}

                  <div className="p-2 flex justify-end gap-2 border-t">
                    {/* <Button size="sm" variant="destructive" onClick={() => handleDeleteDraft([row.requestId])}>
                        Delete Draft
                      </Button> */}
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => addComponentRow(index)}
                      disabled={isOverBudget(row)}
                    >
                      + Add Component
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <Button onClick={addRow} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          + Add Department
        </Button>
      </div>
    </>
  );
};

export default Capexform;

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
import { monthOptions, yearOptions } from '@/lib/helperFunction';
import { Label } from '@/components/ui/label';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import BudgetRequestList from '@/components/dailogs/BudgetRequestList';

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
  const [rows, setRows] = useState([
    {
      requestId: 0,
      department: null,
      description: '',
      amount: '',
      file: null,
      existingFileName: null,
      existingFileUrl: null,
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

  const validateForm = () => {
    let newErrors: any = {};

    if (!unit) newErrors.unit = 'Unit is required';
    if (!month) newErrors.month = 'Month is required';
    if (!year) newErrors.year = 'Year is required';

    const rowErrors = rows.map((row) => {
      let err: any = {};

      if (!row.department) err.department = 'Department required';
      if (!row.amount) err.amount = 'Amount required';

      if (!row.file && !row.existingFileName) {
        err.file = 'File required';
      }

      if (!row.description || row.description === '<p><br></p>') {
        err.description = 'Description required';
      }

      return err;
    });

    newErrors.rows = rowErrors;

    setErrors(newErrors);

    const hasRowErrors = rowErrors.some((r: any) => Object.keys(r).length > 0);

    if (newErrors.unit || newErrors.month || newErrors.year || hasRowErrors) {
      toast.error('Please fill all required fields properly ⚠️');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setUnit(null);

    setMonth(monthOptions[new Date().getMonth()]);

    setYear({
      value: new Date().getFullYear(),
      label: new Date().getFullYear().toString(),
    });

    setRows([
      {
        requestId: 0,
        department: null,
        description: '',
        amount: '',
        file: null,
        existingFileName: null,
        existingFileUrl: null,
      },
    ]);

    setErrors({});
  };

  // Add row
  const addRow = () => {
    setRows([
      ...rows,
      {
        requestId: 0,
        department: null,
        description: '',
        amount: '',
        file: null,
        existingFileName: null,
        existingFileUrl: null,
      },
    ]);
  };

  // Delete row
  const deleteRow = (index: number) => {
    if (rows.length === 1) return;
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  // Handle change
  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);

    // clear error
    const newErrors = { ...errors };
    if (newErrors?.rows?.[index]?.[field]) {
      delete newErrors.rows[index][field];
      setErrors(newErrors);
    }
  };

  const getDraft = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/UnitAmountRequest/Draft');

      if (response.data.statusCode === 'OK') {
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

    setMonth(monthOptions.find((m) => m.value === first.month));

    setYear({
      value: first.year,
      label: String(first.year),
    });

    const mappedRows = draft.map((item: any) => ({
      requestId: item.id,
      department: departmentOptions.find((d) => String(d.value) === String(item.departmentId)) || null,

      description: item.demandDetails || '',
      amount: item.amount || '',

      file: null,
      existingFileName: item.fileName,
      existingFileUrl: item.fileUrl,
    }));

    setRows(mappedRows);
  }, [draft, departmentOptions]);

  const handleSubmit = async (isDraft: boolean) => {
    try {
      setLoading(true);

      const formData = new FormData();

      rows.forEach((row, index) => {
        formData.append(`requests[${index}].requestId`, String(row.requestId || 0));
        formData.append(`requests[${index}].unitId`, String(unit));
        formData.append(`requests[${index}].departmentId`, String(row.department?.value));
        formData.append(`requests[${index}].amount`, String(row.amount));
        formData.append(`requests[${index}].frequency`, 'Monthly');
        formData.append(`requests[${index}].year`, String(year.value));
        formData.append(`requests[${index}].month`, String(month.value));
        formData.append(`requests[${index}].quarter`, '');
        formData.append(`requests[${index}].demandDetails`, row.description);
        formData.append(`requests[${index}].isDraft`, String(isDraft));
        formData.append(`requests[${index}].file`, row.file);
      });

      const res = await axiosInstance.post('/UnitAmountRequest/raise-bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res?.data?.statusCode === 200) {
        toast.success(isDraft ? 'Draft saved successfully' : 'Demand submitted successfully');
        resetForm();
      }
      if (res?.data?.statusCode === 409) {
        toast.error('Request already exists for selected unit and deapartment for the current month');
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
          <div className="flex justify-between">
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
            <div className="flex justify-end">
              <Button onClick={addRow} className="bg-green-600 text-white">
                + Add Row
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <div className="grid grid-cols-[60px_1fr_1fr_1fr_100px] bg-gray-100 px-3 py-2 font-semibold text-sm">
              <div>#</div>
              <div className="text-center">Department</div>
              <div className="text-center">Demand Amount</div>
              <div className="text-center">Upload</div>
              <div className="text-center">Action</div>
            </div>

            {rows.map((row, index) => (
              <div key={index} className="border-t">
                {/* 🔹 TOP ROW */}
                <div className="grid grid-cols-[60px_1fr_1fr_1fr_100px] px-3 py-2 gap-2 items-center text-sm">
                  <div>{index + 1}</div>

                  {/* Department */}
                  <Select
                    options={departmentOptions}
                    value={row.department}
                    onChange={(val) => handleChange(index, 'department', val)}
                    placeholder="Select Dept"
                  />

                  {/* Amount */}
                  <Input type="number" placeholder="Amount" value={row.amount} onChange={(e) => handleChange(index, 'amount', e.target.value)} />

                  {/* Upload */}
                  <div className="flex flex-col">
                    {row.file || row.existingFileName ? (
                      <div className="flex items-center justify-between p-[6px] border rounded-md bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>

                          <span className="text-sm truncate max-w-[150px]">{row.file?.name || row.existingFileName}</span>

                          {row.existingFileUrl && !row.file && (
                            <a href={row.existingFileUrl} target="_blank" className="text-blue-500 text-xs underline">
                              View
                            </a>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleChange(index, 'file', null);
                            handleChange(index, 'existingFileName', null);
                            handleChange(index, 'existingFileUrl', null);
                          }}
                          className="ml-2 p-1 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="border border-gray-400 rounded-md p-1">
                        <input
                          type="file"
                          className="cursor-pointer w-full"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            handleChange(index, 'file', file);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <div className="flex justify-center">
                    <Button variant="destructive" disabled={rows.length === 1} onClick={() => deleteRow(index)}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                <div className="px-3 pb-3">
                  <label className="text-sm text-gray-800 font-semibold mb-1 block">Description</label>

                  <ReactQuill value={row.description} onChange={(value) => handleChange(index, 'description', value)} className="bg-white" />
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 mt-5">
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
          </div>
        </div>
      )}

      {activeTab == 'list' && (
        <BudgetRequestList/>
      )}
    </div>
  );
};

export default BudgetDemand;

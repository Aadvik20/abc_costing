import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useMemo } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {Trash2} from 'lucide-react';
import { RootState } from '@/app/store';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import { monthOptions, yearOptions } from '@/lib/helperFunction';

const BudgetDemand = () => {
  const [loading, setLoading] = useState(false);
  const { units } = useAppSelector((state: RootState) => state.user);
  const { departments } = useAppSelector((state: RootState) => state.user);
  const [draft, setDraft] = useState([]);
  const [errors, setErrors] = useState<any>({});
  const [month, setMonth] = useState(monthOptions[new Date().getMonth()]);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState({
    value: currentYear,
    label: currentYear.toString(),
  });
  const [unit, setUnit] = useState(null);
  const [rows, setRows] = useState([{ department: null, description: '', amount: '', file: null }]);

  
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
      if (!row.description) err.description = 'Description required';

      return err;
    });

    newErrors.rows = rowErrors;

    setErrors(newErrors);

    const hasRowErrors = rowErrors.some((r: any) => Object.keys(r).length > 0);

    return !(newErrors.unit || newErrors.month || newErrors.year || hasRowErrors);
  };

  const resetForm = () => {
    setUnit(null);
    setMonth(monthOptions[new Date().getMonth()]);
    const [year, setYear] = useState<number | null>(new Date().getFullYear());

    setRows([{ department: null, description: '', amount: '', file: null }]);
    setErrors({});
  };

  // Add row
  const addRow = () => {
    setRows([...rows, { department: null, description: '', amount: '', file: null }]);
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

      if (response.data.success) {
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

  const handleSubmit = async (isDraft: boolean) => {
    try {
      setLoading(true);

      const formData = new FormData();

      rows.forEach((row, index) => {
        formData.append(`requests[${index}].requestId`, '0');
        formData.append(`requests[${index}].unitId`, String(unit));
        formData.append(`requests[${index}].departmentId`, String(row.department?.value));
        formData.append(`requests[${index}].amount`, String(row.amount));
        formData.append(`requests[${index}].frequency`, 'Monthly');
        formData.append(`requests[${index}].year`, String(year));
        formData.append(`requests[${index}].month`, String(month.value));
        formData.append(`requests[${index}].quarter`, null);
        formData.append(`requests[${index}].demandDetails`, row.description);
        formData.append(`requests[${index}].isDraft`, String(isDraft));

        if (row.file) {
          formData.append(`requests[${index}].file`, row.file);
        }
      });

      const res = await axiosInstance.post('/UnitAmountRequest/raise-bulk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        toast.success(isDraft ? 'Draft Saved' : 'Submitted Successfully');
        resetForm();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed');
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
              {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
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
          <div className="grid grid-cols-[60px_1fr_1fr_0.5fr_100px] bg-gray-100 px-3 py-2 font-semibold text-sm">
            <div>#</div>
            <div className="text-center">Department</div>
            <div className="text-center">Demand Amount</div>
            <div className="text-center">Upload</div>
            <div className="text-center">Action</div>
          </div>

          {rows.map((row, index) => (
            <div key={index} className="border-t">
              {/* 🔹 TOP ROW */}
              <div className="grid grid-cols-[60px_1fr_1fr_0.5fr_100px] px-3 py-2 gap-2 items-center text-sm">
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
                <div className="flex items-center justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => document.getElementById(`file-${index}`)?.click()}>
                    Upload
                  </Button>

                  <input
                    id={`file-${index}`}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleChange(index, 'file', e.target.files[0]);
                      }
                    }}
                  />

                  {row.file && <span className="text-xs truncate max-w-[80px]">{row.file.name}</span>}
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
          <Button onClick={() => handleSubmit(true)} className="bg-yellow-500 hover:bg-yellow-500 text-white">
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit(false)} className="bg-blue-600 text-white">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BudgetDemand;

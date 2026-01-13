import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from 'react-select';
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';
const toStr = (v) => (v === null || v === undefined ? '' : String(v));
const isValidDate = (s) => !isEmpty(s) && !Number.isNaN(Date.parse(s));

function ErrorLine({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

export function QMapEmpModal({
  open,
  onOpenChange,
  mode = 'add',
  initialData = null,
  onSave,
  saving = false,
  quarterDetailsOptions = [],
  employeeOptions = [],
}) {
  const empty = React.useMemo(
    () => ({
      fkQDetailId: '',
      fkEmpId: {
        department: '',
        empCode: '',
        empName: '',
        label: '',
        value: '',
      },
      allotmentDate: '',
      vacanteDate: '',
    }),
    []
  );
  const employeeOptionsList = useMemo(
    () =>
      employeeOptions.map((emp) => ({
        value: emp.employeeMasterAutoId ?? '',
        label: emp.userName,
        empName: emp.userName,
        empCode: emp.employeeCode,
        designation: emp.post,
        positionGrade: emp.positionGrade,
        department: emp.deptDFCCIL,
        dob: emp.dob,
        dojdfccil: emp.dojdfccil,
        doretirement: emp.doretirement,
      })),
    [employeeOptions]
  );

  const [form, setForm] = React.useState(empty);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      setForm({
        fkQDetailId: toStr(initialData.quaterDetaisl.fkQDetailId),
        fkEmpId: {
          department: initialData.employeeDetails.department,
          empCode: initialData.employeeDetails.employeeCode,
          empName: initialData.employeeDetails.userName,
          label: initialData.employeeDetails.userName,
          value: initialData.employeeDetails.empId,
          post: initialData.employeeDetails.post,
        },
        allotmentDate: toStr(initialData.allotmentDate.split('T')[0]),
        vacanteDate: toStr(initialData.vacanteDate.split('T')[0]),
      });
    } else setForm(empty);
    setErrors({});
  }, [open, mode, initialData, empty]);

  const validate = () => {
    const e = {};
    if (isEmpty(form.fkQDetailId)) e.fkQDetailId = 'Quarter is required';
    if (isEmpty(form.fkEmpId)) e.fkEmpId = 'Employee is required';
    if (!isValidDate(form.allotmentDate)) e.allotmentDate = 'Allotment Date is required';
    if (!isValidDate(form.vacanteDate)) e.vacanteDate = 'Vacante Date Date is required';

    if (!isEmpty(form.vacanteDate) && !isValidDate(form.vacanteDate)) {
      e.vacanteDate = 'Invalid Vacant Date';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;

    const payload = {
      ...(mode === 'edit' ? { pkQMapEmpId: initialData?.pkQMapEmpId } : {}),
      fkQDetailId: form.fkQDetailId,
      fkEmpId: form.fkEmpId.value,
      EmployeeCode: form.fkEmpId.empCode,
      allotmentDate: form.allotmentDate,
      vacanteDate: form.vacanteDate || '',
    };
    await onSave?.(payload);
  };
  console.log(form, 'Form');
  console.log(initialData, 'initialData');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Quarter Employee Mapping' : 'Quarter Employee Mapping'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Quarter</p>
            <Select
              onChange={(e) => setForm((p) => ({ ...p, fkQDetailId: e.value }))}
              className="min-w-[120px] mt-1"
              placeholder="Select quarter details"
              options={quarterDetailsOptions.map((ele) => ({
                label: `${ele.qType}-${ele.qNumber}`,
                value: ele.pkQDetailId,
              }))}
              value={
                quarterDetailsOptions
                  .map((ele) => ({
                    label: `${ele.qType}-${ele.qNumber}`,
                    value: ele.pkQDetailId,
                  }))
                  .find((opt) => Number(opt.value) === Number(form.fkQDetailId)) || null
              }
            />
            <ErrorLine msg={errors.fkQDetailId} />
          </div>
          <div>
            <p className="text-sm font-medium">Employee</p>
            <Select
              onChange={(v) => {
                setForm((p) => ({ ...p, fkEmpId: v }));
              }}
              className="min-w-[120px] mt-1"
              placeholder="Select employee"
              options={employeeOptionsList}
              value={employeeOptionsList?.find((opt) => Number(opt.value) === Number(form.fkEmpId.value)) || null}
              formatOptionLabel={(option: any) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full font-bold uppercase">{option?.empName?.[0]}</div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{option?.empName}</div>
                    <div className="text-xs text-gray-500">
                      {option?.empCode} | {option?.designation} | {option?.department}
                    </div>
                  </div>
                </div>
              )}
              filterOption={(option, inputValue) => {
                const search = inputValue.toLowerCase();
                return (
                  option.data.empName?.toLowerCase().includes(search) ||
                  option.data.empCode?.toLowerCase().includes(search) ||
                  option.data.designation?.toLowerCase().includes(search) ||
                  option.data.department?.toLowerCase().includes(search)
                );
              }}
            />
            <ErrorLine msg={errors.fkEmpId} />
          </div>
          <div>
            <p className="text-sm font-medium">Allotment Date</p>
            <Input
              min={new Date().toISOString().split('T')[0]}
              type="date"
              value={form.allotmentDate || ''}
              onChange={(e) => setForm((p) => ({ ...p, allotmentDate: e.target.value }))}
            />
            <ErrorLine msg={errors.allotmentDate} />
          </div>
          <div>
            <p className="text-sm font-medium">Vacant Date</p>
            <Input
              min={new Date().toISOString().split('T')[0]}
              type="date"
              value={form.vacanteDate || ''}
              onChange={(e) => setForm((p) => ({ ...p, vacanteDate: e.target.value }))}
            />
            <ErrorLine msg={errors.vacanteDate} />
          </div>
        </div>
        <DialogFooter className="gap-2 mt-6">
          <Button variant="outline" type="button" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={saving}>
            {saving ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

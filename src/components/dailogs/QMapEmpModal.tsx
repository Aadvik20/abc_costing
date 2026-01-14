import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from 'react-select';
import { Card, CardContent, CardHeader } from '../ui/card';

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

  // --- NEW: quarter search state ---
  const [quarterSearch, setQuarterSearch] = React.useState('');

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
    setQuarterSearch('');
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

  // --- NEW: quarter filtered list ---
  const filteredQuarters = useMemo(() => {
    const q = quarterSearch.trim().toLowerCase();
    if (!q) return quarterDetailsOptions;

    return (quarterDetailsOptions || []).filter((row) => {
      const hay = [
        row?.qType,
        row?.qNumber,
        row?.unitName,
        row?.city,
        row?.qAddress,
        String(row?.pkQDetailId ?? ''),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return hay.includes(q);
    });
  }, [quarterDetailsOptions, quarterSearch]);
  console.log('filteredQuarters', filteredQuarters);

  const selectedQuarterId = toStr(form.fkQDetailId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Quarter Employee Mapping' : 'Quarter Employee Mapping'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5">
            {/* Employee */}
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
                formatOptionLabel={(option) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full font-bold uppercase">
                      {option?.empName?.[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{option?.empName} </div>
                      <div className="text-xs text-gray-500">
                        {option?.empCode} | {option?.designation} | {option?.department} | {option?.positionGrade}
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

            {/* Quarter */}
            <div>
              <p className="text-sm font-medium">Quarter</p>

              <Card className="mt-1">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Search quarter by Type / Number / Unit / City / Address"
                        value={quarterSearch}
                        onChange={(e) => setQuarterSearch(e.target.value)}
                      />
                    </div>

                    <div className="text-xs text-gray-500">
                      Showing <span className="font-medium text-gray-700">{filteredQuarters?.length || 0}</span> rows
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="border rounded-md overflow-hidden">
                    <div className="max-h-64 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky text-white top-0 bg-primary uppercase">
                          <tr className="text-left">
                            <th className="w-10 px-3 py-2 border-b"></th>
                            <th className="px-3 py-2 border-b">Type</th>
                            <th className="px-3 py-2 border-b">Quarter No</th>
                            <th className="px-3 py-2 border-b">Unit</th>
                            <th className="px-3 py-2 border-b">City</th>
                            <th className="px-3 py-2 border-b">Is Vacant</th>
                            <th className="px-3 py-2 border-b">Is Garage</th>
                            <th className="px-3 py-2 border-b text-right">Area</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(filteredQuarters || []).length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-3 py-6 text-center text-gray-500">
                                No quarters found.
                              </td>
                            </tr>
                          ) : (
                            filteredQuarters.map((row) => {
                              const id = toStr(row?.pkQDetailId);
                              const checked = id === selectedQuarterId;
                              return (
                                <tr
                                  key={id}
                                  className={`border-b last:border-b-0 cursor-pointer ${
                                    checked ? 'bg-blue-50' : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setForm((p) => ({ ...p, fkQDetailId: id }));
                                    // clear error instantly when selected
                                    setErrors((prev) => ({ ...prev, fkQDetailId: '' }));
                                  }}
                                >
                                  <td className="px-3 py-2">
                                    {/* radio: only one selectable */}
                                    <input
                                      type="radio"
                                      name="quarterSelect"
                                      checked={checked}
                                      onChange={() => {
                                        setForm((p) => ({ ...p, fkQDetailId: id }));
                                        setErrors((prev) => ({ ...prev, fkQDetailId: '' }));
                                      }}
                                    />
                                  </td>
                                  <td className="px-3 py-2">{row?.qType || '-'}</td>
                                  <td className="px-3 py-2">{row?.qNumber || '-'}</td>
                                  <td className="px-3 py-2">{row?.unitName || '-'}</td>
                                  <td className="px-3 py-2">{row?.city || '-'}</td>
                                  <td className="px-3 py-2">
                                    <div className="line-clamp-1">{row?.isVacant ? 'Yes' : 'No'}</div>
                                  </td>
                                  <td className="px-3 py-2">{row?.isGarage ? 'Yes' : 'No'}</td>
                                  <td className="px-3 py-2 text-right">{row?.area ?? '-'}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <ErrorLine msg={errors.fkQDetailId} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

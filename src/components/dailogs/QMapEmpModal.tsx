import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from 'react-select';
import EnhancedDatePicker from '../EnhancedDatePicker';

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
        unitId: '',
        unitName: '',
        post: '',
        positionGrade: '',
      },
      allotmentDate: '',
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
        unitId: emp.fkUnitId ?? emp.unitId ?? '',
        unitName: emp.unitName ?? emp.unitNameDFCCIL ?? '',
      })),
    [employeeOptions]
  );

  const [form, setForm] = React.useState(empty);
  const [errors, setErrors] = React.useState<any>({});
  const [quarterSearch, setQuarterSearch] = React.useState('');
  const getInitialQuarterId = (data) => {
    if (!data) return '';
    return toStr(
      data?.fkQDetailId ??
        data?.quaterDetaisl?.fkQDetailId ??
        data?.quaterDetaisl?.pkQDetailId ??
        data?.quarterDetails?.pkQDetailId ??
        data?.quarterDetails?.fkQDetailId ??
        data?.quaterDetaisl?.pkQDetailId
    );
  };

  React.useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialData) {
      const quarterId = getInitialQuarterId(initialData);
      setForm({
        ...empty,
        fkQDetailId: quarterId,
        fkEmpId: {
          department: initialData?.employeeDetails?.department ?? '',
          empCode: initialData?.employeeDetails?.employeeCode ?? '',
          empName: initialData?.employeeDetails?.userName ?? '',
          label: initialData?.employeeDetails?.userName ?? '',
          value: toStr(initialData?.employeeDetails?.fkEmpId ?? ''),
          post: initialData?.employeeDetails?.post ?? '',
          positionGrade: initialData?.employeeDetails?.positionGrade ?? '',
          unitId: initialData?.employeeDetails?.fkUnitId ?? initialData?.employeeDetails?.unitId ?? '',
          unitName: initialData?.employeeDetails?.unitName ?? initialData?.employeeDetails?.location ?? '',
        },

        allotmentDate: toStr(initialData?.allotmentDate?.split?.('T')?.[0] ?? ''),
      });
    } else {
      setForm(empty);
    }
    setErrors({});
    setQuarterSearch('');
  }, [open, mode, initialData, empty]);

  const validate = () => {
    const e: any = {};
    if (isEmpty(form.fkQDetailId)) e.fkQDetailId = 'Quarter is required';
    if (isEmpty(form.fkEmpId) || isEmpty(form.fkEmpId?.value)) e.fkEmpId = 'Employee is required';
    if (!isValidDate(form.allotmentDate)) e.allotmentDate = 'Allotment Date is required';
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
    };

    await onSave?.(payload);
  };

  const hasEmployee = !!form?.fkEmpId?.value;

  const employeeUnitId = toStr(form?.fkEmpId?.unitId);
  const unitFilteredQuarters = useMemo(() => {
    if (!hasEmployee) return [];
    if (isEmpty(employeeUnitId)) return quarterDetailsOptions || [];

    return (quarterDetailsOptions || []).filter((q) => toStr(q?.fkUnitId ?? q?.unitId) === employeeUnitId);
  }, [quarterDetailsOptions, employeeUnitId, hasEmployee]);

  const filteredQuarters = useMemo(() => {
    const q = quarterSearch.trim().toLowerCase();
    if (!q) return unitFilteredQuarters;

    return (unitFilteredQuarters || []).filter((row) => {
      const hay = [row?.qType, row?.qNumber, row?.unitName, row?.city, row?.qAddress, String(row?.pkQDetailId ?? '')].filter(Boolean).join(' ').toLowerCase();

      return hay.includes(q);
    });
  }, [unitFilteredQuarters, quarterSearch]);

  const selectedQuarterId = toStr(form.fkQDetailId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Quarter Employee Mapping' : 'Quarter Employee Mapping'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 ">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium">Select Employee</p>
                <Select
                  onChange={(v) => {
                    setForm((p) => ({
                      ...p,
                      fkEmpId: {
                        value: v.value,
                        label: v.label,
                        empName: v.empName,
                        empCode: v.empCode,
                        department: v.department,
                        unitId: v.unitId,
                        unitName: v.unitName,
                        post: v.designation,
                        positionGrade: v.positionGrade,
                      },
                      fkQDetailId: '',
                    }));
                    setQuarterSearch('');
                    setErrors((prev) => ({ ...prev, fkEmpId: '', fkQDetailId: '' }));
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
              {/* Dates */}
              <div>
                <div>
                  <p className="text-sm font-medium">Allotment Date</p>
                  <EnhancedDatePicker
                    className="mt-1"
                    onChange={(e) => {
                      setForm((p) => ({ ...p, allotmentDate: e }));
                    }}
                    selectedDate={(form.allotmentDate as any) || null}
                    minDate={new Date()}
                  />

                  <ErrorLine msg={errors.allotmentDate} />
                </div>
              </div>
            </div>
            {/* Quarter */}
            <div>
              <p className="text-sm font-medium">Select Quarter</p>
              {!hasEmployee ? (
                <div className="mt-2 border border-dashed rounded-lg p-4 text-sm text-gray-500 bg-gray-50">
                  Please select an <span className="font-medium text-gray-700">Employee</span> first to view and choose a quarter.
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center mt-2 gap-2 md:gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Tip: Click any row to select a quarter (only one selectable)"
                        value={quarterSearch}
                        onChange={(e) => setQuarterSearch(e.target.value)}
                      />
                    </div>

                    <div className="text-xs text-gray-500">
                      Showing <span className="font-medium text-gray-700">{filteredQuarters?.length || 0}</span> rows
                    </div>
                  </div>

                  {/* ✅ subtle helper text */}
                  <div className="text-xs text-green-700 my-2">Selectable table: click a row or radio button to choose. Selected row will be highlighted.</div>
                  <div className="border rounded-md overflow-hidden">
                    <div className=" overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky text-white top-0 bg-primary uppercase">
                          <tr className="text-left">
                            <th className="w-10 px-3 py-2 border-b"></th>
                            <th className="px-3 py-2 border-b">Type</th>
                            <th className="px-3 py-2 border-b">Quarter No</th>
                            <th className="px-3 py-2 border-b">Unit Name</th>
                            <th className="px-3 py-2 border-b">City</th>
                            <th className="px-3 py-2 border-b">Is Servent</th>
                            <th className="px-3 py-2 border-b">Is Garage</th>
                            <th className="px-3 py-2 border-b text-right">Area</th>
                            <th className="px-3 py-2 border-b text-right">Rent</th>
                          </tr>
                        </thead>

                        <tbody>
                          {(filteredQuarters || []).length === 0 ? (
                            <tr>
                              <td colSpan={8} className="px-3 py-6 text-center text-gray-500">
                                No quarters found for this employee / unit.
                              </td>
                            </tr>
                          ) : (
                            filteredQuarters.map((row) => {
                              const id = toStr(row?.pkQDetailId);
                              const checked = id === selectedQuarterId;

                              return (
                                <tr
                                  key={id}
                                  className={`border-b last:border-b-0 cursor-pointer transition ${
                                    checked ? 'bg-green-100 ring-1 ring-green-300' : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setForm((p) => ({ ...p, fkQDetailId: id }));
                                    setErrors((prev) => ({ ...prev, fkQDetailId: '' }));
                                  }}
                                >
                                  <td className="px-3 py-2">
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
                                  <td className="px-3 py-2">{row?.quarterType || '-'}</td>
                                  <td className="px-3 py-2">{row?.qNumber || '-'}</td>
                                  <td className="px-3 py-2">{row?.unitName || '-'}</td>
                                  <td className="px-3 py-2">{row?.city || '-'}</td>
                                  <td className="px-3 py-2">{row?.isServentQuarter ? 'Yes' : 'No'}</td>
                                  <td className="px-3 py-2">{row?.isGarage ? 'Yes' : 'No'}</td>
                                  <td className="px-3 py-2 text-right">{row?.area ?? '-'}</td>
                                  <td className="px-3 py-2 text-right">{row?.rentPerMonth ?? '-'}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <ErrorLine msg={errors.fkQDetailId} />
                </>
              )}
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

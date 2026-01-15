import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import Select from 'react-select';
import { PlusCircle, Trash2 } from 'lucide-react';

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';
const toStr = (v) => (v === null || v === undefined ? '' : String(v));
const isValidDate = (s) => !isEmpty(s) && !Number.isNaN(Date.parse(s));

function ErrorLine({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

const normalizeMultiValue = (v) => {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
};

export function QuarterDetailsModal({
  open,
  onOpenChange,
  mode = 'add',
  initialData = null,
  onSave,
  saving = false,
  unitOptions = [],
  positionGrades = [],
  quarterTypeOptions = [],
}) {
  const empty = React.useMemo(
    () => ({
      fkQTypeId: '',
      fkUnitId: '',
      area: '',
      isServentQuarter: false,
      isGarage: false,
      numberOfQuarters: '1',
      qAddress: '',
      rent: '',
      isVacant: false,
      vacantDate: '',
      unit: [],
      grades: [],
      quartersList: [{ quarterNo: '', quarterAddress: '', meterNumber: '' }],
    }),
    []
  );
  const [form, setForm] = React.useState(empty);
  const [errors, setErrors] = React.useState({});
  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const makeQuarterRow = () => ({ quarterNo: '', quarterAddress: '', meterNumber: '' });
  const resizeQuartersList = React.useCallback((count) => {
    const n = Math.max(0, Number(count) || 0);
    setForm((p) => {
      const prev = Array.isArray(p.quartersList) ? p.quartersList : [];
      if (prev.length === n) return p;
      if (prev.length < n) {
        const add = Array.from({ length: n - prev.length }, () => makeQuarterRow());
        return { ...p, quartersList: [...prev, ...add] };
      }
      return { ...p, quartersList: prev.slice(0, n) };
    });
  }, []);

  React.useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialData) {
      const count = Number(initialData.numberOfQuarters ?? 1) || 1;
      setForm({
        fkQTypeId: toStr(initialData.fkQTypeId),
        fkUnitId: toStr(initialData.fkUnitId),
        area: toStr(initialData.area),
        isServentQuarter: Boolean(initialData.isServentQuarter),
        isGarage: Boolean(initialData.isGarage),
        numberOfQuarters: toStr(count),
        qAddress: toStr(initialData.qAddress),
        rent: toStr(initialData.rent),
        isVacant: Boolean(initialData.isVacant),
        vacantDate: toStr(initialData.vacantDate),
        unit: Array.isArray(initialData.unit) ? initialData.unit : [],
        grades: Array.isArray(initialData.grades) ? initialData.grades : [],
        quartersList:
          Array.isArray(initialData.quartersList) && initialData.quartersList.length
            ? initialData.quartersList.map((q) => ({
                quarterNo: toStr(q.quarterNo),
                quarterAddress: toStr(q.quarterAddress),
                meterNumber: toStr(q.meterNumber),
              }))
            : Array.from({ length: count }, () => makeQuarterRow()),
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [open, mode, initialData, empty]);

  React.useEffect(() => {
    if (!open) return;
    resizeQuartersList(form.numberOfQuarters);
  }, [open, form.numberOfQuarters, resizeQuartersList]);

  const validate = () => {
    const e = {};
    if (isEmpty(form.area)) e.area = 'Area is required';
    if (isEmpty(form.numberOfQuarters) || Number(form.numberOfQuarters) <= 0) e.numberOfQuarters = 'Number of quarters must be > 0';
    if (!form.grades?.length) e.positionGrade = 'Position grade is required';
    if (!form.unit?.length) e.unitId = 'Unit is required';
    if (isEmpty(form.rent)) e.rent = ' Quarter rent is required';
    if (form.isVacant) {
      if (isEmpty(form.vacantDate)) e.vacantDate = 'Vacant Date is required';
      else if (!isValidDate(form.vacantDate)) e.vacantDate = 'Invalid Vacant Date';
    }

    // validate each quarter row
    const list = form.quartersList || [];
    const rowErrors = [];
    list.forEach((q, idx) => {
      const re = {};
      if (isEmpty(q.quarterNo)) re.quarterNo = 'Quarter No is required';
      // address/meter can be optional; make required if you want:
      // if (isEmpty(q.quarterAddress)) re.quarterAddress = 'Quarter Address is required';
      // if (isEmpty(q.meterNumber)) re.meterNumber = 'Meter Number is required';
      if (Object.keys(re).length) rowErrors[idx] = re;
    });
    if (rowErrors.length) e.quartersList = rowErrors;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  React.useEffect(() => {
    setErrors((prev) => {
      const updated = { ...prev };

      if (!isEmpty(form.area)) delete updated.area;
      if (!isEmpty(form.numberOfQuarters) && Number(form.numberOfQuarters) > 0) delete updated.numberOfQuarters;
      if (form.grades?.length) delete updated.positionGrade;
      if (form.unit?.length) delete updated.unitId;
      if (!isEmpty(form.rent)) delete updated.rent;
      if (!form.isVacant) {
        delete updated.vacantDate;
      } else {
        if (!isEmpty(form.vacantDate) && isValidDate(form.vacantDate)) delete updated.vacantDate;
      }
      return updated;
    });
  }, [form.area, form.numberOfQuarters, form.grades, form.unit, form.rent, form.isVacant, form.vacantDate]);

  const updateQuarterRow = (index, key, value) => {
    setForm((p) => {
      const next = [...(p.quartersList || [])];
      next[index] = { ...(next[index] || makeQuarterRow()), [key]: value };
      return { ...p, quartersList: next };
    });
    setErrors((prev) => {
      const next = { ...prev };
      if (Array.isArray(next.quartersList) && next.quartersList[index]) {
        const row = { ...next.quartersList[index] };
        delete row[key];
        const rows = [...next.quartersList];
        rows[index] = Object.keys(row).length ? row : undefined;
        while (rows.length && rows[rows.length - 1] === undefined) rows.pop();
        if (rows.length) next.quartersList = rows;
        else delete next.quartersList;
      }
      return next;
    });
  };

  const addQuarterRow = () => {
    setForm((p) => {
      const next = [...(p.quartersList || [])];
      next.push(makeQuarterRow());
      return { ...p, quartersList: next, numberOfQuarters: String(next.length || 1) };
    });
  };

  const removeQuarterRow = (index) => {
    setForm((p) => {
      const next = [...(p.quartersList || [])];
      if (next.length <= 1) return p; // keep at least 1
      next.splice(index, 1);
      return { ...p, quartersList: next, numberOfQuarters: String(next.length) };
    });

    setErrors((prev) => {
      const next = { ...prev };
      if (Array.isArray(next.quartersList)) {
        const rows = [...next.quartersList];
        rows.splice(index, 1);
        if (rows.length) next.quartersList = rows;
        else delete next.quartersList;
      }
      return next;
    });
  };

  const submit = async () => {
    if (!validate()) return;

    const payload = {
      ...(mode === 'edit' ? { pkQDetailId: initialData?.pkQDetailId } : {}),
      fkQTypeId: form.fkQTypeId,
      fkUnitId: form.fkUnitId,
      unitIds: (form.unit || []).map((x) => x.value),
      positionGrades: (form.grades || []).map((x) => x.value),
      area: String(form.area).trim(),
      isServentQuarter: Boolean(form.isServentQuarter),
      isGarage: Boolean(form.isGarage),
      numberOfQuarters: String(form.numberOfQuarters).trim(),
      qAddress: form.qAddress?.trim?.() || '',
      rent: String(form.rent).trim(),
      isVacant: Boolean(form.isVacant),
      vacantDate: form.isVacant ? form.vacantDate : '',
      quartersList: (form.quartersList || []).map((q) => ({
        quarterNo: q.quarterNo?.trim?.() || '',
        quarterAddress: q.quarterAddress?.trim?.() || '',
        meterNumber: q.meterNumber?.trim?.() || '',
      })),
    };

    await onSave?.(payload);
  };

  const unitSelectOptions = React.useMemo(
    () =>
      (unitOptions || []).map((ele) => ({
        label: ele.unitName,
        value: ele.unitid,
      })),
    [unitOptions]
  );
  const quarterSelectOptions = React.useMemo(
    () =>
      (quarterTypeOptions || []).map((ele) => ({
        label: ele.qType,
        value: ele.pkQTypeId,
      })),
    [quarterTypeOptions]
  );

  const gradeSelectOptions = React.useMemo(
    () =>
      (positionGrades || []).map((ele) => ({
        label: ele.positionGrade,
        value: ele.positionGrade,
      })),
    [positionGrades]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Quarter Details' : 'Add Quarter Details'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1">
            <div>
              <p className="text-sm font-medium">
                Quarter Type <span className="text-red-500">*</span>
              </p>
              <Select
                value={quarterSelectOptions.find((ele) => Number(ele.value) === Number(form.fkQTypeId)) || null}
                onChange={(e) => setField('fkQTypeId', e.value)}
                className="mt-1"
                isClearable
                options={quarterSelectOptions}
              />
              <ErrorLine msg={errors.quarterType} />
            </div>
            <div>
              <p className="text-sm font-medium">
                Area <span className="text-red-500">*</span>
              </p>
              <Input className="mt-1" type="number" value={form.area} onChange={(e) => setField('area', e.target.value)} placeholder="e.g., 1200 sqft" />
              <ErrorLine msg={errors.area} />
            </div>
            <div>
              <p className="text-sm font-medium">
                Quarter Rent <span className="text-red-500">*</span>
              </p>
              <Input className="mt-1" type="number" value={form.rent} onChange={(e) => setField('rent', e.target.value)} placeholder="Enter rent" />
              <ErrorLine msg={errors.rent} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Servant Quarter</p>
                <p className="text-xs text-muted-foreground">Is servant quarter?</p>
              </div>
              <Switch checked={form.isServentQuarter} onCheckedChange={(v) => setField('isServentQuarter', v)} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Garage</p>
                <p className="text-xs text-muted-foreground">Has garage?</p>
              </div>
              <Switch checked={form.isGarage} onCheckedChange={(v) => setField('isGarage', v)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">
                Select Unit<span className="text-red-500 ml-1">*</span>
              </p>
              <Select
                onChange={(v) => setField('unit', normalizeMultiValue(v))}
                className="min-w-[120px] mt-1"
                placeholder="Select unit"
                options={unitSelectOptions}
                isMulti
                value={form.unit || []}
              />
              <ErrorLine msg={errors.unitId} />
            </div>

            <div>
              <p className="text-sm font-medium">
                Position Grade<span className="text-red-500 ml-1">*</span>
              </p>
              <Select
                onChange={(v) => setField('grades', normalizeMultiValue(v))}
                className="min-w-[120px] mt-1"
                isMulti
                placeholder="Select grade"
                options={gradeSelectOptions}
                value={form.grades || []}
              />
              <ErrorLine msg={errors.positionGrade} />
            </div>
          </div>
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Quarters List</p>
                <p className="text-xs text-muted-foreground">Auto generated based on “Number of quarters”. You can also add/remove rows.</p>
              </div>

              <Button type="button" onClick={addQuarterRow}>
                <PlusCircle /> Add Row
              </Button>
            </div>

            <div className="space-y-3">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-md">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm font-medium text-gray-700">
                      <th className="p-2 border">
                        Quarter No <span className="text-red-500">*</span>
                      </th>
                      <th className="p-2 border">Quarter Address</th>
                      <th className="p-2 border">Meter Number</th>
                      <th className="p-2 border text-center">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(form.quartersList || []).map((q, idx) => {
                      const rowErr = Array.isArray(errors.quartersList) ? errors.quartersList[idx] : null;

                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          {/* Quarter No */}
                          <td className="p-2 border align-top">
                            <Input value={q.quarterNo} onChange={(e) => updateQuarterRow(idx, 'quarterNo', e.target.value)} placeholder="A-12" />
                            <ErrorLine msg={rowErr?.quarterNo} />
                          </td>

                          {/* Quarter Address */}
                          <td className="p-2 border align-top">
                            <Input value={q.quarterAddress} onChange={(e) => updateQuarterRow(idx, 'quarterAddress', e.target.value)} placeholder="Address" />
                            <ErrorLine msg={rowErr?.quarterAddress} />
                          </td>

                          {/* Meter Number */}
                          <td className="p-2 border align-top">
                            <Input value={q.meterNumber} onChange={(e) => updateQuarterRow(idx, 'meterNumber', e.target.value)} placeholder="Meter No" />
                            <ErrorLine msg={rowErr?.meterNumber} />
                          </td>

                          {/* Action */}
                          <td className="p-2 border text-center align-middle">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => removeQuarterRow(idx)}
                              disabled={(form.quartersList || []).length <= 1}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="space-y-3 md:hidden">
                {(form.quartersList || []).map((q, idx) => {
                  const rowErr = Array.isArray(errors.quartersList) ? errors.quartersList[idx] : null;

                  return (
                    <div key={idx} className="border rounded-md p-3 space-y-2">
                      <div>
                        <p className="text-sm font-medium">
                          Quarter No <span className="text-red-500">*</span>
                        </p>
                        <Input value={q.quarterNo} onChange={(e) => updateQuarterRow(idx, 'quarterNo', e.target.value)} />
                        <ErrorLine msg={rowErr?.quarterNo} />
                      </div>

                      <div>
                        <p className="text-sm font-medium">Quarter Address</p>
                        <Input value={q.quarterAddress} onChange={(e) => updateQuarterRow(idx, 'quarterAddress', e.target.value)} />
                        <ErrorLine msg={rowErr?.quarterAddress} />
                      </div>

                      <div>
                        <p className="text-sm font-medium">Meter Number</p>
                        <Input value={q.meterNumber} onChange={(e) => updateQuarterRow(idx, 'meterNumber', e.target.value)} />
                        <ErrorLine msg={rowErr?.meterNumber} />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        className="w-full"
                        onClick={() => removeQuarterRow(idx)}
                        disabled={(form.quartersList || []).length <= 1}
                      >
                        <Trash2 className="mr-2" size={16} />
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
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

import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import Select from 'react-select';
import { PlusCircle, Trash2 } from 'lucide-react';
import axiosInstance from '@/services/axiosInstance';
interface Area {
  pkAreaId: number;
  area: string;
  rentId: number;
  rentPerMonth: number;
}
interface QuarterTypeDetails {
  pkQTypeId: number;
  qType: string;
  applicableFrom: string; // ISO date string
  areas: Area[];
}
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';
const toStr = (v) => (v === null || v === undefined ? '' : String(v));

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
  quarterTypeOptions = [],
}) {
  const empty = React.useMemo(
    () => ({
      fkQTypeId: '',
      fkUnitId: '',
      quarterType: '',
      rent: '',
      area: {},
      unit: [],
      quartersList: [{ quarterNumber: '', qAddress: '', city: '', isServentQuarter: false, isGarage: false }],
    }),
    []
  );

  const [form, setForm] = React.useState(empty);
  const [selectedTypeDetails, setSelectedTypeDetails] = React.useState<QuarterTypeDetails | null>(null);
  const [errors, setErrors] = React.useState({});
  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const makeQuarterRow = () => ({ quarterNumber: '', qAddress: '', city: '', isServentQuarter: false, isGarage: false });
  console.log(initialData, 'initialData');
  React.useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      const count = Number(initialData.numberOfQuarters ?? 1) || 1;
      setForm({
        fkQTypeId: toStr(initialData.pkQTypeId),
        fkUnitId: toStr(initialData.fkUnitId),
        quarterType: toStr(initialData.quarterType),
        rent: toStr(initialData.rentPerMonth),
        unit: [
          {
            label: initialData.unitName,
            value: initialData.fkUnitId,
          },
        ],
        area: {
          label: initialData.area,
          value: initialData.pkAreaId,
        },
        quartersList:
          Array.isArray(initialData.quartersList) && initialData.quartersList.length
            ? initialData.quartersList.map((q) => ({
                quarterNumber: toStr(q.quarterNumber),
                qAddress: toStr(q.qAddress),
                city: toStr(q.city),
                isServentQuarter: q.isServentQuarter,
                isGarage: q.isGarage,
              }))
            : Array.from({ length: count }, () => makeQuarterRow()),
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [open, mode, initialData, empty]);
  const getQuarterTypeDetsils = async (type) => {
    try {
      const response = await axiosInstance.get(`/QuarterManage/GetQuarteTypeWithRent?QType=${type}`);
      console.log(response.data);
      if (response.data?.data?.length) {
        setSelectedTypeDetails(response.data.data[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };
  console.log(form, 'form');

  useEffect(() => {
    if (form?.quarterType) {
      getQuarterTypeDetsils(form.quarterType);
    }
  }, [form.quarterType]);
  const validate = () => {
    const e: any = {};
    if (isEmpty(form?.area?.value)) e.area = 'Area is required';
    const list = form.quartersList || [];
    const rowErrors: any[] = [];
    list.forEach((q, idx) => {
      const re: Record<string, any> = {};
      if (isEmpty(q.quarterNumber)) re.quarterNumber = 'Quarter No is required';
      if (isEmpty(q.qAddress)) re.qAddress = 'Quarter Address is required';
      if (isEmpty(q.city)) re.city = 'City is required';
      if (Object.keys(re).length) rowErrors[idx] = re;
    });
    if (rowErrors.length) e.quartersList = rowErrors;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  React.useEffect(() => {
    setErrors((prev) => {
      const updated: any = { ...prev };
      if (!isEmpty(form?.area?.value)) delete updated?.area;
      if (!isEmpty(form.rent)) delete updated.rent;
      return updated;
    });
  }, []);
  useEffect(() => {
    if (form.fkQTypeId && form.area?.value) {
      setField('rent', selectedTypeDetails?.areas?.find((ele) => ele.pkAreaId === form.area.value)?.rentPerMonth);
    } else {
      setField('rent', 0);
    }
  }, [form.area?.value, form.fkQTypeId]);

  const updateQuarterRow = (index, key, value) => {
    setForm((p) => {
      const next = [...(p.quartersList || [])];
      next[index] = { ...(next[index] || makeQuarterRow()), [key]: value };
      return { ...p, quartersList: next };
    });
    setErrors((prev) => {
      const next: Record<string, any> = { ...prev };
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
      const next: Record<string, any> = { ...prev };
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
      ...(mode === 'edit' ? { pkQdetailsId: initialData?.pkQDetailId } : {}),
      fkQTypeId: form.fkQTypeId,
      fkUnitId: form.unit[0]?.value,
      fkAreaId: form?.area?.value,
      quarters: (form.quartersList || []).map((q) => ({
        quarterNumber: q.quarterNumber?.trim?.() || '',
        qAddress: q.qAddress?.trim?.() || '',
        city: q.city?.trim?.() || '',
        isServentQuarter: q.isServentQuarter,
        isGarage: q.isGarage,
        isVacant: true,
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
  const quarterAreaSelectOptions = React.useMemo(
    () =>
      selectedTypeDetails?.areas?.map((ele) => ({
        label: ele.area,
        value: ele.pkAreaId,
      })) ?? [],
    [selectedTypeDetails]
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
                value={quarterSelectOptions?.find((ele) => Number(ele.value) === Number(form.fkQTypeId)) || null}
                onChange={(e) => {
                  setField('fkQTypeId', e.value);
                  setField('quarterType', e.label);
                  setField('area', {
                    label: '',
                    value: '',
                  });
                }}
                className="mt-1"
                options={quarterSelectOptions}
              />
              <ErrorLine msg={errors.quarterType} />
            </div>
            <div>
              <p className="text-sm font-medium">
                Area <span className="text-red-500">*</span>
              </p>
              <Select
                className="mt-1"
                onChange={(e) => {
                  setField('area', e);
                }}
                isDisabled={!form.fkQTypeId}
                value={quarterAreaSelectOptions.find((ele) => Number(ele.value) === Number(form?.area?.value)) || null}
                options={selectedTypeDetails?.areas?.map((ele) => ({
                  label: ele.area,
                  value: ele.pkAreaId,
                }))}
              />
              <ErrorLine msg={errors.area} />
            </div>
            <div>
              <p className="text-sm font-medium">
                Quarter Rent <span className="text-red-500">*</span>
              </p>
              <Input disabled className="mt-1" type="number" value={form.rent} placeholder="Enter rent" />
              <ErrorLine msg={errors.rent} />
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
          </div>
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Quarters List</p>
                <p className="text-xs text-muted-foreground">Auto generated based on “Number of quarters”. You can also add/remove rows.</p>
              </div>

              <Button disabled={mode === 'edit'} type="button" onClick={addQuarterRow}>
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
                      <th className="p-2 border">City</th>
                      <th className="p-2 border">Garage</th>
                      <th className="p-2 border text-nowrap">Servent Quarter</th>
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
                            <Input value={q.quarterNumber} onChange={(e) => updateQuarterRow(idx, 'quarterNumber', e.target.value)} placeholder="A-12" />
                            <ErrorLine msg={rowErr?.quarterNumber} />
                          </td>

                          {/* Quarter Address */}
                          <td className="p-2 border align-top">
                            <Input value={q.qAddress} onChange={(e) => updateQuarterRow(idx, 'qAddress', e.target.value)} placeholder="Address" />
                            <ErrorLine msg={rowErr?.qAddress} />
                          </td>

                          {/* Meter Number */}
                          <td className="p-2 border align-top">
                            <Input value={q.city} onChange={(e) => updateQuarterRow(idx, 'city', e.target.value)} placeholder="City" />
                            <ErrorLine msg={rowErr?.city} />
                          </td>

                          <div className="flex items-center justify-center mt-3 gap-3">
                            <Switch checked={q.isGarage} onCheckedChange={(v) => updateQuarterRow(idx, 'isGarage', v)} />
                          </div>

                          {/* Meter Number */}
                          <td className=" border align-top">
                            <div className="flex items-center justify-center mt-3">
                              <Switch checked={q.isServentQuarter} onCheckedChange={(v) => updateQuarterRow(idx, 'isServentQuarter', v)} />
                            </div>
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
                        <Input value={q.quarterNumber} onChange={(e) => updateQuarterRow(idx, 'quarterNumber', e.target.value)} />
                        <ErrorLine msg={rowErr?.quarterNumber} />
                      </div>

                      <div>
                        <p className="text-sm font-medium">Quarter Address</p>
                        <Input value={q.qAddress} onChange={(e) => updateQuarterRow(idx, 'qAddress', e.target.value)} />
                        <ErrorLine msg={rowErr?.qAddress} />
                      </div>

                      <div>
                        <p className="text-sm font-medium">Meter Number</p>
                        <Input value={q.city} onChange={(e) => updateQuarterRow(idx, 'city', e.target.value)} />
                        <ErrorLine msg={rowErr?.city} />
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

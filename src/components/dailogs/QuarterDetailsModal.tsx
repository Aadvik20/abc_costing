import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Select from 'react-select';
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';
const toStr = (v) => (v === null || v === undefined ? '' : String(v));
const isValidDate = (s) => !isEmpty(s) && !Number.isNaN(Date.parse(s));

function ErrorLine({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

export function QuarterDetailsModal({
  open,
  onOpenChange,
  mode = 'add',
  initialData = null,
  onSave,
  saving = false,
  quarterTypeOptions = [],
  unitOptions = [],
}) {
  const empty = React.useMemo(
    () => ({
      fkQTypeId: '',
      fkUnitId: '',
      area: '',
      isServentQuarter: false,
      isGarage: false,
      qNumber: '',
      qAddress: '',
      city: '',
      isVacant: false,
      vacantDate: '',
    }),
    []
  );
  const [form, setForm] = React.useState(empty);
  const [errors, setErrors] = React.useState({});
  console.log(unitOptions, 'unitOptions');
  React.useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      setForm({
        fkQTypeId: toStr(initialData.fkQTypeId),
        fkUnitId: toStr(initialData.fkUnitId),
        area: toStr(initialData.area),
        isServentQuarter: Boolean(initialData.isServentQuarter),
        isGarage: Boolean(initialData.isGarage),
        qNumber: toStr(initialData.qNumber),
        qAddress: toStr(initialData.qAddress),
        city: toStr(initialData.city),
        isVacant: Boolean(initialData.isVacant),
        vacantDate: toStr(initialData.vacantDate),
      });
    } else setForm(empty);
    setErrors({});
  }, [open, mode, initialData, empty]);

  const validate = () => {
    const e = {};
    if (isEmpty(form.fkQTypeId)) e.fkQTypeId = 'Quarter Type is required';
    if (isEmpty(form.fkUnitId)) e.fkUnitId = 'Unit is required';
    if (isEmpty(form.area)) e.area = 'Area is required';
    if (isEmpty(form.qNumber)) e.qNumber = 'Quarter Number is required';
    if (isEmpty(form.city)) e.city = 'City is required';
    if (isEmpty(form.vacantDate)) e.vacantDate = 'Vacant Date is required';
    if (form.vacantDate && !isValidDate(form.vacantDate)) e.vacantDate = 'Invalid Vacant Date';

    setErrors(e);
    return Object.keys(e).length === 0;
  };
  React.useEffect(() => {
    setErrors((prev) => {
      const updated = { ...prev };

      if (!isEmpty(form.fkQTypeId)) delete updated.fkQTypeId;
      if (!isEmpty(form.fkUnitId)) delete updated.fkUnitId;
      if (!isEmpty(form.area)) delete updated.area;
      if (!isEmpty(form.qNumber)) delete updated.qNumber;
      if (!isEmpty(form.city)) delete updated.city;

      if (form.isVacant) {
        if (!isEmpty(form.vacantDate) && isValidDate(form.vacantDate)) {
          delete updated.vacantDate;
        }
      } else {
        delete updated.vacantDate;
      }

      return updated;
    });
  }, [form.fkQTypeId, form.fkUnitId, form.area, form.qNumber, form.city, form.isVacant, form.vacantDate]);

  const submit = async () => {
    if (!validate()) return;

    const payload = {
      ...(mode === 'edit' ? { pkQDetailId: initialData?.pkQDetailId } : {}),
      fkQTypeId: form.fkQTypeId,
      fkUnitId: form.fkUnitId,
      area: form.area.trim(),
      isServentQuarter: Boolean(form.isServentQuarter),
      isGarage: Boolean(form.isGarage),
      qNumber: form.qNumber.trim(),
      qAddress: form.qAddress?.trim?.() || '',
      city: form.city.trim(),
      isVacant: Boolean(form.isVacant),
      vacantDate: form.isVacant ? form.vacantDate : '',
    };

    await onSave?.(payload);
  };

  console.log(form, 'dskjhakf');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl ">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Quarter Details' : 'Add Quarter Details'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[55vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1">
            <div>
              <p className="text-sm font-medium">
                Quarter Type<span className="text-red-500 ml-2">*</span>
              </p>
              <Select
                onChange={(v) => setForm((p) => ({ ...p, fkQTypeId: v.value }))}
                className="min-w-[120px] mt-1"
                placeholder="Quarter type"
                options={quarterTypeOptions.map((ele) => ({
                  label: ele.qType,
                  value: ele.pkQTypeId,
                }))}
                value={
                  quarterTypeOptions
                    .map((ele) => ({
                      label: ele.qType,
                      value: ele.pkQTypeId,
                    }))
                    .find((opt) => Number(opt.value) === Number(form.fkQTypeId)) || null
                }
              />

              <ErrorLine msg={errors.fkQTypeId} />
            </div>

            <div>
              <p className="text-sm font-medium">
                Unit<span className="text-red-500 ml-2">*</span>
              </p>
              <Select
                onChange={(v) => {
                  console.log(v, 'fkashfaks');
                  setForm((p) => ({ ...p, fkUnitId: v.value }));
                }}
                className="min-w-[120px] mt-1"
                placeholder="Select unit"
                options={unitOptions.map((ele) => ({
                  label: ele.unitName,
                  value: ele.unitid,
                }))}
                value={
                  unitOptions
                    .map((ele) => ({
                      label: ele.unitName,
                      value: ele.unitid,
                    }))
                    .find((opt) => Number(opt.value) === Number(form.fkUnitId)) || null
                }
              />

              <ErrorLine msg={errors.fkUnitId} />
            </div>

            <div>
              <p className="text-sm font-medium">
                Area<span className="text-red-500 ml-2">*</span>
              </p>
              <Input
                className="mt-1"
                type="number"
                value={form.area}
                onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                placeholder="e.g., 1200 sqft"
              />
              <ErrorLine msg={errors.area} />
            </div>

            <div>
              <p className="text-sm font-medium">
                Quarter Number<span className="text-red-500 ml-2">*</span>
              </p>
              <Input
                className="mt-1"
                type="number"
                value={form.qNumber}
                onChange={(e) => setForm((p) => ({ ...p, qNumber: e.target.value }))}
                placeholder="e.g., Q-12"
              />
              <ErrorLine msg={errors.qNumber} />
            </div>

            <div>
              <p className="text-sm font-medium">
                City<span className="text-red-500 ml-2">*</span>
              </p>
              <Input className="mt-1" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="e.g., Prayagraj" />
              <ErrorLine msg={errors.city} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">
              Quarter Address<span className="text-red-500 ml-2">*</span>
            </p>
            <Textarea
              className="min-h-[80px] mt-1"
              value={form.qAddress}
              onChange={(e) => setForm((p) => ({ ...p, qAddress: e.target.value }))}
              placeholder="Full address..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Servant Quarter</p>
                <p className="text-xs text-muted-foreground">Is servant quarter?</p>
              </div>
              <Switch checked={form.isServentQuarter} onCheckedChange={(v) => setForm((p) => ({ ...p, isServentQuarter: v }))} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Garage</p>
                <p className="text-xs text-muted-foreground">Has garage?</p>
              </div>
              <Switch checked={form.isGarage} onCheckedChange={(v) => setForm((p) => ({ ...p, isGarage: v }))} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Vacant</p>
                <p className="text-xs text-muted-foreground">Currently vacant?</p>
              </div>
              <Switch
                checked={form.isVacant}
                onCheckedChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    isVacant: v,
                  }))
                }
              />
            </div>

            <div>
              <p className="text-sm font-medium">
                Vacant Date<span className="text-red-500 ml-2">*</span>
              </p>
              <Input
                min={new Date().toISOString().split('T')[0]}
                type="date"
                value={form.vacantDate || ''}
                onChange={(e) => setForm((p) => ({ ...p, vacantDate: e.target.value }))}
              />
              <ErrorLine msg={errors.vacantDate} />
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

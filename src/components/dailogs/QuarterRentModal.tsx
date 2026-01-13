import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from 'react-select';

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';
const toStr = (v) => (v === null || v === undefined ? '' : String(v));
const isValidDate = (s) => !isEmpty(s) && !Number.isNaN(Date.parse(s));
const isNonNegativeNumber = (v) => {
  if (isEmpty(v)) return false;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0;
};

function ErrorLine({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

export function QuarterRentModal({ open, onOpenChange, mode = 'add', initialData = null, onSave, saving = false, quarterDetailsOptions = [] }) {
  const empty = React.useMemo(() => ({ fkQTypeId: '', applicableFrom: '', rentPerMonth: '' }), []);
  const [form, setForm] = React.useState(empty);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      setForm({
        fkQTypeId: toStr(initialData.fkQTypeId),
        applicableFrom: toStr(initialData.applicableFrom?.split('T')[0]),
        rentPerMonth: toStr(initialData.rentPerMonth),
      });
    } else setForm(empty);
    setErrors({});
  }, [open, mode, initialData, empty]);
  console.log(form, 'form');
  const validate = () => {
    const e = {};
    if (isEmpty(form.fkQTypeId)) e.fkQTypeId = 'Quarter is required';
    if (!isValidDate(form.applicableFrom)) e.applicableFrom = 'Applicable From date is required';
    if (!isNonNegativeNumber(form.rentPerMonth)) e.rentPerMonth = 'Rent must be a number >= 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submit = async () => {
    if (!validate()) return;

    const payload = {
      ...(mode === 'edit' ? { pkQRateId: initialData?.pkQRateId } : {}),
      fkQTypeId: form.fkQTypeId,
      applicableFrom: form.applicableFrom,
      rentPerMonth: Number(form.rentPerMonth),
    };

    await onSave?.(payload);
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Quarter Rent' : 'Add Quarter Rent'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Quarter Type</p>
            <Select
              onChange={(v) => setForm((p) => ({ ...p, fkQTypeId: v.value }))}
              className="min-w-[120px] mt-1"
              placeholder="Quarter type"
              options={quarterDetailsOptions.map((ele) => ({
                label: ele.qType,
                value: ele.pkQTypeId,
              }))}
              value={
                quarterDetailsOptions
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
            <p className="text-sm font-medium">Applicable From</p>
            <Input
              min={new Date().toISOString().split('T')[0]}
              type="date"
              className="mt-1"
              value={form.applicableFrom || ''}
              onChange={(e) => setForm((p) => ({ ...p, applicableFrom: e.target.value }))}
            />
            <ErrorLine msg={errors.applicableFrom} />
          </div>

          <div>
            <p className="text-sm font-medium">Rent Per Month</p>
            <Input
              className="mt-1"
              type="number"
              value={form.rentPerMonth}
              onChange={(e) => setForm((p) => ({ ...p, rentPerMonth: e.target.value }))}
              placeholder="e.g., 5000"
            />
            <ErrorLine msg={errors.rentPerMonth} />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
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

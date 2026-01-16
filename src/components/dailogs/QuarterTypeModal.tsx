import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';
const toStr = (v) => (v === null || v === undefined ? '' : String(v));

function ErrorLine({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

export function QuarterTypeModal({ open, onOpenChange, mode = 'add', initialData = null, onSave, saving = false }) {
  const empty = React.useMemo(
    () => ({
      QType: '',
      details: [{ area: '', rent: '' }],
    }),
    []
  );

  const [form, setForm] = React.useState(empty);
  const [errors, setErrors] = React.useState({});

  /** Prefill on edit */
  React.useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialData) {
      setForm({
        QType: toStr(initialData.QType),
        details:
          initialData.details?.length > 0
            ? initialData.details.map((d) => ({
                area: toStr(d.area),
                rent: toStr(d.rent),
              }))
            : [{ area: '', rent: '' }],
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [open, mode, initialData, empty]);

  /** Row handlers */
  const addRow = () => {
    setForm((p) => ({
      ...p,
      details: [...p.details, { area: '', rent: '' }],
    }));
  };

  const removeRow = (index) => {
    setForm((p) => ({
      ...p,
      details: p.details.filter((_, i) => i !== index),
    }));
  };

  const updateRow = (index, field, value) => {
    setForm((p) => ({
      ...p,
      details: p.details.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }));
  };

  /** Validation */
  const validate = () => {
    const e = {};

    if (isEmpty(form.QType)) e.QType = 'Quarter Type is required';

    if (!form.details.length) {
      e.details = 'At least one Area & Rent row is required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /** Submit */
  const submit = async () => {
    if (!validate()) return;

    const payload = {
      ...(mode === 'edit' ? { pkQTypeId: initialData?.pkQTypeId } : {}),
      QType: form.QType.trim(),
      details: form.details.map((d) => ({
        area: d.area,
        rent: d.rent,
      })),
    };

    await onSave?.(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Quarter Type & Area-Rent' : 'Add Quarter Type & Area-Rent'}</DialogTitle>
        </DialogHeader>

        {/* Quarter Type */}
        <div>
          <p className="text-sm font-medium">Quarter Type</p>
          <Input className="mt-1" value={form.QType} onChange={(e) => setForm((p) => ({ ...p, QType: e.target.value }))} placeholder="Enter quarter type" />
          <ErrorLine msg={errors.QType} />
        </div>

        {/* Add Row */}
        <div className="flex justify-end">
          <Button type="button" size="sm" className="bg-green-600 hover:bg-green-700" onClick={addRow}>
            + Add Row
          </Button>
        </div>

        {/* Area & Rent Rows */}
        <div className="space-y-3">
          {form.details.map((row, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-3 items-end border p-3 rounded-lg">
              <div className="col-span-2">
                <p className="text-sm font-medium">Quarter Area</p>
                <Input className="mt-1" value={row.area} onChange={(e) => updateRow(idx, 'area', e.target.value)} placeholder="Area" />
              </div>

              <div className="col-span-2">
                <p className="text-sm font-medium">Quarter Rent</p>
                <Input className="mt-1" value={row.rent} onChange={(e) => updateRow(idx, 'rent', e.target.value)} placeholder="Rent" />
              </div>

              <div>
                <Button type="button" variant="destructive" onClick={() => removeRow(idx)} disabled={form.details.length === 1}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        <ErrorLine msg={errors.details} />

        <DialogFooter className="gap-2">
          <Button variant="outline" type="button" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={saving}>
            {saving ? (mode === 'edit' ? 'Updating...' : 'Creating...') : mode === 'edit' ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

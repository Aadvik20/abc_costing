import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import EnhancedDatePicker from '../EnhancedDatePicker';

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
      applicableFrom: '',
      details: [{ area: '', rent: '' }],
    }),
    []
  );

  const [form, setForm] = React.useState(empty);
  const [errors, setErrors] = React.useState({});
  console.log(form, 'form');
  React.useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      setForm({
        QType: toStr(initialData.qType),
        applicableFrom: initialData?.applicableFrom,
        details:
          initialData.areas?.length > 0
            ? initialData.areas.map((d) => ({
                area: toStr(d.area),
                rent: toStr(d.rentPerMonth),
              }))
            : [{ area: '', rent: '' }],
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [open, mode, initialData, empty]);
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

  const validate = () => {
    const e = {};
    const areaSet = new Set();
    if (isEmpty(form.QType)) e.QType = 'Quarter Type is required';
    if (isEmpty(form.applicableFrom)) e.applicableFrom = 'Applicable From date is required';
    if (!form.details.length) {
      e.details = 'At least one Area & Rent row is required';
    } else {
      const detailErrors = [];
      form.details.forEach((row, index) => {
        const rowError = {};
        if (isEmpty(row.area)) rowError.area = 'Area is required';
        if (isEmpty(row.rent)) rowError.rent = 'Rent is required';
        if (!isEmpty(row.area)) {
          if (areaSet.has(row.area)) {
            rowError.area = 'Area must be unique';
          } else {
            areaSet.add(row.area);
          }
        }
        if (Object.keys(rowError).length) {
          detailErrors[index] = rowError;
        }
      });

      if (detailErrors.length) {
        e.details = detailErrors;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    const payload = {
      ...(mode === 'edit' ? { pkQTypeId: initialData?.pkQTypeId } : {}),
      qType: form.QType.trim(),
      applicableFrom: form.applicableFrom,
      areawithRent: form.details.map((d) => ({
        area: d.area,
        rent: d.rent,
      })),
    };

    await onSave?.(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Quarter Type & Area-Rent' : 'Add Quarter Type & Area-Rent'}</DialogTitle>
        </DialogHeader>

        {/* Quarter Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium">Quarter Type</p>
            <Input className="mt-1" value={form.QType} onChange={(e) => setForm((p) => ({ ...p, QType: e.target.value }))} placeholder="Enter quarter type" />
            <ErrorLine msg={errors.QType} />
          </div>
          <div>
            <p className="text-sm font-medium">Applicable From Date</p>
            <EnhancedDatePicker
              minDate={new Date()}
              selectedDate={form.applicableFrom ? new Date(form.applicableFrom) : null}
              onChange={(date: any) => {
                setForm((p) => ({ ...p, applicableFrom: date }));
              }}
              className={`flex items-center py-1 mt-1 pl-3 rounded-md`}
            />
            <ErrorLine msg={errors.applicableFrom} />
          </div>
        </div>

        {/* Add Row */}
        <div className="flex justify-end">
          <Button type="button" size="sm" className="bg-green-600 hover:bg-green-700" onClick={addRow}>
            + Add Row
          </Button>
        </div>
        {/* Table */}
        <div className="border rounded-lg max-h-[300px] overflow-y-auto ">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Quarter Area</th>
                <th className="px-3 py-2 text-left">Quarter Rent</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {form.details.map((row, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <Input value={row.area} onChange={(e) => updateRow(idx, 'area', e.target.value)} placeholder="Area" />
                    {errors.details?.[idx]?.area && <ErrorLine msg={errors.details[idx].area} />}
                  </td>
                  <td className="px-3 py-2">
                    <Input type="number" value={row.rent} onChange={(e) => updateRow(idx, 'rent', e.target.value)} placeholder="Rent" />
                    {errors.details?.[idx]?.rent && <ErrorLine msg={errors.details[idx].rent} />}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeRow(idx)} disabled={form.details.length === 1}>
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

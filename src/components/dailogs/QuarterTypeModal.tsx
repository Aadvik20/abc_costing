import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Select from 'react-select';
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';
const toStr = (v) => (v === null || v === undefined ? '' : String(v));

function ErrorLine({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-600 mt-1">{msg}</p>;
}

export function QuarterTypeModal({ open, onOpenChange, mode = 'add', initialData = null, onSave, saving = false, positionGrades = [], units = [] }) {
  const empty = React.useMemo(() => ({ QType: '', positionGrade: '' }), []);
  const [form, setForm] = React.useState(empty);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      setForm({
        QType: toStr(initialData.QType),
        positionGrade: toStr(initialData.QType),
      });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [open, mode, initialData, empty]);

  const validate = () => {
    const e = {};
    if (isEmpty(form.QType)) e.QType = 'Quarter Type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  console.log(form.QType.length);
  const submit = async () => {
    if (!validate()) return;
    const payload = {
      ...(mode === 'edit' ? { pkQTypeId: initialData?.pkQTypeId } : {}),
      QType: form.QType.trim(),
    };
    await onSave?.(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Quarter Type & Map Grade' : 'Add Quarter Type & Map Grade'}</DialogTitle>
        </DialogHeader>
        <div className="gap-3 grid grid-cols-2">
          <div>
            <p className="text-sm font-medium">Select Unit</p>
            <Select
              onChange={(v) => {
                console.log(v, 'fkashfaks');
                setForm((p) => ({ ...p, fkUnitId: v.value }));
              }}
              className="min-w-[120px] mt-1"
              placeholder="Select unit"
              options={units.map((ele) => ({
                label: ele.unitName,
                value: ele.unitid,
              }))}
              value={
                units
                  .map((ele) => ({
                    label: ele.unitName,
                    value: ele.unitid,
                  }))
                  .find((opt) => Number(opt.value) === Number(form.unitId)) || null
              }
            />
            <ErrorLine msg={errors.unitId} />
          </div>
          <div>
            <p className="text-sm font-medium">Position Grade</p>
            <Select
              onChange={(v) => setForm((p) => ({ ...p, positionGrade: v.value }))}
              className="min-w-[120px] mt-1"
              placeholder="Select grade"
              options={positionGrades.map((ele) => ({
                label: ele.positionGrade,
                value: ele.positionGrade,
              }))}
              value={
                positionGrades
                  .map((ele) => ({
                    label: ele.positionGrade,
                    value: ele.positionGrade,
                  }))
                  .find((opt) => opt.value === form.positionGrade) || null
              }
            />
            <ErrorLine msg={errors.positionGrade} />
          </div>
          <div>
            <p className="text-sm font-medium">Quarter Type</p>
            <Input
              className="mt-1"
              value={form.QType}
              onChange={(e) => setForm((p) => ({ ...p, QType: e.target.value }))}
              placeholder="Enter type name here...."
            />
            <ErrorLine msg={errors.QType} />
          </div>
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

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

export function QPGradeMappingModal({
  open,
  onOpenChange,
  mode = 'add',
  initialData = null,
  onSave,
  saving = false,
  quarterTypeOptions = [],
  positionGrades = [],
}) {
  const empty = React.useMemo(() => ({ fkQTypeId: '', positionGrade: '' }), []);
  const [form, setForm] = React.useState(empty);
  const [errors, setErrors] = React.useState({});
  console.log(positionGrades, 'positionGrades');
  React.useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      setForm({
        fkQTypeId: toStr(initialData.fkQTypeId),
        positionGrade: toStr(initialData.positionGrade),
      });
    } else setForm(empty);
    setErrors({});
  }, [open, mode, initialData, empty]);

  const validate = () => {
    const e = {};
    if (isEmpty(form.fkQTypeId)) e.fkQTypeId = 'Quarter Type is required';
    if (isEmpty(form.positionGrade)) e.positionGrade = 'Position Grade is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    const payload = {
      ...(mode === 'edit' ? { pkQPGradeId: initialData?.pkQPGradeId } : {}),
      fkQTypeId: form.fkQTypeId,
      positionGrade: form.positionGrade.trim(),
    };

    await onSave?.(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit QP Grade Mapping' : 'Add QP Grade Mapping'}</DialogTitle>
        </DialogHeader>

        <div className="gap-3 grid grid-cols-2">
          <div>
            <p className="text-sm font-medium">Quarter Type</p>
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

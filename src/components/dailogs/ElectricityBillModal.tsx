import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EnhancedDatePicker from '../EnhancedDatePicker';
import Select from 'react-select';
type Mode = 'add' | 'edit';

interface ElectricityBillForm {
  fkQMapEmpId: string;
  dateOfReading: Date | null;
  currentMeterReading: string;
  ratePerUnit: string;
}

interface ElectricityBillPayload {
  pkElectricityBillId?: number;
  fkQMapEmpId: number;
  dateOfReading: Date;
  currentMeterReading: number;
  ratePerUnit: number;
}

interface ElectricityBillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: Mode;
  initialData?: {
    pkElectricityBillId: number;
    fkQMapEmpId: number;
    dateOfReading: string | Date;
    currentMeterReading: number;
    ratePerUnit: number;
  } | null;
  onSave?: (payload: ElectricityBillPayload) => Promise<void> | void;
  saving?: boolean;
  employeeOption: any[];
}

const isEmpty = (v: unknown): boolean => v === null || v === undefined || (typeof v === 'string' && v.trim() === '');

const ErrorLine: React.FC<{ msg?: string }> = ({ msg }) => (msg ? <p className="text-xs text-red-600 mt-1">{msg}</p> : null);

export const ElectricityBillModal: React.FC<ElectricityBillModalProps> = ({
  open,
  onOpenChange,
  mode = 'add',
  initialData = null,
  onSave,
  saving = false,
  employeeOption = [],
}) => {
  const emptyForm: ElectricityBillForm = React.useMemo(
    () => ({
      fkQMapEmpId: '',
      dateOfReading: null,
      currentMeterReading: '',
      ratePerUnit: '',
    }),
    []
  );
  console.log(employeeOption, 'employeeOption');
  const [form, setForm] = React.useState<ElectricityBillForm>(emptyForm);
  const [errors, setErrors] = React.useState<Partial<Record<keyof ElectricityBillForm, string>>>({});

  React.useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialData) {
      setForm({
        fkQMapEmpId: String(initialData.fkQMapEmpId),
        dateOfReading: initialData.dateOfReading ? new Date(initialData.dateOfReading) : null,
        currentMeterReading: String(initialData.currentMeterReading),
        ratePerUnit: String(initialData.ratePerUnit),
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
  }, [open, mode, initialData, emptyForm]);

  const validate = (): boolean => {
    const e: Partial<Record<keyof ElectricityBillForm, string>> = {};

    if (isEmpty(form.fkQMapEmpId)) e.fkQMapEmpId = 'Employee mapping is required';

    if (!form.dateOfReading) e.dateOfReading = 'Date of reading is required';

    if (isEmpty(form.currentMeterReading)) e.currentMeterReading = 'Current meter reading is required';

    if (isEmpty(form.ratePerUnit)) e.ratePerUnit = 'Rate per unit is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (): Promise<void> => {
    if (!validate() || !form.dateOfReading) return;

    const payload: ElectricityBillPayload = {
      ...(mode === 'edit' && initialData ? { pkElectricityBillId: initialData.pkElectricityBillId } : {}),
      fkQMapEmpId: Number(form.fkQMapEmpId),
      dateOfReading: form.dateOfReading,
      currentMeterReading: Number(form.currentMeterReading),
      ratePerUnit: Number(form.ratePerUnit),
    };

    await onSave?.(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Electricity Bill' : 'Add Electricity Bill'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Employee Mapping */}
          <div className="col-span-2">
            <p className="text-sm font-medium">Employee Mapping ID</p>
            <Select
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  fkQMapEmpId: e.value,
                }))
              }
              className="mt-1"
              options={employeeOption.map((ele) => ({
                label: `${ele.employeeDetails.userName}-${ele.employeeDetails.employeeCode} - ${ele.quarterDetails.qNumber} -${ele.quarterDetails.quarterType}`,
                value: ele.pkQMapEmpId,
              }))}
            />
            <ErrorLine msg={errors.fkQMapEmpId} />
          </div>

          {/* Date */}
          <div>
            <p className="text-sm font-medium">Date of Reading</p>
            <EnhancedDatePicker
              minDate={new Date()}
              selectedDate={form.dateOfReading}
              onChange={(date: Date | null) =>
                setForm((p) => ({
                  ...p,
                  dateOfReading: date,
                }))
              }
              className="flex items-center py-1 mt-1 pl-3 rounded-md"
            />
            <ErrorLine msg={errors.dateOfReading} />
          </div>

          {/* Meter Reading */}
          <div>
            <p className="text-sm font-medium">Current Meter Reading</p>
            <Input
              type="number"
              className="mt-1"
              value={form.currentMeterReading}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  currentMeterReading: e.target.value,
                }))
              }
              placeholder="Enter meter reading"
            />
            <ErrorLine msg={errors.currentMeterReading} />
          </div>

          {/* Rate */}
          <div className="col-span-2">
            <p className="text-sm font-medium">Rate Per Unit</p>
            <Input
              type="number"
              className="mt-1"
              value={form.ratePerUnit}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  ratePerUnit: e.target.value,
                }))
              }
              placeholder="Enter rate per unit"
            />
            <ErrorLine msg={errors.ratePerUnit} />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={saving}>
            {saving ? (mode === 'edit' ? 'Updating...' : 'Creating...') : mode === 'edit' ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

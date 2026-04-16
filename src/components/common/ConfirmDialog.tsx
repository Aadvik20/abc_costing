import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  triggerLabel: string;
  triggerClassName?: string;
  disabled?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  onConfirm: (remarks?: string) => void;
  beforeOpen?: () => boolean;

  withRemarks?: boolean;
  remarksRequired?: boolean;
  remarksPlaceholder?: string;
}

export default function ConfirmDialog({
  triggerLabel,
  triggerClassName = '',
  disabled = false,
  title = 'Confirm',
  description = 'This action cannot be undone.',
  actionLabel = 'Confirm',
  onConfirm,
  beforeOpen,

  withRemarks = false,
  remarksRequired = false,
  remarksPlaceholder = 'Enter remarks...',
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [remarks, setRemarks] = useState('');

  const handleTriggerClick = () => {
    if (beforeOpen) {
      const shouldOpen = beforeOpen();
      if (!shouldOpen) return;
    }
    setOpen(true);
  };

  const handleConfirm = () => {
    if (withRemarks && remarksRequired && !remarks.trim()) {
      alert('Remarks required'); // or toast
      return;
    }

    onConfirm(withRemarks ? remarks : undefined);
    setRemarks('');
    setOpen(false);
  };

  return (
    <>
      <Button disabled={disabled} className={triggerClassName} onClick={handleTriggerClick}>
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {/* 🔥 REMARKS INPUT */}
          {withRemarks && (
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={remarksPlaceholder}
              className="w-full border rounded-md p-2 text-sm mt-2"
              rows={4}
            />
          )}

          <DialogFooter>
            <Button onClick={handleConfirm}>{actionLabel}</Button>

            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
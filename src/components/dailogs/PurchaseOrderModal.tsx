import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRupees } from '@/lib/helperFunction';
import { formatRupeeInput } from '@/lib/helperFunction';

export function PurchaseOrderModal({ open, onOpenChange, initialData, onSave }) {
  const [anticipatedDemand, setAnticipatedDemand] = useState('');
  const [error, setError] = useState('');
  const data = initialData || {};
  const poOrderValue = data.poOrderValue ?? 0;
  const deliveredValue = data.deliveredValue ?? 0;
  const balanceToBeInvoice = data.balanceToBeInvoice ?? 0;
  const sapdump = data.pktblSapDump;

  const submit = async () => {
    const payload = {
      employeeMasterAutoId: 0,
      employeeCode: 'NA',
      sapdumpId: sapdump,
      demandAmount: anticipatedDemand,
      remark: 'NA',
    };
    await onSave?.(payload);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');

    if (value === '') {
      setAnticipatedDemand('');
      setError('');
      return;
    }

    const num = Number(value);

    if (isNaN(num) || num < 0) {
      setError('Please enter a valid amount');
      setAnticipatedDemand(value);
      return;
    }

    if (num > balanceToBeInvoice) {
      setError(`Amount cannot be greater than Balance Amount (${formatRupees(balanceToBeInvoice)})`);
    } else {
      setError('');
    }

    setAnticipatedDemand(value);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Raise an Anticipated Demand</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="grid grid-cols-[1fr_2fr] gap-y-4 gap-x-6 items-center">
            <p className="text-sm font-medium">PO Order Value</p>

            <div className="rounded-md border bg-background px-3 py-2 text-sm font-semibold text-right">{formatRupees(poOrderValue)}</div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-y-4 gap-x-6 items-center mt-1">
            <p className="text-sm font-medium">Delivered Value</p>
            <div className="rounded-md border bg-background px-3 py-2 text-sm font-semibold text-right">{formatRupees(deliveredValue)}</div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-y-4 gap-x-6 items-center mt-1">
            <p className="text-sm font-medium ">Balance To Be Invoiced</p>

            <div className="rounded-md border bg-background px-3 py-2 text-sm font-semibold text-right">{formatRupees(balanceToBeInvoice)}</div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-y-4 gap-x-6 items-center">
            <p className="text-sm font-medium ">Anticipated Demand</p>
            <div>
              <Input
                className="mt-1 text-right font-medium"
                type="text"
                inputMode="numeric"
                placeholder="Enter Demand Amount"
                value={formatRupeeInput(anticipatedDemand)}
                onChange={handleAmountChange}
              />
              {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              (onOpenChange?.(false), setAnticipatedDemand(''), setError(''));
            }}
          >
            Cancel
          </Button>
          <Button disabled={!anticipatedDemand || Boolean(error)} type="button" onClick={submit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

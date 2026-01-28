import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRupees } from '@/lib/helperFunction';
import {formatRupeeInput} from "@/lib/helperFunction"
import { fetchFinanceData } from '@/features/FinanceSlice';
import { useAppDispatch} from '@/app/hooks';

export function FinanceModal({ open, onOpenChange, initialData, onSave }) {
  const [approveDemand, setApproveDemand] = useState('');

  const [reason, setReason] = useState('');

  const [error, setError] = useState('');

  const dispatch = useAppDispatch();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');

    if (value === '') {
      setApproveDemand('');
      setError('');
      return;
    }

    const num = Number(value);

    if (isNaN(num) || num < 0) {
      setError('Please enter a valid amount');
      setApproveDemand(value);
      return;
    }

    if (num > pendingAncipatedDemand) {
      setError(`Amount cannot be greater than Pending Amount (${formatRupees(pendingAncipatedDemand)})`);
    } else {
      setError('');
    }

    setApproveDemand(value);
  };              

  const data = initialData || {}; 

  const poOrderValue = data.poOrderValue ?? 0;
  const deliveredValue = data.deliveredValue ?? 0;
  const balanceToBeInvoice = data.balanceToBeInvoice ?? 0;
  const anticipatedDemand = data.demandAmount ?? 0;
  const pendingAncipatedDemand = data.pendingAmount ?? 0;
  const demandId = data.pkDemandId;

  const submit = async () => {
    const payload = {
      employeeMasterAutoId: 0,
      employeeCode: 'NA',
      demandId: demandId,
      approvedAmount: approveDemand,
      reason: reason || '',
    };
    await onSave?.(payload);
    await dispatch(fetchFinanceData());
    setApproveDemand('')
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Approve an Anticipated Demand</DialogTitle>
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

          <div className="grid grid-cols-[1fr_2fr] gap-y-4 gap-x-6 items-center mt-1">
            <p className="text-sm font-medium ">Anticipated Demand</p>

            <div className="rounded-md border bg-background px-3 py-2 text-sm font-semibold text-right">{formatRupees(anticipatedDemand)}</div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-y-4 gap-x-6 items-center mt-1">
            <p className="text-sm font-medium ">Pending Anticipated Demand</p>

            <div className="rounded-md border bg-background px-3 py-2 text-sm font-semibold text-right">{formatRupees(pendingAncipatedDemand)}</div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-y-4 gap-x-6 items-center">
            <p className="text-sm font-medium ">Approve Demand</p>
            <div>
              <Input
                className="mt-1 text-right font-medium`"
                inputMode="numeric"
                type="text"
                placeholder="Enter Approve Amount"
                value={formatRupeeInput(approveDemand)}
                onChange={handleAmountChange}
              />
              {error && <span className="text-xs text-red-500">{error}</span>}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-y-4 gap-x-6 items-center">
            <p className="text-sm font-medium ">Reason</p>

            <Input className="mt-1 font-medium" type="text" placeholder="Enter Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              (onOpenChange?.(false), setApproveDemand(''), setError(''));
            }}
          >
            Cancel
          </Button>
          <Button disabled={!approveDemand || Boolean(error)} type="button" onClick={submit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

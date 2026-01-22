import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Props = {
  demandId: number;
  pendingAmount: number;
  onSave: (demandId: number, reason: string, amount: number) => Promise<void>;
};

const FinanceActionInput = React.memo(({ demandId, pendingAmount, onSave }: Props) => {
  const [Reasonvalue, setReasonValue] = useState('');
  const [Amountvalue, setAmountValue] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setAmountValue('');
      setError('');
      return;
    }

    const num = Number(value);

    if (isNaN(num) || num < 0) {
      setError('Please enter a valid amount');
      setAmountValue(value);
      return;
    }
    
    if (num > pendingAmount) {
      setError(`Amount cannot be greater than Pending Amount (₹${pendingAmount})`);
      setOpen(true);
    } else {
      setError('');
      setOpen(false);
    }

    setAmountValue(value);
  };

  return (
    <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
      <Input
        type="number"
        placeholder="Enter Approved Amount"
        value={Amountvalue}
        onChange={handleAmountChange}
        className="border px-2 py-1 w-32 rounded"
      />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid Amount</AlertDialogTitle>
            <AlertDialogDescription>Entered amount is greater than the pending amount (₹{pendingAmount})</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setAmountValue('');
                setOpen(false);
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Input
        type="text"
        placeholder="Enter Reason"
        value={Reasonvalue}
        onChange={(e) => setReasonValue(e.target.value)}
        className="border px-2 py-1 w-32 rounded"
      />

      <Button
        disabled={!Amountvalue || Number(Amountvalue) > pendingAmount}
        onClick={async () => {
          await onSave(demandId, String(Reasonvalue), Number(Amountvalue));
          setReasonValue('');
          setAmountValue('');
        }}
      >
        Submit
      </Button>
    </div>
  );
});

export default FinanceActionInput;

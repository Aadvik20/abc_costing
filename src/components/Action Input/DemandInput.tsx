import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';

type Props = {
  sapDump: string;
  onSave: (sapDump: string, amount: number) => Promise<void>;
};

const DemandInput = React.memo(({ sapDump, onSave }: Props) => {
  const [value, setValue] = useState('');

  return (
    <div
      className="flex items-center gap-2"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Input
        type="number"
        placeholder="Enter Demand Amount"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border px-2 py-1 w-32 rounded"
      />

      <Button
        disabled={!value}
        onClick={async () => {
          await onSave(sapDump, Number(value));
          setValue('');
        }}
      >
        Submit
      </Button>
    </div>
  );
});

export default DemandInput;

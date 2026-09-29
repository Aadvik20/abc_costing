import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";

type IconInputProps = {
  icon: ReactNode;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function IconInput({
  icon,
  placeholder,
  value,
  onChange,
  disabled = false,
}: IconInputProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </div>

      <Input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
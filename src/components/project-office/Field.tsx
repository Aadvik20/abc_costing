import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

type FieldProps = {
  label: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
};

export function Field({
  label,
  required = false,
  children,
  error,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}

        {required && (
          <span className="ml-1 text-destructive">*</span>
        )}
      </Label>

      {children}

      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
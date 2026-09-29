import {
  Building2,
  Hash,
  Landmark,
  Plus,
  TrainFront,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type {
  CorridorApi,
  Draft,
} from "@/types/projectOffice";

import { Field } from "./Field";
import { IconInput } from "./IconInput";

type ProjectOfficeFormProps = {
  draft: Draft;
  corridors: CorridorApi[];
  errors: Record<string, string>;
  saving: boolean;
  onChange: (field: keyof Draft, value: string) => void;
  onSubmit: () => void;
};

export function ProjectOfficeForm({
  draft,
  corridors,
  errors,
  saving,
  onChange,
  onSubmit,
}: ProjectOfficeFormProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-primary/10 p-2">
          <Plus className="h-4 w-4 text-primary" />
        </div>

        <div>
          <h2 className="font-semibold">
            Add Project Office
          </h2>

          <p className="text-sm text-muted-foreground">
            Enter project office details
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_12rem_auto]">
        <Field
          label="Project Office"
          required
          error={errors.name}
        >
          <IconInput
            icon={<Building2 className="h-4 w-4" />}
            placeholder="Enter project office"
            value={draft.name}
            onChange={(value) => onChange("name", value)}
          />
        </Field>

        <Field
          label="Unit Code"
          required
          error={errors.unitCode}
        >
          <IconInput
            icon={<Hash className="h-4 w-4" />}
            placeholder="Enter unit code"
            value={draft.unitCode}
            onChange={(value) => onChange("unitCode", value)}
          />
        </Field>

        <Field
          label="SAP Profit Centre Code"
          required
          error={errors.sapCode}
        >
          <IconInput
            icon={<Landmark className="h-4 w-4" />}
            placeholder="Enter SAP code"
            value={draft.sapCode}
            onChange={(value) => onChange("sapCode", value)}
          />
        </Field>

        <Field
          label="Corridor"
          required
          error={errors.corridor}
        >
          <select
            value={draft.corridor}
            onChange={(event) =>
              onChange("corridor", event.target.value)
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">
              Select corridor
            </option>

            {corridors.map((corridor) => (
              <option
                key={corridor.pkCorId}
                value={String(corridor.pkCorId)}
              >
                {corridor.CorridorName ||
                  corridor.CorCode}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-end">
          <Button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="w-full"
          >
            {saving ? (
              <>
                <span className="mr-2 animate-spin">⟳</span>
                Saving...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
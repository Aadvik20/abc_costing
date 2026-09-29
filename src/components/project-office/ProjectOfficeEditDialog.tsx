import { useEffect, useState } from "react";

import {
  Building2,
  Hash,
  Landmark,
  Loader2,
  Trash2,
  TrainFront,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type {
  CorridorApi,
  Draft,
  Office,
} from "@/types/projectOffice";

import { Field } from "./Field";
import { IconInput } from "./IconInput";

type ProjectOfficeEditDialogProps = {
  office: Office | null;
  corridors: CorridorApi[];
  open: boolean;
  saving: boolean;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    office: Office,
    draft: Draft
  ) => void;
  onDelete: (office: Office) => void;
};

export function ProjectOfficeEditDialog({
  office,
  corridors,
  open,
  saving,
  deleting,
  onOpenChange,
  onSave,
  onDelete,
}: ProjectOfficeEditDialogProps) {
  const [draft, setDraft] = useState<Draft>({
    name: "",
    unitCode: "",
    sapCode: "",
    corridor: "",
  });

  useEffect(() => {
    if (!office) return;

    setDraft({
      name: office.name,
      unitCode: office.unitCode,
      sapCode: office.sapCode,
      corridor: String(office.corridorId),
    });
  }, [office]);

  const updateField = (
    field: keyof Draft,
    value: string
  ) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  if (!office) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit Project Office
          </DialogTitle>

          <DialogDescription>
            Update project office details.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Field label="Project Office" required>
            <IconInput
              icon={
                <Building2 className="h-4 w-4" />
              }
              value={draft.name}
              onChange={(value) =>
                updateField("name", value)
              }
            />
          </Field>

          <Field label="Unit Code" required>
            <IconInput
              icon={
                <Hash className="h-4 w-4" />
              }
              value={draft.unitCode}
              onChange={(value) =>
                updateField("unitCode", value)
              }
            />
          </Field>

          <Field
            label="SAP Profit Centre Code"
            required
          >
            <IconInput
              icon={
                <Landmark className="h-4 w-4" />
              }
              value={draft.sapCode}
              onChange={(value) =>
                updateField("sapCode", value)
              }
            />
          </Field>

          <Field label="Corridor" required>
            <div className="relative">
              <TrainFront className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <select
                value={draft.corridor}
                onChange={(event) =>
                  updateField(
                    "corridor",
                    event.target.value
                  )
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm"
              >
                <option value="">
                  Select corridor
                </option>

                {corridors.map((corridor) => (
                  <option
                    key={corridor.pkCorId}
                    value={String(
                      corridor.pkCorId
                    )}
                  >
                    {corridor.CorridorName ||
                      corridor.CorCode}
                  </option>
                ))}
              </select>
            </div>
          </Field>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            disabled={deleting || saving}
            onClick={() => onDelete(office)}
          >
            {deleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}

            Delete
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving || deleting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={() =>
                onSave(office, draft)
              }
              disabled={saving || deleting}
            >
              {saving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
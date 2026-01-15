import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  mode: "add" | "edit";
  initialData: any;
  onSave: (payload: any) => void;
  saving: boolean;
}

const RoleModal: React.FC<Props> = ({
  open,
  onOpenChange,
  mode,
  initialData,
  onSave,
  saving
  }) => {
    
  const [formData, setFormData] = useState({
    roleName: "",
    description: ""
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        roleName: initialData.roleName,
        description: initialData.description
      });
    } else {
      setFormData({ roleName: "", description: "" });
    }
  }, [mode, initialData]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{mode === 'edit' ? 'Edit Role' : 'Add Role'}</DialogTitle>
          </DialogHeader>
        <div className="gap-3 grid grid-cols-2">
        <div>
         <p className="text-sm font-medium">Role Name</p> 
         <Input
         className="mt-1"
         placeholder="Role Name"
         value={formData.roleName}
         onChange={(e) =>
          setFormData({
            ...formData,
            roleName: e.target.value
          })
          }
        />
        </div>

        <div>
        <p className="text-sm font-medium">Role Description</p>
        <Input
        className="mt-1"
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({
            ...formData,
            description: e.target.value
          })
         }
        />
        </div>
        </div>
          <DialogFooter className="gap-2">
            <Button
            variant="outline"
            type='button'
            onClick={() => onOpenChange(false)}
            >
            Cancel
            </Button>

            <Button
            type='button'
            disabled={saving}
            onClick={() =>
              onSave(
                mode === "edit"
                  ? { ...formData, id: initialData.id }
                  : formData
              )
              }
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};

export default RoleModal;

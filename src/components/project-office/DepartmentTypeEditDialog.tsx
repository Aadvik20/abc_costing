import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export type DepartmentType = {
    pkDeptType: number;
    DType: string;
};

interface DepartmentTypeEditDialogProps {
    departmentType: DepartmentType | null;
    open: boolean;
    saving: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: DepartmentType) => void;
}

const DepartmentTypeEditDialog = ({ departmentType, open, saving, onOpenChange, onSave }: DepartmentTypeEditDialogProps) => {

    const [name, setName] = useState('');

    const handleSave = () => {
        if (!departmentType) return;

        const trimmedName = name.trim();

        if (!trimmedName) return;

        onSave({
            ...departmentType,
            DType: trimmedName,
        });
    };


    useEffect(() => {
        if (departmentType) {
            setName(departmentType.DType)
        }
        else {
            setName('')
        }

    }, [departmentType])


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>

            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Department Type</DialogTitle>
                    <DialogDescription>
                        Update the Department Type details and click Save Changes.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="departmentType">
                            Department Type
                            <span className="ml-1 text-destructive">*</span>
                        </Label>

                        <Input
                            id="departmentType"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter Department Type"
                            disabled={saving}
                            autoFocus
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                    >
                        {saving && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}

                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DepartmentTypeEditDialog;
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

export type Department = {
    pkDeptId: number;
    Department: string;
    Departmental_Code: number;
    fkDeptType: number;
};

interface DepartmentEditDialogProps {
    department: Department | null;
    open: boolean;
    saving: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: Department) => void;
}

const DepartmentsEditDialog = ({
    department,
    open,
    saving,
    onOpenChange,
    onSave,
}: DepartmentEditDialogProps) => {
    const [name, setName] = useState("");
    const [departmentalCode, setDepartmentalCode] = useState("");
    const [fkDeptType, setFkDeptType] = useState("");

    // Existing data modal me load karega
    useEffect(() => {
        if (department) {
            setName(department.Department ?? "");
            setDepartmentalCode(
                department.Departmental_Code !== null &&
                    department.Departmental_Code !== undefined
                    ? String(department.Departmental_Code)
                    : ""
            );
            setFkDeptType(
                department.fkDeptType !== null &&
                    department.fkDeptType !== undefined
                    ? String(department.fkDeptType)
                    : ""
            );
        } else {
            setName("");
            setDepartmentalCode("");
            setFkDeptType("");
        }
    }, [department, open]);

    const handleSave = () => {
        if (!department) return;

        const trimmedName = name.trim();
        const trimmedCode = departmentalCode.trim();
        const trimmedDeptType = fkDeptType.trim();

        if (!trimmedName) {
            alert("Please enter Department.");
            return;
        }

        if (!trimmedCode) {
            alert("Please enter Departmental Code.");
            return;
        }

        if (!trimmedDeptType) {
            alert("Please enter Department Type.");
            return;
        }

        const numericCode = Number(trimmedCode);
        const numericDeptType = Number(trimmedDeptType);

        if (Number.isNaN(numericCode)) {
            alert("Departmental Code must be a valid number.");
            return;
        }

        if (Number.isNaN(numericDeptType)) {
            alert("Department Type must be a valid number.");
            return;
        }

        const updatedDepartment: Department = {
            ...department,
            Department: trimmedName,
            Departmental_Code: numericCode,
            fkDeptType: numericDeptType,
        };

        console.log("Updated Department:", updatedDepartment);

        onSave(updatedDepartment);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Department</DialogTitle>

                    <DialogDescription>
                        Update the Department details and click Save Changes.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4">
                    {/* Department */}
                    <div className="space-y-2">
                        <Label htmlFor="department">
                            Department
                            <span className="ml-1 text-destructive">*</span>
                        </Label>

                        <Input
                            id="department"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter Department"
                            disabled={saving}
                            autoFocus
                        />
                    </div>

                    {/* Departmental Code */}
                    <div className="space-y-2">
                        <Label htmlFor="departmentalCode">
                            Departmental Code
                            <span className="ml-1 text-destructive">*</span>
                        </Label>

                        <Input
                            id="departmentalCode"
                            type="text"
                            inputMode="numeric"
                            value={departmentalCode}
                            onChange={(e) => {
                                const value = e.target.value;

                                if (/^\d*$/.test(value)) {
                                    setDepartmentalCode(value);
                                }
                            }}
                        />
                    </div>

                    {/* Department Type */}
                    <div className="space-y-2">
                        <Label htmlFor="fkDeptType">
                            Department Type
                            <span className="ml-1 text-destructive">*</span>
                        </Label>

                        <Input
                            id="fkDeptType"
                            type="text"
                            inputMode="numeric"
                            value={fkDeptType}
                            onChange={(e) => {
                                const value = e.target.value;

                                if (/^\d*$/.test(value)) {
                                    setFkDeptType(value);
                                }
                            }}
                            placeholder="Enter Department Type ID"
                            disabled={saving}
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
                        disabled={
                            saving ||
                            !name.trim() ||
                            !departmentalCode.trim() ||
                            !fkDeptType.trim()
                        }
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
};

export default DepartmentsEditDialog;
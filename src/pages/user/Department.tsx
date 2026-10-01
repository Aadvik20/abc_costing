import DepartmentsEditDialog from "@/components/project-office/DepartmentsEditDialog";
import axios from "axios";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

type DepartmentModal = {
    pkDeptId: number;
    Department: string;
    Departmental_Code: number;
    fkDeptType: number;
};

const Departments = () => {
    const [departments, setDepartments] = useState<DepartmentModal[]>([]);
    const [editDepartment, setEditDepartment] =
        useState<DepartmentModal | null>(null);

    const [editDepartmentOpen, setEditDepartmentOpen] = useState(false);
    const [savingDepartment, setSavingDepartment] = useState(false);

    // ============================
    // GET DEPARTMENTS
    // ============================
    const getDepartments = async () => {
        try {
            const url = `${import.meta.env.VITE_API_BASE_URL}/Departments`;

            const result = await axios.get<DepartmentModal[]>(url);

            console.log("Departments API:", result.data);

            setDepartments(result.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    useEffect(() => {
        getDepartments();
    }, []);

    // ============================
    // OPEN EDIT MODAL
    // ============================
    const handleEditClick = (department: DepartmentModal) => {
        setEditDepartment(department);
        setEditDepartmentOpen(true);
    };

    // ============================
    // UPDATE DEPARTMENT
    // ============================
   const handleEdit = async (updatedDepartment: DepartmentModal) => {
    try {
        setSavingDepartment(true);

        const url = `${import.meta.env.VITE_API_BASE_URL}/Departments/${updatedDepartment.pkDeptId}`;

        const payload = {
            pkDeptId: updatedDepartment.pkDeptId,
            Department: updatedDepartment.Department,
            Departmental_Code: Number(updatedDepartment.Departmental_Code),
            fkDeptType: Number(updatedDepartment.fkDeptType),
        };

        console.log("========== UPDATE DEPARTMENT ==========");
        console.log("PUT URL:", url);
        console.log("Updated Department:", updatedDepartment);
        console.log("Departmental Code:", updatedDepartment.Departmental_Code);
        console.log("Departmental Code Type:", typeof updatedDepartment.Departmental_Code);
        console.log("PUT Payload:", payload);

        const response = await axios.put(url, payload);

        console.log("PUT Response:", response.data);

        // Refresh table
        await getDepartments();

        // Close modal
        setEditDepartmentOpen(false);
        setEditDepartment(null);

    } catch (error: any) {
        console.error("Error updating department:", error);

        if (error.response) {
            console.error("API Status:", error.response.status);
            console.error("API Response:", error.response.data);
        }
    } finally {
        setSavingDepartment(false);
    }
};
    return (
        <div className="mx-px overflow-hidden rounded-t-[10px] border border-slate-300">

            <table className="w-full border-collapse text-left text-sm text-slate-500">

                <thead className="bg-slate-100">
                    <tr>
                        <th className="h-12 px-4">
                            Ser. No.
                        </th>

                        <th className="h-12 px-4">
                            Department
                        </th>

                        <th className="h-12 px-4">
                            Code
                        </th>

                        <th className="h-12 px-4">
                            Department Type
                        </th>

                        <th className="h-12 px-4">
                            Action
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {departments.length > 0 ? (
                        departments.map((department) => (
                            <tr
                                key={department.pkDeptId}
                                className="border-b border-slate-300 last:border-b-0"
                            >

                                <td className="h-[50px] px-4">
                                    {department.pkDeptId}
                                </td>

                                <td className="h-[50px] px-4">
                                    {department.Department}
                                </td>

                                <td className="h-[50px] px-4">
                                    {department.Departmental_Code}
                                </td>

                                <td className="h-[50px] px-4">
                                    {department.fkDeptType}
                                </td>

                                <td className="h-[50px] px-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleEditClick(department)
                                        }
                                        className="inline-flex h-8 items-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                    >
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </button>
                                </td>

                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={5}
                                className="h-20 px-4 text-center text-slate-400"
                            >
                                No departments found
                            </td>
                        </tr>
                    )}
                </tbody>

            </table>

            <DepartmentsEditDialog
                department={editDepartment}
                open={editDepartmentOpen}
                saving={savingDepartment}
                onOpenChange={(open) => {
                    setEditDepartmentOpen(open);

                    if (!open) {
                        setEditDepartment(null);
                    }
                }}
                onSave={handleEdit}
            />

        </div>
    );
};

export default Departments;
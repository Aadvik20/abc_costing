import { Dialog } from "@radix-ui/react-dialog";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import DepartmentTypeEditDialog from "@/components/project-office/DepartmentTypeEditDialog";
import { error } from "loglevel";
import { Item } from "@radix-ui/react-select";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Pencil, Search, Trash2 } from "lucide-react";
import Pagination from "@/components/common/Pagination";



type DepartmentTypeModel = {
    pkDeptType: number;
    DType: string;
};

const DepartmentType = () => {
    const [departmentTypes, setDepartmentTypes] = useState<DepartmentTypeModel[]>([]);
    const [editDepartmentType, setEditDepartmentType] = useState<DepartmentTypeModel | null>(null);
    const [editDepartmentTypeOpen, setEditDepartmentTypeOpen] = useState(false);
    const [savingDepartmentType, setSavingDepartmentType] = useState(false);

    const getDepartmentTypes = async () => {
        let url = `${import.meta.env.VITE_API_BASE_URL}/DepartmentType`;
        const result = await axios.get(url);
        const data = result.data;
        console.log(result, "DepType");
        setDepartmentTypes(data);
    };

    useEffect(() => {
        getDepartmentTypes();
    }, []);

    const handleUpdateDepartmentType = async (updatedDepartmentType: DepartmentTypeModel) => {
        try {
            setSavingDepartmentType(true);
            const url = `${import.meta.env.VITE_API_BASE_URL}/DepartmentType/${updatedDepartmentType.pkDeptType}`;
            const payload = {
                pkDeptType: updatedDepartmentType.pkDeptType,
                DType: updatedDepartmentType.DType,
            };

            await axios.put(url, payload);
            await getDepartmentTypes();
            setEditDepartmentTypeOpen(false);
        } catch (error) {
            console.error("Error updating Department Type:", error);
        } finally {
            setSavingDepartmentType(false);
        }
    };

    // Open Edit Modal

    const editDepartmentTypeModal = (item: number, item2: string) => {
        setEditDepartmentType({
            pkDeptType: item,
            DType: item2,
        });
        setEditDepartmentTypeOpen(true);
    };

    const handleDelete = async (id: number) => {
        const url = `${import.meta.env.VITE_API_BASE_URL}/DepartmentType/${id}`;
        const res = await axios.delete(url);
        if (res.status == 200) {
            alert(res.data.message);
            getDepartmentTypes()
        }
    };

    type SortKey = "sno" | "DType";

    const [search, setSearch] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "sno", dir: "asc" });

    const processed = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = departmentTypes
            .map((d, i) => ({ ...d, sno: i + 1 }))
            .filter((d) => d.DType.toLowerCase().includes(q));

        list.sort((a, b) => {
            const v = sort.key === "sno" ? a.sno - b.sno : a.DType.localeCompare(b.DType);
            return sort.dir === "asc" ? v : -v;
        });
        return list;
    }, [departmentTypes, search, sort]);

    const total = processed.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const visibleRows = processed.slice(startIndex, startIndex + pageSize);

    const toggleSort = (key: SortKey) => {
        setSort((s) =>
            s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
        );
    };

    const SortIcon = ({ k }: { k: SortKey }) => {
        const cls = "ml-1.5 inline h-3.5 w-3.5 align-middle text-blue-500";
        if (sort.key !== k) return <ArrowUpDown className={cls} />;
        return sort.dir === "asc" ? <ArrowUp className={cls} /> : <ArrowDown className={cls} />;
    };

    return (
        <>
        <div>
            <div className="rounded-[14px] border border-slate-300 bg-white pt-4 text-sm text-gray-900">
            {/* Show entries + Search */}
            <div className="flex flex-col gap-3 px-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                    Show
                    <div className="relative">
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(1);
                            }}
                            className="h-9 w-[72px] cursor-pointer appearance-none rounded-md border border-gray-500 bg-white pl-3 pr-6 text-sm text-gray-700 outline-none"
                        >
                            {[10, 25, 50, 100].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-3 h-3.5 w-3.5 text-gray-400" />
                    </div>
                    entries
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-600" />
                    <input
                        type="text"
                        placeholder="Search department types"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="h-9 w-full rounded-md border border-gray-500 pl-[38px] pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="mx-px overflow-hidden rounded-t-[10px] border border-slate-300">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-blue-50 text-left text-sm font-semibold text-blue-800">
                            <th
                                onClick={() => toggleSort("sno")}
                                className="h-12 w-1/4 cursor-pointer select-none border-b border-slate-300 px-4"
                            >
                                Ser. No.
                                <SortIcon k="sno" />
                            </th>
                            <th
                                onClick={() => toggleSort("DType")}
                                className="h-12 cursor-pointer select-none border-b border-slate-300 px-4"
                            >
                                Department Type
                                <SortIcon k="DType" />
                            </th>
                            <th className="h-12 border-b border-slate-300 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleRows.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="h-20 text-center text-gray-500">
                                    No department types found
                                </td>
                            </tr>
                        ) : (
                            visibleRows.map((dpt) => (
                                <tr key={dpt.pkDeptType} className="border-b border-slate-300 last:border-b-0">
                                    <td className="h-[50px] px-4">{dpt.sno}</td>
                                    <td className="h-[50px] px-4">{dpt.DType}</td>
                                    <td className="h-[50px] px-4 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    editDepartmentTypeModal(dpt.pkDeptType, dpt.DType);
                                                    setEditDepartmentTypeOpen(true);
                                                }}
                                                className="inline-flex h-8 items-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleDelete(dpt.pkDeptType);
                                                }}
                                                className="inline-flex h-8 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-medium text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer: info + pagination (alag component) */}
            <Pagination total={total} page={currentPage} pageSize={pageSize} onPageChange={setPage} />
        </div>

            <DepartmentTypeEditDialog
                departmentType={editDepartmentType}
                open={editDepartmentTypeOpen}
                saving={savingDepartmentType}
                onOpenChange={setEditDepartmentTypeOpen}
                onSave={handleUpdateDepartmentType}
            />
        </div>
        </>
    );
}

export default DepartmentType;
import { Plus } from "lucide-react";
import { useState } from "react";
import axios from "axios";

const InputField = () => {

    const [depertmentType, setDepartmentType] = useState<string>("");
    const [isRequired, setIsRequired] = useState<boolean>(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDepartmentType(e.target.value)
    }

    const departmentSubmit = async () => {
        if (depertmentType.trim() === "") {
            setIsRequired(true)
            // alert("Please enter a department type");
            return;
        }
        let url = `${import.meta.env.VITE_API_BASE_URL}/DepartmentType`
        const payload = {
            DType: depertmentType,
        }
        const result = await axios.post(url, payload);
        history.go();
    }

    return (
        <div className="mb-[18px] flex flex-wrap items-center gap-3 rounded-[10px] border-l-4 border-blue-600 bg-slate-50 px-5 py-4">
            <div className="flex min-h-[64px] flex-col justify-center relative w-full sm:w-auto">
                <input
                    type="text"
                    placeholder="Department type"
                    value={depertmentType}
                    onChange={handleChange}
                    className={`h-10 w-full rounded-md border ${isRequired ? 'border-red-500' : 'border-gray-500'} bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 sm:w-64`}
                />
                {isRequired && <p className="mt-1 text-sm text-red-500 absolute -bottom-3 left-1">Please enter a department type</p>}
            </div>
            <button
                type="button"
                onClick={departmentSubmit}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700"
            >
                <Plus className="h-4 w-4" />
                Add
            </button>
        </div>
    )
}
export default InputField;

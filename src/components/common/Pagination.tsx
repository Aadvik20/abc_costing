import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    total: number;                       // total entries (filter ke baad)
    page: number;                        // current page (1-based)
    pageSize: number;                    // entries per page
    onPageChange: (page: number) => void;
}

const Pagination = ({ total, page, pageSize, onPageChange }: PaginationProps) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * pageSize;

    return (
        <div className="-mt-px flex flex-col gap-3 rounded-b-[14px] border-t border-slate-300 bg-[#f6f9fd] p-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[12.5px] text-gray-600">
                Showing {total === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, total)} of {total} entries
            </span>

            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3.5 text-sm text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPageChange(p)}
                        className={
                            p === currentPage
                                ? "h-9 w-[30px] rounded-md border border-blue-600 bg-blue-600 text-sm font-semibold text-white"
                                : "h-9 w-[30px] rounded-md border border-gray-300 bg-white text-sm text-gray-700"
                        }
                    >
                        {p}
                    </button>
                ))}

                <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3.5 text-sm text-gray-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;

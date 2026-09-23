import { useMemo, useState } from "react";
import { Pencil, Plus, Search, ArrowUpDown, Route } from "lucide-react";

const CORRIDORS = [
  { id: 1, name: "Corporate Office", code: "20" },
  { id: 2, name: "EDFC", code: "30" },
  { id: 3, name: "WDFC", code: "40" },
  { id: 4, name: "HHI", code: "50" },
  { id: 15, name: "Abc", code: "FGV" },
  { id: 16, name: "", code: "" },
  { id: 17, name: "", code: "" },
  { id: 18, name: "", code: "" },
  { id: 19, name: "Corporate Office", code: "02" },
  { id: 20, name: "xyz", code: "50" },
];

export default function CorridorMaster() {
  const [query, setQuery] = useState("");
  const [name, setName] = useState("WDFC");
  const [code, setCode] = useState("40");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      CORRIDORS.filter((c) =>
        (c.name + c.code).toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const filled = CORRIDORS.filter((c) => c.name).length;

  return (
    <div
      className="min-h-full w-full bg-[#F5F7FA] px-6 py-8 md:px-10"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Page title */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14213D] text-[#F2A93B]">
          <Route size={22} />
        </div>
        <div>
          <h1
            className="text-2xl font-semibold text-[#14213D] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Corridor Master
          </h1>
          <p className="text-sm text-[#64748B]">
            Configure the freight corridors used across the network
          </p>
        </div>
      </div>

      {/* Stat strip */}
      {/* <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total entries" value={CORRIDORS.length} />
        <Stat label="With data" value={filled} />
        <Stat label="Blank rows" value={CORRIDORS.length - filled} accent />
        <Stat label="Current page" value="1 / 2" />
      </div> */}

      {/* Control strip: create / update */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-[#E2E6ED] bg-white shadow-sm">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-[repeating-linear-gradient(180deg,#F2A93B_0px,#F2A93B_10px,transparent_10px,transparent_18px)]" />
        <div className="flex flex-col gap-3 p-5 pl-7 md:flex-row md:items-center">
          <Field label="Corridor name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#E2E6ED] bg-[#F5F7FA] px-3 py-2 text-sm text-[#14213D] outline-none focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
              placeholder="e.g. WDFC"
            />
          </Field>
          <Field label="Code">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-[#E2E6ED] bg-[#F5F7FA] px-3 py-2 text-sm text-[#14213D] outline-none focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              placeholder="e.g. 40"
            />
          </Field>
          <button
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#14213D] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1c2c52] md:mt-6"
          >
            <Plus size={16} />
            Update corridor
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-[#E2E6ED] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#E2E6ED] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            Show
            <select className="rounded-md border border-[#E2E6ED] bg-white px-2 py-1 text-[#14213D]">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            entries
          </div>
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search corridor"
              className="w-full rounded-lg border border-[#E2E6ED] bg-[#F5F7FA] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#14213D] focus:ring-2 focus:ring-[#14213D]/10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E2E6ED] text-xs uppercase tracking-wide text-[#94A3B8]">
                <Th>Ser. No.</Th>
                <Th>Corridor name</Th>
                <Th>Code</Th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-[#EFF2F6] last:border-0 ${i % 2 ? "bg-[#FAFBFC]" : "bg-white"
                    } hover:bg-[#F2A93B]/5`}
                >
                  <td className="px-5 py-3.5 text-[#94A3B8]">{c.id}</td>
                  <td className="px-5 py-3.5 font-medium text-[#14213D]">
                    {c.name || <span className="text-[#CBD5E1]">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {c.code ? (
                      <span
                        className="inline-flex rounded-md bg-[#14213D]/5 px-2 py-0.5 text-xs font-medium text-[#14213D]"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {c.code}
                      </span>
                    ) : (
                      <span className="text-[#CBD5E1]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E6ED] px-3 py-1.5 text-xs font-medium text-[#14213D] transition hover:border-[#F2A93B] hover:bg-[#F2A93B]/10">
                      <Pencil size={13} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#E2E6ED] p-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-[#94A3B8]">
            Showing 1 to {filtered.length} of {CORRIDORS.length + 3} entries
          </span>
          <div className="flex items-center gap-1.5">
            <PageBtn disabled>Previous</PageBtn>
            <PageBtn active onClick={() => setPage(1)}>1</PageBtn>
            <PageBtn onClick={() => setPage(2)}>2</PageBtn>
            <PageBtn>Next</PageBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-[#E2E6ED] bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${accent ? "text-[#F2A93B]" : "text-[#14213D]"
          }`}
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex-1">
      <label className="mb-1 block text-xs font-medium text-[#64748B]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-3">
      <span className="inline-flex items-center gap-1">
        {children}
        <ArrowUpDown size={11} className="text-[#CBD5E1]" />
      </span>
    </th>
  );
}

function PageBtn({ children, active, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${active
          ? "bg-[#14213D] text-white"
          : disabled
            ? "cursor-not-allowed text-[#CBD5E1]"
            : "border border-[#E2E6ED] text-[#14213D] hover:border-[#14213D]"
        }`}
    >
      {children}
    </button>
  );
}

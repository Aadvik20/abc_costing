import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, CheckCircle2, ChevronLeft, ChevronRight, Link2, Save, Search, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/* ---------- sample data (replace with your API) ---------- */
type Assignment = { id: number; unit: string; department: string }
type SortKey = "unit" | "department"

const UNITS = ["Ahmedabad", "Ambala", "DDU Junction", "Kolkata", "Meerut", "Mumbai South", "Prayagraj East", "Prayagraj West", "Tundla", "Vadodara",
  "Kanpur", "Sonnagar", "Rewari", "Palanpur", "Marwar", "Surat", "Jawaharlal Nehru Port"]
const DEPARTMENTS = ["SEMU", "Design", "Engineering", "S & T", "Electrical", "Store", "Common", "Mechanical", "Security", "Asset Usage Charges",
  "Civil", "HR", "Finance & Accounts", "Operations & BD", "Admin. Department", "Legal", "Vigilance", "IT"]

// every unit gets the first 16 departments -> 272 rows of placeholder data
const SEED: Assignment[] = UNITS.flatMap((unit, u) =>
  DEPARTMENTS.slice(0, 16).map((department, d) => ({ id: u * 16 + d + 1, unit, department })),
)

/* pagination: 1 2 3 4 5 … 28 */
function pageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total]
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total]
  return [1, "…", current - 1, current, current + 1, "…", total]
}

export default function UnitDepartments() {
  const [rows, setRows] = useState(SEED)
  const [unit, setUnit] = useState("")
  const [department, setDepartment] = useState("")
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [query, setQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "unit", dir: "asc" })
  const [deleting, setDeleting] = useState<Assignment | null>(null)

  // departments already assigned to the chosen unit are disabled in the dropdown
  const taken = useMemo(() => new Set(rows.filter((r) => r.unit === unit).map((r) => r.department)), [rows, unit])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? rows.filter((r) => r.unit.toLowerCase().includes(q) || r.department.toLowerCase().includes(q)) : rows
    return [...list].sort((a, b) => {
      const res = a[sort.key].localeCompare(b[sort.key], undefined, { numeric: true })
      return sort.dir === "asc" ? res : -res
    })
  }, [rows, query, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)

  const toggleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))
    setPage(1)
  }

  const save = () => {
    if (!unit || !department) return setMessage({ ok: false, text: "Select both a unit and a department." })
    if (taken.has(department)) return setMessage({ ok: false, text: `${department} is already assigned to ${unit}.` })
    setRows([...rows, { id: Math.max(0, ...rows.map((r) => r.id)) + 1, unit, department }])
    setMessage({ ok: true, text: `${department} assigned to ${unit}.` })
    setDepartment("")
  }

  const confirmDelete = () => {
    if (!deleting) return
    setRows(rows.filter((r) => r.id !== deleting.id))
    setMessage({ ok: true, text: `${deleting.department} removed from ${deleting.unit}.` })
    setDeleting(null)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_30rem_at_top_left,theme(colors.blue.100),transparent)] bg-slate-50 px-4 py-8 dark:bg-slate-950 dark:bg-none md:px-8">
      <div className="mx-auto max-w-full space-y-6">
        <header className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
            <Link2 className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">Assign Department to Unit</h1>
            <p className="text-sm text-muted-foreground">Manage and configure which departments belong to each unit</p>
          </div>
        </header>

        {/* assign bar */}
        <section className="rounded-2xl border border-white/60 border-l-4 border-l-blue-500 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <form onSubmit={(e) => { e.preventDefault(); save() }} className="flex flex-wrap items-center gap-3">
            <Select value={unit} onValueChange={(v) => { setUnit(v); setDepartment(""); setMessage(null) }}>
              <SelectTrigger aria-label="Unit" className="h-10 w-full bg-white sm:w-56 dark:bg-transparent"><SelectValue placeholder="Select unit" /></SelectTrigger>
              <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={department} onValueChange={(v) => { setDepartment(v); setMessage(null) }} disabled={!unit}>
              <SelectTrigger aria-label="Department" className="h-10 w-full bg-white sm:w-64 dark:bg-transparent"><SelectValue placeholder={unit ? "Select department" : "Select a unit first"} /></SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d} disabled={taken.has(d)}>{d}{taken.has(d) ? " (assigned)" : ""}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button type="submit" className="h-10 bg-blue-600 px-6 shadow-md shadow-blue-600/25 hover:bg-blue-700"><Save className="size-4" />Save</Button>
          </form>
          {message && (
            <p role="status" className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${message.ok ? "text-emerald-600" : "text-destructive"}`}>
              {message.ok && <CheckCircle2 className="size-4" />}{message.text}
            </p>
          )}
        </section>

        {/* table */}
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Show
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
                <SelectTrigger aria-label="Rows per page" className="h-9 w-[4.5rem]"><SelectValue /></SelectTrigger>
                <SelectContent>{[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
              </Select>
              entries
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search unit or department" className="h-9 pl-9" />
            </div>
          </div>

          <Table>
            <TableHeader className="bg-blue-50/80 dark:bg-blue-950/30">
              <TableRow>
                {([["unit", "Unit"], ["department", "Department"]] as [SortKey, string][]).map(([key, label]) => {
                  const active = sort.key === key
                  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown
                  return (
                    <TableHead key={key} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
                      <button onClick={() => toggleSort(key)} className="group flex items-center gap-1.5 font-semibold text-blue-800 dark:text-blue-300">
                        {label}<Icon className={`size-3.5 ${active ? "text-blue-600" : "opacity-40 group-hover:opacity-100"}`} />
                      </button>
                    </TableHead>
                  )
                })}
                <TableHead className="text-right font-semibold text-blue-800 dark:text-blue-300">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((r) => (
                <TableRow key={r.id} className="transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                  <TableCell className="font-semibold">{r.unit}</TableCell>
                  <TableCell className="font-medium">{r.department}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setDeleting(r)} className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="size-3.5" />Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow><TableCell colSpan={3} className="py-12 text-center text-muted-foreground">
                  {query ? `Nothing matches "${query}". Try a different search.` : "No departments assigned yet. Pick a unit and department above."}
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-blue-50/60 px-4 py-3 dark:bg-blue-950/20">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length ? start + 1 : 0} to {Math.min(start + pageSize, filtered.length)} of {filtered.length} entries
            </p>
            <nav className="flex flex-wrap items-center gap-1.5" aria-label="Pagination">
              <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft className="size-4" />Previous</Button>
              {pageList(current, totalPages).map((n, i) =>
                n === "…" ? (
                  <span key={`gap${i}`} className="px-1.5 text-muted-foreground">…</span>
                ) : (
                  <Button key={n} size="sm" variant={n === current ? "default" : "outline"} aria-current={n === current ? "page" : undefined}
                    className={n === current ? "bg-blue-600 hover:bg-blue-700" : ""} onClick={() => setPage(n)}>{n}</Button>
                ),
              )}
              <Button variant="outline" size="sm" disabled={current === totalPages} onClick={() => setPage(current + 1)}>Next<ChevronRight className="size-4" /></Button>
            </nav>
          </div>
        </section>
      </div>

      {/* delete confirmation */}
      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove this assignment?</DialogTitle>
            <DialogDescription>{deleting?.department} will no longer be assigned to {deleting?.unit}.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Keep it</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

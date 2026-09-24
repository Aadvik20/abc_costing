import { useMemo, useState } from "react"
import {
  ArrowDown, ArrowUp, ArrowUpDown, Building2, ChevronLeft, ChevronRight,
  Hash, Landmark, Pencil, Plus, Search, TrainFront,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

/* ---------- types & sample data (replace with your API) ---------- */
type Office = { id: number; name: string; unitCode: string; sapCode: string; corridor: string }
type SortKey = keyof Office
type Draft = Omit<Office, "id">

const CORRIDORS = ["EDFC", "WDFC"]

const SEED: Office[] = [
  ["Meerut", "MTC", "3010", "EDFC"], ["Prayagraj East", "PRE", "3020", "EDFC"],
  ["Prayagraj West", "PRW", "3030", "EDFC"], ["Tundla", "TDL", "3040", "EDFC"],
  ["Ambala", "UMB", "3050", "EDFC"], ["DDU Junction", "DDU", "3060", "EDFC"],
  ["Kolkata", "CCC", "3070", "EDFC"], ["Mumbai South", "MUS", "4010", "WDFC"],
  ["Vadodara", "BRC", "4020", "WDFC"], ["Ahmedabad", "ADI", "4040", "WDFC"],
  ["Kanpur", "CNB", "3080", "EDFC"], ["Sonnagar", "SEB", "3090", "EDFC"],
  ["Rewari", "RE", "4050", "WDFC"], ["Palanpur", "PNU", "4060", "WDFC"],
  ["Marwar", "MJ", "4070", "WDFC"], ["Surat", "ST", "4080", "WDFC"],
  ["Jawaharlal Nehru Port", "JNP", "4090", "WDFC"],
].map(([name, unitCode, sapCode, corridor], i) => ({ id: i + 1, name, unitCode, sapCode, corridor }))

const EMPTY: Draft = { name: "", unitCode: "", sapCode: "", corridor: "" }

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "id", label: "Ser. No." },
  { key: "name", label: "Project Office" },
  { key: "unitCode", label: "Unit Code" },
  { key: "sapCode", label: "SAP Profit Centre" },
  { key: "corridor", label: "Corridor" },
]

const corridorStyle: Record<string, string> = {
  EDFC: "bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 dark:text-indigo-300",
  WDFC: "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300",
}

/* ---------- page ---------- */
export default function ProjectOffice() {
  const [rows, setRows] = useState<Office[]>(SEED)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "id", dir: "asc" })
  const [editing, setEditing] = useState<Office | null>(null)

  /* search -> sort -> paginate */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? rows.filter((r) => [r.name, r.unitCode, r.sapCode, r.corridor].some((v) => v.toLowerCase().includes(q)))
      : rows
    return [...list].sort((a, b) => {
      const res = String(a[sort.key]).localeCompare(String(b[sort.key]), undefined, { numeric: true })
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

  /* validation shared by add + edit */
  const validate = (d: Draft, ignoreId?: number) => {
    if (!d.name.trim() || !d.unitCode.trim() || !d.sapCode.trim() || !d.corridor)
      return "Fill in all four fields, including the corridor."
    const dup = rows.find(
      (r) => r.id !== ignoreId && (r.unitCode.toLowerCase() === d.unitCode.trim().toLowerCase() || r.sapCode === d.sapCode.trim()),
    )
    return dup ? `Unit code or SAP profit centre already used by ${dup.name}.` : ""
  }

  const addOffice = () => {
    const msg = validate(draft)
    setError(msg)
    if (msg) return
    const id = Math.max(0, ...rows.map((r) => r.id)) + 1
    setRows([...rows, { id, ...draft, name: draft.name.trim(), unitCode: draft.unitCode.trim().toUpperCase(), sapCode: draft.sapCode.trim() }])
    setDraft(EMPTY)
    setSort({ key: "id", dir: "asc" })
    setPage(Math.ceil((rows.length + 1) / pageSize))
  }

  const saveEdit = () => {
    if (!editing) return
    const { id, ...d } = editing
    const msg = validate(d, id)
    setError(msg)
    if (msg) return
    setRows(rows.map((r) => (r.id === id ? { ...editing, unitCode: editing.unitCode.trim().toUpperCase() } : r)))
    setEditing(null)
  }

  const pageNumbers = useMemo(() => {
    const from = Math.max(1, Math.min(current - 2, totalPages - 4))
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => from + i)
  }, [current, totalPages])

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_30rem_at_top_left,theme(colors.blue.100),transparent)] bg-slate-50 px-4 py-8 dark:bg-slate-950 dark:bg-none md:px-8">
      <div className="mx-auto w-full space-y-6">
        {/* header */}
        <header className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
            <TrainFront className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">Project Office Master</h1>
            <p className="text-sm text-muted-foreground">Manage and configure project office master entries</p>
          </div>
        </header>

        {/* add form */}
        <section className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
          <form
            onSubmit={(e) => { e.preventDefault(); addOffice() }}
            className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_12rem_auto]"
          >
            <IconInput icon={<Building2 />} label="Project office" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <IconInput icon={<Landmark />} label="Unit code" value={draft.unitCode} onChange={(v) => setDraft({ ...draft, unitCode: v })} />
            <IconInput icon={<Hash />} label="SAP profit centre code" value={draft.sapCode} onChange={(v) => setDraft({ ...draft, sapCode: v })} />
            <Select value={draft.corridor} onValueChange={(v) => setDraft({ ...draft, corridor: v })}>
              <SelectTrigger aria-label="Corridor" className="h-10 bg-white dark:bg-transparent"><SelectValue placeholder="Select corridor" /></SelectTrigger>
              <SelectContent>{CORRIDORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Button type="submit" className="h-10 bg-blue-600 px-5 shadow-md shadow-blue-600/25 hover:bg-blue-700">
              <Plus className="size-4" /> Add project office
            </Button>
          </form>
          {error && !editing && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{error}</p>}
        </section>

        {/* table card */}
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
              <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search office, code or corridor" className="h-9 pl-9" />
            </div>
          </div>

          <Table>
            <TableHeader className="bg-blue-50/80 dark:bg-blue-950/30">
              <TableRow>
                {COLUMNS.map((c) => {
                  const active = sort.key === c.key
                  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown
                  return (
                    <TableHead key={c.key} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
                      <button onClick={() => toggleSort(c.key)} className="group flex items-center gap-1.5 font-semibold text-blue-800 dark:text-blue-300">
                        {c.label}
                        <Icon className={`size-3.5 ${active ? "text-blue-600" : "opacity-40 group-hover:opacity-100"}`} />
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
                  <TableCell className="text-muted-foreground">{r.id}</TableCell>
                  <TableCell className="font-semibold">{r.name}</TableCell>
                  <TableCell><code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold dark:bg-slate-800">{r.unitCode}</code></TableCell>
                  <TableCell className="tabular-nums">{r.sapCode}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 ring-1 ${corridorStyle[r.corridor] ?? ""}`}>{r.corridor}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => { setError(""); setEditing(r) }} className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50">
                      <Pencil className="size-3.5" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">No project offices match "{query}". Try a different search.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {/* footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-blue-50/60 px-4 py-3 dark:bg-blue-950/20">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length ? start + 1 : 0} to {Math.min(start + pageSize, filtered.length)} of {filtered.length} entries
            </p>
            <nav className="flex items-center gap-1.5" aria-label="Pagination">
              <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft className="size-4" />Previous</Button>
              {pageNumbers.map((n) => (
                <Button key={n} size="sm" variant={n === current ? "default" : "outline"} aria-current={n === current ? "page" : undefined}
                  className={n === current ? "bg-blue-600 hover:bg-blue-700" : ""} onClick={() => setPage(n)}>{n}</Button>
              ))}
              <Button variant="outline" size="sm" disabled={current === totalPages} onClick={() => setPage(current + 1)}>Next<ChevronRight className="size-4" /></Button>
            </nav>
          </div>
        </section>
      </div>

      {/* edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project office</DialogTitle>
            <DialogDescription>Update the details for {editing?.name}.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <Field label="Project office" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Unit code" value={editing.unitCode} onChange={(v) => setEditing({ ...editing, unitCode: v })} />
                <Field label="SAP profit centre" value={editing.sapCode} onChange={(v) => setEditing({ ...editing, sapCode: v })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Corridor</Label>
                <Select value={editing.corridor} onValueChange={(v) => setEditing({ ...editing, corridor: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CORRIDORS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} className="bg-blue-600 hover:bg-blue-700">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ---------- small helpers ---------- */
function IconInput({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:size-4">{icon}</span>
      <Input aria-label={label} placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 bg-white pl-9 dark:bg-transparent" />
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

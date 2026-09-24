import { useDeferredValue, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Download, Loader2, ReceiptText, RotateCcw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

/* ---------- sample data (replace with your API) ---------- */
type Txn = {
  id: number; corridor: string; project: string; department: string
  costElement: string; amount: number; date: string /* yyyy-mm-dd */; q: string
}
type SortKey = "corridor" | "project" | "department" | "costElement" | "amount" | "date"

const PROJECTS: Record<string, string[]> = {
  EDFC: ["Meerut", "Prayagraj East", "Prayagraj West", "Tundla", "Ambala", "DDU Junction", "Kolkata"],
  WDFC: ["Mumbai North", "Mumbai South", "Vadodara", "Ahmedabad", "Rewari", "Palanpur"],
}
const DEPARTMENTS = ["Mechanical", "Engineering", "Electrical", "S & T", "Store", "HR", "Finance & Accounts", "Operations & BD", "Civil", "Design"]
const GLS = ["61000310", "60000340", "60000120", "60000010", "60010110", "60010400", "60000090", "60000040", "60010010", "60010070", "68000010", "68000120"]

const inr = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (iso: string) => `${iso.slice(8)}-${iso.slice(5, 7)}-${iso.slice(0, 4)}`
const collator = new Intl.Collator(undefined, { numeric: true })

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 23,674 placeholder rows, generated once
const DATA: Txn[] = (() => {
  const r = rng(42), pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)], start = Date.UTC(2024, 3, 1)
  return Array.from({ length: 23674 }, (_, i) => {
    const corridor = r() < 0.45 ? "EDFC" : "WDFC"
    const project = pick(PROJECTS[corridor]), department = pick(DEPARTMENTS), costElement = pick(GLS)
    const amount = Math.round((r() < 0.03 ? -r() * 3000 : r() * 200000) * 100) / 100
    const date = new Date(start + Math.floor(r() * 426) * 864e5).toISOString().slice(0, 10)
    return { id: i + 1, corridor, project, department, costElement, amount, date,
      q: `${corridor} ${project} ${department} ${costElement} ${inr.format(amount)} ${fmtDate(date)}`.toLowerCase() }
  })
})()
const YEARS = [...new Set(DATA.map((d) => d.date.slice(0, 4)))].sort().reverse()

const COLUMNS: { key: SortKey; label: string; right?: boolean }[] = [
  { key: "corridor", label: "Corridor" }, { key: "project", label: "Project" }, { key: "department", label: "Department" },
  { key: "costElement", label: "Cost Element" }, { key: "amount", label: "Amount", right: true }, { key: "date", label: "Posting Date" },
]

const corridorStyle: Record<string, string> = {
  EDFC: "bg-indigo-500/10 text-indigo-700 ring-indigo-500/20 dark:text-indigo-300",
  WDFC: "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300",
}

/* pagination: 1 2 3 4 5 … 2368 */
function pageList(c: number, t: number): (number | "…")[] {
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  if (c <= 4) return [1, 2, 3, 4, 5, "…", t]
  if (c >= t - 3) return [1, "…", t - 4, t - 3, t - 2, t - 1, t]
  return [1, "…", c - 1, c, c + 1, "…", t]
}

export default function DailyTransactions() {
  const [corridor, setCorridor] = useState("all")
  const [department, setDepartment] = useState("all")
  const [year, setYear] = useState("all")
  const [query, setQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "corridor", dir: "asc" })
  const [exporting, setExporting] = useState(false)
  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase()
    const list = DATA.filter((r) =>
      (corridor === "all" || r.corridor === corridor) &&
      (department === "all" || r.department === department) &&
      (year === "all" || r.date.startsWith(year)) &&
      (!q || r.q.includes(q)))
    const dir = sort.dir === "asc" ? 1 : -1
    return list.sort((a, b) =>
      (sort.key === "amount" ? a.amount - b.amount : collator.compare(String(a[sort.key]), String(b[sort.key]))) * dir)
  }, [corridor, department, year, deferredQuery, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)
  const hasFilters = corridor !== "all" || department !== "all" || year !== "all" || query !== ""

  const change = (set: (v: string) => void) => (v: string) => { set(v); setPage(1) }
  const toggleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))
    setPage(1)
  }
  const reset = () => { setCorridor("all"); setDepartment("all"); setYear("all"); setQuery(""); setPage(1) }

  /* exports every filtered + sorted row, not just the current page (needs: npm i xlsx) */
  const downloadExcel = async () => {
    setExporting(true)
    try {
      const XLSX = await import("xlsx")
      const sheet = XLSX.utils.json_to_sheet(filtered.map((r) => ({
        Corridor: r.corridor, Project: r.project, Department: r.department,
        "Cost Element": r.costElement, Amount: r.amount, "Posting Date": fmtDate(r.date),
      })))
      sheet["!cols"] = [10, 20, 22, 14, 14, 14].map((wch) => ({ wch }))
      const book = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(book, sheet, "Daily Transactions")
      XLSX.writeFile(book, `daily-transactions-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_30rem_at_top_left,theme(colors.blue.100),transparent)] bg-slate-50 px-4 py-8 dark:bg-slate-950 dark:bg-none md:px-8">
      <div className="mx-auto max-w-full space-y-6">
        <header className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
            <ReceiptText className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">Daily Transactions</h1>
            <p className="text-sm text-muted-foreground">Manage and configure daily transactions entries</p>
          </div>
        </header>

        {/* filters */}
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-l-4 border-white/60 border-l-blue-500 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:border-l-blue-500 dark:bg-white/5">
          <Select value={corridor} onValueChange={change(setCorridor)}>
            <SelectTrigger aria-label="Corridor" className="h-10 w-full bg-white sm:w-44 dark:bg-transparent"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Corridors</SelectItem>{Object.keys(PROJECTS).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={department} onValueChange={change(setDepartment)}>
            <SelectTrigger aria-label="Department" className="h-10 w-full bg-white sm:w-56 dark:bg-transparent"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Departments</SelectItem>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={year} onValueChange={change(setYear)}>
            <SelectTrigger aria-label="Year" className="h-10 w-full bg-white sm:w-36 dark:bg-transparent"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Years</SelectItem>{YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          {hasFilters && <Button variant="ghost" onClick={reset} className="h-10"><RotateCcw className="size-4" />Reset</Button>}
          <Button onClick={downloadExcel} disabled={exporting || filtered.length === 0}
            className="h-10 w-full bg-gradient-to-r from-blue-600 to-sky-500 px-6 shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-sky-600 sm:ml-auto sm:w-auto">
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {exporting ? "Preparing…" : "Download Excel"}
          </Button>
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
              <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder="Search transactions" className="h-9 pl-9" />
            </div>
          </div>

          <Table>
            <TableHeader className="bg-blue-50/80 dark:bg-blue-950/30">
              <TableRow>
                {COLUMNS.map((c) => {
                  const active = sort.key === c.key
                  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown
                  return (
                    <TableHead key={c.key} className={c.right ? "text-right" : ""} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
                      <button onClick={() => toggleSort(c.key)} className={`group flex items-center gap-1.5 font-semibold text-blue-800 dark:text-blue-300 ${c.right ? "ml-auto" : ""}`}>
                        {c.label}<Icon className={`size-3.5 ${active ? "text-blue-600" : "opacity-40 group-hover:opacity-100"}`} />
                      </button>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((r) => (
                <TableRow key={r.id} className="transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                  <TableCell><Badge variant="outline" className={`border-0 ring-1 ${corridorStyle[r.corridor]}`}>{r.corridor}</Badge></TableCell>
                  <TableCell className="font-medium">{r.project}</TableCell>
                  <TableCell>{r.department}</TableCell>
                  <TableCell className="tabular-nums">{r.costElement}</TableCell>
                  <TableCell className={`text-right font-medium tabular-nums ${r.amount < 0 ? "text-red-600" : ""}`}>{inr.format(r.amount)}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">{fmtDate(r.date)}</TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  No transactions match these filters. <button onClick={reset} className="font-medium text-blue-600 underline-offset-4 hover:underline">Reset filters</button>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-blue-50/60 px-4 py-3 dark:bg-blue-950/20">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length ? (start + 1).toLocaleString("en-IN") : 0} to {Math.min(start + pageSize, filtered.length).toLocaleString("en-IN")} of {filtered.length.toLocaleString("en-IN")} entries
            </p>
            <nav className="flex flex-wrap items-center gap-1.5" aria-label="Pagination">
              <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft className="size-4" />Previous</Button>
              {pageList(current, totalPages).map((n, i) =>
                n === "…" ? <span key={`gap${i}`} className="px-1.5 text-muted-foreground">…</span> : (
                  <Button key={n} size="sm" variant={n === current ? "default" : "outline"} aria-current={n === current ? "page" : undefined}
                    className={n === current ? "bg-blue-600 hover:bg-blue-700" : ""} onClick={() => setPage(n)}>{n}</Button>
                ))}
              <Button variant="outline" size="sm" disabled={current === totalPages} onClick={() => setPage(current + 1)}>Next<ChevronRight className="size-4" /></Button>
            </nav>
          </div>
        </section>
      </div>
    </div>
  )
}

import { useMemo, useState } from "react"
import { AlignJustify, Download, FileBarChart2, Loader2, MousePointerClick } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

/* ---------- config & sample data (replace with your API) ---------- */
const UNITS = ["Corporate Office", "Ahmedabad", "Ambala", "DDU Junction", "Kolkata", "Meerut", "Mumbai North", "Mumbai South", "Prayagraj East", "Prayagraj West", "Tundla", "Vadodara"]

const COST_GROUPS = ["Depreciation & Amortization", "Employee Benefit Expenses", "Lease & Finance Charges", "Non Cost Expense", "Other Expenses", "Other Income", "Repair & Maintenance"]

// Template 1 matches your screenshot. Templates 2 and 3 are placeholders until you share their layouts.
const TEMPLATES = [
  {
    id: "t1", label: "Template 1", title: "Cost of Support Service Centres",
    departments: ["Admin. Department", "BOD", "Commercial", "Contracts", "Design", "Electrical", "Engineering", "Finance & Accounts", "HR", "IT", "Legal", "Mechanical", "Operations & BD", "Rajbhasha", "S & T", "Security", "SEMU", "Store", "Vigilance"],
  },
  { id: "t2", label: "Template 2", title: "Cost of Main Functional Departments", departments: ["Civil", "Electrical", "Engineering", "Mechanical", "Operations & BD", "S & T", "SEMU"] },
  { id: "t3", label: "Template 3", title: "Cost of Other Activities Cost Centres", departments: ["Board Secretariat", "Land & Planning", "Public Relations"] },
]

const inr = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const money = (n: number) => `₹ ${inr.format(n)}`
const fmtDate = (iso: string) => `${iso.slice(8)}-${iso.slice(5, 7)}-${iso.slice(0, 4)}`
const round2 = (n: number) => Math.round(n * 100) / 100

const hash = (s: string) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

type Report = { unit: string; from: string; to: string }
type Built = { title: string; rows: { name: string; values: number[]; total: number }[]; totals: number[]; grand: number }

/* stand-in for the API: same inputs always give the same numbers */
function build(t: (typeof TEMPLATES)[number], rep: Report): Built {
  const r = rng(hash(`${t.id}|${rep.unit}|${rep.from}|${rep.to}`))
  const chance = [0.15, 0.95, 0.1, 0.2, 0.9, 0.05, 0.3], scale = [4e6, 1.5e7, 1e7, 1e6, 3e6, 1e5, 2e5]
  const rows = t.departments.map((name) => {
    const values = COST_GROUPS.map((_, i) => {
      if (r() > chance[i]) return 0
      const v = round2(r() * scale[i])
      return r() < 0.08 ? -v : v
    })
    return { name, values, total: round2(values.reduce((a, b) => a + b, 0)) }
  })
  const totals = COST_GROUPS.map((_, i) => round2(rows.reduce((a, row) => a + row.values[i], 0)))
  return { title: t.title, rows, totals, grand: round2(totals.reduce((a, b) => a + b, 0)) }
}

/* ---------- page ---------- */
export default function ActivityBasedCosting() {
  const [unit, setUnit] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [tab, setTab] = useState("t1")

  const built = useMemo(() => (report ? TEMPLATES.map((t) => build(t, report)) : []), [report])

  const getData = () => {
    if (!unit) return setError("Select a unit.")
    if (!from || !to) return setError("Choose both a from date and a to date.")
    if (from > to) return setError("The from date must be on or before the to date.")
    setError("")
    setLoading(true)
    // replace with your API call, then setReport({ unit, from, to }) with the response
    setTimeout(() => { setReport({ unit, from, to }); setLoading(false) }, 500)
  }

  const downloadExcel = async () => {
    if (!report) return
    const idx = TEMPLATES.findIndex((t) => t.id === tab), b = built[idx]
    const XLSX = await import("xlsx")
    const sheet = XLSX.utils.aoa_to_sheet([
      [b.title], [`${report.unit} | ${fmtDate(report.from)} to ${fmtDate(report.to)}`], [],
      ["Department", ...COST_GROUPS, "Department Total"],
      ...b.rows.map((x) => [x.name, ...x.values, x.total]),
      ["Grand Total", ...b.totals, b.grand],
    ])
    sheet["!cols"] = [{ wch: 24 }, ...Array(COST_GROUPS.length + 1).fill({ wch: 20 })]
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, sheet, TEMPLATES[idx].label)
    XLSX.writeFile(book, `activity-based-costing-${TEMPLATES[idx].id}-${report.unit.replace(/\s+/g, "-").toLowerCase()}.xlsx`)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_30rem_at_top_left,theme(colors.blue.100),transparent)] bg-slate-50 px-4 py-8 dark:bg-slate-950 dark:bg-none md:px-8">
      <div className="mx-auto max-w-full space-y-6">
        <header className="flex flex-wrap items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
            <FileBarChart2 className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">Activity Based Costing</h1>
            <p className="text-sm text-muted-foreground">Department expense report</p>
          </div>
          {report && (
            <span className="ml-auto rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              Report Period: {fmtDate(report.from)} - {fmtDate(report.to)}
            </span>
          )}
        </header>

        {/* filters */}
        <section className="rounded-2xl border border-l-4 border-white/60 border-l-blue-500 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:border-l-blue-500 dark:bg-white/5">
          <form onSubmit={(e) => { e.preventDefault(); getData() }} className="flex flex-wrap items-center gap-3">
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger aria-label="Unit" className="h-10 w-full bg-white sm:w-60 dark:bg-transparent"><SelectValue placeholder="Select unit" /></SelectTrigger>
              <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
            <div className="w-full sm:w-52"><Input type="date" aria-label="From date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="h-10 bg-white dark:bg-transparent" /></div>
            <div className="w-full sm:w-52"><Input type="date" aria-label="To date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="h-10 bg-white dark:bg-transparent" /></div>
            <div className="flex w-full flex-wrap gap-3 sm:ml-auto sm:w-auto">
              <Button type="submit" disabled={loading} className="h-10 flex-1 bg-gradient-to-r from-blue-600 to-sky-500 px-6 shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-sky-600 sm:flex-none">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <AlignJustify className="size-4" />}Get Data
              </Button>
              <Button type="button" onClick={downloadExcel} disabled={!report || loading}
                className="h-10 flex-1 bg-gradient-to-r from-blue-600 to-sky-500 px-6 shadow-lg shadow-blue-600/30 hover:from-blue-700 hover:to-sky-600 sm:flex-none">
                <Download className="size-4" />Download Excel
              </Button>
            </div>
          </form>
          {error && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{error}</p>}
        </section>

        {/* templates */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b bg-transparent p-0">
            {TEMPLATES.map((t) => (
              <TabsTrigger key={t.id} value={t.id}
                className="-mb-px rounded-b-none rounded-t-lg border border-transparent px-4 py-2 text-blue-600 shadow-none data-[state=active]:border-border data-[state=active]:border-b-background data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TEMPLATES.map((t, i) => (
            <TabsContent key={t.id} value={t.id} className="mt-0">
              <div className="rounded-b-2xl border border-t-0 bg-white p-4 shadow-sm dark:bg-slate-900 md:p-5">
                {loading ? <Skeleton /> : report ? <ReportTable data={built[i]} /> : (
                  <div className="grid place-items-center gap-2 py-16 text-center text-muted-foreground">
                    <MousePointerClick className="size-8 text-blue-500/70" />
                    <p className="max-w-xs text-sm">Select a unit and a date range, then choose Get Data to see the report.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}

/* ---------- report table ---------- */
function ReportTable({ data }: { data: Built }) {
  const neg = (n: number) => (n < 0 ? "text-red-600" : "")
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{data.title}</h2>
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader className="bg-blue-50/80 dark:bg-blue-950/30">
            <TableRow>
              <TableHead className="sticky left-0 z-10 min-w-44 bg-blue-50 font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">Department</TableHead>
              {COST_GROUPS.map((c) => <TableHead key={c} className="min-w-36 whitespace-normal text-right font-semibold text-blue-800 dark:text-blue-300">{c}</TableHead>)}
              <TableHead className="min-w-40 text-right font-semibold text-blue-800 dark:text-blue-300">Department Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((r) => (
              <TableRow key={r.name} className="group hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                <TableCell className="sticky left-0 z-10 bg-white font-medium group-hover:bg-blue-50 dark:bg-slate-900 dark:group-hover:bg-blue-950">{r.name}</TableCell>
                {r.values.map((v, i) => <TableCell key={i} className={`text-right tabular-nums ${v === 0 ? "text-muted-foreground" : neg(v)}`}>{money(v)}</TableCell>)}
                <TableCell className={`text-right font-semibold tabular-nums ${neg(r.total)}`}>{money(r.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <tfoot>
            <TableRow className="border-t-2 border-blue-200 bg-blue-50 font-bold hover:bg-blue-50 dark:bg-blue-950/40">
              <TableCell className="sticky left-0 z-10 bg-blue-50 dark:bg-blue-950">Grand Total</TableCell>
              {data.totals.map((v, i) => <TableCell key={i} className={`text-right tabular-nums ${neg(v)}`}>{money(v)}</TableCell>)}
              <TableCell className="text-right tabular-nums text-blue-600 dark:text-blue-300">{money(data.grand)}</TableCell>
            </TableRow>
          </tfoot>
        </Table>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading report">
      <div className="h-6 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      {Array.from({ length: 7 }, (_, i) => <div key={i} className="h-9 animate-pulse rounded bg-slate-100 dark:bg-slate-800/60" />)}
    </div>
  )
}

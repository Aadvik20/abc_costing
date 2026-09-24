import { useState, type ReactNode } from "react"
import { Code2, LayoutGrid, Plus, Route } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable, type Column } from "@/components/DataTable"

/* ---------- sample data (replace with your API) ---------- */
type Corridor = { id: number; name: string; code: string }
type Draft = Omit<Corridor, "id">

// Ser. No. keeps the real ids, so gaps (4 -> 15) show like in your screenshot.
// The last three rows are placeholders to reach 13 entries.
const SEED: Corridor[] = [
  { id: 1, name: "Corporate Office", code: "20" }, { id: 2, name: "EDFC", code: "30" },
  { id: 3, name: "WDFC", code: "40" }, { id: 4, name: "HHI", code: "50" },
  { id: 15, name: "Abc", code: "fgv" }, { id: 16, name: "", code: "" },
  { id: 17, name: "", code: "" }, { id: 18, name: "", code: "" },
  { id: 19, name: "Corporate Office", code: "02" }, { id: 20, name: "xyz", code: "50" },
  { id: 21, name: "East Link", code: "60" }, { id: 22, name: "West Link", code: "70" },
  { id: 23, name: "North Link", code: "80" },
]

const blankCell = (v: string) => (v ? v : <span className="text-muted-foreground/60">—</span>)

const COLUMNS: Column<Corridor>[] = [
  { key: "id", label: "Ser. No.", value: (r) => r.id },
  { key: "name", label: "Corridor Name", value: (r) => r.name, render: (r) => blankCell(r.name) },
  { key: "code", label: "Code", value: (r) => r.code, render: (r) => blankCell(r.code) },
]

export default function CorridorMaster() {
  const [rows, setRows] = useState(SEED)
  const [draft, setDraft] = useState<Draft>({ name: "", code: "" })
  const [error, setError] = useState("")
  const [editing, setEditing] = useState<Corridor | null>(null)
  const [editError, setEditError] = useState("")

  // your data already has repeated names and codes, so only an identical name + code pair is blocked
  const validate = (d: Draft, id?: number) => {
    if (!d.name.trim() || !d.code.trim()) return "Enter both the corridor name and its code."
    const same = rows.some((r) => r.id !== id && r.name.toLowerCase() === d.name.trim().toLowerCase() && r.code.toLowerCase() === d.code.trim().toLowerCase())
    return same ? "A corridor with this name and code already exists." : ""
  }

  const add = () => {
    const msg = validate(draft)
    setError(msg)
    if (msg) return
    setRows([...rows, { id: Math.max(0, ...rows.map((r) => r.id)) + 1, name: draft.name.trim(), code: draft.code.trim() }])
    setDraft({ name: "", code: "" })
  }

  const save = () => {
    if (!editing) return
    const msg = validate(editing, editing.id)
    setEditError(msg)
    if (msg) return
    setRows(rows.map((r) => (r.id === editing.id ? { ...r, name: editing.name.trim(), code: editing.code.trim() } : r)))
    setEditing(null)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_30rem_at_top_left,theme(colors.blue.100),transparent)] bg-slate-50 px-4 py-8 dark:bg-slate-950 dark:bg-none md:px-8">
      <div className="mx-auto max-w-full space-y-6">
        <header className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
            <Route className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">Corridor Master</h1>
            <p className="text-sm text-muted-foreground">Manage and configure corridor entries</p>
          </div>
        </header>

        {/* add form */}
        <section className="rounded-2xl border border-l-4 border-white/60 border-l-blue-500 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:border-l-blue-500 dark:bg-white/5">
          <form onSubmit={(e) => { e.preventDefault(); add() }} className="flex flex-wrap items-center gap-3">
            <IconField icon={<LayoutGrid />} label="Corridor name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} />
            <IconField icon={<Code2 />} label="Code" value={draft.code} onChange={(v) => setDraft({ ...draft, code: v })} />
            <Button type="submit" className="h-10 bg-blue-600 px-6 shadow-md shadow-blue-600/25 hover:bg-blue-700"><Plus className="size-4" />Add corridor</Button>
          </form>
          {error && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{error}</p>}
        </section>

        <DataTable rows={rows} columns={COLUMNS} searchPlaceholder="Search corridors"
          onEdit={(r) => { setEditing(r); setEditError("") }} />
      </div>

      {/* edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit corridor</DialogTitle>
            <DialogDescription>Change the name or code and save.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4">
              <div className="grid gap-1.5"><Label>Corridor name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Code</Label><Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} /></div>
              {editError && <p role="alert" className="text-sm font-medium text-destructive">{editError}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} className="bg-blue-600 hover:bg-blue-700">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* input with a leading icon; width sits on the outer div because the Input component wraps itself in a w-full div */
function IconField({ icon, label, value, onChange }: { icon: ReactNode; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full sm:w-64">
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground [&>svg]:size-4">{icon}</span>
      <Input aria-label={label} placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 bg-white pl-9 dark:bg-transparent" />
    </div>
  )
}

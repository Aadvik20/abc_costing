import { useState, type ReactNode } from "react"
import { Boxes, Layers, Network, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTable, type Column } from "@/components/DataTable"

/* ---------- types & sample data (replace with your API) ---------- */
type DeptType = { id: number; name: string }
type Dept = { id: number; name: string; code: string; typeId: number }
type Values = Record<string, string>
type FieldDef = { key: string; label: string; kind?: "text" | "select"; options?: { value: string; label: string }[] }

const TYPES: DeptType[] = ["Main Functional Department", "Other Support Service Department", "Other Activities Cost Centres", "Other", "Corporate Office"]
  .map((name, i) => ({ id: i + 1, name }))

// [name, code, typeId] — first 10 rows come from your screenshot, the rest are placeholders
const DEPTS: Dept[] = ([
  ["SEMU", "010", 2], ["Design", "020", 2], ["Engineering", "030", 1], ["S & T", "040", 1], ["Electrical", "050", 1],
  ["Store", "060", 2], ["HR", "070", 2], ["Finance & Accounts", "080", 2], ["Operations & BD", "090", 1], ["Admin. Department", "110", 2],
  ["Civil", "100", 1], ["Mechanical", "120", 1], ["Legal", "130", 2], ["Vigilance", "140", 2], ["Safety", "150", 2],
  ["Security", "160", 2], ["IT", "170", 2], ["Land & Planning", "180", 1], ["Contracts", "190", 1], ["Commercial", "200", 1],
  ["Medical", "210", 2], ["Public Relations", "220", 5], ["Board Secretariat", "230", 5],
] as [string, string, number][]).map(([name, code, typeId], i) => ({ id: i + 1, name, code, typeId }))

const BADGES = [
  "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300",
  "bg-teal-500/10 text-teal-700 ring-teal-500/20 dark:text-teal-300",
  "bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-300",
  "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300",
  "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300",
]

/* ---------- page ---------- */
export default function DepartmentMaster() {
  const [types, setTypes] = useState(TYPES)
  const [depts, setDepts] = useState(DEPTS)
  const typeName = (id: number) => types.find((t) => t.id === id)?.name ?? "—"
  const nextId = (list: { id: number }[]) => Math.max(0, ...list.map((r) => r.id)) + 1

  /* Department Type */
  const typeFields: FieldDef[] = [{ key: "name", label: "Department type" }]
  const typeCols: Column<DeptType>[] = [
    { key: "id", label: "Ser. No.", value: (r) => r.id },
    { key: "name", label: "Department Type", value: (r) => r.name },
  ]
  const validateType = (v: Values, id?: number) => {
    if (!v.name.trim()) return "Enter a department type."
    return types.some((t) => t.id !== id && t.name.toLowerCase() === v.name.trim().toLowerCase()) ? "This department type already exists." : ""
  }

  /* Department */
  const deptFields: FieldDef[] = [
    { key: "name", label: "Department" },
    { key: "code", label: "Code" },
    { key: "typeId", label: "Department type", kind: "select", options: types.map((t) => ({ value: String(t.id), label: t.name })) },
  ]
  const deptCols: Column<Dept>[] = [
    { key: "id", label: "Ser. No.", value: (r) => r.id },
    { key: "name", label: "Department", value: (r) => r.name },
    { key: "code", label: "Code", value: (r) => r.code },
    {
      key: "typeId", label: "Department Type", value: (r) => typeName(r.typeId),
      render: (r) => <Badge variant="outline" className={`border-0 font-medium ring-1 ${BADGES[(r.typeId - 1) % BADGES.length]}`}>{typeName(r.typeId)}</Badge>,
    },
  ]
  const validateDept = (v: Values, id?: number) => {
    if (!v.name.trim() || !v.code.trim() || !v.typeId) return "Fill in the department, its code and the department type."
    return depts.some((d) => d.id !== id && d.code === v.code.trim()) ? "This code is already used by another department." : ""
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_30rem_at_top_left,theme(colors.blue.100),transparent)] bg-slate-50 px-4 py-8 dark:bg-slate-950 dark:bg-none md:px-8">
      <div className="mx-auto max-w-full space-y-8">
        <header className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
            <Network className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">Department Master</h1>
            <p className="text-sm text-muted-foreground">Manage and configure department master entries</p>
          </div>
        </header>

        <Section icon={<Layers />} title="Department Type">
          <Master<DeptType>
            rows={types} columns={typeCols} fields={typeFields} addLabel="Add"
            validate={validateType} searchPlaceholder="Search department types"
            toValues={(r) => ({ name: r.name })}
            onAdd={(v) => setTypes([...types, { id: nextId(types), name: v.name.trim() }])}
            onSave={(r, v) => setTypes(types.map((t) => (t.id === r.id ? { ...t, name: v.name.trim() } : t)))}
          />
        </Section>

        <Section icon={<Boxes />} title="Department">
          <Master<Dept>
            rows={depts} columns={deptCols} fields={deptFields} addLabel="Add"
            validate={validateDept} searchPlaceholder="Search departments"
            toValues={(r) => ({ name: r.name, code: r.code, typeId: String(r.typeId) })}
            onAdd={(v) => setDepts([...depts, { id: nextId(depts), name: v.name.trim(), code: v.code.trim(), typeId: Number(v.typeId) }])}
            onSave={(r, v) => setDepts(depts.map((d) => (d.id === r.id ? { ...d, name: v.name.trim(), code: v.code.trim(), typeId: Number(v.typeId) } : d)))}
          />
        </Section>
      </div>
    </div>
  )
}

/* ---------- section shell ---------- */
function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-white/80 shadow-sm backdrop-blur dark:bg-white/5">
      <h2 className="flex items-center gap-2.5 border-b bg-slate-50/80 px-5 py-3.5 text-lg font-semibold dark:bg-white/5 [&>svg]:size-5">
        <span className="text-blue-600 [&>svg]:size-5">{icon}</span>{title}
      </h2>
      <div className="space-y-4 p-4 md:p-5">{children}</div>
    </section>
  )
}

/* ---------- add bar + table + edit dialog for one master list ---------- */
type MasterProps<T extends { id: number }> = {
  rows: T[]; columns: Column<T>[]; fields: FieldDef[]; addLabel: string; searchPlaceholder: string
  validate: (v: Values, id?: number) => string
  toValues: (r: T) => Values
  onAdd: (v: Values) => void
  onSave: (row: T, v: Values) => void
}

function Master<T extends { id: number }>({ rows, columns, fields, addLabel, searchPlaceholder, validate, toValues, onAdd, onSave }: MasterProps<T>) {
  const blank = Object.fromEntries(fields.map((f) => [f.key, ""])) as Values
  const [draft, setDraft] = useState<Values>(blank)
  const [addError, setAddError] = useState("")
  const [editing, setEditing] = useState<T | null>(null)
  const [edit, setEdit] = useState<Values>(blank)
  const [editError, setEditError] = useState("")

  const submitAdd = () => {
    const msg = validate(draft)
    setAddError(msg)
    if (msg) return
    onAdd(draft)
    setDraft(blank)
  }
  const submitEdit = () => {
    if (!editing) return
    const msg = validate(edit, editing.id)
    setEditError(msg)
    if (msg) return
    onSave(editing, edit)
    setEditing(null)
  }

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); submitAdd() }}
        className="flex flex-wrap items-center gap-3 rounded-xl border-l-4 border-l-blue-500 bg-slate-50 p-4 dark:bg-white/5">
        {fields.map((f) => (
          <div key={f.key} className="w-full sm:w-64">
            <FieldInput def={f} value={draft[f.key]} onChange={(v) => setDraft({ ...draft, [f.key]: v })} bare />
          </div>
        ))}
        <Button type="submit" className="h-10 bg-blue-600 px-6 shadow-md shadow-blue-600/25 hover:bg-blue-700"><Plus className="size-4" />{addLabel}</Button>
        {addError && <p role="alert" className="w-full text-sm font-medium text-destructive">{addError}</p>}
      </form>

      <DataTable rows={rows} columns={columns} searchPlaceholder={searchPlaceholder}
        onEdit={(r) => { setEditing(r); setEdit(toValues(r)); setEditError("") }} />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit entry</DialogTitle>
            <DialogDescription>Change the details and save.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {fields.map((f) => <FieldInput key={f.key} def={f} value={edit[f.key] ?? ""} onChange={(v) => setEdit({ ...edit, [f.key]: v })} />)}
            {editError && <p role="alert" className="text-sm font-medium text-destructive">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={submitEdit} className="bg-blue-600 hover:bg-blue-700">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function FieldInput({ def, value, onChange, bare }: { def: FieldDef; value: string; onChange: (v: string) => void; bare?: boolean }) {
  const control =
    def.kind === "select" ? (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label={def.label} className="h-10 bg-white dark:bg-transparent"><SelectValue placeholder={`Select ${def.label.toLowerCase()}`} /></SelectTrigger>
        <SelectContent>{def.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    ) : (
      <Input aria-label={def.label} placeholder={bare ? def.label : undefined} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 bg-white dark:bg-transparent" />
    )
  return bare ? control : <div className="grid gap-1.5"><Label>{def.label}</Label>{control}</div>
}

import { useMemo, useState, type ReactNode } from "react"
import { Coins, Layers, Pencil, Plus, Save, Shapes, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DataTable, type Column } from "@/components/DataTable"

/* ---------- types & sample data (replace with your API) ---------- */
type Group = { id: number; name: string }
type Element = { id: number; gl: string; name: string; groupId: number }

const GROUPS: Group[] = [
  "Depreciation & Amortization", "Employee Benefit Expenses", "Lease & Finance Charges", "Non Cost Expense",
  "Other Expenses", "Other Income", "Repair & Maintenance Expenses", "New Cost Group 1",
].map((name, i) => ({ id: i + 1, name }))

// [SAP GL, cost element]. Group 1 comes from your screenshot; the rest are placeholders.
const PAIRS: [number, [string, string][]][] = [
  [1, [
    ["68000010", "Depreciation- Civil - Earth Works"], ["68000020", "Depreciation- Civil - Track Works"],
    ["68000030", "Dep- Civil - Other Engin Works-Platforms"], ["68000040", "Dep- Civil - Integrated Testing & Commissioning"],
    ["68000050", "Depreciation- Civil - Water Tank"], ["68000060", "Depreciation- Stations & Buildings"],
    ["68000070", "Dep- Formation"], ["68000080", "Dep- Permanent Way"], ["68000090", "Dep- Bridges - Important Bridges"],
    ["68000100", "Depreciation- Bridges - Major Bridges"], ["68000110", "Depreciation- Bridges - Minor Bridges"],
    ["68000120", "Dep- Bridges - RFO (Rail Flyover)"], ["68000130", "Dep- Bridges - ROB (Road Over Bridges)"],
    ["68000140", "Dep- Bridges - RUB (Road Under Bridges)"], ["68000150", "Dep- Electrical equipment OHE Materials"],
    ["68000160", "Dep- Electrical equipment PSI Materials"], ["68000170", "Dep- Electrical equipment Steel Struct"],
    ["68000180", "Dep- Electrical equipment Non-Traction"], ["68000190", "Dep- Signalling - Mech Signalling"],
    ["68000200", "Dep- Signalling - Electrical Signalling"], ["68000210", "Dep- Signalling - Electronic System"],
    ["68000220", "Depreciation- SCADA"], ["12", "123456"], ["60010560", "new gl"], ["30010030", "new"], ["30000060", "ssa"],
  ]],
  [2, [["61000010", "Salaries & Allowances"], ["61000020", "Provident Fund Contribution"], ["61000030", "Staff Welfare"]]],
  [3, [["65000010", "Lease Rent - Land"], ["65000020", "Interest on Borrowings"]]],
  [4, [["69000010", "Prior Period Adjustment"]]],
  [5, [["67000010", "Office Expenses"], ["67000020", "Travelling Expenses"]]],
  [6, [["70000010", "Interest Income"], ["70000020", "Miscellaneous Receipts"]]],
  [7, [["66000010", "R&M - Buildings"], ["66000020", "R&M - Vehicles"]]],
]
const ELEMENTS: Element[] = PAIRS.flatMap(([groupId, list]) => list.map(([gl, name]) => ({ id: 0, gl, name, groupId })))
  .map((e, i) => ({ ...e, id: i + 1 }))
const SAP_GLS = [...new Set(ELEMENTS.map((e) => e.gl))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

/* ---------- page ---------- */
export default function CostGroup() {
  const [groups, setGroups] = useState(GROUPS)
  const [elements, setElements] = useState(ELEMENTS)
  const [open, setOpen] = useState("1")

  /* cost group add / edit */
  const [groupName, setGroupName] = useState("")
  const [groupError, setGroupError] = useState("")
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [editName, setEditName] = useState("")
  const groupCols: Column<Group>[] = [
    { key: "id", label: "Ser. No.", value: (r) => r.id },
    { key: "name", label: "Cost Group", value: (r) => r.name },
  ]
  const nameTaken = (name: string, id?: number) => groups.some((g) => g.id !== id && g.name.toLowerCase() === name.trim().toLowerCase())

  const addGroup = () => {
    const msg = !groupName.trim() ? "Enter a cost group name." : nameTaken(groupName) ? "This cost group already exists." : ""
    setGroupError(msg)
    if (msg) return
    setGroups([...groups, { id: Math.max(0, ...groups.map((g) => g.id)) + 1, name: groupName.trim() }])
    setGroupName("")
  }
  const saveGroup = () => {
    if (!editingGroup) return
    const msg = !editName.trim() ? "Enter a cost group name." : nameTaken(editName, editingGroup.id) ? "This cost group already exists." : ""
    setGroupError(msg)
    if (msg) return
    setGroups(groups.map((g) => (g.id === editingGroup.id ? { ...g, name: editName.trim() } : g)))
    setEditingGroup(null)
  }

  /* cost group element add / update */
  const [form, setForm] = useState({ gl: "", name: "", groupId: "" })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [elError, setElError] = useState("")
  const byGroup = useMemo(() => {
    const map = new Map<number, Element[]>()
    elements.forEach((e) => map.set(e.groupId, [...(map.get(e.groupId) ?? []), e]))
    return map
  }, [elements])

  const resetForm = () => { setForm({ gl: "", name: "", groupId: "" }); setEditingId(null); setElError("") }

  const saveElement = () => {
    const gid = Number(form.groupId)
    if (!form.gl || !form.name.trim() || !gid) return setElError("Select a SAP GL and a cost group, and enter the cost element.")
    if (elements.some((e) => e.id !== editingId && e.groupId === gid && e.gl === form.gl))
      return setElError("This SAP GL is already in the selected cost group.")
    if (editingId) setElements(elements.map((e) => (e.id === editingId ? { ...e, gl: form.gl, name: form.name.trim(), groupId: gid } : e)))
    else setElements([...elements, { id: Math.max(0, ...elements.map((e) => e.id)) + 1, gl: form.gl, name: form.name.trim(), groupId: gid }])
    setOpen(String(gid))
    resetForm()
  }

  const editElement = (e: Element) => {
    setForm({ gl: e.gl, name: e.name, groupId: String(e.groupId) })
    setEditingId(e.id)
    setElError("")
    window.scrollTo({ top: document.getElementById("element-form")?.offsetTop ?? 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(60rem_30rem_at_top_left,theme(colors.blue.100),transparent)] bg-slate-50 px-4 py-8 dark:bg-slate-950 dark:bg-none md:px-8">
      <div className="mx-auto max-w-full space-y-8">
        <header className="flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30">
            <Coins className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-3xl">Cost Group Master</h1>
            <p className="text-sm text-muted-foreground">Manage and configure cost group master entries</p>
          </div>
        </header>

        {/* ---- cost group ---- */}
        <Section icon={<Layers />} title="Cost Group">
          <form onSubmit={(e) => { e.preventDefault(); addGroup() }} className="flex flex-wrap items-center gap-3 rounded-xl border-l-4 border-l-blue-500 bg-slate-50 p-4 dark:bg-white/5">
            <div className="w-full sm:w-72">
              <Input aria-label="Cost group name" placeholder="Cost group name" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="h-10 bg-white dark:bg-transparent" />
            </div>
            <Button type="submit" className="h-10 bg-blue-600 px-6 shadow-md shadow-blue-600/25 hover:bg-blue-700"><Plus className="size-4" />Add</Button>
            {groupError && !editingGroup && <p role="alert" className="w-full text-sm font-medium text-destructive">{groupError}</p>}
          </form>
          <DataTable rows={groups} columns={groupCols} searchPlaceholder="Search cost groups"
            onEdit={(g) => { setEditingGroup(g); setEditName(g.name); setGroupError("") }} />
        </Section>

        {/* ---- cost group element ---- */}
        <Section icon={<Shapes />} title="Cost Group Element">
          <div id="element-form" className="rounded-xl border-l-4 border-l-blue-500 bg-slate-50 p-4 dark:bg-white/5">
            <form onSubmit={(e) => { e.preventDefault(); saveElement() }} className="flex flex-wrap items-center gap-3">
              <Select value={form.gl} onValueChange={(v) => setForm({ ...form, gl: v })}>
                <SelectTrigger aria-label="SAP GL" className="h-10 w-full bg-white sm:w-48 dark:bg-transparent"><SelectValue placeholder="Select SAP GL" /></SelectTrigger>
                <SelectContent className="max-h-72">{SAP_GLS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
              <div className="w-full sm:w-72">
                <Input aria-label="Cost element" placeholder="Cost element" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 bg-white dark:bg-transparent" />
              </div>
              <Select value={form.groupId} onValueChange={(v) => setForm({ ...form, groupId: v })}>
                <SelectTrigger aria-label="Cost group" className="h-10 w-full bg-white sm:w-64 dark:bg-transparent"><SelectValue placeholder="Select cost group" /></SelectTrigger>
                <SelectContent>{groups.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button type="submit" className="h-10 bg-blue-600 px-6 shadow-md shadow-blue-600/25 hover:bg-blue-700">
                <Save className="size-4" />{editingId ? "Update" : "Add"}
              </Button>
              {editingId && <Button type="button" variant="ghost" onClick={resetForm}><X className="size-4" />Cancel edit</Button>}
            </form>
            {editingId && <p className="mt-3 text-sm text-blue-700 dark:text-blue-300">Editing an existing element. Change the fields and select Update.</p>}
            {elError && <p role="alert" className="mt-3 text-sm font-medium text-destructive">{elError}</p>}
          </div>

          <Accordion type="single" collapsible value={open} onValueChange={setOpen} className="space-y-2">
            {groups.map((g) => {
              const list = byGroup.get(g.id) ?? []
              return (
                <AccordionItem key={g.id} value={String(g.id)} className="overflow-hidden rounded-xl border bg-white dark:bg-slate-900">
                  <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline data-[state=open]:bg-blue-100/80 data-[state=open]:text-blue-900 dark:data-[state=open]:bg-blue-950/50 dark:data-[state=open]:text-blue-200">
                    <span className="flex items-center gap-2">{g.name}<Badge variant="secondary" className="font-normal">{list.length}</Badge></span>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <div className="max-h-[28rem] overflow-auto border-t">
                      <Table>
                        <TableHeader className="sticky top-0 z-10 bg-blue-50 dark:bg-blue-950">
                          <TableRow>
                            <TableHead className="font-semibold text-blue-800 dark:text-blue-300">SAP GL</TableHead>
                            <TableHead className="font-semibold text-blue-800 dark:text-blue-300">Cost Element</TableHead>
                            <TableHead className="text-right font-semibold text-blue-800 dark:text-blue-300">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {list.map((e) => (
                            <TableRow key={e.id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-950/20 ${e.id === editingId ? "bg-blue-50 dark:bg-blue-950/30" : ""}`}>
                              <TableCell className="tabular-nums">{e.gl}</TableCell>
                              <TableCell className="font-medium">{e.name}</TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="outline" onClick={() => editElement(e)} className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"><Pencil className="size-3.5" />Edit</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {list.length === 0 && <TableRow><TableCell colSpan={3} className="py-8 text-center text-muted-foreground">No cost elements yet. Add one using the form above.</TableCell></TableRow>}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </Section>
      </div>

      {/* edit cost group */}
      <Dialog open={!!editingGroup} onOpenChange={(o) => !o && setEditingGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit cost group</DialogTitle>
            <DialogDescription>Rename this cost group. Its cost elements stay attached.</DialogDescription>
          </DialogHeader>
          <Input aria-label="Cost group name" value={editName} onChange={(e) => setEditName(e.target.value)} />
          {groupError && <p role="alert" className="text-sm font-medium text-destructive">{groupError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingGroup(null)}>Cancel</Button>
            <Button onClick={saveGroup} className="bg-blue-600 hover:bg-blue-700">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-white/80 shadow-sm backdrop-blur dark:bg-white/5">
      <h2 className="flex items-center gap-2.5 border-b bg-slate-50/80 px-5 py-3.5 text-lg font-semibold dark:bg-white/5">
        <span className="text-blue-600 [&>svg]:size-5">{icon}</span>{title}
      </h2>
      <div className="space-y-4 p-4 md:p-5">{children}</div>
    </section>
  )
}

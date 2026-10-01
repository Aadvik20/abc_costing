import { useState, type ReactNode } from "react"
import { Boxes, Layers, Network, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "@/components/DataTable";
import DepartmentType from "./DepartmentType";
import InputField from "@/components/common/DepartmentTypeInputField";
import DepartmentInputField from "@/components/common/DepartmentInputField";
import Department from "./Department"






const BADGES = [
  "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300",
  "bg-teal-500/10 text-teal-700 ring-teal-500/20 dark:text-teal-300",
  "bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-300",
  "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300",
  "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300",
]

/* ---------- page ---------- */
export default function DepartmentMaster() {

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
          <InputField />
          <DepartmentType />
        </Section>

        <Section icon={<Boxes />} title="Department">
          <DepartmentInputField />
          <Department />
        </Section>
        {/* <Section icon={<Boxes />} title="Department">
          
        </Section> */}
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
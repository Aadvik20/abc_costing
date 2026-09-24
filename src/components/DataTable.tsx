import { useMemo, useState, type ReactNode } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Pencil, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type Column<T> = {
  key: string
  label: string
  /** plain value used for sorting and searching */
  value: (row: T) => string | number
  /** optional custom cell content */
  render?: (row: T) => ReactNode
}

type Props<T> = {
  rows: T[]
  columns: Column<T>[]
  onEdit: (row: T) => void
  searchPlaceholder?: string
}

export function DataTable<T extends { id: number }>({ rows, columns, onEdit, searchPlaceholder = "Search" }: Props<T>) {
  const [query, setQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({ key: columns[0].key, dir: "asc" as "asc" | "desc" })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const col = columns.find((c) => c.key === sort.key) ?? columns[0]
    const list = q ? rows.filter((r) => columns.some((c) => String(c.value(r)).toLowerCase().includes(q))) : rows
    return [...list].sort((a, b) => {
      const res = String(col.value(a)).localeCompare(String(col.value(b)), undefined, { numeric: true })
      return sort.dir === "asc" ? res : -res
    })
  }, [rows, columns, query, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * pageSize
  const visible = filtered.slice(start, start + pageSize)
  const from = Math.max(1, Math.min(current - 2, totalPages - 4))
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => from + i)

  const toggleSort = (key: string) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))
    setPage(1)
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white dark:bg-slate-900">
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
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} placeholder={searchPlaceholder} className="h-9 pl-9" />
        </div>
      </div>

      <Table>
        <TableHeader className="bg-blue-50/80 dark:bg-blue-950/30">
          <TableRow>
            {columns.map((c) => {
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
              {columns.map((c, i) => (
                <TableCell key={c.key} className={i === 0 ? "text-muted-foreground" : i === 1 ? "font-medium" : ""}>
                  {c.render ? c.render(r) : c.value(r)}
                </TableCell>
              ))}
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onEdit(r)} className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50">
                  <Pencil className="size-3.5" /> Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {visible.length === 0 && (
            <TableRow><TableCell colSpan={columns.length + 1} className="py-10 text-center text-muted-foreground">
              {query ? `Nothing matches "${query}". Try a different search.` : "No entries yet. Add one above."}
            </TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-blue-50/60 px-4 py-3 dark:bg-blue-950/20">
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length ? start + 1 : 0} to {Math.min(start + pageSize, filtered.length)} of {filtered.length} entries
        </p>
        <nav className="flex items-center gap-1.5" aria-label="Pagination">
          <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft className="size-4" />Previous</Button>
          {pages.map((n) => (
            <Button key={n} size="sm" variant={n === current ? "default" : "outline"} aria-current={n === current ? "page" : undefined}
              className={n === current ? "bg-blue-600 hover:bg-blue-700" : ""} onClick={() => setPage(n)}>{n}</Button>
          ))}
          <Button variant="outline" size="sm" disabled={current === totalPages} onClick={() => setPage(current + 1)}>Next<ChevronRight className="size-4" /></Button>
        </nav>
      </div>
    </div>
  )
}

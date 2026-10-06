import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, ShieldAlert, Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuditLog {
  id: string
  actorId: string
  actorRole: string
  action: string
  resourceType: string
  resourceId: string
  beforeState: Record<string, unknown> | null
  afterState: Record<string, unknown> | null
  reason: string | null
  createdAt: string
}

interface AuditLogListResponse {
  items: AuditLog[]
  total: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  OPERATIONS: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
}

const PAGE_SIZE = 25

function JsonCell({ value }: { value: Record<string, unknown> | null }) {
  const [open, setOpen] = useState(false)
  if (!value) return <span className="text-muted-foreground">—</span>
  return (
    <div>
      <button
        className="flex items-center gap-1 text-xs text-primary hover:underline"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRightIcon className="size-3" />}
        {Object.keys(value).length} field{Object.keys(value).length !== 1 ? "s" : ""}
      </button>
      {open && (
        <pre className="mt-1 max-w-xs overflow-auto rounded bg-muted p-2 text-xs">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminAuditLogsPage() {
  const [search, setSearch] = useState("")
  const [resourceType, setResourceType] = useState("")
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
  if (search) params.set("action", search)
  if (resourceType) params.set("resourceType", resourceType)

  const { data, isLoading, isError, refetch } = useQuery<AuditLogListResponse>({
    queryKey: ["admin-audit-logs", search, resourceType, page],
    queryFn: async () =>
      (await apiClient.get<AuditLogListResponse>(`/admin/audit-logs?${params}`)).data,
  })

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Audit Logs</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Append-only record of every sensitive action on the platform. Never edited or deleted.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by action (e.g. APPROVED, CREATED)…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          placeholder="Filter by resource type…"
          value={resourceType}
          onChange={(e) => { setResourceType(e.target.value); setPage(1) }}
          className="sm:w-52"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <p className="text-sm text-destructive">Failed to load audit logs.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-24 text-center">
          <ShieldAlert className="size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-foreground">No audit logs found</p>
          <p className="text-xs text-muted-foreground">Sensitive actions will appear here as they happen.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">When</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Action</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actor Role</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Resource</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Before</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">After</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-muted/20 align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-medium text-foreground">{log.action}</p>
                      {log.reason && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{log.reason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[log.actorRole] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-foreground">{log.resourceType}</p>
                      <p className="mt-0.5 max-w-[140px] truncate font-mono text-xs text-muted-foreground">
                        {log.resourceId}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <JsonCell value={log.beforeState} />
                    </td>
                    <td className="px-4 py-3">
                      <JsonCell value={log.afterState} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t px-4 py-2.5">
              <p className="text-xs text-muted-foreground">
                {data.total} event{data.total !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="size-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="size-7" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminAuditLogsPage

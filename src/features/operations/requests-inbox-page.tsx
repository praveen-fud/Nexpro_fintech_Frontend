import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle, ArrowRight, Hourglass, Inbox, Search, ShieldCheck, Wallet } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge, type KnownStatus } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { Stagger, StaggerItem } from "@/components/shared/motion"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { usePortal } from "@/lib/portal"
import { cn } from "@/lib/utils"

export interface InboxItem {
  kind: "FUNDING" | "KYC"
  id: string
  reference: string
  customerId: string
  customerName: string
  customerEmail: string
  title: string
  detail: string
  amount: number | string | null
  status: string
  needsAction: boolean
  submittedAt: string
  waitingMinutes: number
  flags: string[]
}

export interface InboxData {
  summary: { awaitingAction: number; fundingAwaiting: number; kycAwaiting: number; oldestWaitingMinutes: number }
  items: InboxItem[]
}

type KindFilter = "ALL" | "FUNDING" | "KYC"
type StateFilter = "NEEDS_ACTION" | "ALL" | "DONE"

const KIND_FILTERS: { key: KindFilter; label: string }[] = [
  { key: "ALL", label: "All types" },
  { key: "FUNDING", label: "Add money" },
  { key: "KYC", label: "KYC" },
]

const STATE_FILTERS: { key: StateFilter; label: string }[] = [
  { key: "NEEDS_ACTION", label: "Needs action" },
  { key: "DONE", label: "Completed" },
  { key: "ALL", label: "Everything" },
]

export function formatWaiting(minutes: number): string {
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m`
  return `${Math.floor(hours / 24)}d ${hours % 24}h`
}

/** Older open requests get louder so nothing quietly goes stale. */
export function waitingTone(item: Pick<InboxItem, "needsAction" | "waitingMinutes">): string {
  if (!item.needsAction) return "text-muted-foreground"
  if (item.waitingMinutes >= 24 * 60) return "font-semibold text-error"
  if (item.waitingMinutes >= 4 * 60) return "font-medium text-warning"
  return "text-foreground"
}

function Tile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: typeof Inbox
  tone: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={cn("flex size-8 items-center justify-center rounded-full", tone)}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="font-tabular mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

export function RequestsInboxPage() {
  const portal = usePortal()
  const [kind, setKind] = useState<KindFilter>("ALL")
  const [state, setState] = useState<StateFilter>("NEEDS_ACTION")
  const [search, setSearch] = useState("")

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["operations", "requests", kind, state, search],
    queryFn: async () =>
      (
        await apiClient.get<InboxData>("/operations/requests", {
          params: { kind, state, search: search || undefined },
        })
      ).data,
    refetchInterval: 30_000, // new customer requests show up without a manual reload
  })

  const link = (item: InboxItem) => (item.kind === "KYC" ? portal.kycDetail(item.id) : portal.fundingDetail(item.id))

  return (
    <Stagger>
      <StaggerItem>
        <PageHeader
          title="Requests"
          description="Everything customers have submitted for verification, oldest waiting first."
        />
      </StaggerItem>

      <StaggerItem className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
        ) : (
          <>
            <Tile
              label="Awaiting action"
              value={String(data.summary.awaitingAction)}
              icon={Inbox}
              tone="bg-primary/10 text-primary"
            />
            <Tile
              label="Add-money requests"
              value={String(data.summary.fundingAwaiting)}
              icon={Wallet}
              tone="bg-info-surface text-info"
            />
            <Tile
              label="KYC reviews"
              value={String(data.summary.kycAwaiting)}
              icon={ShieldCheck}
              tone="bg-success-surface text-success"
            />
            <Tile
              label="Longest waiting"
              value={data.summary.awaitingAction ? formatWaiting(data.summary.oldestWaitingMinutes) : "—"}
              icon={Hourglass}
              tone={
                data.summary.oldestWaitingMinutes >= 24 * 60
                  ? "bg-error-surface text-error"
                  : "bg-warning-surface text-warning"
              }
            />
          </>
        )}
      </StaggerItem>

      <StaggerItem className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 flex flex-wrap gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          {STATE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setState(f.key)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                state === f.key
                  ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
          <span className="mx-1 hidden h-6 w-px self-center bg-border lg:block" />
          {KIND_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setKind(f.key)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                kind === f.key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, email, mobile, ID, UTR"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </StaggerItem>

      {isLoading && <Skeleton className="h-72 w-full rounded-lg" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.items.length === 0 && (
        <EmptyState
          icon={Inbox}
          title={state === "NEEDS_ACTION" ? "You're all caught up" : "No requests found"}
          description={
            state === "NEEDS_ACTION" ? "No customer requests are waiting for review." : "Nothing matches the current filters."
          }
        />
      )}

      {data && data.items.length > 0 && (
        <StaggerItem className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs font-medium text-muted-foreground uppercase">
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Checks</th>
                <th className="px-4 py-3">Waiting</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((item) => (
                <tr key={`${item.kind}-${item.id}`} className="group transition-colors hover:bg-primary/[0.03]">
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      {item.kind === "KYC" ? (
                        <ShieldCheck className="size-4 text-success" />
                      ) : (
                        <Wallet className="size-4 text-info" />
                      )}
                      {item.title}
                    </p>
                    <p className="font-tabular mt-0.5 text-xs text-muted-foreground">
                      {item.reference} · {item.detail}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{item.customerName}</p>
                    <p className="text-xs text-muted-foreground">{item.customerEmail}</p>
                  </td>
                  <td className="font-tabular px-4 py-3 font-medium text-foreground">
                    {item.amount != null ? formatCurrency(Number(item.amount)) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status as KnownStatus} />
                  </td>
                  <td className="px-4 py-3">
                    {item.flags.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {item.flags.map((flag) => (
                          <span
                            key={flag}
                            className="inline-flex items-center gap-1 rounded-full bg-warning-surface px-2 py-0.5 text-xs font-medium text-warning"
                          >
                            <AlertTriangle className="size-3" />
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className={cn("font-tabular", waitingTone(item))}>
                      {item.needsAction ? formatWaiting(item.waitingMinutes) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(item.submittedAt)}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={link(item)}
                      className="inline-flex items-center gap-1 font-medium text-primary transition-all group-hover:gap-1.5 hover:underline"
                    >
                      {item.needsAction ? "Review" : "View"}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </StaggerItem>
      )}
    </Stagger>
  )
}

export default RequestsInboxPage

import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, CheckCircle2, ShieldCheck, Wallet } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  formatWaiting,
  waitingTone,
  type InboxData,
} from "@/features/operations/requests-inbox-page"

/**
 * Dashboard widget: the oldest requests still waiting for a decision, each one
 * clickable straight into its review page. `base` keeps links inside the
 * portal (operations or admin) the widget is shown in.
 */
export function PendingRequestsCard({ base }: { base: "/operations" | "/admin" }) {
  const { data, isLoading } = useQuery({
    queryKey: ["operations", "requests", "widget"],
    queryFn: async () =>
      (
        await apiClient.get<InboxData>("/operations/requests", { params: { state: "NEEDS_ACTION", limit: 6 } })
      ).data,
    refetchInterval: 30_000,
  })

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Requests awaiting review</p>
          {data && (
            <p className="text-xs text-muted-foreground">
              {data.summary.awaitingAction} open · {data.summary.fundingAwaiting} add-money ·{" "}
              {data.summary.kycAwaiting} KYC
            </p>
          )}
        </div>
        <Link
          to={`${base}/requests`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {isLoading && <Skeleton className="h-40 w-full" />}

      {data && data.items.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
          <CheckCircle2 className="size-8 text-success" />
          All caught up — nothing is waiting.
        </div>
      )}

      {data && data.items.length > 0 && (
        <ul className="divide-y divide-border">
          {data.items.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <Link
                to={item.kind === "KYC" ? `${base}/kyc/${item.id}` : `${base}/funding/${item.id}`}
                className="flex items-center gap-3 py-2.5 transition-colors hover:bg-primary/[0.03]"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  {item.kind === "KYC" ? (
                    <ShieldCheck className="size-4 text-success" />
                  ) : (
                    <Wallet className="size-4 text-info" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{item.customerName}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.title}
                    {item.amount != null && ` · ${formatCurrency(Number(item.amount))}`}
                  </span>
                </span>
                {item.flags.length > 0 && (
                  <span className="hidden shrink-0 rounded-full bg-warning-surface px-2 py-0.5 text-xs font-medium text-warning sm:inline">
                    {item.flags[0]}
                  </span>
                )}
                <span className={cn("font-tabular shrink-0 text-xs", waitingTone(item))}>
                  {formatWaiting(item.waitingMinutes)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

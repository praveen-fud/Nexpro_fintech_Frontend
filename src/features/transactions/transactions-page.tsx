import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Inbox } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { Stagger, StaggerItem } from "@/components/shared/motion"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/format"
import { routes } from "@/lib/routes"
import type { Transaction } from "@/types/domain"

type FilterKey = "ALL" | "FUNDING" | "PAYMENT" | "REFUND" | "PENDING" | "COMPLETED" | "FAILED"

const filters: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "FUNDING", label: "Funding" },
  { key: "PAYMENT", label: "Payments" },
  { key: "REFUND", label: "Refunds" },
  { key: "PENDING", label: "Pending" },
  { key: "COMPLETED", label: "Completed" },
  { key: "FAILED", label: "Failed" },
]

function filterToParams(filter: FilterKey) {
  if (filter === "FUNDING" || filter === "PAYMENT" || filter === "REFUND") return { type: filter }
  if (filter === "PENDING" || filter === "COMPLETED" || filter === "FAILED") return { status: filter }
  return {}
}

export function TransactionsPage() {
  const [filter, setFilter] = useState<FilterKey>("ALL")

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["transactions", filter],
    queryFn: async () =>
      (await apiClient.get<Transaction[]>("/transactions", { params: filterToParams(filter) })).data,
  })

  return (
    <Stagger>
      <StaggerItem>
        <PageHeader title="Transactions" description="A complete history of your funding and payment activity." />
      </StaggerItem>

      <StaggerItem className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
              filter === f.key
                ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </StaggerItem>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {data && data.length === 0 && (
        <EmptyState
          icon={Inbox}
          title="No transactions yet"
          description="Once you add money to your wallet, your funding history will appear here."
        />
      )}

      {data && data.length > 0 && (
        <StaggerItem>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card shadow-sm">
            {data.map((tx) => (
              <li key={tx.id}>
                <Link
                  to={routes.app.transaction(tx.id)}
                  className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="font-tabular mt-0.5 text-xs text-muted-foreground">
                      {tx.transactionNumber} · {formatDate(tx.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={cn(
                        "font-tabular text-sm font-semibold",
                        tx.type === "FUNDING" || tx.type === "REFUND" ? "text-success" : "text-foreground"
                      )}
                    >
                      {tx.type === "PAYMENT" ? "-" : "+"}
                      {formatCurrency(tx.amount)}
                    </span>
                    <StatusBadge status={tx.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </StaggerItem>
      )}
    </Stagger>
  )
}

export default TransactionsPage

import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Headset } from "lucide-react"
import { FlowLayout } from "@/layouts/flow-layout"
import { StatusBadge } from "@/components/shared/status-badge"
import { Timeline, type TimelineItem } from "@/components/shared/timeline"
import { ErrorState } from "@/components/shared/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { routes } from "@/lib/routes"
import type { Transaction } from "@/types/domain"

function buildTimeline(tx: Transaction): TimelineItem[] {
  if (tx.status === "FAILED") {
    return [
      { id: "created", label: "Transaction Created", timestamp: tx.createdAt, status: "complete" },
      { id: "failed", label: "Failed", timestamp: tx.updatedAt, status: "rejected" },
    ]
  }
  return [
    { id: "created", label: "Transaction Created", timestamp: tx.createdAt, status: "complete" },
    {
      id: "completed",
      label: "Completed",
      timestamp: tx.status === "COMPLETED" ? tx.updatedAt : undefined,
      status: tx.status === "COMPLETED" ? "complete" : "current",
    },
  ]
}

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: tx, isLoading, isError, refetch } = useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => (await apiClient.get<Transaction>(`/transactions/${id}`)).data,
    enabled: !!id,
  })

  return (
    <FlowLayout title="Transaction Detail" closeTo={routes.app.transactions} maxWidthClassName="max-w-lg">
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {tx && (
        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-5 text-center">
            <p className="text-xs text-muted-foreground">{tx.transactionNumber}</p>
            <p className="font-tabular mt-1 text-3xl font-semibold text-foreground">{formatCurrency(tx.amount)}</p>
            <div className="mt-3 flex justify-center">
              <StatusBadge status={tx.status} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 text-sm">
            <dl className="space-y-2.5">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium text-foreground">{tx.type}</dd>
              </div>
              {tx.method && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Funding Method</dt>
                  <dd className="font-medium text-foreground">{tx.method.replace("_", " ")}</dd>
                </div>
              )}
              {tx.fee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Fee</dt>
                  <dd className="font-tabular font-medium text-foreground">{formatCurrency(tx.fee)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Reference</dt>
                <dd className="font-tabular font-medium text-foreground">{tx.reference}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium text-foreground">{formatDateTime(tx.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="font-medium text-foreground">{formatDateTime(tx.updatedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="mb-5 text-sm font-semibold text-foreground">Timeline</p>
            <Timeline items={buildTimeline(tx)} />
          </div>

          <Button variant="outline" className="w-full" asChild>
            <a href={routes.app.support}>
              <Headset className="size-4" />
              Need help with this transaction?
            </a>
          </Button>
        </div>
      )}
    </FlowLayout>
  )
}

export default TransactionDetailPage

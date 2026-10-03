import { useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Headset } from "lucide-react"
import { FlowLayout } from "@/layouts/flow-layout"
import { FundingSummary } from "@/components/shared/funding-summary"
import { StatusBadge } from "@/components/shared/status-badge"
import { Timeline, type TimelineItem } from "@/components/shared/timeline"
import { ErrorState } from "@/components/shared/error-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { formatDateTime } from "@/lib/format"
import { routes } from "@/lib/routes"
import type { FundingRequest } from "@/types/domain"

const METHOD_LABEL: Record<FundingRequest["method"], string> = {
  CREDIT_CARD: "Credit Card",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
}

function buildTimeline(request: FundingRequest): TimelineItem[] {
  const created: TimelineItem = { id: "created", label: "Request Created", timestamp: request.createdAt, status: "complete" }

  if (request.status === "REJECTED") {
    return [
      created,
      { id: "review", label: "Operations Review", status: "complete" },
      { id: "rejected", label: "Rejected", timestamp: request.updatedAt, status: "rejected" },
    ]
  }

  if (request.status === "ADDITIONAL_INFORMATION_REQUIRED") {
    return [
      created,
      { id: "info", label: "Additional Information Required", timestamp: request.updatedAt, status: "current" },
      { id: "approved", label: "Approved", status: "upcoming" },
    ]
  }

  if (request.status === "CANCELLED" || request.status === "FAILED") {
    return [
      created,
      { id: "closed", label: request.status === "CANCELLED" ? "Cancelled" : "Failed", timestamp: request.updatedAt, status: "rejected" },
    ]
  }

  return [
    created,
    {
      id: "evidence",
      label: "Payment Evidence Received",
      status: "complete",
    },
    {
      id: "review",
      label: "Operations Review",
      status: request.status === "UNDER_REVIEW" || request.status === "PENDING" ? "current" : "complete",
    },
    {
      id: "approved",
      label: "Approved",
      status: request.status === "APPROVED" ? "complete" : "upcoming",
      timestamp: request.status === "APPROVED" ? request.updatedAt : undefined,
    },
    {
      id: "credited",
      label: "Wallet Credited",
      status: request.status === "APPROVED" ? "complete" : "upcoming",
    },
  ]
}

export function FundingRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const previousStatus = useRef<string | null>(null)

  const { data: request, isLoading, isError, refetch } = useQuery({
    queryKey: ["funding-request", id],
    queryFn: async () => (await apiClient.get<FundingRequest>(`/funding-requests/${id}`)).data,
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      const terminal = status === "APPROVED" || status === "REJECTED" || status === "CANCELLED" || status === "FAILED"
      return terminal ? false : 5000
    },
  })

  useEffect(() => {
    if (request && previousStatus.current && previousStatus.current !== "APPROVED" && request.status === "APPROVED") {
      navigate(routes.app.fundingRequestSuccess(request.id), { replace: true })
    }
    if (request) previousStatus.current = request.status
  }, [request, navigate])

  return (
    <FlowLayout title="Funding Request" closeTo={routes.app.transactions} maxWidthClassName="max-w-lg">
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
        </div>
      )}
      {isError && <ErrorState onRetry={() => refetch()} />}

      {request && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Request</p>
              <p className="font-tabular text-sm font-medium text-foreground">{request.requestNumber}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <FundingSummary requestedAmount={request.requestedAmount} fee={request.fee} walletCredit={request.walletCredit} />

          <div className="rounded-lg border border-border bg-card p-5 text-sm">
            <dl className="space-y-2.5">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Method</dt>
                <dd className="font-medium text-foreground">{METHOD_LABEL[request.method]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Reference</dt>
                <dd className="font-tabular font-medium text-foreground">{request.reference}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium text-foreground">{formatDateTime(request.createdAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="mb-5 text-sm font-semibold text-foreground">Timeline</p>
            <Timeline items={buildTimeline(request)} />
          </div>

          {request.status === "REJECTED" && (
            <Button variant="outline" className="w-full" asChild>
              <a href={routes.app.support}>
                <Headset className="size-4" />
                Contact Support
              </a>
            </Button>
          )}
        </div>
      )}
    </FlowLayout>
  )
}

export default FundingRequestDetailPage

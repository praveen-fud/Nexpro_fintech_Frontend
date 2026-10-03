import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Search, Inbox, ArrowRight } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { Stagger, StaggerItem } from "@/components/shared/motion"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { routes } from "@/lib/routes"
import type { FundingRequest, FundingStatus } from "@/types/domain"

type FilterKey = "ALL" | FundingStatus

const filters: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "UNDER_REVIEW", label: "Under Review" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "ADDITIONAL_INFORMATION_REQUIRED", label: "Information Required" },
]

const METHOD_LABEL: Record<FundingRequest["method"], string> = {
  CREDIT_CARD: "Credit Card",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
}

export function FundingQueuePage() {
  const [filter, setFilter] = useState<FilterKey>("ALL")
  const [search, setSearch] = useState("")

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["operations", "funding-queue", filter, search],
    queryFn: async () =>
      (
        await apiClient.get<FundingRequest[]>("/operations/funding-requests", {
          params: { status: filter === "ALL" ? undefined : filter, search: search || undefined },
        })
      ).data,
  })

  return (
    <Stagger>
      <StaggerItem>
        <PageHeader title="Funding Requests" description="Review and act on customer funding requests." />
      </StaggerItem>

      <StaggerItem className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
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
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 transition-shadow focus-visible:shadow-sm"
            placeholder="Search ID, name, mobile, email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </StaggerItem>

      {isLoading && <Skeleton className="h-72 w-full rounded-lg" />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.length === 0 && (
        <EmptyState icon={Inbox} title="No funding requests" description="Nothing matches the current filters." />
      )}

      {data && data.length > 0 && (
        <StaggerItem className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full min-w-[840px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs font-medium text-muted-foreground uppercase">
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((request) => (
                <tr key={request.id} className="group transition-colors hover:bg-primary/[0.03]">
                  <td className="font-tabular px-4 py-3 text-foreground">{request.requestNumber}</td>
                  <td className="px-4 py-3 text-foreground">{request.customerName}</td>
                  <td className="font-tabular px-4 py-3 font-medium text-foreground">
                    {formatCurrency(request.requestedAmount)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{METHOD_LABEL[request.method]}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(request.createdAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{request.assignedTo ?? "Unassigned"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={routes.operations.fundingDetail(request.id)}
                      className="inline-flex items-center gap-1 font-medium text-primary transition-all group-hover:gap-1.5 hover:underline"
                    >
                      Review
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

export default FundingQueuePage

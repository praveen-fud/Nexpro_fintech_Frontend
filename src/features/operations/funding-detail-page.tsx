import { useState } from "react"
import { useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { FundingSummary } from "@/components/shared/funding-summary"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiClient, ApiError } from "@/lib/api-client"
import { formatCurrency, formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { FundingRequest } from "@/types/domain"

interface ChecklistItem {
  key: string
  label: string
  result: "pass" | "fail" | "warning"
  detail?: string
}

interface FundingDetail extends FundingRequest {
  customer: { fullName: string; email: string; mobileNumber: string; kycStatus: string; customerSince: string }
  checklist: ChecklistItem[]
}

const METHOD_LABEL: Record<FundingRequest["method"], string> = {
  CREDIT_CARD: "Credit Card",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const config = {
    pass: { icon: CheckCircle2, className: "text-success" },
    fail: { icon: XCircle, className: "text-error" },
    warning: { icon: AlertTriangle, className: "text-warning" },
  }[item.result]

  return (
    <li className="flex items-start gap-2.5 py-2.5">
      <config.icon className={cn("mt-0.5 size-4 shrink-0", config.className)} />
      <div>
        <p className="text-sm font-medium text-foreground">{item.label}</p>
        {item.detail && <p className="text-xs text-muted-foreground">{item.detail}</p>}
      </div>
    </li>
  )
}

export function FundingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [infoMessage, setInfoMessage] = useState("")

  const { data: request, isLoading, isError, refetch } = useQuery({
    queryKey: ["operations", "funding-request", id],
    queryFn: async () => (await apiClient.get<FundingDetail>(`/operations/funding-requests/${id}`)).data,
    enabled: !!id,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["operations", "funding-request", id] })
    queryClient.invalidateQueries({ queryKey: ["operations", "funding-queue"] })
  }

  const approve = useMutation({
    mutationFn: async () =>
      apiClient.post(
        `/operations/funding-requests/${id}/approve`,
        {},
        { headers: { "Idempotency-Key": crypto.randomUUID() } }
      ),
    onSuccess: () => {
      toast.success("Funding request approved and wallet credited")
      setApproveOpen(false)
      invalidate()
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not approve this request.")
    },
  })

  const reject = useMutation({
    mutationFn: async () => apiClient.post(`/operations/funding-requests/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success("Funding request rejected")
      setRejectOpen(false)
      setReason("")
      invalidate()
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not reject this request.")
    },
  })

  const requestInfo = useMutation({
    mutationFn: async () =>
      apiClient.post(`/operations/funding-requests/${id}/request-information`, { message: infoMessage }),
    onSuccess: () => {
      toast.success("Information request sent to customer")
      setInfoOpen(false)
      setInfoMessage("")
      invalidate()
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not send this request.")
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !request) {
    return <ErrorState onRetry={() => refetch()} />
  }

  const isActionable = request.status === "PENDING" || request.status === "UNDER_REVIEW"

  return (
    <div>
      <PageHeader
        title={`Funding Request ${request.requestNumber}`}
        description={`Submitted ${formatDateTime(request.createdAt)}`}
        actions={<StatusBadge status={request.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-[280px_1fr_280px]">
        <div className="space-y-4 lg:order-1">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-foreground">Customer</p>
            <dl className="space-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Full Name</dt>
                <dd className="font-medium text-foreground">{request.customer.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-medium text-foreground">{request.customer.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Mobile</dt>
                <dd className="font-medium text-foreground">{request.customer.mobileNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">KYC Status</dt>
                <dd>
                  <StatusBadge status={request.customer.kycStatus} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Customer Since</dt>
                <dd className="font-medium text-foreground">{formatDateTime(request.customer.customerSince)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4 lg:order-2">
          <FundingSummary requestedAmount={request.requestedAmount} fee={request.fee} walletCredit={request.walletCredit} />
          <div className="rounded-lg border border-border bg-card p-5 text-sm shadow-sm">
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
                <dt className="text-muted-foreground">Payment Status</dt>
                <dd className="font-medium text-foreground">{request.paymentStatus.replace(/_/g, " ")}</dd>
              </div>
            </dl>
          </div>

          {!isActionable && (
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              This request is {request.status.toLowerCase().replace(/_/g, " ")} and no longer requires action.
            </div>
          )}
        </div>

        <div className="space-y-4 lg:order-3">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="mb-1 text-sm font-semibold text-foreground">Verification Checklist</p>
            <ul className="divide-y divide-border">
              {request.checklist.map((item) => (
                <ChecklistRow key={item.key} item={item} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      {isActionable && (
        <div className="sticky bottom-0 mt-6 -mx-4 flex flex-col gap-2 border-t border-border bg-card px-4 py-4 sm:flex-row sm:justify-end lg:-mx-6 lg:px-6">
          <Button variant="outline" className="text-error hover:bg-error-surface hover:text-error" onClick={() => setRejectOpen(true)}>
            <X className="size-4" />
            Reject
          </Button>
          <Button variant="outline" onClick={() => setInfoOpen(true)}>
            <FileText className="size-4" />
            Request Information
          </Button>
          <Button onClick={() => setApproveOpen(true)}>
            <Check className="size-4" />
            Approve &amp; Credit Wallet
          </Button>
        </div>
      )}

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve &amp; credit wallet?</DialogTitle>
            <DialogDescription>Review the details before this is applied to the customer's wallet.</DialogDescription>
          </DialogHeader>
          <dl className="space-y-2 rounded-md border border-border bg-muted/40 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Customer</dt>
              <dd className="font-medium text-foreground">{request.customer.fullName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Request ID</dt>
              <dd className="font-tabular font-medium text-foreground">{request.requestNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Funding Method</dt>
              <dd className="font-medium text-foreground">{METHOD_LABEL[request.method]}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Requested Amount</dt>
              <dd className="font-tabular font-medium text-foreground">{formatCurrency(request.requestedAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-foreground">Wallet Credit</dt>
              <dd className="font-tabular font-semibold text-success">{formatCurrency(request.walletCredit)}</dd>
            </div>
          </dl>
          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning-surface p-3 text-xs text-warning">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            This action will create a wallet ledger entry and will be recorded in the audit log.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => approve.mutate()} disabled={approve.isPending}>
              {approve.isPending && <Loader2 className="size-4 animate-spin" />}
              Approve &amp; Credit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject funding request</DialogTitle>
            <DialogDescription>The customer will see this reason on their request timeline.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!reason || reject.isPending}
              onClick={() => reject.mutate()}
            >
              {reject.isPending && <Loader2 className="size-4 animate-spin" />}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request additional information</DialogTitle>
            <DialogDescription>Tell the customer exactly what's needed to continue the review.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="What do you need from the customer?"
            value={infoMessage}
            onChange={(e) => setInfoMessage(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoOpen(false)}>
              Cancel
            </Button>
            <Button disabled={!infoMessage || requestInfo.isPending} onClick={() => requestInfo.mutate()}>
              {requestInfo.isPending && <Loader2 className="size-4 animate-spin" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FundingDetailPage

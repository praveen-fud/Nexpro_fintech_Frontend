import { useState } from "react"
import { useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Check, Eye, FileText, Loader2, ShieldAlert, X } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/shared/empty-state"
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
import { formatDateTime } from "@/lib/format"
import type { KycProfile } from "@/types/domain"

interface KycReviewDetail extends KycProfile {
  customer: { fullName: string; email: string; mobileNumber: string; customerSince: string }
}

export function KycDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [infoMessage, setInfoMessage] = useState("")

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["operations", "kyc-profile", id],
    queryFn: async () => (await apiClient.get<KycReviewDetail>(`/operations/kyc-profiles/${id}`)).data,
    enabled: !!id,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["operations", "kyc-profile", id] })
    queryClient.invalidateQueries({ queryKey: ["operations", "kyc-queue"] })
  }

  const approve = useMutation({
    mutationFn: async () =>
      apiClient.post(
        `/operations/kyc-profiles/${id}/approve`,
        {},
        { headers: { "Idempotency-Key": crypto.randomUUID() } }
      ),
    onSuccess: () => {
      toast.success("KYC approved — the customer can now fund their wallet")
      setApproveOpen(false)
      invalidate()
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not approve this profile.")
    },
  })

  const reject = useMutation({
    mutationFn: async () => apiClient.post(`/operations/kyc-profiles/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success("KYC rejected")
      setRejectOpen(false)
      setReason("")
      invalidate()
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not reject this profile.")
    },
  })

  const [viewingDocId, setViewingDocId] = useState<string | null>(null)

  const viewDocument = async (documentId: string) => {
    setViewingDocId(documentId)
    try {
      const res = await apiClient.get(`/operations/kyc-profiles/${id}/documents/${documentId}`, {
        responseType: "blob",
      })
      const url = URL.createObjectURL(res.data as Blob)
      window.open(url, "_blank", "noopener,noreferrer")
      // Revoke once the new tab has had time to load it — it holds its own
      // reference after that, so this doesn't break the preview.
      setTimeout(() => URL.revokeObjectURL(url), 30_000)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not load this document.")
    } finally {
      setViewingDocId(null)
    }
  }

  const requestInfo = useMutation({
    mutationFn: async () =>
      apiClient.post(`/operations/kyc-profiles/${id}/request-information`, { message: infoMessage }),
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

  if (isError || !profile) {
    return <ErrorState onRetry={() => refetch()} />
  }

  const isActionable = profile.status === "UNDER_REVIEW"

  return (
    <div>
      <PageHeader
        title={profile.customer.fullName}
        description={profile.submittedAt ? `Submitted ${formatDateTime(profile.submittedAt)}` : "Not yet submitted"}
        actions={<StatusBadge status={profile.status} />}
      />

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4 lg:order-1">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-foreground">Customer</p>
            <dl className="space-y-2.5 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Full Name</dt>
                <dd className="font-medium text-foreground">{profile.customer.fullName}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-medium text-foreground">{profile.customer.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Mobile</dt>
                <dd className="font-medium text-foreground">{profile.customer.mobileNumber}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Customer Since</dt>
                <dd className="font-medium text-foreground">{formatDateTime(profile.customer.customerSince)}</dd>
              </div>
            </dl>
          </div>

          {!isActionable && (
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              This profile is {profile.status.toLowerCase().replace(/_/g, " ")} and no longer requires action.
            </div>
          )}

          {profile.reviewNotes && (
            <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase">Last Review Note</p>
              <p className="mt-1 text-foreground">{profile.reviewNotes}</p>
            </div>
          )}
        </div>

        <div className="space-y-4 lg:order-2">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-foreground">Personal Information</p>
            {profile.personalInfo ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Date of Birth</dt>
                  <dd className="font-medium text-foreground">{profile.personalInfo.dateOfBirth}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">PIN Code</dt>
                  <dd className="font-medium text-foreground">{profile.personalInfo.pinCode}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Address</dt>
                  <dd className="font-medium text-foreground">
                    {profile.personalInfo.address}, {profile.personalInfo.city}, {profile.personalInfo.state}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Not provided.</p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-foreground">Bank Details</p>
            {profile.bankAccount ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Account Holder</dt>
                  <dd className="font-medium text-foreground">{profile.bankAccount.accountHolderName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">IFSC</dt>
                  <dd className="font-tabular font-medium text-foreground">{profile.bankAccount.ifsc}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Account Number</dt>
                  <dd className="font-tabular font-medium text-foreground">{profile.bankAccount.accountNumberMasked}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">Not provided.</p>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-foreground">Submitted Documents</p>
            {profile.documents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No documents yet"
                description="Documents will appear here once submitted."
                className="border-none p-0 py-6"
              />
            ) : (
              <ul className="space-y-2">
                {profile.documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm text-foreground">{doc.fileName}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={doc.status} />
                      <button
                        type="button"
                        onClick={() => viewDocument(doc.id)}
                        disabled={viewingDocId === doc.id}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                      >
                        {viewingDocId === doc.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
            Approve
          </Button>
        </div>
      )}

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve this KYC profile?</DialogTitle>
            <DialogDescription>The customer will immediately be able to fund their wallet.</DialogDescription>
          </DialogHeader>
          <dl className="space-y-2 rounded-md border border-border bg-muted/40 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Customer</dt>
              <dd className="font-medium text-foreground">{profile.customer.fullName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium text-foreground">{profile.customer.email}</dd>
            </div>
          </dl>
          <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning-surface p-3 text-xs text-warning">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            This action unlocks wallet funding for this customer and will be recorded in the audit log.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => approve.mutate()} disabled={approve.isPending}>
              {approve.isPending && <Loader2 className="size-4 animate-spin" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this KYC profile</DialogTitle>
            <DialogDescription>The customer will see this reason and can resubmit.</DialogDescription>
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
              Reject Profile
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

export default KycDetailPage

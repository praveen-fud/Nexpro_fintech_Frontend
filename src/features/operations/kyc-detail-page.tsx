import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Check,
  FileText,
  FileImage,
  FileBadge,
  Loader2,
  ShieldAlert,
  X,
  ChevronLeft,
  Eye,
  ZoomIn,
  ZoomOut,
  MessageSquarePlus,
  User,
  CreditCard,
  MapPin,
  Building2,
} from "lucide-react"
import { StatusBadge } from "@/components/shared/status-badge"
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
import { usePortal } from "@/lib/portal"
import { apiClient, ApiError } from "@/lib/api-client"
import { formatDateTime } from "@/lib/format"
import type { KycProfile } from "@/types/domain"

interface KycReviewDetail extends KycProfile {
  customer: { fullName: string; email: string; mobileNumber: string; customerSince: string }
}

// ── Document type helpers ──────────────────────────────────────────────────────

function isImage(fileName: string) {
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(fileName)
}

function DocTypeIcon({ fileName }: { fileName: string }) {
  if (isImage(fileName)) return <FileImage className="size-4 shrink-0 text-blue-500" />
  if (/\.pdf$/i.test(fileName)) return <FileBadge className="size-4 shrink-0 text-red-500" />
  return <FileText className="size-4 shrink-0 text-muted-foreground" />
}

function docTypeLabel(fileName: string) {
  const ext = fileName.split(".").pop()?.toUpperCase() ?? "FILE"
  return ext
}

// ── In-page document viewer ────────────────────────────────────────────────────

interface DocumentViewerProps {
  open: boolean
  onClose: () => void
  fileName: string
  blobUrl: string | null
  loading: boolean
}

function DocumentViewer({ open, onClose, fileName, blobUrl, loading }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1)
  const showImage = blobUrl && isImage(fileName)
  const showPdf = blobUrl && /\.pdf$/i.test(fileName)

  function handleClose() {
    setZoom(1)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent showCloseButton={false} className="flex max-h-[92vh] w-full max-w-4xl flex-col gap-0 overflow-hidden p-0">
        {/* Toolbar */}
        <div className="flex shrink-0 items-center justify-between border-b bg-card px-4 py-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <DocTypeIcon fileName={fileName} />
            <span className="truncate text-sm font-medium text-foreground">{fileName}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {showImage && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="size-4" />
                </Button>
                <span className="w-12 text-center text-xs text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="size-4" />
                </Button>
                <div className="mx-1 h-4 w-px bg-border" />
              </>
            )}
            <Button variant="ghost" size="icon" className="size-8" onClick={handleClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-muted/30">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading document…</p>
              </div>
            </div>
          ) : showImage ? (
            <div className="flex min-h-64 items-center justify-center p-4">
              <img
                src={blobUrl}
                alt={fileName}
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                className="max-w-full rounded-md object-contain shadow-md transition-transform duration-150"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          ) : showPdf ? (
            <iframe
              src={blobUrl}
              title={fileName}
              className="h-[70vh] w-full border-0"
            />
          ) : blobUrl ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <FileText className="size-12 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Info card section wrapper ─────────────────────────────────────────────────

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
          <Icon className="size-3.5 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function KycDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const portal = usePortal()
  const queryClient = useQueryClient()

  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [infoMessage, setInfoMessage] = useState("")

  // Document viewer state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerFile, setViewerFile] = useState("")
  const [viewerBlobUrl, setViewerBlobUrl] = useState<string | null>(null)
  const [viewerLoading, setViewerLoading] = useState(false)
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null)

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["operations", "kyc-profile", id],
    queryFn: async () => (await apiClient.get<KycReviewDetail>(`/operations/kyc-profiles/${id}`)).data,
    enabled: !!id,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["operations", "kyc-profile", id] })
    queryClient.invalidateQueries({ queryKey: ["operations", "kyc-queue"] })
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

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
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Could not approve this profile."),
  })

  const reject = useMutation({
    mutationFn: async () => apiClient.post(`/operations/kyc-profiles/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success("KYC rejected")
      setRejectOpen(false)
      setReason("")
      invalidate()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Could not reject this profile."),
  })

  const requestInfo = useMutation({
    mutationFn: async () =>
      apiClient.post(`/operations/kyc-profiles/${id}/request-information`, { message: infoMessage }),
    onSuccess: () => {
      toast.success("Information request sent to customer")
      setInfoOpen(false)
      setInfoMessage("")
      invalidate()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Could not send this request."),
  })

  // ── Document viewer ────────────────────────────────────────────────────────

  function closeViewer() {
    setViewerOpen(false)
    if (viewerBlobUrl) {
      URL.revokeObjectURL(viewerBlobUrl)
      setViewerBlobUrl(null)
    }
    setViewerFile("")
  }

  async function openDocument(documentId: string, fileName: string) {
    setLoadingDocId(documentId)
    setViewerFile(fileName)
    setViewerBlobUrl(null)
    setViewerLoading(true)
    setViewerOpen(true)

    try {
      const res = await apiClient.get(
        `/operations/kyc-profiles/${id}/documents/${documentId}`,
        { responseType: "blob" }
      )
      const url = URL.createObjectURL(res.data as Blob)
      setViewerBlobUrl(url)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not load this document.")
      setViewerOpen(false)
    } finally {
      setViewerLoading(false)
      setLoadingDocId(null)
    }
  }

  // ── Loading / error states ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-64 rounded-xl" />
          <div className="space-y-5">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return <ErrorState onRetry={() => refetch()} />
  }

  const isActionable = profile.status === "UNDER_REVIEW"

  const statusColorMap: Record<string, string> = {
    APPROVED: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300",
    REJECTED: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
    UNDER_REVIEW: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
    ADDITIONAL_INFORMATION_REQUIRED: "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300",
    SUBMITTED: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
  }

  return (
    <div className="pb-24">
      {/* Back navigation */}
      <button
        onClick={() => navigate(portal.kycQueue)}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to KYC Queue
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{profile.customer.fullName}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {profile.submittedAt
              ? `Submitted ${formatDateTime(profile.submittedAt)}`
              : "Not yet submitted"}
          </p>
        </div>
        <StatusBadge status={profile.status} />
      </div>

      {/* Status notice for non-actionable states */}
      {!isActionable && (
        <div className={`mb-5 rounded-lg border px-4 py-3 text-sm font-medium ${statusColorMap[profile.status] ?? "bg-muted/40 border-border text-muted-foreground"}`}>
          This profile is <strong>{profile.status.replace(/_/g, " ").toLowerCase()}</strong> — no further action required.
          {profile.reviewNotes && (
            <p className="mt-1 font-normal opacity-80">{profile.reviewNotes}</p>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <Section icon={User} title="Customer">
            <dl className="space-y-3 text-sm">
              {[
                { label: "Full Name", value: profile.customer.fullName },
                { label: "Email", value: profile.customer.email },
                { label: "Mobile", value: profile.customer.mobileNumber },
                { label: "Customer Since", value: formatDateTime(profile.customer.customerSince) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {/* Documents */}
          <Section icon={FileText} title={`Documents (${profile.documents.length})`}>
            {profile.documents.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No documents submitted.</p>
            ) : (
              <ul className="space-y-2">
                {profile.documents.map((doc) => (
                  <li key={doc.id}>
                    <button
                      type="button"
                      onClick={() => openDocument(doc.id, doc.fileName)}
                      disabled={loadingDocId === doc.id}
                      className="group flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm disabled:cursor-wait disabled:opacity-60"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <DocTypeIcon fileName={doc.fileName} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">{docTypeLabel(doc.fileName)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge status={doc.status} />
                        {loadingDocId === doc.id ? (
                          <Loader2 className="size-4 animate-spin text-primary" />
                        ) : (
                          <Eye className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        {/* ── Right column ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <Section icon={MapPin} title="Personal Information">
            {profile.personalInfo ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Date of Birth</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{profile.personalInfo.dateOfBirth}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">PIN Code</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{profile.personalInfo.pinCode}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">City</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{profile.personalInfo.city}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">State</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{profile.personalInfo.state}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Address</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{profile.personalInfo.address}</dd>
                </div>
              </dl>
            ) : (
              <p className="py-2 text-sm text-muted-foreground">Personal information not provided.</p>
            )}
          </Section>

          <Section icon={Building2} title="Bank Details">
            {profile.bankAccount ? (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Account Holder</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{profile.bankAccount.accountHolderName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Account Number</dt>
                  <dd className="mt-0.5 font-mono text-sm font-medium text-foreground">{profile.bankAccount.accountNumberMasked}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Bank</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{profile.bankAccount.bankName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">IFSC</dt>
                  <dd className="mt-0.5 font-mono text-sm font-medium text-foreground">{profile.bankAccount.ifsc}</dd>
                </div>
              </dl>
            ) : (
              <p className="py-2 text-sm text-muted-foreground">Bank details not provided.</p>
            )}
          </Section>

          {profile.reviewNotes && (
            <Section icon={CreditCard} title="Review Notes">
              <p className="text-sm leading-relaxed text-foreground">{profile.reviewNotes}</p>
            </Section>
          )}
        </div>
      </div>

      {/* ── Sticky action bar ──────────────────────────────────────────────── */}
      {isActionable && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-sm lg:left-64">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <p className="hidden text-sm text-muted-foreground sm:block">
              Reviewing <span className="font-medium text-foreground">{profile.customer.fullName}</span>
            </p>
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <Button
                variant="outline"
                className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive"
                onClick={() => setRejectOpen(true)}
              >
                <X className="size-4" />
                Reject
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => setInfoOpen(true)}
              >
                <MessageSquarePlus className="size-4" />
                <span className="hidden sm:inline">Request Info</span>
              </Button>
              <Button
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setApproveOpen(true)}
              >
                <Check className="size-4" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── In-page document viewer ────────────────────────────────────────── */}
      <DocumentViewer
        open={viewerOpen}
        onClose={closeViewer}
        fileName={viewerFile}
        blobUrl={viewerBlobUrl}
        loading={viewerLoading}
      />

      {/* ── Approve dialog ─────────────────────────────────────────────────── */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve KYC Profile?</DialogTitle>
            <DialogDescription>
              The customer will immediately be able to fund their wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Customer</dt>
                <dd className="font-medium text-foreground">{profile.customer.fullName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium text-foreground">{profile.customer.email}</dd>
              </div>
            </dl>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            This action unlocks wallet funding for this customer and is recorded in the audit log. It cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              onClick={() => approve.mutate()}
              disabled={approve.isPending}
            >
              {approve.isPending && <Loader2 className="size-4 animate-spin" />}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject dialog ──────────────────────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject KYC Profile</DialogTitle>
            <DialogDescription>
              The customer will see this reason and may resubmit after addressing it.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Explain clearly what the customer needs to fix…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || reject.isPending}
              onClick={() => reject.mutate()}
              className="gap-2"
            >
              {reject.isPending && <Loader2 className="size-4 animate-spin" />}
              Reject Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Request information dialog ─────────────────────────────────────── */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Additional Information</DialogTitle>
            <DialogDescription>
              Tell the customer exactly what is needed to proceed with their review.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. Please upload a clearer copy of your PAN card…"
            value={infoMessage}
            onChange={(e) => setInfoMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setInfoOpen(false)}>Cancel</Button>
            <Button
              disabled={!infoMessage.trim() || requestInfo.isPending}
              onClick={() => requestInfo.mutate()}
              className="gap-2"
            >
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

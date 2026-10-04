import { Link } from "react-router-dom"
import { AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { routes } from "@/lib/routes"
import type { KycStatus } from "@/types/domain"

// Word-for-word consistent with KycStatusPage's NEXT_ACTION map, so a
// customer sees the same message whether they're glancing at the
// dashboard or looking at the full verification status page.
const NEXT_ACTION: Record<KycStatus, string> = {
  NOT_STARTED: "Start your verification to unlock funding.",
  SUBMITTED: "We've received your documents and will begin review shortly.",
  UNDER_REVIEW: "Our Operations team is reviewing your documents. This usually takes 1–2 business days.",
  ADDITIONAL_INFORMATION_REQUIRED: "Please review the note below and resubmit the requested information.",
  APPROVED: "You're fully verified.",
  REJECTED: "Your verification was not approved.",
}

const ACTIONABLE: Partial<Record<KycStatus, string>> = {
  NOT_STARTED: "Start Verification",
  ADDITIONAL_INFORMATION_REQUIRED: "Update Information",
  REJECTED: "Resubmit",
}

export function KycStatusBanner({ status, reviewNotes }: { status: KycStatus; reviewNotes?: string }) {
  if (status === "APPROVED") return null

  const isActionable = status in ACTIONABLE
  const tone = isActionable
    ? "surface-tint-error border-error/20"
    : "surface-tint-info border-info/20"
  const iconTone = isActionable ? "bg-error text-white" : "bg-info text-white"

  return (
    <div className={`relative overflow-hidden rounded-[20px] border p-5 ${tone}`}>
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-full shadow-sm ${iconTone}`}>
            {isActionable ? <AlertTriangle className="size-4" /> : <Clock className="size-4" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Identity Verification</p>
              <StatusBadge status={status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{NEXT_ACTION[status]}</p>
            {reviewNotes && <p className="mt-1 text-sm text-foreground">"{reviewNotes}"</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isActionable && (
            <Button size="sm" asChild>
              <Link to={routes.app.kyc}>{ACTIONABLE[status]}</Link>
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <Link to={routes.app.kycStatus}>View details</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

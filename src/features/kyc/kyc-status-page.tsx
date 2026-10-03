import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { FileText } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Timeline, type TimelineItem } from "@/components/shared/timeline"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient } from "@/lib/api-client"
import { formatDate } from "@/lib/format"
import { routes } from "@/lib/routes"
import type { KycProfile } from "@/types/domain"

function buildTimeline(profile: KycProfile): TimelineItem[] {
  const base: TimelineItem[] = [
    {
      id: "submitted",
      label: "KYC Submitted",
      timestamp: profile.submittedAt,
      status: "complete",
    },
  ]

  if (profile.status === "REJECTED") {
    base.push({ id: "review", label: "Operations Review", status: "complete" })
    base.push({ id: "rejected", label: "Rejected", description: profile.reviewNotes, status: "rejected" })
    return base
  }

  if (profile.status === "ADDITIONAL_INFORMATION_REQUIRED") {
    base.push({
      id: "info",
      label: "Additional Information Required",
      description: profile.reviewNotes,
      status: "current",
    })
    base.push({ id: "approved", label: "Approved", status: "upcoming" })
    return base
  }

  base.push({
    id: "review",
    label: "Operations Review",
    status: profile.status === "UNDER_REVIEW" ? "current" : "complete",
  })
  base.push({
    id: "approved",
    label: "Approved",
    status: profile.status === "APPROVED" ? "complete" : "upcoming",
  })
  return base
}

const NEXT_ACTION: Record<KycProfile["status"], string> = {
  NOT_STARTED: "Start your verification to unlock funding.",
  SUBMITTED: "We've received your documents and will begin review shortly.",
  UNDER_REVIEW: "Our Operations team is reviewing your documents. This usually takes 1–2 business days.",
  ADDITIONAL_INFORMATION_REQUIRED: "Please review the note below and resubmit the requested information.",
  APPROVED: "You're fully verified. You can now add money to your wallet.",
  REJECTED: "Your verification was not approved. Contact support for next steps.",
}

export function KycStatusPage() {
  const navigate = useNavigate()
  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["kyc", "me"],
    queryFn: async () => (await apiClient.get<KycProfile>("/kyc/me")).data,
  })

  return (
    <div>
      <PageHeader title="Verification Status" description="Track the progress of your identity verification." />

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {profile && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                <StatusBadge status={profile.status} />
              </div>
              <p className="mt-3 text-sm text-foreground">{NEXT_ACTION[profile.status]}</p>
              {profile.status === "ADDITIONAL_INFORMATION_REQUIRED" && (
                <Button className="mt-4" size="sm" onClick={() => navigate(routes.app.kyc)}>
                  Update Information
                </Button>
              )}
              {profile.status === "NOT_STARTED" && (
                <Button className="mt-4" size="sm" onClick={() => navigate(routes.app.kyc)}>
                  Start Verification
                </Button>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <p className="mb-5 text-sm font-semibold text-foreground">Timeline</p>
              <Timeline items={buildTimeline(profile)} />
            </div>
          </div>

          <div className="space-y-4">
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
                      <StatusBadge status={doc.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {profile.submittedAt && (
              <div className="rounded-lg border border-border bg-card p-5 text-sm">
                <p className="text-muted-foreground">Submitted on</p>
                <p className="font-medium text-foreground">{formatDate(profile.submittedAt)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default KycStatusPage

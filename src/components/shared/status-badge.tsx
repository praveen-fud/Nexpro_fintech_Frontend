import { AlertCircle, CheckCircle2, Clock, HelpCircle, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type KnownStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "ADDITIONAL_INFORMATION_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "FAILED"
  | "COMPLETED"
  | "NOT_STARTED"
  | "SUBMITTED"
  | "INITIATED"
  | "AUTHORIZED"
  | "CAPTURED"
  | "REFUNDED"
  | "REVERSED"

interface StatusConfig {
  label: string
  icon: typeof CheckCircle2
  className: string
}

const STATUS_CONFIG: Record<KnownStatus, StatusConfig> = {
  NOT_STARTED: { label: "Not Started", icon: HelpCircle, className: "bg-muted text-muted-foreground" },
  PENDING: { label: "Pending", icon: Clock, className: "bg-warning-surface text-warning" },
  SUBMITTED: { label: "Submitted", icon: Clock, className: "bg-info-surface text-info" },
  INITIATED: { label: "Initiated", icon: Clock, className: "bg-info-surface text-info" },
  UNDER_REVIEW: { label: "Under Review", icon: Clock, className: "bg-info-surface text-info" },
  ADDITIONAL_INFORMATION_REQUIRED: {
    label: "Information Required",
    icon: AlertCircle,
    className: "bg-warning-surface text-warning",
  },
  AUTHORIZED: { label: "Authorized", icon: Info, className: "bg-info-surface text-info" },
  CAPTURED: { label: "Captured", icon: CheckCircle2, className: "bg-success-surface text-success" },
  APPROVED: { label: "Approved", icon: CheckCircle2, className: "bg-success-surface text-success" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, className: "bg-success-surface text-success" },
  REJECTED: { label: "Rejected", icon: XCircle, className: "bg-error-surface text-error" },
  FAILED: { label: "Failed", icon: XCircle, className: "bg-error-surface text-error" },
  CANCELLED: { label: "Cancelled", icon: XCircle, className: "bg-muted text-muted-foreground" },
  REFUNDED: { label: "Refunded", icon: Info, className: "bg-info-surface text-info" },
  REVERSED: { label: "Reversed", icon: AlertCircle, className: "bg-warning-surface text-warning" },
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = STATUS_CONFIG[status as KnownStatus] ?? {
    label: status.replace(/_/g, " "),
    icon: HelpCircle,
    className: "bg-muted text-muted-foreground",
  }
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label}
    </span>
  )
}

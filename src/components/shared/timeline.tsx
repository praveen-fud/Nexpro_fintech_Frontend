import { Check, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/format"

export interface TimelineItem {
  id: string
  label: string
  description?: string
  status: "complete" | "current" | "upcoming" | "rejected"
  timestamp?: string
}

export function Timeline({ items, className }: { items: TimelineItem[]; className?: string }) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  "absolute top-7 left-[13px] w-0.5",
                  item.status === "complete" ? "bg-primary" : "bg-border"
                )}
                style={{ height: "calc(100% - 1.75rem)" }}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                item.status === "complete" && "border-primary bg-primary text-primary-foreground",
                item.status === "current" && "border-primary bg-primary/10 text-primary",
                item.status === "upcoming" && "border-border bg-card text-muted-foreground",
                item.status === "rejected" && "border-error bg-error-surface text-error"
              )}
            >
              {item.status === "complete" && <Check className="size-3.5" aria-hidden="true" />}
              {item.status === "current" && <Clock className="size-3.5" aria-hidden="true" />}
              {item.status === "rejected" && <X className="size-3.5" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    item.status === "upcoming" ? "text-muted-foreground" : "text-foreground"
                  )}
                >
                  {item.label}
                </p>
                {item.timestamp && (
                  <span className="text-xs text-muted-foreground">{formatDateTime(item.timestamp)}</span>
                )}
              </div>
              {item.description && <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

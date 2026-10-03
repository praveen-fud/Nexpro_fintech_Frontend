import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StepperStep {
  key: string
  label: string
}

interface StepperProps {
  steps: StepperStep[]
  currentIndex: number
  className?: string
}

export function Stepper({ steps, currentIndex, className }: StepperProps) {
  return (
    <div className={cn(className)}>
      {/* Compact view: avoids cramped labels below 420px */}
      <div className="sm:hidden">
        <p className="text-xs font-medium text-muted-foreground">
          Step {currentIndex + 1} of {steps.length}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">{steps[currentIndex]?.label}</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Full stepper from sm breakpoint up */}
      <ol className="hidden items-start sm:flex">
        {steps.map((step, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex
          const isLast = index === steps.length - 1

          return (
            <li key={step.key} className={cn("flex items-center", !isLast && "flex-1")}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isComplete && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary/10 text-primary",
                    !isComplete && !isCurrent && "border-border bg-card text-muted-foreground"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "max-w-[6.5rem] text-center text-xs font-medium",
                    isCurrent || isComplete ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className={cn("mx-2 h-0.5 flex-1 rounded-full", isComplete ? "bg-primary" : "bg-border")} />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

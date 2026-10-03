import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, X } from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FlowLayoutProps {
  title: string
  onBack?: () => void
  closeTo?: string
  children: ReactNode
  maxWidthClassName?: string
}

/** Minimal, focused shell for linear flows: KYC, Add Money, funding review/success. */
export function FlowLayout({ title, onBack, closeTo, children, maxWidthClassName = "max-w-xl" }: FlowLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center border-b border-border bg-card px-4 lg:px-6">
        <div className="flex w-full max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="icon" aria-label="Go back" onClick={onBack}>
                <ArrowLeft className="size-4.5" />
              </Button>
            )}
            <Logo mark className="lg:hidden" />
            <span className="hidden text-sm font-semibold text-foreground lg:block">{title}</span>
          </div>
          {closeTo && (
            <Button variant="ghost" size="icon" aria-label="Close" onClick={() => navigate(closeTo)}>
              <X className="size-4.5" />
            </Button>
          )}
        </div>
      </header>
      <main className="flex flex-1 justify-center px-4 py-6 lg:py-10">
        <div className={cn("w-full", maxWidthClassName)}>
          <h1 className="mb-6 text-xl font-semibold text-foreground lg:hidden">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  )
}

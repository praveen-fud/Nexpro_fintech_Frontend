import { Loader2 } from "lucide-react"

export function FullScreenLoader({ label = "Loading Nexpro Paytech…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-background">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

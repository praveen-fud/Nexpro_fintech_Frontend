import { Construction } from "lucide-react"

export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card px-6 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Construction className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {description ?? "This area is coming soon as the Nexpro Paytech build continues."}
        </p>
      </div>
    </div>
  )
}

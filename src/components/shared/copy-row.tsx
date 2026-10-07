import { Copy } from "lucide-react"
import { toast } from "sonner"

export function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-tabular break-all text-sm font-medium text-foreground">{value}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(value).then(
            () => toast.success(`${label} copied`),
            () => toast.error("Could not copy — select and copy it manually")
          )
        }}
        className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={`Copy ${label}`}
      >
        <Copy className="size-4" />
      </button>
    </div>
  )
}

import { useEffect, useState } from "react"
import { Loader2, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { apiClient, ApiError } from "@/lib/api-client"

interface ProofViewerProps {
  open: boolean
  onClose: () => void
  /** Authenticated API path that returns the file. */
  path: string
  title?: string
}

/**
 * Shows a payment proof in-page only (never a new tab). The file is fetched
 * with the auth header as a blob, so no shareable URL ever exists, and the
 * blob URL is revoked as soon as the dialog closes.
 */
export function ProofViewer({ open, onClose, path, title = "Payment proof" }: ProofViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [isPdf, setIsPdf] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let url: string | null = null
    let cancelled = false
    setError(null)
    apiClient
      .get<Blob>(path, { responseType: "blob" })
      .then((res) => {
        if (cancelled) return
        url = URL.createObjectURL(res.data)
        setIsPdf(res.data.type === "application/pdf")
        setBlobUrl(url)
      })
      .catch((err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load the proof."))
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
      setBlobUrl(null)
    }
  }, [open, path])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton={false} className="flex max-h-[92vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b bg-card px-4 py-3">
          <DialogTitle className="text-sm font-medium">{title}</DialogTitle>
          <DialogDescription className="sr-only">Customer-submitted proof of payment</DialogDescription>
          <Button variant="ghost" size="icon" className="size-8" aria-label="Close" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto bg-muted/30">
          {error ? (
            <p className="p-10 text-center text-sm text-muted-foreground">{error}</p>
          ) : !blobUrl ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : isPdf ? (
            <iframe src={blobUrl} title={title} className="h-[70vh] w-full border-0" />
          ) : (
            <div className="flex justify-center p-4">
              <img
                src={blobUrl}
                alt={title}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="max-h-[75vh] max-w-full rounded-md object-contain shadow-md"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

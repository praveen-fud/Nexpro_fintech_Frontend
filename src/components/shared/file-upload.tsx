import { useId, useRef, useState, type DragEvent } from "react"
import { File as FileIcon, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  label: string
  description?: string
  accept?: string
  maxSizeMb?: number
  value: File | null
  onChange: (file: File | null) => void
  error?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUpload({
  label,
  description,
  accept = "image/png,image/jpeg,application/pdf",
  maxSizeMb = 5,
  value,
  onChange,
  error,
}: FileUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const validateAndSet = (file: File | undefined) => {
    if (!file) return
    const acceptedTypes = accept.split(",")
    if (!acceptedTypes.includes(file.type)) {
      setLocalError("Unsupported file type. Please upload a PNG, JPG, or PDF.")
      return
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`File is too large. Maximum size is ${maxSizeMb}MB.`)
      return
    }
    setLocalError(null)
    onChange(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    validateAndSet(e.dataTransfer.files?.[0])
  }

  const displayError = error ?? localError

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {description && <p className="mb-2 text-xs text-muted-foreground">{description}</p>}

      {value ? (
        <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{value.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(value.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-2 shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={`Remove ${value.name}`}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40",
            displayError && "border-error/50"
          )}
        >
          <Upload className="size-5 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-foreground">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, or PDF up to {maxSizeMb}MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => validateAndSet(e.target.files?.[0])}
      />

      {displayError && <p className="mt-1.5 text-sm text-error">{displayError}</p>}
    </div>
  )
}

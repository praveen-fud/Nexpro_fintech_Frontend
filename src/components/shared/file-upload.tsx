import { useId, useRef, useState, useEffect, type DragEvent } from "react"
import {
  CloudUpload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  FileImage,
} from "lucide-react"
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

function fileExt(name: string) {
  return name.split(".").pop()?.toUpperCase() ?? "FILE"
}

function isImageFile(file: File) {
  return file.type.startsWith("image/")
}

// ── Thumbnail preview for images ──────────────────────────────────────────────

function ImageThumb({ file }: { file: File }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (!src) {
    return (
      <div className="flex size-full items-center justify-center">
        <FileImage className="size-5 text-blue-500" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={file.name}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className="size-full rounded-lg object-cover"
    />
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

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
    const accepted = accept.split(",")
    if (!accepted.includes(file.type)) {
      setLocalError("Unsupported type. Upload a PNG, JPG, or PDF.")
      return
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setLocalError(`Too large — maximum ${maxSizeMb} MB.`)
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
  const isImage = value ? isImageFile(value) : false

  return (
    <div className="group/upload space-y-1.5">
      {/* Label row */}
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-foreground"
        >
          {label}
        </label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>

      {/* ── Uploaded state ────────────────────────────────────────────── */}
      {value ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border transition-shadow duration-200",
            "border-emerald-200 bg-emerald-50/60 shadow-sm hover:shadow-md",
            "dark:border-emerald-800/60 dark:bg-emerald-950/30"
          )}
        >
          {/* Green accent stripe */}
          <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-emerald-500" />

          <div className="flex items-center gap-3 py-3 pl-5 pr-3">
            {/* Thumbnail or icon */}
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg",
                isImage
                  ? "size-12 overflow-hidden border border-border bg-muted shadow-sm"
                  : "size-12 border border-red-200 bg-red-50 dark:border-red-800/60 dark:bg-red-950/30"
              )}
            >
              {isImage ? (
                <ImageThumb file={value} />
              ) : (
                <FileText className="size-5 text-red-500" />
              )}
            </div>

            {/* File info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground leading-tight">
                {value.name}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {fileExt(value.name)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatBytes(value.size)}
                </span>
              </div>
            </div>

            {/* Status + remove */}
            <div className="flex shrink-0 items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <button
                type="button"
                onClick={() => {
                  setLocalError(null)
                  onChange(null)
                }}
                aria-label={`Remove ${value.name}`}
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg",
                  "text-muted-foreground transition-colors",
                  "hover:bg-destructive/10 hover:text-destructive",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
                )}
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Drop zone ────────────────────────────────────────────────── */
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
          aria-label={`Upload ${label}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
          }}
          className={cn(
            // Base
            "relative flex cursor-pointer flex-col items-center justify-center gap-3",
            "min-h-[136px] rounded-xl border-2 border-dashed px-6 py-8",
            "transition-all duration-200 ease-out select-none",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",

            // Default
            !dragOver &&
              !displayError &&
              "border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5",

            // Drag-active
            dragOver &&
              "scale-[1.015] border-primary border-solid bg-primary/8 shadow-md",

            // Error
            displayError &&
              !dragOver &&
              "border-destructive/50 bg-destructive/5 hover:border-destructive/70"
          )}
        >
          {/* Upload icon */}
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl transition-all duration-200",
              dragOver
                ? "scale-110 bg-primary/15 text-primary"
                : displayError
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground group-hover/upload:bg-primary/10 group-hover/upload:text-primary"
            )}
          >
            {displayError ? (
              <AlertCircle className="size-5" />
            ) : (
              <CloudUpload
                className={cn(
                  "size-5 transition-transform duration-200",
                  dragOver && "translate-y-[-2px]"
                )}
              />
            )}
          </div>

          {/* Text content */}
          <div className="text-center">
            {dragOver ? (
              <p className="text-sm font-semibold text-primary">
                Drop to upload
              </p>
            ) : (
              <>
                <p className="text-sm text-foreground">
                  <span className="font-semibold text-primary underline-offset-2 hover:underline">
                    Click to browse
                  </span>
                  {" "}or drag and drop
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG or PDF · up to {maxSizeMb} MB
                </p>
              </>
            )}
          </div>

          {/* Accepted types row */}
          {!dragOver && (
            <div className="flex items-center gap-1.5">
              {["PNG", "JPG", "PDF"].map((t) => (
                <span
                  key={t}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    "border-border bg-background text-muted-foreground",
                    displayError
                      ? "border-destructive/30 text-destructive/70"
                      : ""
                  )}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Drag glow overlay */}
          {dragOver && (
            <div
              className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-primary/5"
              aria-hidden
            />
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        capture="environment"
        className="sr-only"
        onChange={(e) => validateAndSet(e.target.files?.[0])}
      />

      {/* Error message */}
      {displayError && (
        <div className="flex items-center gap-1.5 text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          <p className="text-xs font-medium">{displayError}</p>
        </div>
      )}
    </div>
  )
}

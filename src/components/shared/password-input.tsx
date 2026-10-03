import { useState, type ComponentProps } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function PasswordInput({
  className,
  withLeadingIcon = true,
  ...props
}: ComponentProps<"input"> & { withLeadingIcon?: boolean }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      {withLeadingIcon && (
        <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-9", withLeadingIcon && "pl-9", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

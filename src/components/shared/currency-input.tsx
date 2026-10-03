import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CurrencyInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ id, value, onChange, placeholder = "0", className, autoFocus }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          className
        )}
      >
        <span className="text-xl font-semibold text-muted-foreground">₹</span>
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/[^\d]/g, "")
            onChange(digitsOnly)
          }}
          placeholder={placeholder}
          className="font-tabular w-full border-0 bg-transparent text-xl font-semibold text-foreground outline-none placeholder:text-muted-foreground/50"
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

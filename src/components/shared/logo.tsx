import logoMark from "@/assets/logo.png"
import logoFull from "@/assets/logo-full.png"
import { cn } from "@/lib/utils"

export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  // The artwork has a white background, so on dark surfaces (callers pass text-white) sit it on a white pill.
  const onDark = className?.includes("text-white")
  return (
    <span
      className={cn(
        "inline-flex items-center",
        onDark && "rounded-lg bg-white px-2 py-1",
        className
      )}
    >
      <img
        src={mark ? logoMark : logoFull}
        alt="Nexpro Paytech"
        className={cn("w-auto shrink-0 object-contain", mark ? "h-9" : "h-11")}
      />
    </span>
  )
}

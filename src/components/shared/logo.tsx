import logoMark from "@/assets/logo.png"
import { cn } from "@/lib/utils"

export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <img
        src={logoMark}
        alt={mark ? "Nexpro Fintech" : ""}
        className="h-8 w-auto shrink-0 object-contain"
      />
      {!mark && (
        <span className="text-[1.0625rem] leading-none">
          Nexpro<span className="text-primary"> Fintech</span>
        </span>
      )}
    </span>
  )
}

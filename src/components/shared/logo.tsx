import { cn } from "@/lib/utils"

export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="bg-brand-gradient flex size-7 shrink-0 items-center justify-center rounded-md text-white">
        <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden="true">
          <path
            d="M4 18V6l8 8 8-8v12"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!mark && (
        <span className="text-[1.0625rem] leading-none">
          Nexpro<span className="text-primary"> Fintech</span>
        </span>
      )}
    </span>
  )
}

import { WifiIcon } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

interface WalletCardProps {
  availableBalance: number
  walletId?: string
  pendingBalance?: number
  className?: string
}

export function WalletCard({ availableBalance, walletId, pendingBalance, className }: WalletCardProps) {
  return (
    <div
      className={cn(
        "bg-brand-gradient relative isolate flex min-h-[200px] w-full flex-col justify-between overflow-hidden rounded-[20px] p-6 text-white shadow-lg sm:p-7",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 size-48 rounded-full bg-white/5"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-white/70 uppercase">Available Balance</span>
        <WifiIcon className="size-5 rotate-90 text-white/60" aria-hidden="true" />
      </div>

      <div className="relative z-10 mt-2">
        <p className="font-tabular text-4xl font-semibold tracking-tight sm:text-5xl">
          {formatCurrency(availableBalance)}
        </p>
        {typeof pendingBalance === "number" && pendingBalance > 0 && (
          <p className="mt-2 text-sm text-white/75">
            + {formatCurrency(pendingBalance)} pending funding
          </p>
        )}
      </div>

      <div className="relative z-10 flex items-end justify-between pt-6">
        <div>
          <p className="text-[11px] tracking-wide text-white/60 uppercase">Wallet ID</p>
          <p className="font-tabular text-sm text-white/90">{walletId ?? "NXP-••••-••••"}</p>
        </div>
        <span className="text-sm font-semibold tracking-wide text-white/90">NEXPRO</span>
      </div>
    </div>
  )
}

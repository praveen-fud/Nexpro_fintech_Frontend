import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

interface FundingSummaryProps {
  requestedAmount: number
  fee: number
  walletCredit: number
  className?: string
}

/**
 * Always shows Requested Amount, Fee, and Wallet Credit as distinct lines —
 * never collapse these into a single "amount," per financial transparency
 * requirements. Total Payment = requested + fee (fee is additive, not
 * deducted from the wallet credit).
 */
export function FundingSummary({ requestedAmount, fee, walletCredit, className }: FundingSummaryProps) {
  const totalPayment = requestedAmount + fee

  return (
    <div className={cn("rounded-lg border border-border bg-card p-5", className)}>
      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Requested Amount</dt>
          <dd className="font-tabular font-medium text-foreground">{formatCurrency(requestedAmount)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Processing Fee</dt>
          <dd className="font-tabular font-medium text-foreground">
            {fee > 0 ? formatCurrency(fee) : "No fee"}
          </dd>
        </div>
        <div className="border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <dt className="font-medium text-foreground">Wallet Credit</dt>
            <dd className="font-tabular text-base font-semibold text-success">{formatCurrency(walletCredit)}</dd>
          </div>
        </div>
        {fee > 0 && (
          <div className="flex items-center justify-between border-t border-border pt-3">
            <dt className="font-medium text-foreground">Total Payment</dt>
            <dd className="font-tabular font-semibold text-foreground">{formatCurrency(totalPayment)}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}

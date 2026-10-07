import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { QRCodeSVG } from "qrcode.react"
import { Clock, Info, Smartphone } from "lucide-react"
import { Logo } from "@/components/shared/logo"
import { CopyRow } from "@/components/shared/copy-row"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { apiClient, ApiError } from "@/lib/api-client"
import { formatCurrency, formatDateTime } from "@/lib/format"

interface PublicPayment {
  upiId: string
  payeeName: string
  amount: number | string
  reference: string
  expiresAt: string
  isDemo: boolean
}

/** Public page (no login) opened from a payment link a customer shared. */
export function PayLinkPage() {
  const { token } = useParams<{ token: string }>()

  const query = useQuery({
    queryKey: ["public-upi-payment", token],
    queryFn: async () => (await apiClient.get<PublicPayment>(`/public/upi-payment/${token}`)).data,
    retry: false,
  })

  const data = query.data
  const amount = data ? Number(data.amount) : 0
  const upiLink = data
    ? `upi://pay?pa=${encodeURIComponent(data.upiId)}&pn=${encodeURIComponent(data.payeeName)}` +
      `&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(data.reference)}`
    : ""

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-10">
      <Logo />
      <div className="mt-8 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        {query.isLoading && <Skeleton className="mx-auto h-72 w-full" />}

        {query.isError && (
          <div className="py-8 text-center">
            <Clock className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 text-base font-semibold text-foreground">Link unavailable</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {query.error instanceof ApiError
                ? query.error.message
                : "We couldn't open this payment link."}{" "}
              Ask the person who sent it to create a new one.
            </p>
          </div>
        )}

        {data && (
          <>
            <p className="text-center text-sm text-muted-foreground">Pay {data.payeeName}</p>
            <p className="font-tabular mt-1 text-center text-3xl font-semibold text-foreground">
              {formatCurrency(amount, true)}
            </p>

            <div className="mx-auto mt-5 w-fit rounded-xl border border-border bg-white p-3">
              <QRCodeSVG value={upiLink} size={208} level="M" marginSize={0} />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Scan with any UPI app</p>

            <Button asChild className="mt-4 w-full md:hidden">
              <a href={upiLink}>
                <Smartphone className="size-4" />
                Open UPI app
              </a>
            </Button>

            <div className="mt-4 divide-y divide-border">
              <CopyRow label="UPI ID" value={data.upiId} />
              <CopyRow label="Payment note (please add)" value={data.reference} />
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>
                After paying, send the <span className="font-medium text-foreground">UTR / transaction ID</span> and a
                screenshot to the person who shared this link — they need it to complete the request. Link valid
                until {formatDateTime(data.expiresAt)}.
              </p>
            </div>

            {data.isDemo && (
              <p className="mt-3 rounded-md bg-warning-surface px-3 py-2 text-xs text-warning">
                Demo payee — do not send real money.
              </p>
            )}
          </>
        )}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">Payments are verified by Nexpro Fintech before crediting.</p>
    </div>
  )
}

export default PayLinkPage

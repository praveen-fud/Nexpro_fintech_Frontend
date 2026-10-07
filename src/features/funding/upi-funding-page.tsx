import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { QRCodeSVG } from "qrcode.react"
import { ArrowRight, Link2, Loader2, Send, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { FlowLayout } from "@/layouts/flow-layout"
import { Stepper, type StepperStep } from "@/components/shared/stepper"
import { CurrencyInput } from "@/components/shared/currency-input"
import { CopyRow } from "@/components/shared/copy-row"
import { FileUpload } from "@/components/shared/file-upload"
import { FundingSummary } from "@/components/shared/funding-summary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { useFundingQuote } from "@/features/funding/use-funding-quote"
import { apiClient, ApiError } from "@/lib/api-client"
import { formatCurrency } from "@/lib/format"
import { routes } from "@/lib/routes"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { FundingRequest } from "@/types/domain"

const steps: StepperStep[] = [
  { key: "amount", label: "Enter Amount" },
  { key: "pay", label: "Scan & Pay" },
  { key: "confirm", label: "Confirm Payment" },
]

const UTR_REGEX = /^[A-Za-z0-9]{12,22}$/

interface UpiPayee {
  upiId: string
  payeeName: string
  reference: string
  isDemo: boolean
}

export function UpiFundingPage() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [amount, setAmount] = useState("")
  const [utr, setUtr] = useState("")
  const [utrError, setUtrError] = useState<string | null>(null)
  const [proof, setProof] = useState<File | null>(null)

  const amountNumber = Number(amount) || 0
  const quote = useFundingQuote(amountNumber, "UPI")

  const payeeQuery = useQuery({
    queryKey: ["funding", "upi-payee"],
    queryFn: async () => (await apiClient.get<UpiPayee>("/funding-requests/upi/payee")).data,
    staleTime: Infinity, // keep one stable payment note for the whole session
  })

  const payee = payeeQuery.data
  // Customer pays the amount plus any fee; the wallet is credited the amount.
  const payable = quote.data?.totalPayment ?? amountNumber
  const upiLink = payee
    ? `upi://pay?pa=${encodeURIComponent(payee.upiId)}&pn=${encodeURIComponent(payee.payeeName)}` +
      `&am=${payable.toFixed(2)}&cu=INR&tn=${encodeURIComponent(payee.reference)}`
    : ""

  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const createLink = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<{ token: string; expiresAt: string }>("/funding-requests/upi/payment-link", {
          amount: amountNumber,
          reference: payee?.reference,
        })
      ).data,
    onSuccess: async ({ token }) => {
      const url = `${window.location.origin}${routes.payLink(token)}`
      if (navigator.share) {
        try {
          await navigator.share({ title: "Nexpro payment link", text: "Please pay using this link", url })
          return
        } catch {
          // dismissed or unsupported — fall through to the copy dialog
        }
      }
      setShareUrl(url)
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Could not create the payment link."),
  })

  const createRequest = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append("method", "UPI")
      formData.append("amount", String(amountNumber))
      formData.append("paymentDetails", JSON.stringify({ referenceNumber: utr.trim().toUpperCase() }))
      if (proof) formData.append("proof", proof)
      return (
        await apiClient.post<FundingRequest>("/funding-requests", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data
    },
    onSuccess: (request) => navigate(routes.app.fundingRequest(request.id)),
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Could not submit your payment. Please try again."),
  })

  const submit = () => {
    if (!UTR_REGEX.test(utr.trim())) {
      setUtrError("Enter the 12-digit UTR / transaction ID from your UPI app")
      return
    }
    setUtrError(null)
    createRequest.mutate()
  }

  const goBack = () => (stepIndex === 0 ? navigate(routes.app.addMoney) : setStepIndex((i) => i - 1))

  return (
    <FlowLayout title="Add Money via UPI" closeTo={routes.app.addMoney} onBack={goBack} maxWidthClassName="max-w-lg">
      <Stepper steps={steps} currentIndex={stepIndex} className="mb-8" />

      {stepIndex === 0 && (
        <div>
          <Field>
            <FieldLabel htmlFor="amount">How much would you like to add?</FieldLabel>
            <CurrencyInput id="amount" value={amount} onChange={setAmount} autoFocus />
            <FieldDescription>Minimum ₹100, maximum ₹2,00,000 per request.</FieldDescription>
          </Field>
          <Button className="mt-6 w-full" size="lg" disabled={amountNumber < 100} onClick={() => setStepIndex(1)}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {stepIndex === 1 && (
        <div className="space-y-5">
          <FundingSummary
            requestedAmount={quote.data?.requestedAmount ?? amountNumber}
            fee={quote.data?.fee ?? 0}
            walletCredit={quote.data?.walletCredit ?? amountNumber}
          />

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            {payeeQuery.isLoading && <Skeleton className="mx-auto size-48" />}
            {payeeQuery.isError && (
              <p className="text-center text-sm text-destructive">
                UPI payments are unavailable right now. Please try another method.
              </p>
            )}
            {payee && (
              <>
                <div className="mx-auto w-fit rounded-xl border border-border bg-white p-3">
                  <QRCodeSVG value={upiLink} size={192} level="M" marginSize={0} />
                </div>
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  Scan with any UPI app and pay{" "}
                  <span className="font-tabular font-semibold text-foreground">{formatCurrency(payable, true)}</span>
                </p>
                <div className="mt-3 divide-y divide-border">
                  <CopyRow label="UPI ID" value={payee.upiId} />
                  <CopyRow label="Payee name" value={payee.payeeName} />
                  <CopyRow label="Payment note (add this)" value={payee.reference} />
                </div>
                <Button asChild variant="outline" className="mt-3 w-full md:hidden">
                  <a href={upiLink}>
                    <Smartphone className="size-4" />
                    Open UPI app
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  disabled={createLink.isPending}
                  onClick={() => createLink.mutate()}
                >
                  {createLink.isPending ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
                  Get a payment link for someone else
                </Button>
                {payee.isDemo && (
                  <p className="mt-3 rounded-md bg-warning-surface px-3 py-2 text-xs text-warning">
                    Demo payee — set the PAYEE_UPI_* settings before going live. Do not send real money.
                  </p>
                )}
              </>
            )}
          </div>

          <Button className="w-full" size="lg" disabled={!payee} onClick={() => setStepIndex(2)}>
            <Send className="size-4" />
            I&apos;ve made the payment
          </Button>
        </div>
      )}

      {stepIndex === 2 && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Enter the details from your UPI app so we can match your payment. Your wallet is credited after our
            team verifies it.
          </p>

          <Field data-invalid={!!utrError}>
            <FieldLabel htmlFor="utr">UTR / Transaction ID</FieldLabel>
            <Input
              id="utr"
              value={utr}
              onChange={(e) => setUtr(e.target.value.replace(/\s/g, ""))}
              placeholder="e.g. 412345678901"
              maxLength={22}
              className="uppercase"
              autoComplete="off"
            />
            <FieldDescription>
              Shown as &quot;UPI Ref. No.&quot; or &quot;UTR&quot; on the payment success screen.
            </FieldDescription>
            <FieldError errors={utrError ? [{ message: utrError }] : []} />
          </Field>

          <FileUpload
            label="Payment Screenshot"
            description="Required — a screenshot of the successful payment (PNG, JPG or PDF)."
            value={proof}
            onChange={setProof}
          />

          <Button className="w-full" size="lg" disabled={!utr || !proof || createRequest.isPending} onClick={submit}>
            {createRequest.isPending && <Loader2 className="size-4 animate-spin" />}
            Submit for Verification
          </Button>
        </div>
      )}

      <Dialog open={!!shareUrl} onOpenChange={(o) => !o && setShareUrl(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment link ready</DialogTitle>
            <DialogDescription>
              Send this to the person paying for you. It works for 24 hours and only shows how to pay — no account
              details of yours. Ask them to send you the UTR and a screenshot, then submit them here.
            </DialogDescription>
          </DialogHeader>
          {shareUrl && <CopyRow label="Payment link" value={shareUrl} />}
        </DialogContent>
      </Dialog>
    </FlowLayout>
  )
}

export default UpiFundingPage

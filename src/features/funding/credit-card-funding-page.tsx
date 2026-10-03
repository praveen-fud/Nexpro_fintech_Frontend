import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { FlowLayout } from "@/layouts/flow-layout"
import { Stepper, type StepperStep } from "@/components/shared/stepper"
import { CurrencyInput } from "@/components/shared/currency-input"
import { FundingSummary } from "@/components/shared/funding-summary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { useFundingQuote } from "@/features/funding/use-funding-quote"
import { apiClient, ApiError } from "@/lib/api-client"
import { formatCurrency, maskCardNumber } from "@/lib/format"
import { routes } from "@/lib/routes"
import type { FundingRequest } from "@/types/domain"

const steps: StepperStep[] = [
  { key: "amount", label: "Enter Amount" },
  { key: "payment", label: "Payment Details" },
  { key: "review", label: "Review" },
]

export function CreditCardFundingPage() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [amount, setAmount] = useState("")
  const [cardHolderName, setCardHolderName] = useState("")
  const [last4, setLast4] = useState("")
  const [expiry, setExpiry] = useState("")

  const amountNumber = Number(amount) || 0
  const quote = useFundingQuote(amountNumber, "CREDIT_CARD")

  const createRequest = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<FundingRequest>("/funding-requests", {
          method: "CREDIT_CARD",
          amount: amountNumber,
          paymentDetails: { cardHolderName, maskedCard: maskCardNumber(last4), expiry },
        })
      ).data,
    onSuccess: (request) => {
      navigate(routes.app.fundingRequest(request.id))
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not create funding request. Please try again.")
    },
  })

  const goBack = () => {
    if (stepIndex === 0) navigate(routes.app.addMoney)
    else setStepIndex((i) => i - 1)
  }

  return (
    <FlowLayout title="Add Money via Credit Card" onBack={goBack}>
      <Stepper steps={steps} currentIndex={stepIndex} className="mb-8" />

      {stepIndex === 0 && (
        <div>
          <Field>
            <FieldLabel htmlFor="amount">How much would you like to add?</FieldLabel>
            <CurrencyInput id="amount" value={amount} onChange={setAmount} autoFocus />
            <FieldDescription>Minimum ₹500, maximum ₹2,00,000 per request.</FieldDescription>
          </Field>
          <Button
            className="mt-6 w-full"
            size="lg"
            disabled={amountNumber < 500}
            onClick={() => setStepIndex(1)}
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {stepIndex === 1 && (
        <div className="space-y-5">
          <div className="rounded-md border border-info/30 bg-info-surface p-3 text-xs text-info">
            This is a simulated payment form. Nexpro never collects or stores your full card number or CVV —
            in production, card details are captured by a PCI-compliant hosted field.
          </div>
          <Field>
            <FieldLabel htmlFor="cardHolderName">Cardholder Name</FieldLabel>
            <Input id="cardHolderName" value={cardHolderName} onChange={(e) => setCardHolderName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="last4">Last 4 Digits</FieldLabel>
              <Input
                id="last4"
                inputMode="numeric"
                maxLength={4}
                value={last4}
                onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
                placeholder="4821"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="expiry">Expiry (MM/YY)</FieldLabel>
              <Input
                id="expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="08/29"
                maxLength={5}
              />
            </Field>
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={!cardHolderName || last4.length !== 4 || !expiry}
            onClick={() => setStepIndex(2)}
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {stepIndex === 2 && (
        <div className="space-y-5">
          <div className="rounded-md border border-border bg-muted/40 p-4">
            <p className="text-xs text-muted-foreground">Card</p>
            <p className="font-tabular mt-1 text-sm font-medium text-foreground">
              {maskCardNumber(last4)} · {cardHolderName}
            </p>
          </div>

          {quote.data ? (
            <FundingSummary
              requestedAmount={quote.data.requestedAmount}
              fee={quote.data.fee}
              walletCredit={quote.data.walletCredit}
            />
          ) : (
            <FundingSummary requestedAmount={amountNumber} fee={0} walletCredit={amountNumber} />
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={createRequest.isPending}
            onClick={() => createRequest.mutate()}
          >
            {createRequest.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            Confirm &amp; Pay {quote.data ? formatCurrency(quote.data.totalPayment) : formatCurrency(amountNumber)}
          </Button>
        </div>
      )}
    </FlowLayout>
  )
}

export default CreditCardFundingPage

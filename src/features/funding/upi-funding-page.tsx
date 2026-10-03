import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Loader2, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { FlowLayout } from "@/layouts/flow-layout"
import { Stepper, type StepperStep } from "@/components/shared/stepper"
import { CurrencyInput } from "@/components/shared/currency-input"
import { FundingSummary } from "@/components/shared/funding-summary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { useFundingQuote } from "@/features/funding/use-funding-quote"
import { apiClient, ApiError } from "@/lib/api-client"
import { routes } from "@/lib/routes"
import type { FundingRequest } from "@/types/domain"

const steps: StepperStep[] = [
  { key: "amount", label: "Enter Amount" },
  { key: "upi", label: "UPI Details" },
  { key: "payment", label: "Payment" },
]

const UPI_REGEX = /^[\w.-]+@[\w.-]+$/

type PaymentState = "idle" | "waiting" | "received"

export function UpiFundingPage() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [amount, setAmount] = useState("")
  const [upiId, setUpiId] = useState("")
  const [upiError, setUpiError] = useState<string | null>(null)
  const [paymentState, setPaymentState] = useState<PaymentState>("idle")

  const amountNumber = Number(amount) || 0
  const quote = useFundingQuote(amountNumber, "UPI")

  const createRequest = useMutation({
    mutationFn: async () =>
      (
        await apiClient.post<FundingRequest>("/funding-requests", {
          method: "UPI",
          amount: amountNumber,
          paymentDetails: { upiId, reference: `UPI-${Date.now().toString().slice(-8)}` },
        })
      ).data,
    onSuccess: (request) => navigate(routes.app.fundingRequest(request.id)),
    onError: (err) => {
      setPaymentState("idle")
      toast.error(err instanceof ApiError ? err.message : "Could not create funding request. Please try again.")
    },
  })

  const goBack = () => {
    if (stepIndex === 0) navigate(routes.app.addMoney)
    else setStepIndex((i) => i - 1)
  }

  const startPayment = () => {
    if (!UPI_REGEX.test(upiId)) {
      setUpiError("Enter a valid UPI ID, e.g. name@bank")
      return
    }
    setUpiError(null)
    setStepIndex(2)
    setPaymentState("waiting")
    setTimeout(() => {
      setPaymentState("received")
      createRequest.mutate()
    }, 1600)
  }

  return (
    <FlowLayout title="Add Money via UPI" onBack={stepIndex < 2 ? goBack : undefined}>
      <Stepper steps={steps} currentIndex={stepIndex} className="mb-8" />

      {stepIndex === 0 && (
        <div>
          <Field>
            <FieldLabel htmlFor="amount">How much would you like to add?</FieldLabel>
            <CurrencyInput id="amount" value={amount} onChange={setAmount} autoFocus />
            <FieldDescription>Minimum ₹100, maximum ₹1,00,000 per request.</FieldDescription>
          </Field>
          <Button className="mt-6 w-full" size="lg" disabled={amountNumber < 100} onClick={() => setStepIndex(1)}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {stepIndex === 1 && (
        <div className="space-y-5">
          {quote.data ? (
            <FundingSummary
              requestedAmount={quote.data.requestedAmount}
              fee={quote.data.fee}
              walletCredit={quote.data.walletCredit}
            />
          ) : (
            <FundingSummary requestedAmount={amountNumber} fee={0} walletCredit={amountNumber} />
          )}

          <Field data-invalid={!!upiError}>
            <FieldLabel htmlFor="upiId">Your UPI ID</FieldLabel>
            <Input
              id="upiId"
              placeholder="yourname@bank"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            <FieldError errors={upiError ? [{ message: upiError }] : []} />
          </Field>

          <Button className="w-full" size="lg" onClick={startPayment}>
            <Smartphone className="size-4" />
            Pay via UPI
          </Button>
        </div>
      )}

      {stepIndex === 2 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={
              paymentState === "received"
                ? "flex size-16 items-center justify-center rounded-full bg-success-surface text-success"
                : "flex size-16 items-center justify-center rounded-full bg-info-surface text-info"
            }
          >
            {paymentState === "received" ? (
              <CheckCircle2 className="size-8" />
            ) : (
              <Loader2 className="size-8 animate-spin" />
            )}
          </motion.div>
          <p className="mt-5 text-base font-semibold text-foreground">
            {paymentState === "received" ? "Payment received" : "Waiting for payment…"}
          </p>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            {paymentState === "received"
              ? "Creating your funding request."
              : `Simulating confirmation from ${upiId}. This usually takes a few seconds.`}
          </p>
        </div>
      )}
    </FlowLayout>
  )
}

export default UpiFundingPage

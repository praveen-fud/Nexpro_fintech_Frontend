import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowRight, Loader2, Lock, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { FlowLayout } from "@/layouts/flow-layout"
import { Stepper, type StepperStep } from "@/components/shared/stepper"
import { CurrencyInput } from "@/components/shared/currency-input"
import { FundingSummary } from "@/components/shared/funding-summary"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { useAuth } from "@/features/auth/auth-context"
import { useFundingQuote } from "@/features/funding/use-funding-quote"
import { apiClient, ApiError } from "@/lib/api-client"
import { loadRazorpayCheckout } from "@/lib/razorpay"
import { formatCurrency } from "@/lib/format"
import { routes } from "@/lib/routes"
import type { FundingRequest } from "@/types/domain"

const steps: StepperStep[] = [
  { key: "amount", label: "Enter Amount" },
  { key: "review", label: "Review" },
  { key: "pay", label: "Secure Payment" },
]

interface CardOrder {
  orderId: string
  keyId: string
  amountPaise: number
  currency: string
}

export function CreditCardFundingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [stepIndex, setStepIndex] = useState(0)
  const [amount, setAmount] = useState("")
  const [paying, setPaying] = useState(false)

  const amountNumber = Number(amount) || 0
  const quote = useFundingQuote(amountNumber, "CREDIT_CARD")

  const configQuery = useQuery({
    queryKey: ["funding", "card-config"],
    queryFn: async () => (await apiClient.get<{ enabled: boolean }>("/funding-requests/card/config")).data,
  })
  const cardsAvailable = configQuery.data?.enabled ?? false

  const verify = useMutation({
    mutationFn: async (payload: { orderId: string; paymentId: string; signature: string }) =>
      (await apiClient.post<FundingRequest>("/funding-requests/card/verify", payload)).data,
    onSuccess: (request) => {
      void queryClient.invalidateQueries({ queryKey: ["wallet"] })
      navigate(routes.app.fundingRequest(request.id))
    },
    onError: (err) => {
      setPaying(false)
      toast.error(err instanceof ApiError ? err.message : "We could not confirm your payment. Contact support if you were charged.")
    },
  })

  // Card details are typed into Razorpay's hosted checkout — never into our page,
  // never sent to our server.
  const startPayment = async () => {
    setPaying(true)
    try {
      const order = (await apiClient.post<CardOrder>("/funding-requests/card/order", { amount: amountNumber })).data
      const Razorpay = await loadRazorpayCheckout()
      const checkout = new Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amountPaise,
        currency: order.currency,
        name: "Nexpro Paytech",
        description: "Wallet top-up",
        prefill: { name: user?.fullName, email: user?.email, contact: user?.mobileNumber },
        theme: { color: "#0b5036" },
        handler: (res) =>
          verify.mutate({
            orderId: res.razorpay_order_id,
            paymentId: res.razorpay_payment_id,
            signature: res.razorpay_signature,
          }),
        modal: { ondismiss: () => setPaying(false), confirm_close: true },
      })
      checkout.on("payment.failed", () => {
        setPaying(false)
        toast.error("Payment failed. You have not been charged — please try again or use another card.")
      })
      checkout.open()
    } catch (err) {
      setPaying(false)
      toast.error(err instanceof ApiError ? err.message : "Could not start the payment. Please try again.")
    }
  }

  const goBack = () => (stepIndex === 0 ? navigate(routes.app.addMoney) : setStepIndex((i) => i - 1))
  const total = quote.data?.totalPayment ?? amountNumber

  return (
    <FlowLayout title="Add Money via Card" closeTo={routes.app.addMoney} onBack={paying ? undefined : goBack}>
      <Stepper steps={steps} currentIndex={Math.min(stepIndex, 2)} className="mb-8" />

      {configQuery.isSuccess && !cardsAvailable && (
        <div className="mb-6 rounded-md border border-warning/30 bg-warning-surface p-3 text-sm text-warning">
          Card payments are not available right now. Please use UPI or bank transfer.
        </div>
      )}

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
            disabled={amountNumber < 500 || !cardsAvailable}
            onClick={() => setStepIndex(1)}
          >
            Continue
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {stepIndex >= 1 && (
        <div className="space-y-5">
          <FundingSummary
            requestedAmount={quote.data?.requestedAmount ?? amountNumber}
            fee={quote.data?.fee ?? 0}
            walletCredit={quote.data?.walletCredit ?? amountNumber}
          />

          <div className="flex items-start gap-3 rounded-md border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0 text-success" />
            <p>
              You&apos;ll enter your card details in Razorpay&apos;s secure window. Nexpro never sees or stores your
              card number, expiry or CVV. Your wallet is credited immediately after the payment succeeds.
            </p>
          </div>

          <Button className="w-full" size="lg" disabled={paying || !quote.data} onClick={startPayment}>
            {paying ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            Pay {formatCurrency(total)} securely
          </Button>
        </div>
      )}
    </FlowLayout>
  )
}

export default CreditCardFundingPage

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowRight, Clock, CreditCard, Info, Landmark } from "lucide-react"
import { FlowLayout } from "@/layouts/flow-layout"
import { Stepper, type StepperStep } from "@/components/shared/stepper"
import { CurrencyInput } from "@/components/shared/currency-input"
import { BankSelect } from "@/components/shared/bank-select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field"
import { apiClient } from "@/lib/api-client"
import { formatCurrency } from "@/lib/format"
import { routes } from "@/lib/routes"

const steps: StepperStep[] = [
  { key: "details", label: "Amount & Recipient" },
  { key: "review", label: "Review & Pay" },
]

interface RateCard {
  gatewayRate: number | string
  commissionRate: number | string
  minCommission: number | string
  payoutFee: number | string
  gstRate: number | string
  minAmount: number | string
  maxAmount: number | string
  payoutEta: string
}

interface Quote {
  amountToBank: number | string
  gatewayCharge: number | string
  commission: number | string
  payoutFee: number | string
  gst: number | string
  totalFees: number | string
  cardTotal: number | string
}

const recipientSchema = z
  .object({
    accountHolderName: z.string().min(2, "Enter the account holder's name"),
    bankName: z.string().min(2, "Select the recipient's bank"),
    accountNumber: z.string().regex(/^\d{9,18}$/, "Enter a valid account number"),
    confirmAccountNumber: z.string(),
    ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code"),
  })
  .refine((d) => d.accountNumber === d.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  })

type RecipientForm = z.infer<typeof recipientSchema>

function useDebounced<T>(value: T, ms = 400): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

const n = (v: number | string) => Number(v)
const pct = (v: number | string) => `${n(v)}%`

function Row({ label, hint, value, strong }: { label: string; hint?: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <div>
        <p className={strong ? "font-semibold text-foreground" : "text-muted-foreground"}>{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <p className={`font-tabular shrink-0 ${strong ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
        {value}
      </p>
    </div>
  )
}

function Breakdown({ quote, rates }: { quote: Quote; rates: RateCard }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="rounded-md bg-success-surface px-4 py-3">
        <p className="text-xs text-success">Recipient receives in their bank account</p>
        <p className="font-tabular text-2xl font-semibold text-success">{formatCurrency(n(quote.amountToBank), true)}</p>
      </div>
      <div className="mt-3 divide-y divide-border">
        <Row label="Transfer amount" value={formatCurrency(n(quote.amountToBank), true)} />
        <Row
          label="Card processing charge"
          hint={`${pct(rates.gatewayRate)} charged by the card network / gateway`}
          value={formatCurrency(n(quote.gatewayCharge), true)}
        />
        <Row
          label="Nexpro commission"
          hint={`${pct(rates.commissionRate)}, minimum ${formatCurrency(n(rates.minCommission))}`}
          value={formatCurrency(n(quote.commission), true)}
        />
        <Row label="Bank payout fee" hint="Flat fee per IMPS transfer" value={formatCurrency(n(quote.payoutFee), true)} />
        <Row
          label={`GST (${pct(rates.gstRate)})`}
          hint="On processing, commission and payout fee"
          value={formatCurrency(n(quote.gst), true)}
        />
        <Row label="Total fees" value={formatCurrency(n(quote.totalFees), true)} />
        <Row label="Charged to your credit card" strong value={formatCurrency(n(quote.cardTotal), true)} />
      </div>
    </div>
  )
}

export function CardToBankPage() {
  const navigate = useNavigate()
  const [stepIndex, setStepIndex] = useState(0)
  const [amount, setAmount] = useState("")
  const [agreed, setAgreed] = useState(false)

  const form = useForm<RecipientForm>({
    resolver: zodResolver(recipientSchema),
    defaultValues: { accountHolderName: "", bankName: "", accountNumber: "", confirmAccountNumber: "", ifsc: "" },
  })
  const recipient = useWatch({ control: form.control })

  const ratesQuery = useQuery({
    queryKey: ["card-to-bank", "rate-card"],
    queryFn: async () => (await apiClient.get<RateCard>("/card-to-bank/rate-card")).data,
  })
  const rates = ratesQuery.data
  const min = rates ? n(rates.minAmount) : 1000
  const max = rates ? n(rates.maxAmount) : 100000

  const amountNumber = Number(amount) || 0
  const debouncedAmount = useDebounced(amountNumber)
  const amountValid = amountNumber >= min && amountNumber <= max

  const quoteQuery = useQuery({
    queryKey: ["card-to-bank", "quote", debouncedAmount],
    queryFn: async () => (await apiClient.get<Quote>("/card-to-bank/quote", { params: { amount: debouncedAmount } })).data,
    enabled: debouncedAmount >= min && debouncedAmount <= max,
  })
  const quote = quoteQuery.data
  const quoteReady = !!quote && debouncedAmount === amountNumber

  const goBack = () => (stepIndex === 0 ? navigate(routes.app.services) : setStepIndex(0))

  const next = async () => {
    if (await form.trigger()) setStepIndex(1)
  }

  const maskedAccount = recipient.accountNumber ? `XXXXXX${recipient.accountNumber.slice(-4)}` : ""

  return (
    <FlowLayout title="Credit Card to Bank" closeTo={routes.app.services} onBack={goBack} maxWidthClassName="max-w-xl">
      <Stepper steps={steps} currentIndex={stepIndex} className="mb-8" />

      {stepIndex === 0 && (
        <div className="space-y-6">
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <CreditCard className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Pay with your credit card and we send the money to any bank account in India. The recipient always
              receives the full amount — all charges are added to your card bill, and shown below before you pay.
            </p>
          </div>

          <Field>
            <FieldLabel htmlFor="amount">Amount the recipient should receive</FieldLabel>
            <CurrencyInput id="amount" value={amount} onChange={setAmount} autoFocus />
            <FieldDescription>
              Minimum {formatCurrency(min)}, maximum {formatCurrency(max)} per transfer.
            </FieldDescription>
            {amountNumber > 0 && !amountValid && (
              <p className="text-sm text-destructive">
                Enter an amount between {formatCurrency(min)} and {formatCurrency(max)}.
              </p>
            )}
          </Field>

          {amountValid && (quoteReady && rates ? <Breakdown quote={quote} rates={rates} /> : <Skeleton className="h-72 w-full" />)}

          <div>
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Landmark className="size-4 text-primary" /> Recipient bank account
            </p>
            <FieldGroup>
              <Field data-invalid={!!form.formState.errors.accountHolderName}>
                <FieldLabel htmlFor="accountHolderName">Account Holder Name</FieldLabel>
                <Input id="accountHolderName" {...form.register("accountHolderName")} />
                <FieldError errors={[form.formState.errors.accountHolderName]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.bankName}>
                <FieldLabel htmlFor="bankName">Bank Name</FieldLabel>
                <Controller
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <BankSelect
                      id="bankName"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      invalid={!!form.formState.errors.bankName}
                    />
                  )}
                />
                <FieldError errors={[form.formState.errors.bankName]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.accountNumber}>
                <FieldLabel htmlFor="accountNumber">Account Number</FieldLabel>
                <Input id="accountNumber" inputMode="numeric" autoComplete="off" {...form.register("accountNumber")} />
                <FieldError errors={[form.formState.errors.accountNumber]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.confirmAccountNumber}>
                <FieldLabel htmlFor="confirmAccountNumber">Confirm Account Number</FieldLabel>
                <Input
                  id="confirmAccountNumber"
                  inputMode="numeric"
                  autoComplete="off"
                  onPaste={(e) => e.preventDefault()}
                  {...form.register("confirmAccountNumber")}
                />
                <FieldError errors={[form.formState.errors.confirmAccountNumber]} />
              </Field>

              <Field data-invalid={!!form.formState.errors.ifsc}>
                <FieldLabel htmlFor="ifsc">IFSC Code</FieldLabel>
                <Input
                  id="ifsc"
                  className="uppercase"
                  {...form.register("ifsc", { setValueAs: (v: string) => v.toUpperCase().trim() })}
                />
                <FieldError errors={[form.formState.errors.ifsc]} />
              </Field>
            </FieldGroup>
          </div>

          <Button className="w-full" size="lg" disabled={!amountValid || !quoteReady} onClick={next}>
            Review Transfer
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      {stepIndex === 1 && quote && rates && (
        <div className="space-y-5">
          <Breakdown quote={quote} rates={rates} />

          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Sending to</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Account holder</dt>
                <dd className="text-right font-medium text-foreground">{recipient.accountHolderName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Bank</dt>
                <dd className="text-right font-medium text-foreground">{recipient.bankName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Account number</dt>
                <dd className="font-tabular font-medium text-foreground">{maskedAccount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">IFSC</dt>
                <dd className="font-tabular font-medium text-foreground">{recipient.ifsc}</dd>
              </div>
            </dl>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-4 shrink-0" /> {rates.payoutEta}
            </p>
          </div>

          <Field orientation="horizontal">
            <Checkbox id="agree" checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
            <FieldLabel htmlFor="agree" className="font-normal leading-snug">
              I confirm the recipient details are correct and I understand transfers to a wrong account cannot be
              reversed by Nexpro. Fees shown are non-refundable once the transfer is processed.
            </FieldLabel>
          </Field>

          <div className="flex items-start gap-2 rounded-md border border-info/30 bg-info-surface p-3 text-xs text-info">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>
              Preview: pricing and recipient checks are live, but card payment and bank payout for this service
              switch on once our payout partner is connected. No money is charged yet.
            </p>
          </div>

          <Button className="w-full" size="lg" disabled>
            <CreditCard className="size-4" />
            Pay {formatCurrency(n(quote.cardTotal), true)} with card — coming soon
          </Button>
        </div>
      )}
    </FlowLayout>
  )
}

export default CardToBankPage

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { FlowLayout } from "@/layouts/flow-layout"
import { CurrencyInput } from "@/components/shared/currency-input"
import { CopyRow } from "@/components/shared/copy-row"
import { FileUpload } from "@/components/shared/file-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { useFundingQuote } from "@/features/funding/use-funding-quote"
import { apiClient, ApiError } from "@/lib/api-client"
import { routes } from "@/lib/routes"
import type { FundingRequest } from "@/types/domain"

interface BeneficiaryInfo {
  accountName: string
  bankName: string
  accountNumber: string
  ifsc: string
  reference: string
  isDemo: boolean
}

export function BankTransferFundingPage() {
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState("")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [transferDate, setTransferDate] = useState("")
  const [proof, setProof] = useState<File | null>(null)

  const amountNumber = Number(amount) || 0
  const quote = useFundingQuote(amountNumber, "BANK_TRANSFER")

  const beneficiaryQuery = useQuery({
    queryKey: ["funding", "beneficiary"],
    queryFn: async () => (await apiClient.get<BeneficiaryInfo>("/funding-requests/bank-transfer/beneficiary")).data,
  })

  const createRequest = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append("method", "BANK_TRANSFER")
      formData.append("amount", String(amountNumber))
      formData.append(
        "paymentDetails",
        JSON.stringify({ referenceNumber: referenceNumber.trim().toUpperCase(), transferDate })
      )
      if (proof) formData.append("proof", proof)
      return (
        await apiClient.post<FundingRequest>("/funding-requests", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      ).data
    },
    onSuccess: (request) => navigate(routes.app.fundingRequest(request.id)),
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not submit your transfer details. Please try again.")
    },
  })

  return (
    <FlowLayout title="Add Money via Bank Transfer" closeTo={routes.app.addMoney} maxWidthClassName="max-w-lg">
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Transfer to this account</p>
        {beneficiaryQuery.isLoading && <Skeleton className="mt-3 h-32 w-full" />}
        {beneficiaryQuery.data && (
          <div className="mt-2 divide-y divide-border">
            <CopyRow label="Account Name" value={beneficiaryQuery.data.accountName} />
            <CopyRow label="Bank" value={beneficiaryQuery.data.bankName} />
            <CopyRow label="Account Number" value={beneficiaryQuery.data.accountNumber} />
            <CopyRow label="IFSC" value={beneficiaryQuery.data.ifsc} />
            <CopyRow label="Reference (include in transfer note)" value={beneficiaryQuery.data.reference} />
          </div>
        )}
        {beneficiaryQuery.data?.isDemo && (
          <p className="mt-3 rounded-md bg-warning-surface px-3 py-2 text-xs text-warning">
            Demo account — set the PAYEE_BANK_* settings before going live. Do not send real money.
          </p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Always include your reference so we can match your transfer. Bank transfers are confirmed through
          reconciliation, not automatically on submission.
        </p>
      </div>

      {!showForm ? (
        <Button className="mt-5 w-full" size="lg" onClick={() => setShowForm(true)}>
          <Send className="size-4" />
          I&apos;ve made the transfer
        </Button>
      ) : (
        <div className="mt-6 space-y-5">
          <Field>
            <FieldLabel htmlFor="amount">Amount Transferred</FieldLabel>
            <CurrencyInput id="amount" value={amount} onChange={setAmount} />
          </Field>

          {amountNumber > 0 &&
            (quote.data ? (
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet Credit on Approval</span>
                  <span className="font-tabular font-semibold text-success">
                    ₹{quote.data.walletCredit.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ) : null)}

          <Field>
            <FieldLabel htmlFor="referenceNumber">UTR / Transaction ID</FieldLabel>
            <Input
              id="referenceNumber"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value.replace(/\s/g, ""))}
              placeholder="e.g. SBIN524012345678"
              maxLength={22}
              className="uppercase"
              autoComplete="off"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="transferDate">Date of Transfer</FieldLabel>
            <Input id="transferDate" type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} />
          </Field>

          <FileUpload
            label="Proof of Transfer (optional)"
            description="A screenshot or receipt helps us verify faster — it is not treated as confirmed settlement on its own."
            value={proof}
            onChange={setProof}
          />
          <FieldDescription>
            Final confirmation of a bank transfer always comes from reconciliation with the bank, not from this
            form alone.
          </FieldDescription>

          <Button
            className="w-full"
            size="lg"
            disabled={amountNumber < 100 || !/^[A-Za-z0-9]{12,22}$/.test(referenceNumber) || !transferDate || createRequest.isPending}
            onClick={() => createRequest.mutate()}
          >
            {createRequest.isPending && <Loader2 className="size-4 animate-spin" />}
            Submit for Verification
          </Button>
        </div>
      )}
    </FlowLayout>
  )
}

export default BankTransferFundingPage

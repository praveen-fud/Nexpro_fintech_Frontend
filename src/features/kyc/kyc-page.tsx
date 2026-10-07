import { useEffect, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, ShieldCheck, Lock, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FlowLayout } from "@/layouts/flow-layout"
import { Stepper, type StepperStep } from "@/components/shared/stepper"
import { BankSelect } from "@/components/shared/bank-select"
import { FileUpload } from "@/components/shared/file-upload"
import { apiClient, ApiError } from "@/lib/api-client"
import { routes } from "@/lib/routes"
import { useAuth } from "@/features/auth/auth-context"
import type { KycProfile } from "@/types/domain"

const INDIAN_STATES = [
  "Andhra Pradesh", "Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra",
  "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
]

const steps: StepperStep[] = [
  { key: "documents", label: "Identity Documents" },
  { key: "personal", label: "Personal Information" },
  { key: "bank", label: "Bank Details" },
  { key: "verification", label: "Verification" },
]

const personalSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(5, "Enter your full address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "Select your state"),
  pinCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
})

const bankSchema = z
  .object({
    accountHolderName: z.string().min(2, "Enter the account holder name"),
    accountNumber: z.string().regex(/^\d{9,18}$/, "Enter a valid account number"),
    confirmAccountNumber: z.string(),
    bankName: z.string().min(2, "Select your bank"),
    ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code"),
  })
  .refine((d) => d.accountNumber === d.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  })

type PersonalForm = z.infer<typeof personalSchema>
type BankForm = z.infer<typeof bankSchema>
type DocumentKey = "idProof" | "addressProof" | "panCard"

export function KycPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [stepIndex, setStepIndex] = useState(0)
  const [documents, setDocuments] = useState<Record<DocumentKey, File | null>>({
    idProof: null,
    addressProof: null,
    panCard: null,
  })
  const [declared, setDeclared] = useState(false)
  const prefilledRef = useRef(false)

  const { data: existingProfile } = useQuery({
    queryKey: ["kyc", "me"],
    queryFn: async () => (await apiClient.get<KycProfile>("/kyc/me")).data,
  })

  const personalForm = useForm<PersonalForm>({
    resolver: zodResolver(personalSchema),
    defaultValues: { dateOfBirth: "", address: "", city: "", state: "", pinCode: "" },
  })

  const bankForm = useForm<BankForm>({
    resolver: zodResolver(bankSchema),
    defaultValues: { accountHolderName: "", accountNumber: "", confirmAccountNumber: "", bankName: "", ifsc: "" },
  })

  const selectedState = useWatch({ control: personalForm.control, name: "state" })

  // Pre-fill from a prior (rejected / info-requested) submission exactly
  // once — a later refetch (e.g. on window focus) must not clobber
  // whatever the customer has already typed this session.
  useEffect(() => {
    if (!existingProfile || prefilledRef.current) return
    prefilledRef.current = true
    if (existingProfile.personalInfo) {
      personalForm.reset(existingProfile.personalInfo)
    }
    if (existingProfile.bankAccount) {
      bankForm.reset({
        accountHolderName: existingProfile.bankAccount.accountHolderName,
        accountNumber: "",
        confirmAccountNumber: "",
        bankName: existingProfile.bankAccount.bankName ?? "",
        ifsc: existingProfile.bankAccount.ifsc,
      })
    }
  }, [existingProfile, personalForm, bankForm])

  const needsFix =
    existingProfile?.status === "REJECTED" || existingProfile?.status === "ADDITIONAL_INFORMATION_REQUIRED"

  const submitKyc = useMutation({
    mutationFn: async () => {
      const formData = new FormData()
      formData.append("personalInfo", JSON.stringify(personalForm.getValues()))
      formData.append("bankAccount", JSON.stringify(bankForm.getValues()))
      if (documents.idProof) formData.append("idProof", documents.idProof)
      if (documents.addressProof) formData.append("addressProof", documents.addressProof)
      if (documents.panCard) formData.append("panCard", documents.panCard)
      await apiClient.post("/kyc/submit", formData, { headers: { "Content-Type": "multipart/form-data" } })
    },
    onSuccess: async () => {
      toast.success("KYC submitted for review")
      // The route guard (KycGate) reads kycStatus straight from the auth
      // context, which only refreshes at login/bootstrap otherwise — without
      // this it would still see NOT_STARTED and bounce straight back here.
      await refreshUser()
      navigate(routes.app.kycStatus)
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not submit KYC. Please try again.")
    },
  })

  const documentsComplete = documents.idProof && documents.addressProof && documents.panCard

  const goNext = async () => {
    if (stepIndex === 0 && !documentsComplete) {
      toast.error("Please upload all required documents to continue")
      return
    }
    if (stepIndex === 1) {
      const valid = await personalForm.trigger()
      if (!valid) return
    }
    if (stepIndex === 2) {
      const valid = await bankForm.trigger()
      if (!valid) return
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1))
  }

  const goBack = () => {
    if (stepIndex === 0) {
      navigate(routes.app.dashboard)
    } else {
      setStepIndex((i) => i - 1)
    }
  }

  return (
    <FlowLayout title="Identity Verification" onBack={goBack}>
      <Stepper steps={steps} currentIndex={stepIndex} className="mb-8" />

      {stepIndex === 0 && (
        <div className="space-y-5">
          {needsFix && (
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertTitle>
                {existingProfile?.status === "REJECTED" ? "Verification was rejected" : "More information needed"}
              </AlertTitle>
              <AlertDescription>
                {existingProfile?.reviewNotes ?? "Please review and resubmit your information."}
              </AlertDescription>
            </Alert>
          )}

          {/* Progress header */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="size-3.5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Identity Documents</p>
                <p className="text-xs text-muted-foreground">All 3 documents are required</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {(["idProof", "addressProof", "panCard"] as const).map((key) => (
                <div
                  key={key}
                  className={
                    documents[key]
                      ? "flex size-6 items-center justify-center rounded-full bg-emerald-500"
                      : "size-6 rounded-full border-2 border-dashed border-muted-foreground/30"
                  }
                >
                  {documents[key] && <CheckCircle2 className="size-4 text-white" />}
                </div>
              ))}
              <span className="ml-1 text-xs font-semibold text-muted-foreground">
                {[documents.idProof, documents.addressProof, documents.panCard].filter(Boolean).length}/3
              </span>
            </div>
          </div>

          {/* Document cards */}
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
              <div className="border-b border-border/60 bg-muted/30 px-4 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Document 1 of 3
                </p>
              </div>
              <div className="p-4">
                <FileUpload
                  label="Government ID Proof"
                  description="Aadhaar · Passport · Voter ID"
                  value={documents.idProof}
                  onChange={(f) => setDocuments((d) => ({ ...d, idProof: f }))}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
              <div className="border-b border-border/60 bg-muted/30 px-4 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Document 2 of 3
                </p>
              </div>
              <div className="p-4">
                <FileUpload
                  label="Address Proof"
                  description="Utility bill or bank statement · not older than 3 months"
                  value={documents.addressProof}
                  onChange={(f) => setDocuments((d) => ({ ...d, addressProof: f }))}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
              <div className="border-b border-border/60 bg-muted/30 px-4 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Document 3 of 3
                </p>
              </div>
              <div className="p-4">
                <FileUpload
                  label="PAN Card"
                  description="Required for financial verification"
                  value={documents.panCard}
                  onChange={(f) => setDocuments((d) => ({ ...d, panCard: f }))}
                />
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60" />
            <span>
              Your documents are encrypted and handled securely. They are reviewed only by authorised Nexpro staff.
            </span>
          </div>
        </div>
      )}

      {stepIndex === 1 && (
        <form onSubmit={(e) => e.preventDefault()}>
          <FieldGroup>
            <Field data-invalid={!!personalForm.formState.errors.dateOfBirth}>
              <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
              <Input id="dateOfBirth" type="date" {...personalForm.register("dateOfBirth")} />
              <FieldError errors={[personalForm.formState.errors.dateOfBirth]} />
            </Field>

            <Field data-invalid={!!personalForm.formState.errors.address}>
              <FieldLabel htmlFor="address">Residential Address</FieldLabel>
              <Input id="address" {...personalForm.register("address")} />
              <FieldError errors={[personalForm.formState.errors.address]} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!personalForm.formState.errors.city}>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input id="city" {...personalForm.register("city")} />
                <FieldError errors={[personalForm.formState.errors.city]} />
              </Field>

              <Field data-invalid={!!personalForm.formState.errors.pinCode}>
                <FieldLabel htmlFor="pinCode">PIN Code</FieldLabel>
                <Input id="pinCode" inputMode="numeric" {...personalForm.register("pinCode")} />
                <FieldError errors={[personalForm.formState.errors.pinCode]} />
              </Field>
            </div>

            <Field data-invalid={!!personalForm.formState.errors.state}>
              <FieldLabel htmlFor="state">State</FieldLabel>
              <Select
                value={selectedState}
                onValueChange={(v) => personalForm.setValue("state", v, { shouldValidate: true })}
              >
                <SelectTrigger id="state" className="w-full">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[personalForm.formState.errors.state]} />
            </Field>
          </FieldGroup>
        </form>
      )}

      {stepIndex === 2 && (
        <form onSubmit={(e) => e.preventDefault()}>
          <FieldGroup>
            <Field data-invalid={!!bankForm.formState.errors.accountHolderName}>
              <FieldLabel htmlFor="accountHolderName">Account Holder Name</FieldLabel>
              <Input id="accountHolderName" {...bankForm.register("accountHolderName")} />
              <FieldError errors={[bankForm.formState.errors.accountHolderName]} />
            </Field>

            <Field data-invalid={!!bankForm.formState.errors.bankName}>
              <FieldLabel htmlFor="bankName">Bank Name</FieldLabel>
              <Controller
                control={bankForm.control}
                name="bankName"
                render={({ field }) => (
                  <BankSelect
                    id="bankName"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={!!bankForm.formState.errors.bankName}
                  />
                )}
              />
              <FieldError errors={[bankForm.formState.errors.bankName]} />
            </Field>

            <Field data-invalid={!!bankForm.formState.errors.accountNumber}>
              <FieldLabel htmlFor="accountNumber">Account Number</FieldLabel>
              <Input id="accountNumber" inputMode="numeric" {...bankForm.register("accountNumber")} />
              <FieldError errors={[bankForm.formState.errors.accountNumber]} />
            </Field>

            <Field data-invalid={!!bankForm.formState.errors.confirmAccountNumber}>
              <FieldLabel htmlFor="confirmAccountNumber">Confirm Account Number</FieldLabel>
              <Input id="confirmAccountNumber" inputMode="numeric" {...bankForm.register("confirmAccountNumber")} />
              <FieldError errors={[bankForm.formState.errors.confirmAccountNumber]} />
            </Field>

            <Field data-invalid={!!bankForm.formState.errors.ifsc}>
              <FieldLabel htmlFor="ifsc">IFSC Code</FieldLabel>
              <Input id="ifsc" className="uppercase" {...bankForm.register("ifsc")} />
              <FieldError errors={[bankForm.formState.errors.ifsc]} />
            </Field>
          </FieldGroup>
        </form>
      )}

      {stepIndex === 3 && (
        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Documents</p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li>{documents.idProof?.name}</li>
              <li>{documents.addressProof?.name}</li>
              <li>{documents.panCard?.name}</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Personal Information</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Address</dt>
                <dd className="text-right text-foreground">
                  {personalForm.getValues("city")}, {personalForm.getValues("state")} {personalForm.getValues("pinCode")}
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold text-foreground">Bank Details</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Account Holder</dt>
                <dd className="text-foreground">{bankForm.getValues("accountHolderName")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Bank</dt>
                <dd className="text-foreground">{bankForm.getValues("bankName")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">IFSC</dt>
                <dd className="font-tabular text-foreground">{bankForm.getValues("ifsc")}</dd>
              </div>
            </dl>
          </div>

          <Field orientation="horizontal">
            <Checkbox id="declare" checked={declared} onCheckedChange={(v) => setDeclared(v === true)} />
            <FieldLabel htmlFor="declare" className="font-normal">
              I confirm the information provided is accurate and belongs to me.
            </FieldLabel>
          </Field>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="outline" onClick={goBack} type="button">
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {stepIndex < steps.length - 1 ? (
          <Button onClick={goNext} type="button">
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={() => submitKyc.mutate()} disabled={!declared || submitKyc.isPending} type="button">
            {submitKyc.isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            Submit for Review
          </Button>
        )}
      </div>
    </FlowLayout>
  )
}

export default KycPage

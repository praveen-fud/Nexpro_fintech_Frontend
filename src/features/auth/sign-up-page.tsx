import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, AtSign, Loader2, MailCheck, Phone, User } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "@/components/ui/field"
import { IconInput } from "@/components/shared/icon-input"
import { PasswordInput } from "@/components/shared/password-input"
import { AuthLayout, FormItem, FormStagger } from "@/layouts/auth-layout"
import { apiClient, ApiError } from "@/lib/api-client"
import { routes } from "@/lib/routes"

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.email("Enter a valid email address"),
    mobileNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    acceptedTerms: z.boolean().refine((v) => v, "You must accept the Terms & Conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignUpForm = z.infer<typeof signUpSchema>

const stepTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
}

export function SignUpPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<"details" | "otp">("details")
  const [otp, setOtp] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
  })

  const onSubmit = async (values: SignUpForm) => {
    setSubmitting(true)
    try {
      await apiClient.post("/auth/sign-up", values)
      setRegisteredEmail(values.email)
      setStep("otp")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create your account. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const onVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit verification code")
      return
    }
    setSubmitting(true)
    try {
      await apiClient.post("/auth/verify-otp", { email: registeredEmail, code: otp })
      toast.success("Account verified. You can now sign in.")
      navigate(routes.login)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Verification failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {step === "details" ? (
          <motion.div key="details" {...stepTransition}>
            <FormStagger>
              <FormItem className="mb-7 text-center lg:text-left">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Get started with Nexpro Fintech in a few minutes.
                </p>
              </FormItem>

              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <FieldGroup>
                  <FormItem>
                    <Field data-invalid={!!form.formState.errors.fullName}>
                      <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                      <IconInput icon={User} id="fullName" autoComplete="name" {...form.register("fullName")} />
                      <FieldError errors={[form.formState.errors.fullName]} />
                    </Field>
                  </FormItem>

                  <FormItem>
                    <Field data-invalid={!!form.formState.errors.email}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <IconInput
                        icon={AtSign}
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...form.register("email")}
                      />
                      <FieldError errors={[form.formState.errors.email]} />
                    </Field>
                  </FormItem>

                  <FormItem>
                    <Field data-invalid={!!form.formState.errors.mobileNumber}>
                      <FieldLabel htmlFor="mobileNumber">Mobile Number</FieldLabel>
                      <IconInput
                        icon={Phone}
                        id="mobileNumber"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="98765 43210"
                        {...form.register("mobileNumber")}
                      />
                      <FieldError errors={[form.formState.errors.mobileNumber]} />
                    </Field>
                  </FormItem>

                  <FormItem>
                    <Field data-invalid={!!form.formState.errors.password}>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <PasswordInput id="password" autoComplete="new-password" {...form.register("password")} />
                      <FieldError errors={[form.formState.errors.password]} />
                    </Field>
                  </FormItem>

                  <FormItem>
                    <Field data-invalid={!!form.formState.errors.confirmPassword}>
                      <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                      <PasswordInput
                        id="confirmPassword"
                        autoComplete="new-password"
                        {...form.register("confirmPassword")}
                      />
                      <FieldError errors={[form.formState.errors.confirmPassword]} />
                    </Field>
                  </FormItem>

                  <FormItem>
                    <Controller
                      control={form.control}
                      name="acceptedTerms"
                      render={({ field }) => (
                        <Field orientation="horizontal" data-invalid={!!form.formState.errors.acceptedTerms}>
                          <Checkbox id="acceptedTerms" checked={field.value} onCheckedChange={field.onChange} />
                          <FieldLabel htmlFor="acceptedTerms" className="font-normal">
                            I agree to the{" "}
                            <a href="#" className="text-primary underline underline-offset-4">
                              Terms &amp; Conditions
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-primary underline underline-offset-4">
                              Privacy Policy
                            </a>
                          </FieldLabel>
                          <FieldError errors={[form.formState.errors.acceptedTerms]} />
                        </Field>
                      )}
                    />
                  </FormItem>

                  <FormItem>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-11 w-full shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.015] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.985]"
                      disabled={submitting}
                    >
                      {submitting && <Loader2 className="size-4 animate-spin" />}
                      Create Account
                      {!submitting && <ArrowRight className="size-4" />}
                    </Button>
                  </FormItem>
                </FieldGroup>
              </form>

              <FormItem>
                <p className="mt-6 text-center text-sm text-muted-foreground lg:text-left">
                  Already have an account?{" "}
                  <Link to={routes.login} className="font-medium text-primary underline-offset-4 hover:underline">
                    Sign in
                  </Link>
                </p>
              </FormItem>
            </FormStagger>
          </motion.div>
        ) : (
          <motion.div key="otp" {...stepTransition} className="text-center lg:text-left">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-surface text-success lg:mx-0"
            >
              <MailCheck className="size-6" />
            </motion.div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Verify your email</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-medium text-foreground">{registeredEmail}</span>.
            </p>

            <Field className="mt-6">
              <FieldLabel htmlFor="otp" className="sr-only">
                Verification code
              </FieldLabel>
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="text-center text-lg tracking-[0.5em]"
                autoFocus
              />
              <FieldDescription>Simulated verification — enter any 6-digit code.</FieldDescription>
            </Field>

            <Button
              size="lg"
              className="mt-6 h-11 w-full shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.015] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.985]"
              onClick={onVerifyOtp}
              disabled={submitting}
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Verify &amp; Continue
            </Button>
            <button
              type="button"
              className="mt-4 text-sm font-medium text-primary hover:underline"
              onClick={() => toast.info("A new verification code has been sent (simulated).")}
            >
              Resend code
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}

export default SignUpPage

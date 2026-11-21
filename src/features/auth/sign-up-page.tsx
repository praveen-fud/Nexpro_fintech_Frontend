import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, AtSign, Loader2, Phone, User } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { IconInput } from "@/components/shared/icon-input"
import { PasswordInput } from "@/components/shared/password-input"
import { AuthLayout, FormItem, FormStagger } from "@/layouts/auth-layout"
import { apiClient, ApiError } from "@/lib/api-client"
import { useAuth } from "@/features/auth/auth-context"
import { routes } from "@/lib/routes"

// Mirrors _COMMON_PASSWORDS in Backend/app/schemas/auth.py.
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "passw0rd",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "qwertyuiop",
  "letmein1",
  "iloveyou",
  "admin123",
  "welcome1",
  "welcome123",
  "abc12345",
  "football",
  "monkey123",
  "nexpro123",
  "changeme",
  "secret123",
])

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.email("Enter a valid email address"),
    mobileNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    // Mirrors the server policy in Backend/app/schemas/auth.py. Keep the two
    // in step: anything only the server rejects shows up as a form-level
    // error after submit instead of inline as the user types.
    password: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .max(128, "Password must be at most 128 characters")
      .refine((v) => !COMMON_PASSWORDS.has(v.toLowerCase()), "That password is too common — choose something less guessable")
      .refine((v) => !/^\d+$/.test(v), "Add letters, not just numbers")
      .refine(
        (v) =>
          [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter((re) => re.test(v)).length >= 3,
        "Mix upper case, lower case, and numbers or symbols",
      ),
    confirmPassword: z.string(),
    acceptedTerms: z.boolean().refine((v) => v, "You must accept the Terms & Conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignUpForm = z.infer<typeof signUpSchema>

export function SignUpPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitting, setSubmitting] = useState(false)

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
      // No email/SMS verification step for now (see Backend/app/routers/auth.py
      // sign_up) — the account is immediately usable, so sign straight in and
      // go to the app rather than bouncing through a separate login screen.
      await login({ identifier: values.email, password: values.password })
      navigate(routes.app.root, { replace: true })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create your account. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <FormStagger>
        <FormItem className="mb-7 text-center lg:text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Get started with Nexpro Paytech in a few minutes.</p>
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
    </AuthLayout>
  )
}

export default SignUpPage

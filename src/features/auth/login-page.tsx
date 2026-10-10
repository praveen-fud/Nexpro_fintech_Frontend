import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { ArrowRight, AtSign, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"
import { IconInput } from "@/components/shared/icon-input"
import { PasswordInput } from "@/components/shared/password-input"
import { AuthLayout, FormItem, FormStagger } from "@/layouts/auth-layout"
import { useAuth } from "@/features/auth/auth-context"
import { ApiError } from "@/lib/api-client"
import { consumeSessionExpiredFlag } from "@/lib/auth-token"
import { homeForRole, pathAllowedForRole, routes } from "@/lib/routes"

const loginSchema = z.object({
  identifier: z.string().min(3, "Enter your email or mobile number"),
  password: z.string().min(1, "Enter your password"),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  })

  useEffect(() => {
    if (consumeSessionExpiredFlag()) {
      toast.info("You were signed out after 15 minutes of inactivity. Please sign in again to continue.", {
        duration: 8000,
      })
    }
  }, [])

  const onSubmit = async (values: LoginForm) => {
    setSubmitting(true)
    try {
      const user = await login(values)
      // Only honour the pre-logout page if this role may open it; otherwise a
      // different account signing in lands on the wrong area and gets bounced.
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname
      navigate(from && pathAllowedForRole(from, user.role) ? from : homeForRole(user.role), { replace: true })
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not sign in. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <FormStagger>
        <FormItem className="mb-7 text-center lg:text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Welcome back to Nexpro Paytech.</p>
        </FormItem>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <FormItem>
              <Field data-invalid={!!form.formState.errors.identifier}>
                <FieldLabel htmlFor="identifier">Email or Mobile Number</FieldLabel>
                <IconInput
                  icon={AtSign}
                  id="identifier"
                  autoComplete="username"
                  {...form.register("identifier")}
                />
                <FieldError errors={[form.formState.errors.identifier]} />
              </Field>
            </FormItem>

            <FormItem>
              <Field data-invalid={!!form.formState.errors.password}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button type="button" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <PasswordInput id="password" autoComplete="current-password" {...form.register("password")} />
                <FieldError errors={[form.formState.errors.password]} />
              </Field>
            </FormItem>

            <FormItem>
              <Button
                type="submit"
                size="lg"
                className="h-11 w-full shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.015] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.985]"
                disabled={submitting}
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Sign In
                {!submitting && <ArrowRight className="size-4" />}
              </Button>
            </FormItem>
          </FieldGroup>
        </form>

        <FormItem>
          <p className="mt-6 text-center text-sm text-muted-foreground lg:text-left">
            Don&apos;t have an account?{" "}
            <Link to={routes.signUp} className="font-medium text-primary underline-offset-4 hover:underline">
              Create one
            </Link>
          </p>
        </FormItem>
      </FormStagger>
    </AuthLayout>
  )
}

export default LoginPage
